export type ProviderType = 'groq' | 'arcee';

export interface GroqModel {
  id: string;
  name: string;
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

export interface ProviderUsage {
  id: string;
  userId: string;
  provider: ProviderType;
  model: string;
  tokensUsed: number;
  requestsMade: number;
  costCents: number;
  date: string;
  createdAt: string;
}

export interface ProviderSettings {
  id: string;
  userId: string;
  provider: ProviderType;
  apiKey?: string;
  defaultModel?: string;
  isEnabled: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  type: ProviderType;
  name: string;
  description: string;
  isEnabled: boolean;
  apiKey?: string;
  defaultModel?: string;
  models?: GroqModel[];
  costPerRequest?: number; // em cents
  settings?: Record<string, any>;
}

export interface ProviderContextType {
  providers: ProviderConfig[];
  usage: ProviderUsage[];
  isLoading: boolean;
  updateProvider: (provider: ProviderType, config: Partial<ProviderConfig>) => Promise<void>;
  getUsage: (provider: ProviderType, date?: string) => Promise<ProviderUsage[]>;
  refreshUsage: () => Promise<void>;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
  model: string;
  provider: ProviderType;
  costCents: number;
}