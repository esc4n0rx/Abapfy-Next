// lib/prompts/abap.ts
import { PromptContext, GeneratedPrompt } from './index';

export type ModuleType = 
  | 'function_module'
  | 'class_method'
  | 'subroutine'
  | 'user_exit'
  | 'badi_implementation'
  | 'report'
  | 'cds_view'
  | 'interface'
  | 'class_definition';

export class ABAPPrompts {
  private static readonly BASE_SYSTEM_PROMPT = `
Você é um Engenheiro de Software ABAP Sênior, especialista em Clean Code e ABAP Moderno (7.5+). 
Sua principal habilidade é traduzir requisitos de negócio em código ABAP robusto, eficiente e de fácil manutenção.

REGRAS FUNDAMENTAIS:
- Use SEMPRE sintaxe moderna ABAP 7.5+ (DATA(...), VALUE, CONV, COND, SWITCH)
- Implemente tratamento de exceções com classes (TRY...CATCH...ENDTRY)
- Use SELECT explícito, NUNCA SELECT *
- Siga convenções SAP de nomenclatura
- Código deve ser comentado em português
- Aplique princípios de Clean Code
- Use classes locais ao invés de PERFORM quando possível
`;

  static getPrompt(context: PromptContext): GeneratedPrompt {
    const moduleType = context.moduleType as ModuleType;
    
    switch (moduleType) {
      case 'function_module':
        return this.getFunctionModulePrompt(context);
      case 'class_method':
        return this.getClassMethodPrompt(context);
      case 'subroutine':
        return this.getSubroutinePrompt(context);
      case 'user_exit':
        return this.getUserExitPrompt(context);
      case 'badi_implementation':
        return this.getBAdIPrompt(context);
      case 'report':
        return this.getReportPrompt(context);
      case 'cds_view':
        return this.getCDSViewPrompt(context);
      case 'interface':
        return this.getInterfacePrompt(context);
      case 'class_definition':
        return this.getClassDefinitionPrompt(context);
      default:
        return this.getGenericPrompt(context);
    }
  }

  private static getFunctionModulePrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Criar um módulo de função ABAP completo e funcional.

ESTRUTURA OBRIGATÓRIA:
1. Cabeçalho com documentação
2. Definição de parâmetros (IMPORTING, EXPORTING, CHANGING, TABLES)
3. Declarações de dados locais
4. Validações de entrada (Fail-Fast)
5. Lógica principal
6. Tratamento de exceções
7. Retorno de dados

FORMATO DE SAÍDA:
- Forneça APENAS o código ABAP puro
- Código completo e pronto para ativação
- Sem explicações externas`,
      
      userPrompt: `Crie um módulo de função ABAP com a seguinte especificação:

${context.description}

O módulo deve seguir todas as melhores práticas de ABAP moderno e incluir tratamento robusto de erros.`,
      
      temperature: 0.3,
      maxTokens: 4000
    };
  }

  private static getClassMethodPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Criar um método de classe ABAP moderno.

DIRETRIZES PARA MÉTODOS:
- Use RETURNING quando há apenas um parâmetro de saída
- Implemente validações no início (Fail-Fast)
- Use sintaxe funcional quando possível
- Métodos devem ter responsabilidade única
- Documente parâmetros e exceções no cabeçalho`,
      
      userPrompt: `Crie um método de classe ABAP com a seguinte especificação:

${context.description}

O método deve ser moderno, eficiente e seguir o princípio da responsabilidade única.`,
      
      temperature: 0.4,
      maxTokens: 3000
    };
  }

  private static getSubroutinePrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

NOTA IMPORTANTE: Subroutines (PERFORM) são consideradas práticas obsoletas no ABAP moderno. 
Recomende o uso de métodos de classe sempre que possível.

TAREFA ESPECÍFICA: Criar uma subroutine ABAP (apenas se estritamente necessário para compatibilidade).`,
      
      userPrompt: `Crie uma subroutine ABAP com a seguinte especificação:

${context.description}

IMPORTANTE: Inclua comentários explicando por que uma classe/método seria uma alternativa melhor.`,
      
      temperature: 0.3,
      maxTokens: 2500
    };
  }

  private static getUserExitPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Implementar um User Exit SAP.

CONSIDERAÇÕES PARA USER EXITS:
- Identificar o ponto de extensão correto
- Implementar apenas a lógica necessária
- Não modificar dados padrão sem necessidade
- Documentar o propósito da modificação
- Considerar impactos em upgrades`,
      
      userPrompt: `Implemente um User Exit SAP com a seguinte especificação:

${context.description}

Inclua comentários sobre o impacto da implementação e melhores práticas.`,
      
      temperature: 0.2,
      maxTokens: 3500
    };
  }

  private static getBAdIPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Implementar uma BAdI (Business Add-In).

ESTRUTURA PARA BADI:
1. Identificação da interface da BAdI
2. Implementação da classe
3. Implementação dos métodos da interface
4. Configuração necessária (se aplicável)
5. Testes e validações`,
      
      userPrompt: `Crie uma implementação de BAdI com a seguinte especificação:

${context.description}

Inclua a implementação completa da classe e métodos necessários.`,
      
      temperature: 0.3,
      maxTokens: 4000
    };
  }

  private static getReportPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Criar um programa ABAP (REPORT) completo.

ESTRUTURA OBRIGATÓRIA:
1. Cabeçalho do programa
2. Declarações de tipos e dados globais
3. Tela de seleção (PARAMETERS/SELECT-OPTIONS)
4. Classes locais para a lógica
5. Eventos (INITIALIZATION, AT SELECTION-SCREEN, START-OF-SELECTION)
6. Apenas instanciar classe principal no START-OF-SELECTION`,
      
      userPrompt: `Crie um programa ABAP (REPORT) completo com a seguinte especificação:

${context.description}

O programa deve usar classes locais e sintaxe moderna ABAP.`,
      
      temperature: 0.4,
      maxTokens: 5000
    };
  }

  private static getCDSViewPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Criar uma CDS View.

ELEMENTOS DE CDS VIEW:
- Definição correta da view
- Anotações apropriadas (@AccessControl, @EndUserText, etc.)
- Joins otimizados quando necessário
- Campos calculados usando CASE/CAST
- Filtros e condições WHERE adequadas
- Associações quando aplicável`,
      
      userPrompt: `Crie uma CDS View com a seguinte especificação:

${context.description}

Inclua anotações apropriadas e otimizações de performance.`,
      
      temperature: 0.3,
      maxTokens: 3000
    };
  }

  private static getInterfacePrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Definir uma interface ABAP.

PRINCÍPIOS PARA INTERFACES:
- Métodos devem representar contratos claros
- Parâmetros bem definidos e tipados
- Exceções apropriadas
- Documentação completa
- Seguir princípios SOLID`,
      
      userPrompt: `Defina uma interface ABAP com a seguinte especificação:

${context.description}

A interface deve ser bem estruturada e seguir boas práticas de design.`,
      
      temperature: 0.3,
      maxTokens: 2500
    };
  }

  private static getClassDefinitionPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Criar definição e implementação de uma classe ABAP.

ESTRUTURA DE CLASSE:
1. Definição da classe (PUBLIC/PRIVATE SECTION)
2. Atributos com visibilidade adequada
3. Métodos com assinaturas claras
4. Construtor se necessário
5. Implementação de todos os métodos
6. Tratamento de exceções apropriado`,
      
      userPrompt: `Crie uma classe ABAP completa (definição e implementação) com a seguinte especificação:

${context.description}

A classe deve seguir princípios SOLID e usar ABAP moderno.`,
      
      temperature: 0.4,
      maxTokens: 4500
    };
  }

  private static getGenericPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: this.BASE_SYSTEM_PROMPT,
      userPrompt: `Crie código ABAP com a seguinte especificação:

${context.description}

Tipo: ${context.moduleType}
${context.additionalContext ? `\nContexto adicional: ${context.additionalContext}` : ''}`,
      temperature: 0.4,
      maxTokens: 4000
    };
  }

  static getDebugPrompt(code: string): GeneratedPrompt {
    return {
      systemPrompt: `Você é um Especialista Sênior em troubleshooting de código ABAP, com vasta experiência em depuração, otimização de performance e modernização de código legado.

TAREFA: Analise rigorosamente o código ABAP e identifique todos os erros potenciais, vulnerabilidades e gargalos de performance.

CRITÉRIOS DE ANÁLISE:
- Erros de Runtime: divisão por zero, acessos inválidos, referências nulas
- Erros Lógicos: loops infinitos, condições incorretas, lógica falha
- Performance: SELECTs ineficientes, loops custosos, processamento ineficiente
- Segurança: falta de AUTHORITY-CHECK, exposição de dados, validação de entradas
- Práticas Obsoletas: uso de PERFORM, SELECT *, sy-subrc para controle`,

      userPrompt: `Analise o seguinte código ABAP e forneça um relatório detalhado de problemas:

\`\`\`abap
${code}
\`\`\`

Forneça a resposta no formato:
🐛 **Problemas Identificados**
🔍 **Análise Detalhada** 
🛠️ **Soluções Propostas**
⚡ **Oportunidades de Modernização**`,

      temperature: 0.2,
      maxTokens: 4000
    };
  }

  static getReviewPrompt(code: string): GeneratedPrompt {
    return {
      systemPrompt: `Você é um Arquiteto de Software ABAP Sênior, especialista em Code Review e aplicação dos princípios de Clean Code.

TAREFA: Forneça um code review detalhado, construtivo e educativo.

CRITÉRIOS DE AVALIAÇÃO:
- Clean Code: legibilidade, nomenclatura, responsabilidade única
- Sintaxe Moderna: expressões inline, operadores VALUE/CONV/COND
- Performance: SELECTs otimizados, uso eficiente de tabelas internas
- Segurança: validação de entradas, tratamento de exceções
- Manutenibilidade: modularização, documentação, testabilidade`,

      userPrompt: `Realize um code review do seguinte código ABAP:

\`\`\`abap
${code}
\`\`\`

Forneça feedback estruturado:
✅ **Pontos Positivos**
⚠️ **Pontos de Melhoria**
❌ **Problemas Críticos**
🚀 **Sugestões de Refatoração**`,

      temperature: 0.3,
      maxTokens: 4000
    };
  }
}

export const MODULE_TYPES = [
  {
    id: 'function_module',
    name: 'Módulo de Função',
    description: 'Função reutilizável com parâmetros de entrada e saída',
    icon: '⚙️',
    category: 'Modularização'
  },
  {
    id: 'class_method',
    name: 'Método de Classe',
    description: 'Método dentro de uma classe ABAP',
    icon: '🏗️',
    category: 'Orientação a Objetos'
  },
  {
    id: 'class_definition',
    name: 'Classe Completa',
    description: 'Definição e implementação de uma classe',
    icon: '🏛️',
    category: 'Orientação a Objetos'
  },
  {
    id: 'interface',
    name: 'Interface',
    description: 'Definição de um contrato de interface',
    icon: '🔌',
    category: 'Orientação a Objetos'
  },
  {
    id: 'report',
    name: 'Programa/Report',
    description: 'Programa ABAP executável completo',
    icon: '📊',
    category: 'Programas'
  },
  {
    id: 'cds_view',
    name: 'CDS View',
    description: 'Core Data Services View',
    icon: '👁️',
    category: 'Dados'
  },
  {
    id: 'user_exit',
    name: 'User Exit',
    description: 'Implementação de ponto de extensão SAP',
    icon: '🔧',
    category: 'Extensões'
  },
  {
    id: 'badi_implementation',
    name: 'Implementação BAdI',
    description: 'Business Add-In implementation',
    icon: '🔗',
    category: 'Extensões'
  },
  {
    id: 'subroutine',
    name: 'Subroutine (Legacy)',
    description: 'Subroutine PERFORM (não recomendado)',
    icon: '⚠️',
    category: 'Legacy'
  }
] as const;