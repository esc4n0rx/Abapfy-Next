// app/api/code/debug/route.ts
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

    if (analysisRequest.analysisType !== 'debug') {
      return NextResponse.json(
        { error: 'Tipo de análise inválido' },
        { status: 400 }
      );
    }

    // Realizar análise via AIOrchestrator com provider preference
    const result = await AIOrchestrator.analyzeCode(
      analysisRequest.code,
      'debug',
      decoded.userId,
      analysisRequest.debugContext,
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
        analysis_type: 'debug',
        code: analysisRequest.code,
        debug_context: analysisRequest.debugContext,
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
    console.error('Erro no debug:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}