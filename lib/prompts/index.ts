// lib/prompts/index.ts
export * from './abap';
export * from './programs'; // This correctly exports everything from programs.ts

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