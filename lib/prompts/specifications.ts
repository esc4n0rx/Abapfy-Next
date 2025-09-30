// lib/prompts/specifications.ts
import { GeneratedPrompt, PromptContext } from './index';
import { SpecificationPreferences } from '@/types/specifications';

interface SpecificationContext extends PromptContext {
  name: string;
  description: string;
  projectType?: string;
  projectContext?: {
    objectives?: string[];
    tables?: string[];
    businessRules?: string[];
    flows?: string[];
    integrations?: string[];
    stakeholders?: string[];
    technicalStack?: string[];
    nonFunctionalRequirements?: string[];
    constraints?: string[];
    deliveryPhases?: string[];
    acceptanceCriteria?: string[];
    additionalNotes?: string;
  };
}

export class SpecificationPrompts {
  private static readonly BASE_SYSTEM_PROMPT = `
Você é um Arquiteto de Soluções SAP/ABAP sênior especializado em transformar requisitos de negócio em documentações técnicas completas e acionáveis.

Seu papel é produzir especificações funcionais e técnicas extremamente detalhadas para projetos ABAP, garantindo clareza, rastreabilidade e orientações suficientes para time funcional e desenvolvedores.

PRINCÍPIOS FUNDAMENTAIS:
- Estruture o documento em seções claras e numeradas
- Utilize linguagem objetiva, profissional e em português do Brasil
- Destaque requisitos funcionais, técnicos e de integração
- Traga tabelas SAP, estruturas de dados, regras de negócio e fluxos
- Inclua premissas, restrições, critérios de aceite e riscos
- Considere melhores práticas de governança SAP e ABAP moderno

FORMATO OBRIGATÓRIO DO DOCUMENTO:
1. Capa e resumo executivo
2. Contexto do projeto e stakeholders
3. Escopo funcional detalhado
4. Requisitos técnicos e arquitetura
5. Modelo de dados (tabelas, estruturas, dicionário)
6. Fluxos de processo e integrações
7. Regras de negócio e validações
8. Plano de testes e critérios de aceite
9. Riscos, premissas e dependências
10. Plano macro de implementação

Sempre retorne uma documentação formatada em texto estruturado, com títulos, subtítulos, bullet points e tabelas textuais quando necessário.`;

  static getPrompt(context: SpecificationContext): GeneratedPrompt {
    const projectName = context.name;
    const projectType = context.projectType ? `Tipo de Projeto: ${context.projectType}` : '';
    const objectives = context.projectContext?.objectives?.length
      ? `\nObjetivos Principais:\n- ${context.projectContext.objectives.join('\n- ')}`
      : '';
    const tables = context.projectContext?.tables?.length
      ? `\nTabelas SAP Relacionadas:\n- ${context.projectContext.tables.join('\n- ')}`
      : '';
    const businessRules = context.projectContext?.businessRules?.length
      ? `\nRegras de Negócio:\n- ${context.projectContext.businessRules.join('\n- ')}`
      : '';
    const flows = context.projectContext?.flows?.length
      ? `\nFluxos de Processo:\n- ${context.projectContext.flows.join('\n- ')}`
      : '';
    const integrations = context.projectContext?.integrations?.length
      ? `\nIntegrações Necessárias:\n- ${context.projectContext.integrations.join('\n- ')}`
      : '';
    const stakeholders = context.projectContext?.stakeholders?.length
      ? `\nStakeholders:\n- ${context.projectContext.stakeholders.join('\n- ')}`
      : '';
    const technicalStack = context.projectContext?.technicalStack?.length
      ? `\nStack Tecnológico e Componentes SAP:\n- ${context.projectContext.technicalStack.join('\n- ')}`
      : '';
    const nonFunctional = context.projectContext?.nonFunctionalRequirements?.length
      ? `\nRequisitos Não Funcionais:\n- ${context.projectContext.nonFunctionalRequirements.join('\n- ')}`
      : '';
    const constraints = context.projectContext?.constraints?.length
      ? `\nRestrições e Premissas:\n- ${context.projectContext.constraints.join('\n- ')}`
      : '';
    const delivery = context.projectContext?.deliveryPhases?.length
      ? `\nFases de Entrega Previstas:\n- ${context.projectContext.deliveryPhases.join('\n- ')}`
      : '';
    const acceptance = context.projectContext?.acceptanceCriteria?.length
      ? `\nCritérios de Aceite:\n- ${context.projectContext.acceptanceCriteria.join('\n- ')}`
      : '';

    const additionalNotes = context.projectContext?.additionalNotes
      ? `\nObservações Adicionais:\n${context.projectContext.additionalNotes}`
      : '';

    const preferences = context.specificationPreferences
      ? `\nPreferências de Documentação:\n${[
          context.specificationPreferences.includeArchitecture ? '- Incluir visão de arquitetura e componentes técnicos' : null,
          context.specificationPreferences.includeDataDictionary ? '- Incluir dicionário de dados detalhado' : null,
          context.specificationPreferences.includeTestPlan ? '- Incluir plano de testes completo' : null,
          context.specificationPreferences.includeImplementationRoadmap ? '- Incluir roadmap macro de implementação' : null,
        ]
          .filter(Boolean)
          .join('\n')}`
      : '';

    return {
      systemPrompt: this.BASE_SYSTEM_PROMPT,
      userPrompt: `Gere uma especificação funcional e técnica completa para o projeto ABAP abaixo.

Nome do Projeto: ${projectName}
${projectType}
Resumo Executivo: ${context.description}${objectives}${businessRules}${tables}${flows}${integrations}${stakeholders}${technicalStack}${nonFunctional}${constraints}${delivery}${acceptance}${additionalNotes}${preferences}

O documento deve ser completo, profissional, organizado por seções numeradas e pronto para ser compartilhado com times funcionais e técnicos.`,
      temperature: 0.25,
      maxTokens: 6500,
    };
  }
}
