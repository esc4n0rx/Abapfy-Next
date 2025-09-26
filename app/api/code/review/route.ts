import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AIOrchestrator } from '@/lib/orchestrator';
import { CodeAnalysisRequest } from '@/types/codeAnalysis';
import { ReviewProcessor } from '@/lib/utils/reviewProcessor';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    const analysisRequest: CodeAnalysisRequest = await request.json();
    
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

    const result = await AIOrchestrator.analyzeCode(
      analysisRequest.code,
      'review',
      decoded.userId,
      undefined,
      analysisRequest.providerPreference
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erro na análise' },
        { status: 500 }
      );
    }
    
    let analysisResults;
    try {
      analysisResults = ReviewProcessor.processReviewResponse(result.code || '');
      
      if (!ReviewProcessor.validateReviewResponse(analysisResults)) {
        console.log('Resposta da IA pode estar incompleta');
      }
      
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      );
    }

    const { data: savedAnalysis, error: saveError } = await supabaseAdmin
      .from('code_analyses')
      .insert({
        user_id: decoded.userId,
        analysis_type: 'review',
        code: analysisRequest.code,
        results: {
          summary: analysisResults.summary,
          score: analysisResults.score,
          issues: ReviewProcessor.convertToAnalysisIssues(analysisResults.issues),
          suggestions: analysisResults.suggestions
        },
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
      console.error('Erro ao salvar análise no banco:', saveError);
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
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}