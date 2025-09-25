// lib/orchestrator.ts
import { ABAPPrompts, PromptContext } from '@/lib/prompts';
import { ChatMessage, ProviderResponse, ProviderType } from '@/types/providers';
import { CodeProcessor } from '@/lib/utils/codeProcessor';
import { GroqProvider } from '@/lib/providers/groq';
import { ArceeProvider } from '@/lib/providers/arcee';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { NextRequest } from 'next/server';
import { ProgramPrompts } from './prompts/programs';

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
      // 1. Verificar autenticação
      const token = request.request.cookies.get('auth-token')?.value;
      if (!token) {
        return {
          success: false,
          error: 'Token não encontrado'
        };
      }

      const decoded = verifyToken(token);

      // 2. Gerar prompt baseado no contexto
      const promptData = ABAPPrompts.getPrompt(request.context);

      // 3. Preparar mensagens para o chat
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

      // 4. Tentar providers em ordem de preferência
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
            decoded.userId
          );

          if (result.success && result.code) {
            // Processar e limpar o código antes de retornar
            const cleanedCode = CodeProcessor.extractABAPCode(result.code);
            
            // Validar se o código limpo é válido
            const validation = CodeProcessor.validateABAPCode(cleanedCode);
            
            if (!validation.isValid) {
              console.warn(`Código gerado possui problemas: ${validation.issues.join(', ')}`);
            }

            // Formatar o código
            const formattedCode = CodeProcessor.formatABAPCode(cleanedCode);

            // Registrar uso (fire and forget)
            this.logUsage(decoded.userId, provider, result.model, result.tokensUsed || 0)
              .catch(console.error);

            return {
              ...result,
              code: formattedCode
            };
          }
        } catch (error: any) {
          console.warn(`Provider ${provider} failed:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'Nenhum provider de IA disponível ou configurado'
      };

    } catch (error: any) {
      console.error('Erro na geração:', error);
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
    userId: string,
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
              maxTokens: promptData.maxTokens,
            },
            userId
          );

          if (result.success) {
            // Registrar uso
            this.logUsage(userId, provider, result.model, result.tokensUsed || 0)
              .catch(console.error);

            return result;
          }
        } catch (error: any) {
          console.warn(`Provider ${provider} failed:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'Nenhum provider de IA disponível'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Erro na análise: ${error.message}`
      };
    }
  }
  
  /**
   * Orquestra a geração de programas ABAP completos usando o melhor provider disponível
   */
  static async generateProgram(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // 1. Verificar autenticação
      const token = request.request.cookies.get('auth-token')?.value;
      if (!token) {
        return {
          success: false,
          error: 'Token não encontrado'
        };
      }

      const decoded = verifyToken(token);

      // 2. Gerar prompt baseado no contexto de programa
      const promptData = ProgramPrompts.getPrompt(request.context as any);

      // 3. Preparar mensagens para o chat
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

      // 4. Tentar providers em ordem de preferência
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
            decoded.userId
          );

          if (result.success && result.code) {
            // Processar e limpar o código antes de retornar
            const cleanedCode = CodeProcessor.extractABAPCode(result.code);
            
            // Validar se o código limpo é válido
            const validation = CodeProcessor.validateABAPCode(cleanedCode);
            
            if (!validation.isValid) {
              console.warn(`Código gerado possui problemas: ${validation.issues.join(', ')}`);
            }

            // Formatar o código
            const formattedCode = CodeProcessor.formatABAPCode(cleanedCode);

            // Registrar uso (fire and forget)
            this.logUsage(decoded.userId, provider, result.model, result.tokensUsed || 0)
              .catch(console.error);

            return {
              ...result,
              code: formattedCode
            };
          }
        } catch (error: any) {
          console.warn(`Provider ${provider} failed:`, error.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'Nenhum provider de IA disponível ou configurado'
      };

    } catch (error: any) {
      console.error('Erro na geração de programa:', error);
      return {
        success: false,
        error: `Erro na geração: ${error.message}`
      };
    }
  }

  
  /**
   * Define a ordem de prioridade dos providers
   */
  private static getProviderPriority(preference?: ProviderType): ProviderType[] {
    const allProviders: ProviderType[] = ['groq', 'arcee'];
    
    if (preference && allProviders.includes(preference)) {
      return [preference, ...allProviders.filter(p => p !== preference)];
    }
    
    // Priorizar Groq por ser mais rápido e barato
    return ['groq', 'arcee'];
  }

  /**
   * Tenta usar um provider específico
   */
  private static async tryProvider(
    provider: ProviderType,
    messages: ChatMessage[],
    options: { temperature: number; maxTokens: number },
    userId: string
  ): Promise<GenerationResult> {
    try {
      // Buscar configurações do provider para o usuário
      const { data: settings } = await supabaseAdmin
        .from('user_provider_settings')
        .select('api_key, is_enabled')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();

      if (!settings || !settings.is_enabled || !settings.api_key) {
        throw new Error(`Provider ${provider} não configurado ou desabilitado`);
      }

      let providerInstance;
      let response: ProviderResponse;

      switch (provider) {
        case 'groq':
          providerInstance = new GroqProvider(settings.api_key);
          response = await providerInstance.chat(messages, undefined, {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          });
          break;

        case 'arcee':
          providerInstance = new ArceeProvider(settings.api_key);
          response = await providerInstance.chat(messages, 'auto', {
            temperature: options.temperature,
            maxTokens: options.maxTokens,
          });
          break;

        default:
          throw new Error(`Provider ${provider} não suportado`);
      }

      return {
        success: true,
        code: response.content,
        provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
      };

    } catch (error: any) {
      throw new Error(`Erro no provider ${provider}: ${error.message}`);
    }
  }

  /**
   * Registra o uso do provider para estatísticas
   */
  private static async logUsage(
    userId: string, 
    provider: ProviderType, 
    model: string | undefined, 
    tokensUsed: number
  ): Promise<void> {
    try {
      let costCents = 0;

      // Calcular custo baseado no provider e modelo
      if (provider === 'groq') {
        // Groq é muito barato: ~$0.0001 por request
        costCents = 0.01;
      } else if (provider === 'arcee') {
        // Arcee: ~$0.005672 por request
        costCents = 0.57;
      }

      await supabaseAdmin
        .from('provider_usage_logs')
        .insert({
          user_id: userId,
          provider,
          model: model || 'unknown',
          tokens_used: tokensUsed,
          cost_cents: costCents,
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Erro ao registrar uso do provider:', error);
      // Não propagar o erro para não afetar a funcionalidade principal
    }
  }
}