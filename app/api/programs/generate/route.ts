// app/api/programs/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AIOrchestrator } from '@/lib/orchestrator';
import { GenerateProgramRequest } from '@/types/programs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body: GenerateProgramRequest = await request.json();

    const { 
      name,
      programType, 
      description, 
      programContext,
      specification,
      userPreferences, 
      providerPreference 
    } = body;

    if (!name || !programType || !description) {
      return NextResponse.json(
        { error: 'Nome, tipo de programa e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar contexto para o orquestrador
    const context = {
      description,
      moduleType: programType, // Add moduleType as required by PromptContext
      additionalContext: specification,
      userPreferences: {
        useModernSyntax: userPreferences?.useModernSyntax ?? true,
        includeErrorHandling: userPreferences?.includeErrorHandling ?? true,
        includeDocumentation: userPreferences?.includeDocumentation ?? true,
        includePerformanceOptimizations: userPreferences?.includePerformanceOptimizations ?? true,
      }
    };

    // Gerar código usando o orquestrador
    const result = await AIOrchestrator.generateProgram({
      context,
      providerPreference: providerPreference as any,
      request,
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }

    // Calcular custo estimado (se aplicável)
    let estimatedCost = 0;
    if (result.provider === 'arcee' && result.tokensUsed) {
      // Custo médio do Arcee: ~$0.005672 por request
      estimatedCost = 0.5672; // em cents
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      estimatedCost
    });

  } catch (error: any) {
    console.error('Erro na geração de programa:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}