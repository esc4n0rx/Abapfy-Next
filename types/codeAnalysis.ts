// types/codeAnalysis.ts
export interface CodeAnalysisRequest {
  code: string;
  analysisType: 'debug' | 'review';
  debugContext?: {
    errorMessage?: string;
    errorType?: string;
    flowDescription?: string;
    reproducible?: boolean;
    environment?: string;
  };
}

export interface CodeAnalysisResult {
  id: string;
  userId: string;
  analysisType: 'debug' | 'review';
  code: string;
  results: {
    summary: string;
    issues: AnalysisIssue[];
    suggestions: string[];
    score?: number;
    debugSolutions?: DebugSolution[];
  };
  debugContext?: {
    errorMessage?: string;
    errorType?: string;
    flowDescription?: string;
    reproducible?: boolean;
    environment?: string;
  };
  metadata: {
    provider: string;
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisIssue {
  id: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info' | 'suggestion';
  category: string;
  message: string;
  description?: string;
  suggestion?: string;
  codeSnippet?: string;
}

export interface DebugSolution {
  id: string;
  title: string;
  description: string;
  steps: string[];
  codeExample?: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface RecentAnalysis {
  id: string;
  analysisType: 'debug' | 'review';
  title: string;
  summary: string;
  score?: number;
  issueCount: number;
  createdAt: string;
}