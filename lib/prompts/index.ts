export * from './abap';
export * from './programs';
export * from './debug';

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
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}