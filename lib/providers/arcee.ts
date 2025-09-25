import { ChatMessage, ProviderResponse } from '@/types/providers';

export class ArceeProvider {
  private apiKey: string;
  private baseUrl = 'https://conductor.arcee.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'auto',
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): Promise<ProviderResponse> {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      topP = 0.9,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Arcee API Error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const tokensUsed = data.usage?.total_tokens || 0;

      // Custo médio estimado
      const costCents = 0.5672; // $0.005672 convertido para cents

      return {
        content,
        tokensUsed,
        model,
        provider: 'arcee',
        costCents,
      };
    } catch (error: any) {
      throw new Error(`Erro no Arcee: ${error.message}`);
    }
  }

  async *chatStream(
    messages: ChatMessage[],
    model: string = 'auto',
    options: {
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      topP = 0.9,
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Arcee API Error: ${response.status} - ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignorar linhas malformadas
            }
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Erro no Arcee Stream: ${error.message}`);
    }
  }
}