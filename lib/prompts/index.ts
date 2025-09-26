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
  };
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}