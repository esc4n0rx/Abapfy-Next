// app/api/code/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AIOrchestrator } from '@/lib/orchestrator';
import { CodeAnalysisRequest } from '@/types/codeAnalysis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação usando cookies (como outras APIs)
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const analysisRequest: CodeAnalysisRequest = await request.json();
    
    // Validar request
    if (!analysisRequest.code || !analysisRequest.code.trim()) {
      return NextResponse.json(
        { error: 'Código é obrigatório' },
        { status: 400 }
      );
    }

    if (analysisRequest.analysisType !== 'review') {
      return NextResponse.json(
        { error: 'Tipo de análise inválido' },
        { status: 400 }
      );
    }

    // Realizar análise via AIOrchestrator com provider preference
    const result = await AIOrchestrator.analyzeCode(
      analysisRequest.code,
      'review',
      decoded.userId,
      undefined, // debugContext não usado no review
      analysisRequest.providerPreference
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro na análise' },
        { status: 500 }
      );
    }

    // Parsear resultado JSON da IA
    let analysisResults;
    try {
      analysisResults = JSON.parse(result.code || '{}');
    } catch (error) {
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    // Salvar no banco
    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('code_analyses')
      .insert({
        user_id: decoded.userId,
        analysis_type: 'review',
        code: analysisRequest.code,
        results: analysisResults,
        metadata: {
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed,
          processingTime: Date.now()
        }
      })
      .select()
      .single();

    if (saveError) {
      console.error('Erro ao salvar análise:', saveError);
      return NextResponse.json(
        { error: 'Erro ao salvar análise' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis
    });

  } catch (error: any) {
    console.error('Erro no code review:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}