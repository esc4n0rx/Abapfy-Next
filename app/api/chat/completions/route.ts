import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { ProvidersManager } from '@/lib/providers';
import { ChatCompletionRequestBody, ChatMessageEntity } from '@/types/chat';
import { ChatMessage } from '@/types/providers';
import { SystemGuard } from '@/lib/system-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Token não encontrado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = verifyToken(token);
    const body: ChatCompletionRequestBody = await request.json();

    if (!body.sessionId || !body.message?.trim()) {
      return new Response(JSON.stringify({ error: 'Sessão e mensagem são obrigatórias' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('id', body.sessionId)
      .eq('user_id', decoded.userId)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: 'Sessão não encontrada' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: project } = await supabaseAdmin
      .from('chat_projects')
      .select('*')
      .eq('id', session.project_id)
      .single();

    const { data: previousMessages, error: messagesError } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      throw messagesError;
    }

    const guardCheck = await SystemGuard.validateContext(decoded.userId, {
      type: 'chat_message',
      message: body.message,
      sessionTitle: session.title,
      projectName: project?.name,
      previousMessages: (previousMessages || [])
        .slice(-6)
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({ role: msg.role, content: msg.content })),
    });

    if (!guardCheck.approved) {
      return new Response(JSON.stringify({
        error: guardCheck.message || 'Solicitação bloqueada pelo guardião do sistema.',
        guardRejected: true,
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: providerSettings, error: providerError } = await supabaseAdmin
      .from('user_provider_settings')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('provider', session.provider)
      .single();

    if (providerError || !providerSettings || !providerSettings.is_enabled || !providerSettings.api_key) {
      return new Response(JSON.stringify({ error: 'Provider não configurado para o usuário' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const manager = new ProvidersManager();
    manager.initializeProvider(session.provider, providerSettings.api_key);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: session.system_prompt,
      },
      ...((previousMessages || []) as ChatMessageEntity[]).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: body.message,
      },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let accumulated = '';
        try {
          const { error: insertError } = await supabaseAdmin
            .from('chat_messages')
            .insert({
              session_id: session.id,
              user_id: decoded.userId,
              role: 'user',
              content: body.message,
            });

          if (insertError) {
            throw insertError;
          }

          const userMessageTime = new Date().toISOString();
          await supabaseAdmin
            .from('chat_sessions')
            .update({
              updated_at: userMessageTime,
              last_activity_at: userMessageTime,
            })
            .eq('id', session.id);

          if (session.project_id) {
            await supabaseAdmin
              .from('chat_projects')
              .update({
                updated_at: userMessageTime,
              })
              .eq('id', session.project_id);
          }

          const generator = manager.chatStream(
            session.provider,
            messages,
            session.model,
            {
              temperature: 0.4,
              maxTokens: 2048,
            }
          );

          for await (const chunk of generator) {
            accumulated += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          if (accumulated.trim()) {
            const now = new Date().toISOString();
            const { error: assistantError } = await supabaseAdmin
              .from('chat_messages')
              .insert({
                session_id: session.id,
                user_id: decoded.userId,
                role: 'assistant',
                content: accumulated,
              });

            if (assistantError) {
              console.error('Erro ao salvar resposta da IA:', assistantError);
            }

            await supabaseAdmin
              .from('chat_sessions')
              .update({
                updated_at: now,
                last_activity_at: now,
              })
              .eq('id', session.id);

            if (session.project_id) {
              await supabaseAdmin
                .from('chat_projects')
                .update({
                  updated_at: now,
                })
                .eq('id', session.project_id);
            }
          }

          controller.close();
        } catch (error: any) {
          console.error('Erro no streaming do chat:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: any) {
    console.error('Erro ao processar chat streaming:', error);
    return new Response(JSON.stringify({ error: error.message || 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
