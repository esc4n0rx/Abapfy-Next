// types/programs.ts
export interface ABAPProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: string;
  code: string;
  programContext: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  };
  specification?: string;
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    generatedAt: string;
    parameters?: Record<string, any>;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramRequest {
  name: string;
  type: string;
  description: string;
  programContext?: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  };
  specification?: string;
  tags?: string[];
  isPublic?: boolean;
  providerPreference?: string;
  code: string;
  metadata?: {
    provider: string;
    model: string;
    tokensUsed: number;
    generatedAt: string;
    parameters?: Record<string, any>;
  };
}

export interface GenerateProgramRequest {
  name: string;
  programType: string;
  description: string;
  programContext?: {
    tables?: string[];
    businessRules?: string[];
    modules?: string[];
    parameters?: Record<string, any>;
    customLogic?: string;
  };
  specification?: string;
  userPreferences?: {
    useModernSyntax?: boolean;
    includeErrorHandling?: boolean;
    includeDocumentation?: boolean;
    includePerformanceOptimizations?: boolean;
  };
  providerPreference?: string;
}

export interface ProgramGenerationResult {
  success: boolean;
  code?: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  error?: string;
  estimatedCost?: number;
}

export interface ProgramStats {
  totalPrograms: number;
  programsByType: Record<string, number>;
  recentActivity: number;
  totalTokensUsed: number;
  totalCost: number;
  popularTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}