// app/api/specifications/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

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

    const { data, error } = await supabaseAdmin
      .from('project_specifications')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    const formatted = (data || []).map(spec => ({
      id: spec.id,
      userId: spec.user_id,
      projectName: spec.name,
      projectType: spec.project_type,
      summary: spec.summary,
      specification: spec.specification,
      context: spec.context || {},
      preferences: spec.preferences || {},
      metadata: spec.metadata || {},
      isPublic: spec.is_public,
      createdAt: spec.created_at,
      updatedAt: spec.updated_at,
    }));

    return NextResponse.json({ specifications: formatted });
  } catch (error: any) {
    console.error('Erro ao buscar especificações recentes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
