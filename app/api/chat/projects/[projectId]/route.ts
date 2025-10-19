import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { ChatProject } from '@/types/chat';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { projectId } = params;
    const body = await request.json();
    const updates: Record<string, any> = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ error: 'Nome do projeto não pode ser vazio' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('chat_projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', decoded.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ project: mapProject(data) });
  } catch (error: any) {
    console.error('Erro ao atualizar projeto de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { projectId } = params;

    const { error } = await supabaseAdmin
      .from('chat_projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', decoded.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover projeto de chat:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
