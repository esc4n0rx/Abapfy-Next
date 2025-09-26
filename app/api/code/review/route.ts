// app/api/code/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AIOrchestrator } from '@/lib/orchestrator';
import { CodeAnalysisRequest } from '@/types/codeAnalysis';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

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

    // Realizar análise via AIOrchestrator
   const result = await AIOrchestrator.analyzeCode(
        analysisRequest.code,
        'review',
        decoded.userId,
        undefined, // debugContext não usado no review
        undefined // providerPreference
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
          processingTime: Date.now() // Simplificado
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

  } catch (error) {
    console.error('Erro no code review:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}