import { ProviderType } from '@/types/providers';

export interface ChatProject {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  projectId?: string | null;
  title: string;
  provider: ProviderType;
  model: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  project?: ChatProject | null;
}

export interface ChatMessageEntity {
  id: string;
  sessionId: string;
  userId: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface CreateChatProjectRequest {
  name: string;
  description?: string;
}

export interface CreateChatSessionRequest {
  title: string;
  provider: ProviderType;
  model: string;
  projectId?: string | null;
}

export interface ChatCompletionRequestBody {
  sessionId: string;
  message: string;
}
