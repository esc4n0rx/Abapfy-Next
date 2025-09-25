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
    let cleanedCode = rawResponse;

    // 1. Remover tags <think> e seu conteúdo
    cleanedCode = cleanedCode.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // 2. Remover blocos de markdown que não sejam código
    cleanedCode = cleanedCode.replace(/```(?!abap)[\s\S]*?```/gi, '');

    // 3. Extrair apenas blocos de código ABAP
    const abapBlocks = [];
    const abapCodeRegex = /```abap\s*([\s\S]*?)```/gi;
    let match;
    
    while ((match = abapCodeRegex.exec(cleanedCode)) !== null) {
      abapBlocks.push(match[1].trim());
    }

    // Se encontrou blocos ABAP específicos, usar apenas eles
    if (abapBlocks.length > 0) {
      cleanedCode = abapBlocks.join('\n\n');
    } else {
      // Senão, tentar remover markdown genérico
      cleanedCode = cleanedCode.replace(/```[\s\S]*?```/gi, (match) => {
        return match.replace(/```\w*\n?/, '').replace(/```$/, '');
      });
    }

    // 4. Remover linhas que são claramente explicações/comentários não-ABAP
    const lines = cleanedCode.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      
      // Manter linhas vazias para formatação
      if (!trimmed) return true;
      
      // Manter comentários ABAP (começam com *)
      if (trimmed.startsWith('*')) return true;
      
      // Manter código ABAP (palavras-chave conhecidas)
      const abapKeywords = [
        'FUNCTION', 'ENDFUNCTION', 'METHOD', 'ENDMETHOD', 'CLASS', 'ENDCLASS',
        'DATA', 'TYPES', 'CONSTANTS', 'FIELD-SYMBOLS', 'PARAMETERS', 'SELECT-OPTIONS',
        'IF', 'ENDIF', 'ELSE', 'ELSEIF', 'CASE', 'ENDCASE', 'WHEN', 'OTHERWISE',
        'LOOP', 'ENDLOOP', 'DO', 'ENDDO', 'WHILE', 'ENDWHILE', 'TRY', 'ENDTRY',
        'CATCH', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MODIFY', 'COMMIT', 'ROLLBACK',
        'FORM', 'ENDFORM', 'PERFORM', 'REPORT', 'PROGRAM', 'INTERFACE', 'ENDINTERFACE',
        'IMPORTING', 'EXPORTING', 'CHANGING', 'TABLES', 'RETURNING', 'EXCEPTIONS',
        'PUBLIC', 'PRIVATE', 'PROTECTED', 'SECTION', 'DEFINITION', 'IMPLEMENTATION',
        'VALUE', 'CONV', 'COND', 'SWITCH', 'LET', 'FOR', 'IN', 'WHERE'
      ];
      
      const hasABAPKeyword = abapKeywords.some(keyword => 
        trimmed.toUpperCase().includes(keyword)
      );
      
      // Remover linhas que parecem explicações em português/inglês
      const isExplanation = (
        trimmed.toLowerCase().includes('exemplo:') ||
        trimmed.toLowerCase().includes('explicação:') ||
        trimmed.toLowerCase().includes('description:') ||
        trimmed.toLowerCase().includes('note:') ||
        trimmed.toLowerCase().includes('observação:') ||
        (trimmed.length > 100 && !hasABAPKeyword) // Linhas muito longas sem palavras-chave ABAP
      );
      
      return hasABAPKeyword || !isExplanation;
    });

    cleanedCode = filteredLines.join('\n');

    // 5. Limpar espaços excessivos e normalizar
    cleanedCode = cleanedCode
      .replace(/\n{3,}/g, '\n\n') // Máximo 2 quebras de linha consecutivas
      .trim();

    // 6. Validar se o código resultante tem pelo menos uma estrutura ABAP básica
    const hasBasicStructure = /(?:FUNCTION|METHOD|CLASS|FORM|REPORT)/i.test(cleanedCode);
    
    if (!hasBasicStructure && cleanedCode.length > 0) {
      // Se não tem estrutura básica, assumir que é código inline e manter tudo
      return cleanedCode;
    }

    return cleanedCode;
  }

  /**
   * Valida se o código ABAP parece válido
   */
  static validateABAPCode(code: string): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!code || code.trim().length === 0) {
      issues.push('Código vazio');
      return { isValid: false, issues };
    }

    // Verificar balanceamento básico de estruturas
    const structures = [
      { open: /\bFUNCTION\b/gi, close: /\bENDFUNCTION\b/gi, name: 'FUNCTION' },
      { open: /\bMETHOD\b/gi, close: /\bENDMETHOD\b/gi, name: 'METHOD' },
      { open: /\bCLASS\b.*\bDEFINITION\b/gi, close: /\bENDCLASS\b/gi, name: 'CLASS' },
      { open: /\bIF\b/gi, close: /\bENDIF\b/gi, name: 'IF' },
      { open: /\bLOOP\b/gi, close: /\bENDLOOP\b/gi, name: 'LOOP' },
      { open: /\bTRY\b/gi, close: /\bENDTRY\b/gi, name: 'TRY' },
    ];

    structures.forEach(({ open, close, name }) => {
      const openCount = (code.match(open) || []).length;
      const closeCount = (code.match(close) || []).length;
      
      if (openCount !== closeCount) {
        issues.push(`Estrutura ${name} desbalanceada: ${openCount} aberturas, ${closeCount} fechamentos`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Formata o código ABAP com indentação básica
   */
  static formatABAPCode(code: string): string {
    const lines = code.split('\n');
    const formatted: string[] = [];
    let indentLevel = 0;

    const increaseIndent = [
      /^\s*FUNCTION\b/i, /^\s*METHOD\b/i, /^\s*CLASS\b.*DEFINITION/i, 
      /^\s*CLASS\b.*IMPLEMENTATION/i, /^\s*IF\b/i, /^\s*ELSE/i, /^\s*ELSEIF\b/i,
      /^\s*LOOP\b/i, /^\s*DO\b/i, /^\s*WHILE\b/i, /^\s*TRY\b/i, /^\s*CATCH\b/i,
      /^\s*FORM\b/i, /^\s*CASE\b/i, /^\s*WHEN\b/i, /^\s*PUBLIC\s+SECTION/i,
      /^\s*PRIVATE\s+SECTION/i, /^\s*PROTECTED\s+SECTION/i
    ];

    const decreaseIndent = [
      /^\s*ENDFUNCTION/i, /^\s*ENDMETHOD/i, /^\s*ENDCLASS/i, /^\s*ENDIF/i,
      /^\s*ENDLOOP/i, /^\s*ENDDO/i, /^\s*ENDWHILE/i, /^\s*ENDTRY/i,
      /^\s*ENDFORM/i, /^\s*ENDCASE/i, /^\s*ELSE/i, /^\s*ELSEIF\b/i,
      /^\s*WHEN\b/i, /^\s*CATCH\b/i
    ];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        formatted.push('');
        return;
      }

      // Verificar se deve diminuir indentação antes da linha
      const shouldDecrease = decreaseIndent.some(pattern => pattern.test(trimmedLine));
      if (shouldDecrease && indentLevel > 0) {
        indentLevel--;
      }

      // Aplicar indentação
      const indent = '  '.repeat(indentLevel);
      formatted.push(indent + trimmedLine);

      // Verificar se deve aumentar indentação após a linha
      const shouldIncrease = increaseIndent.some(pattern => pattern.test(trimmedLine));
      if (shouldIncrease) {
        indentLevel++;
      }
    });

    return formatted.join('\n');
  }
}