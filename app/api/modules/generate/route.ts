// app/api/modules/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AIOrchestrator } from '@/lib/orchestrator';
import { GenerateModuleRequest } from '@/types/modules';
import { GuardPayload } from '@/lib/system-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    verifyToken(token);
    const body: GenerateModuleRequest = await request.json();

    const { moduleType, description, additionalContext, userPreferences, providerPreference } = body;

    if (!moduleType || !description) {
      return NextResponse.json(
        { error: 'Tipo de módulo e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar contexto para o orquestrador
    const context = {
      description,
      moduleType,
      additionalContext,
      userPreferences: {
        useModernSyntax: userPreferences?.useModernSyntax ?? true,
        includeErrorHandling: userPreferences?.includeErrorHandling ?? true,
        includeDocumentation: userPreferences?.includeDocumentation ?? true,
      }
    };

    const guardPayload: GuardPayload = {
      type: 'module_generation',
      moduleType,
      description,
      additionalContext,
      userPreferences: context.userPreferences,
    };

    // Gerar código usando o orquestrador
    const result = await AIOrchestrator.generateModule({
      context,
      providerPreference: providerPreference as any,
      request,
      guardPayload,
    });

    if (!result.success) {
      const status = result.guardRejected ? 403 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
        guardRejected: result.guardRejected ?? false,
      }, { status });
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
    console.error('Erro na geração de módulo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}