// app/api/code/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
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

    // Buscar análises recentes
    const { data: analyses, error } = await supabaseAdmin
      .from('code_analyses')
      .select(`
        id,
        analysis_type,
        results,
        created_at
      `)
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar análises:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar análises' },
        { status: 500 }
      );
    }

    // Transformar para formato RecentAnalysis
    const recentAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      analysisType: analysis.analysis_type,
      title: `Análise ${analysis.analysis_type === 'debug' ? 'Debug' : 'Code Review'}`,
      summary: analysis.results.summary || 'Análise de código',
      score: analysis.results.score,
      issueCount: analysis.results.issues?.length || 0,
      createdAt: analysis.created_at
    }));

    return NextResponse.json({
      success: true,
      analyses: recentAnalyses
    });

  } catch (error) {
    console.error('Erro ao buscar análises recentes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}