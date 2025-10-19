import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { ChatSession } from '@/types/chat';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mapSession(record: any): ChatSession {
  return {
    id: record.id,
    userId: record.user_id,
    projectId: record.project_id,
    title: record.title,
    provider: record.provider,
    model: record.model,
    systemPrompt: record.system_prompt,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastActivityAt: record.last_activity_at,
    project: null,
  };
}

export async function PATCH(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.title !== undefined) {
      if (!body.title.trim()) {
        return NextResponse.json({ error: 'Título não pode ser vazio' }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.projectId !== undefined) {
      if (body.projectId === null) {
        updates.project_id = null;
      } else {
        const { error: projectError } = await supabaseAdmin
          .from('chat_projects')
          .select('id')
          .eq('id', body.projectId)
          .eq('user_id', decoded.userId)
          .single();

        if (projectError) {
          return NextResponse.json(
            { error: 'Projeto não encontrado' },
            { status: 404 }
          );
        }

        updates.project_id = body.projectId;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .update(updates)
      .eq('id', params.sessionId)
      .eq('user_id', decoded.userId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ session: mapSession(data) });
  } catch (error: any) {
    console.error('Erro ao atualizar sessão de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', params.sessionId)
      .eq('user_id', decoded.userId);

    if (error) {
      throw error;
    }

    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('session_id', params.sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover sessão de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
