import { SpecificationPreferences } from '@/types/specifications';

export * from './abap';
export * from './programs';
export * from './debug';
export * from './specifications';

export interface PromptContext {
  description: string;
  moduleType: string;
  additionalContext?: string;
  userPreferences?: {
    useModernSyntax?: boolean;
    includeErrorHandling?: boolean;
    includeDocumentation?: boolean;
    includePerformanceOptimizations?: boolean;
  };
  specificationPreferences?: SpecificationPreferences;
  name?: string;
  programType?: string;
  programContext?: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  };
  specification?: string;
  summary?: string;
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

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}