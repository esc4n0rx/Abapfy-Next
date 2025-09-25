import { GroqProvider, GROQ_MODELS } from './groq';
import { ArceeProvider } from './arcee';
import { ProviderType, ProviderConfig, ChatMessage, ProviderResponse } from '@/types/providers';

export class ProvidersManager {
  private providers: Map<ProviderType, any> = new Map();

  constructor() {
    // Providers serão inicializados quando as chaves estiverem disponíveis
  }

  initializeProvider(type: ProviderType, apiKey: string) {
    switch (type) {
      case 'groq':
        this.providers.set(type, new GroqProvider(apiKey));
        break;
      case 'arcee':
        this.providers.set(type, new ArceeProvider(apiKey));
        break;
      default:
        throw new Error(`Provider não suportado: ${type}`);
    }
  }

  async chat(
    providerType: ProviderType,
    messages: ChatMessage[],
    model: string,
    options: any = {}
  ): Promise<ProviderResponse> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider ${providerType} não inicializado`);
    }

    return provider.chat(messages, model, options);
  }

  async *chatStream(
    providerType: ProviderType,
    messages: ChatMessage[],
    model: string,
    options: any = {}
  ): AsyncGenerator<string, void, unknown> {
    const provider = this.providers.get(providerType);
    if (!provider) {
      throw new Error(`Provider ${providerType} não inicializado`);
    }

    yield* provider.chatStream(messages, model, options);
  }

  static getDefaultConfigs(): ProviderConfig[] {
    return [
      {
        type: 'groq',
        name: 'Groq',
        description: 'API gratuita com modelos de alta performance e limites diários',
        isEnabled: false,
        models: GROQ_MODELS,
        defaultModel: 'qwen/qwen3-32b',
        costPerRequest: 0,
      },
      {
        type: 'arcee',
        name: 'Arcee Conductor',
        description: 'API premium com modelo auto-otimizado e cobrança por uso',
        isEnabled: false,
        defaultModel: 'auto',
        costPerRequest: 0.5672,
      },
    ];
  }
}

export { GROQ_MODELS } from './groq';
export * from '@/types/providers';