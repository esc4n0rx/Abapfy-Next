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

FORMATO DE RESPOSTA OBRIGATÓRIO:
- Retorne APENAS código ABAP puro, sem explicações
- Sem texto introdutório ou conclusão
- Sem formatação markdown além do código
- Código completo e funcional pronto para ativação
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

ESTRUTURA OBRIGATÓRIA DO MÓDULO:
1. Cabeçalho com documentação completa
2. Definição de parâmetros (IMPORTING, EXPORTING, CHANGING, TABLES)
3. Declarações de dados locais
4. Validações de entrada (Fail-Fast)
5. Lógica principal
6. Tratamento de exceções
7. Retorno de dados

IMPORTANTE: Retorne SOMENTE o código ABAP do módulo de função, sem nenhuma explicação adicional.`,
      
      userPrompt: `Crie um módulo de função ABAP com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo do módulo de função.`,
      
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
- Documente parâmetros e exceções no cabeçalho

IMPORTANTE: Retorne SOMENTE o código ABAP do método, sem explicações.`,
      
      userPrompt: `Crie um método de classe ABAP com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo do método.`,
      
      temperature: 0.4,
      maxTokens: 3000
    };
  }

  private static getSubroutinePrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

NOTA IMPORTANTE: Subroutines (PERFORM) são consideradas práticas obsoletas no ABAP moderno. 

TAREFA ESPECÍFICA: Criar uma subroutine ABAP (apenas se estritamente necessário).

IMPORTANTE: Retorne SOMENTE o código ABAP da subroutine, incluindo comentários sobre alternativas modernas.`,
      
      userPrompt: `Crie uma subroutine ABAP com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP da subroutine com comentários sobre melhores práticas.`,
      
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

IMPORTANTE: Retorne SOMENTE o código ABAP do User Exit.`,
      
      userPrompt: `Implemente um User Exit SAP com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo do User Exit.`,
      
      temperature: 0.2,
      maxTokens: 3500
    };
  }

  private static getBAdIPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

TAREFA ESPECÍFICA: Implementar uma BAdI (Business Add-In).

ESTRUTURA PARA BADI:
1. Implementação da classe
2. Implementação dos métodos da interface
3. Configuração necessária (comentários)
4. Validações e tratamentos

IMPORTANTE: Retorne SOMENTE o código ABAP da implementação BAdI.`,
      
      userPrompt: `Crie uma implementação de BAdI com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo da implementação BAdI.`,
      
      temperature: 0.3,
      maxTokens: 4000
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

IMPORTANTE: Retorne SOMENTE o código da CDS View.`,
      
      userPrompt: `Crie uma CDS View com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código completo da CDS View.`,
      
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
- Seguir princípios SOLID

IMPORTANTE: Retorne SOMENTE o código ABAP da definição da interface.`,
      
      userPrompt: `Defina uma interface ABAP com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo da interface.`,
      
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
6. Tratamento de exceções apropriado

IMPORTANTE: Retorne SOMENTE o código ABAP da classe completa.`,
      
      userPrompt: `Crie uma classe ABAP completa (definição e implementação) com a seguinte especificação:

${context.description}

${context.additionalContext ? `Contexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo da classe.`,
      
      temperature: 0.4,
      maxTokens: 4500
    };
  }

  private static getGenericPrompt(context: PromptContext): GeneratedPrompt {
    return {
      systemPrompt: `${this.BASE_SYSTEM_PROMPT}

IMPORTANTE: Retorne SOMENTE código ABAP puro, sem explicações.`,
      userPrompt: `Crie código ABAP com a seguinte especificação:

${context.description}

Tipo: ${context.moduleType}
${context.additionalContext ? `\nContexto adicional: ${context.additionalContext}` : ''}

Retorne apenas o código ABAP completo.`,
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