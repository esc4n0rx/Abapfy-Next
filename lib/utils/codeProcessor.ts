// lib/utils/codeProcessor.ts

/**
 * Processa e limpa a resposta de código ABAP gerada por modelos de IA
 */
export class CodeProcessor {
  
  /**
   * Extrai apenas o código ABAP puro de uma resposta de modelo de IA
   * Remove tags <think>, explicações e outros textos indesejados
   */
  static extractABAPCode(rawResponse: string): string {
    if (!rawResponse || rawResponse.trim().length === 0) {
      console.warn('CodeProcessor: Resposta vazia ou inválida');
      return '';
    }

    let cleanedCode = rawResponse;

    // 1. Remover tags <think> e seu conteúdo
    cleanedCode = cleanedCode.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // 2. Verificar se há blocos de código ABAP específicos
    const abapBlocks = [];
    const abapCodeRegex = /```abap\s*([\s\S]*?)```/gi;
    let match;
    
    while ((match = abapCodeRegex.exec(cleanedCode)) !== null) {
      const codeBlock = match[1].trim();
      if (codeBlock.length > 0) {
        abapBlocks.push(codeBlock);
      }
    }

    // Se encontrou blocos ABAP específicos, usar apenas eles
    if (abapBlocks.length > 0) {
      cleanedCode = abapBlocks.join('\n\n');
    } else {
      // Tentar extrair código de blocos markdown genéricos
      const genericCodeRegex = /```[\s\S]*?\n([\s\S]*?)```/gi;
      const genericBlocks = [];
      
      while ((match = genericCodeRegex.exec(cleanedCode)) !== null) {
        const codeBlock = match[1].trim();
        if (codeBlock.length > 0 && this.isLikelyABAPCode(codeBlock)) {
          genericBlocks.push(codeBlock);
        }
      }
      
      if (genericBlocks.length > 0) {
        cleanedCode = genericBlocks.join('\n\n');
      } else {
        // Se não há blocos de código, remover apenas tags markdown, preservando o conteúdo
        cleanedCode = cleanedCode.replace(/```[\w]*\n?/g, '').replace(/```$/g, '');
      }
    }

    // 4. Remover explicações no início e fim, mas preservar comentários ABAP
    cleanedCode = this.removeNonABAPExplanations(cleanedCode);

    // 5. Remover múltiplas linhas em branco consecutivas
    cleanedCode = cleanedCode.replace(/\n\s*\n\s*\n/g, '\n\n');

    // 6. Trim final preservando estrutura
    cleanedCode = cleanedCode.trim();

    if (cleanedCode.length === 0) {
      console.warn('CodeProcessor: Código resultante está vazio após processamento');
    }

    return cleanedCode;
  }

  /**
   * Verifica se o conteúdo parece ser código ABAP
   */
  private static isLikelyABAPCode(content: string): boolean {
    const abapKeywords = [
      'REPORT', 'PROGRAM', 'DATA:', 'SELECT', 'FROM', 'WHERE', 'INTO',
      'FORM', 'ENDFORM', 'PERFORM', 'FUNCTION', 'ENDFUNCTION',
      'CLASS', 'ENDCLASS', 'METHOD', 'ENDMETHOD', 'TYPE', 'TABLES:',
      'PARAMETERS:', 'SELECT-OPTIONS:', 'START-OF-SELECTION',
      'END-OF-SELECTION', 'INITIALIZATION', 'AT SELECTION-SCREEN'
    ];
    
    const upperContent = content.toUpperCase();
    return abapKeywords.some(keyword => upperContent.includes(keyword));
  }

  /**
   * Remove explicações em português/inglês mas preserva comentários ABAP
   */
  private static removeNonABAPExplanations(content: string): string {
    const lines = content.split('\n');
    const filteredLines = [];
    let insideABAPBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Se a linha contém código ABAP, marcar que estamos dentro de um bloco ABAP
      if (this.isLikelyABAPCode(line)) {
        insideABAPBlock = true;
      }
      
      // Manter comentários ABAP (começam com *)
      if (line.startsWith('*')) {
        filteredLines.push(lines[i]);
        continue;
      }
      
      // Se estamos dentro de um bloco ABAP, manter todas as linhas
      if (insideABAPBlock) {
        filteredLines.push(lines[i]);
        continue;
      }
      
      // Antes do bloco ABAP, remover explicações em linguagem natural
      if (line.length === 0) {
        filteredLines.push(lines[i]);
      } else if (!this.isNaturalLanguageExplanation(line)) {
        filteredLines.push(lines[i]);
      }
    }

    return filteredLines.join('\n');
  }

  /**
   * Detecta se uma linha é uma explicação em linguagem natural
   */
  private static isNaturalLanguageExplanation(line: string): boolean {
    const naturalLanguagePatterns = [
      /^(aqui está|este código|o programa|a seguir|primeiro|segundo|terceiro)/i,
      /^(here is|this code|the program|following|first|second|third)/i,
      /^(vamos|vou|iremos|devemos|podemos)/i,
      /^(let's|we will|we should|we can)/i,
      /[.!?]$/  // Termina com pontuação de frase
    ];
    
    return naturalLanguagePatterns.some(pattern => pattern.test(line.trim()));
  }

  /**
   * Valida se o código extraído é válido
   */
  static validateABAPCode(code: string): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    if (!code || code.trim().length === 0) {
      errors.push('Código está vazio');
      return { isValid: false, warnings, errors };
    }
    
    const upperCode = code.toUpperCase();
    
    // Verificar se tem pelo menos um comando ABAP básico
    const basicCommands = ['REPORT', 'PROGRAM', 'FUNCTION', 'CLASS', 'FORM'];
    const hasBasicCommand = basicCommands.some(cmd => upperCode.includes(cmd));
    
    if (!hasBasicCommand) {
      warnings.push('Código pode não ser um programa ABAP válido');
    }
    
    // Verificar estruturas balanceadas
    const structureChecks = [
      { open: 'IF', close: 'ENDIF' },
      { open: 'LOOP', close: 'ENDLOOP' },
      { open: 'FORM', close: 'ENDFORM' },
      { open: 'FUNCTION', close: 'ENDFUNCTION' },
      { open: 'CLASS', close: 'ENDCLASS' },
      { open: 'METHOD', close: 'ENDMETHOD' }
    ];
    
    for (const structure of structureChecks) {
      const openCount = (upperCode.match(new RegExp(`\\b${structure.open}\\b`, 'g')) || []).length;
      const closeCount = (upperCode.match(new RegExp(`\\b${structure.close}\\b`, 'g')) || []).length;
      
      if (openCount !== closeCount) {
        warnings.push(`Estrutura ${structure.open}/${structure.close} pode estar desbalanceada`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}