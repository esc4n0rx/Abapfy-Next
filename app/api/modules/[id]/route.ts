// app/api/modules/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const moduleId = params.id;

    // Verificar se o módulo existe e pertence ao usuário
    const { data: module } = await supabaseAdmin
      .from('abap_modules')
      .select('user_id')
      .eq('id', moduleId)
      .single();

    if (!module) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    if (module.user_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 403 }
      );
    }

    // Deletar módulo
    const { error } = await supabaseAdmin
      .from('abap_modules')
      .delete()
      .eq('id', moduleId)
      .eq('user_id', decoded.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: 'Módulo excluído com sucesso' 
    });

  } catch (error: any) {
    console.error('Erro ao excluir módulo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const moduleId = params.id;

    // Buscar módulo (próprio ou público)
    const { data: module, error } = await supabaseAdmin
      .from('abap_modules')
      .select('*')
      .eq('id', moduleId)
      .or(`user_id.eq.${decoded.userId},is_public.eq.true`)
      .single();

    if (error || !module) {
      return NextResponse.json(
        { error: 'Módulo não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      module: {
        id: module.id,
        userId: module.user_id,
        name: module.name,
        type: module.type,
        description: module.description,
        code: module.code,
        metadata: module.metadata || {},
        tags: module.tags || [],
        isPublic: module.is_public,
        createdAt: module.created_at,
        updatedAt: module.updated_at
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar módulo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}