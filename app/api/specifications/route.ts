// app/api/specifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { CreateSpecificationRequest } from '@/types/specifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabaseAdmin
      .from('project_specifications')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ specifications: data || [] });
  } catch (error: any) {
    console.error('Erro ao buscar especificações:', error);
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
    const body: CreateSpecificationRequest = await request.json();

    const {
      projectName,
      projectType,
      summary,
      specification,
      context,
      preferences,
      metadata,
      isPublic,
    } = body;

    if (!projectName || !summary || !specification) {
      return NextResponse.json(
        { error: 'Nome do projeto, resumo e especificação são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('project_specifications')
      .insert({
        user_id: decoded.userId,
        name: projectName,
        project_type: projectType,
        summary,
        specification,
        context: context || {},
        preferences: preferences || {},
        metadata: metadata || {},
        is_public: isPublic || false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    const formatted = data
      ? {
          id: data.id,
          userId: data.user_id,
          projectName: data.name,
          projectType: data.project_type,
          summary: data.summary,
          specification: data.specification,
          context: data.context || {},
          preferences: data.preferences || {},
          metadata: data.metadata || {},
          isPublic: data.is_public,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      : null;

    return NextResponse.json({ specification: formatted });
  } catch (error: any) {
    console.error('Erro ao salvar especificação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
