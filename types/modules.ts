// types/modules.ts
export interface ABAPModule {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string;
  code: string;
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

export interface CreateModuleRequest {
  name: string;
  type: string;
  description: string;
  additionalContext?: string;
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

export interface GenerateModuleRequest {
  moduleType: string;
  description: string;
  additionalContext?: string;
  userPreferences?: {
    useModernSyntax?: boolean;
    includeErrorHandling?: boolean;
    includeDocumentation?: boolean;
  };
  providerPreference?: string;
}

export interface ModuleGenerationResult {
  success: boolean;
  code?: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  error?: string;
  estimatedCost?: number;
  guardRejected?: boolean;
}

export interface ModuleStats {
  totalModules: number;
  modulesByType: Record<string, number>;
  recentActivity: number;
  totalTokensUsed: number;
  totalCost: number;
  popularTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}