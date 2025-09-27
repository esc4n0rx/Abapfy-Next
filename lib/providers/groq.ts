import { Groq } from 'groq-sdk';
import { ChatMessage, GroqModel, ProviderResponse } from '@/types/providers';

export const GROQ_MODELS: GroqModel[] = [
  {
    id: 'qwen/qwen3-32b',
    name: 'Qwen 3 32B',
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    tokensPerMinute: 6000,
    tokensPerDay: 500000,
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    name: 'DeepSeek R1 Distill Llama 70B',
    requestsPerMinute: 30,
    requestsPerDay: 1000,
    tokensPerMinute: 6000,
    tokensPerDay: 100000,
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'Kimi K2 Instruct',
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    tokensPerMinute: 10000,
    tokensPerDay: 300000,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    requestsPerMinute: 30,
    requestsPerDay: 14400,
    tokensPerMinute: 6000,
    tokensPerDay: 500000,
  },
];

export class GroqProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'qwen/qwen3-32b',
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
      stream?: boolean;
    } = {}
  ): Promise<ProviderResponse> {
    const {
      temperature = 0.6,
      maxTokens = 4096,
      topP = 0.95,
      stream = false,
    } = options;

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        model,
        temperature,
        max_completion_tokens: maxTokens,
        top_p: topP,
        stream,
        stop: null,
      });

      if (stream) {
        // Para streaming, retornar o objeto completo para processar no cliente
        return {
          content: '', // Será preenchido via stream
          tokensUsed: 0, // Será calculado após o stream
          model,
          provider: 'groq',
          costCents: 0, // Groq é gratuito com limites
        };
      }

      const completion = chatCompletion as any;
      const content = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        model,
        provider: 'groq',
        costCents: 0, // Groq é gratuito com limites
      };
    } catch (error: any) {
      throw new Error(`Erro no Groq: ${error.message}`);
    }
  }

  async *chatStream(
    messages: ChatMessage[],
    model: string = 'qwen/qwen3-32b',
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      temperature = 0.6,
      maxTokens = 4096,
      topP = 0.95,
    } = options;

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        model,
        temperature,
        max_completion_tokens: maxTokens,
        top_p: topP,
        stream: true,
        stop: null,
      });

      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error: any) {
      throw new Error(`Erro no Groq Stream: ${error.message}`);
    }
  }

  static getModelLimits(modelId: string): GroqModel | undefined {
    return GROQ_MODELS.find(model => model.id === modelId);
  }
}