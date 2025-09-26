// app/api/code/analysis/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { id: analysisId } = await context.params;

    // Buscar análise específica
    const { data: analysis, error } = await supabaseAdmin
      .from('code_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Análise não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Erro ao buscar análise:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
