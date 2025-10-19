import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { ChatSession, CreateChatSessionRequest } from '@/types/chat';
import { ChatPrompts } from '@/lib/prompts';

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
    project: record.project
      ? {
          id: record.project.id,
          userId: record.project.user_id,
          name: record.project.name,
          description: record.project.description,
          createdAt: record.project.created_at,
          updatedAt: record.project.updated_at,
        }
      : null,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let query = supabaseAdmin
      .from('chat_sessions')
      .select('*, project:chat_projects(*)')
      .eq('user_id', decoded.userId)
      .order('last_activity_at', { ascending: false });

    if (projectId === 'none') {
      query = query.is('project_id', null);
    } else if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    return NextResponse.json({ sessions: (data || []).map(mapSession) });
  } catch (error: any) {
    console.error('Erro ao listar sessões de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body: CreateChatSessionRequest = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: 'Título da conversa é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.provider || !body.model) {
      return NextResponse.json(
        { error: 'Provider e modelo são obrigatórios' },
        { status: 400 }
      );
    }

    if (body.projectId) {
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
    }

    const now = new Date().toISOString();
    const systemPrompt = ChatPrompts.getConsultantSystemPrompt();

    const { data, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        user_id: decoded.userId,
        project_id: body.projectId || null,
        title: body.title.trim(),
        provider: body.provider,
        model: body.model,
        system_prompt: systemPrompt,
        created_at: now,
        updated_at: now,
        last_activity_at: now,
      })
      .select('*, project:chat_projects(*)')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ session: mapSession(data) });
  } catch (error: any) {
    console.error('Erro ao criar sessão de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
