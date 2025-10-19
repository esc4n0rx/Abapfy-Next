import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { CreateChatProjectRequest, ChatProject } from '@/types/chat';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function mapProject(record: any): ChatProject {
  return {
    id: record.id,
    userId: record.user_id,
    name: record.name,
    description: record.description,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { data, error } = await supabaseAdmin
      .from('chat_projects')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ projects: (data || []).map(mapProject) });
  } catch (error: any) {
    console.error('Erro ao listar projetos de chat:', error);
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
    const body: CreateChatProjectRequest = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Nome do projeto é obrigatório' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('chat_projects')
      .insert({
        user_id: decoded.userId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ project: mapProject(data) });
  } catch (error: any) {
    console.error('Erro ao criar projeto de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
