// app/api/modules/recent/route.ts
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

    // Buscar módulos recentes do usuário
    const { data: modules, error } = await supabaseAdmin
      .from('abap_modules')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    // Formatar dados para o frontend
    const formattedModules = modules?.map(module => ({
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
    })) || [];

    return NextResponse.json({ 
      modules: formattedModules 
    });

  } catch (error: any) {
    console.error('Erro ao buscar módulos recentes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}