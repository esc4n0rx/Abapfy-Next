// types/specifications.ts
export interface ProjectSpecificationContext {
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
}

export interface SpecificationPreferences {
  includeArchitecture?: boolean;
  includeDataDictionary?: boolean;
  includeTestPlan?: boolean;
  includeImplementationRoadmap?: boolean;
}

export interface ProjectSpecification {
  id: string;
  userId: string;
  projectName: string;
  projectType?: string;
  summary: string;
  specification: string;
  context: ProjectSpecificationContext;
  preferences: SpecificationPreferences;
  metadata: {
    provider?: string;
    model?: string;
    tokensUsed?: number;
    generatedAt?: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateSpecificationRequest {
  projectName: string;
  projectType?: string;
  summary: string;
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
  preferences?: SpecificationPreferences;
  providerPreference?: string;
}

export interface CreateSpecificationRequest {
  projectName: string;
  projectType?: string;
  summary: string;
  specification: string;
  context: ProjectSpecificationContext;
  preferences: SpecificationPreferences;
  metadata: {
    provider?: string;
    model?: string;
    tokensUsed?: number;
    generatedAt?: string;
  };
  isPublic?: boolean;
}

export interface SpecificationGenerationResult {
  success: boolean;
  specification?: string;
  provider?: string;
  model?: string;
  tokensUsed?: number;
  estimatedCost?: number;
  error?: string;
  guardRejected?: boolean;
}
