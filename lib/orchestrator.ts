// lib/orchestrator.ts
import { ABAPPrompts, PromptContext } from '@/lib/prompts';
import { ChatMessage, ProviderResponse, ProviderType } from '@/types/providers';

import { NextRequest } from 'next/server';

export interface GenerationRequest {
  context: PromptContext;
  providerPreference?: ProviderType;
  request: NextRequest;
}

export interface GenerationResult {
  success: boolean;
  code?: string;
  provider?: ProviderType;
  model?: string;
  tokensUsed?: number;
  error?: string;
}

export class AIOrchestrator {
  /**
   * Orquestra a geração de código ABAP usando o melhor provider disponível
   */
  static async generateModule(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // 1. Gerar prompt baseado no contexto
      const promptData = ABAPPrompts.getPrompt(request.context);

      // 2. Preparar mensagens para o chat
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: promptData.systemPrompt
        },
        {
          role: 'user',
          content: promptData.userPrompt
        }
      ];

      // 3. Tentar providers em ordem de preferência
      const providers = this.getProviderPriority(request.providerPreference);
      
      for (const provider of providers) {
        try {
          const result = await this.tryProvider(
            provider,
            messages,
            {
              temperature: promptData.temperature,
              maxTokens: promptData.maxTokens,
            },
            request.request
          );

          if (result.success) {
            return result;
          }
        } catch (error) {
          console.warn(`Provider ${provider} failed:`, error);
          continue;
        }
      }

      return {
        success: false,
        error: 'Nenhum provider de IA disponível ou configurado'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Erro na geração: ${error.message}`
      };
    }
  }

  /**
   * Analisa código ABAP (debug ou review)
   */
  static async analyzeCode(
    code: string, 
    analysisType: 'debug' | 'review',
    providerPreference?: ProviderType
  ): Promise<GenerationResult> {
    try {
      const promptData = analysisType === 'debug' 
        ? ABAPPrompts.getDebugPrompt(code)
        : ABAPPrompts.getReviewPrompt(code);

      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: promptData.systemPrompt
        },
        {
          role: 'user',
          content: promptData.userPrompt
        }
      ];

      const providers = this.getProviderPriority(providerPreference);
      
      for (const provider of providers) {
        try {
          const result = await this.tryProvider(
            provider,
            messages,
            {
              temperature: promptData.temperature,
              maxTokens: promptData.maxTokens
            },
            undefined as unknown as NextRequest
          );

          if (result.success) {
            return result;
          }
        } catch (error) {
          console.warn(`Provider ${provider} failed:`, error);
          continue;
        }
      }

      return {
        success: false,
        error: 'Nenhum provider de IA disponível para análise'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Erro na análise: ${error.message}`
      };
    }
  }

  private static async tryProvider(
    provider: ProviderType,
    messages: ChatMessage[],
    options: any,
    request: NextRequest
  ): Promise<GenerationResult> {
    // TODO: Trocar para uma variável de ambiente em produção
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/providers/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      body: JSON.stringify({
        messages,
        ...options
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Provider ${provider} error`);
    }

    const data: ProviderResponse = await response.json();

    return {
      success: true,
      code: data.content,
      provider: data.provider,
      model: data.model,
      tokensUsed: data.tokensUsed
    };
  }

  /**
   * Define a prioridade dos providers baseada na preferência e disponibilidade
   */
  private static getProviderPriority(preference?: ProviderType): ProviderType[] {
    const allProviders: ProviderType[] = ['groq', 'arcee'];
    
    if (preference && allProviders.includes(preference)) {
      // Colocar preferência primeiro, outros depois
      return [preference, ...allProviders.filter(p => p !== preference)];
    }

    // Ordem padrão: Groq primeiro (gratuito), depois Arcee
    return allProviders;
  }

  /**
   * Verifica quais providers estão disponíveis
   */
  static async getAvailableProviders(): Promise<{
    provider: ProviderType;
    name: string;
    available: boolean;
    model?: string;
  }[]> {
    try {
      // TODO: Trocar para uma variável de ambiente em produção
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/providers/settings`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.providers.map((p: any) => ({
          provider: p.type,
          name: p.name,
          available: p.isEnabled && !!p.apiKey,
          model: p.defaultModel
        }));
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }

    return [
      { provider: 'groq', name: 'Groq', available: false },
      { provider: 'arcee', name: 'Arcee', available: false }
    ];
  }
}