// app/api/specifications/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { AIOrchestrator } from '@/lib/orchestrator';
import { GenerateSpecificationRequest } from '@/types/specifications';
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
    const body: GenerateSpecificationRequest = await request.json();

    const {
      projectName,
      projectType,
      summary,
      objectives = [],
      tables = [],
      businessRules = [],
      flows = [],
      integrations = [],
      stakeholders = [],
      technicalStack = [],
      nonFunctionalRequirements = [],
      constraints = [],
      deliveryPhases = [],
      acceptanceCriteria = [],
      additionalNotes,
      preferences,
      providerPreference,
    } = body;

    if (!projectName || !summary) {
      return NextResponse.json(
        { error: 'Nome do projeto e resumo são obrigatórios' },
        { status: 400 }
      );
    }

    const context = {
      name: projectName,
      description: summary,
      summary,
      moduleType: 'specification',
      projectType,
      projectContext: {
        objectives,
        tables,
        businessRules,
        flows,
        integrations,
        stakeholders,
        technicalStack,
        nonFunctionalRequirements,
        constraints,
        deliveryPhases,
        acceptanceCriteria,
        additionalNotes,
      },
      specificationPreferences: preferences,
    };

    const guardPreferences = preferences
      ? Object.entries(preferences).reduce<Record<string, unknown>>((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {})
      : undefined;

    const guardPayload: GuardPayload = {
      type: 'specification_generation',
      projectName,
      projectType,
      summary,
      objectives,
      tables,
      businessRules,
      flows,
      integrations,
      stakeholders,
      technicalStack,
      nonFunctionalRequirements,
      constraints,
      deliveryPhases,
      acceptanceCriteria,
      additionalNotes,
      preferences: guardPreferences,
    };

    const result = await AIOrchestrator.generateSpecification({
      context,
      providerPreference: providerPreference as any,
      request,
      guardPayload,
    });

    if (!result.success) {
      const status = result.guardRejected ? 403 : 400;
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          guardRejected: result.guardRejected ?? false,
        },
        { status }
      );
    }

    let estimatedCost = 0;
    if (result.provider === 'arcee' && result.tokensUsed) {
      estimatedCost = 0.5672;
    }

    return NextResponse.json({
      success: true,
      specification: result.content || result.code,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      estimatedCost,
    });
  } catch (error: any) {
    console.error('Erro na geração de especificação:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
