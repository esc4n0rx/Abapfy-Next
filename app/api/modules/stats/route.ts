// app/api/modules/stats/route.ts
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

    // Buscar estatísticas básicas
    const { data: totalCount } = await supabaseAdmin
      .from('abap_modules')
      .select('*', { count: 'exact' })
      .eq('user_id', decoded.userId);

    // Buscar atividade recente (últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: recentActivity } = await supabaseAdmin
      .from('abap_modules')
      .select('*', { count: 'exact' })
      .eq('user_id', decoded.userId)
      .gte('created_at', weekAgo.toISOString());

    // Buscar distribuição por tipo
    const { data: modulesByType } = await supabaseAdmin
      .from('abap_modules')
      .select('type')
      .eq('user_id', decoded.userId);

    // Buscar dados de uso (tokens, custo)
    const { data: usageData } = await supabaseAdmin
      .from('abap_modules')
      .select('metadata')
      .eq('user_id', decoded.userId);

    // Processar dados
    const typeDistribution: Record<string, number> = {};
    let totalTokens = 0;
    let totalCost = 0;

    modulesByType?.forEach(module => {
      typeDistribution[module.type] = (typeDistribution[module.type] || 0) + 1;
    });

    usageData?.forEach(module => {
      const metadata = module.metadata || {};
      totalTokens += metadata.tokensUsed || 0;
      totalCost += metadata.estimatedCost || 0;
    });

    const popularTypes = Object.entries(typeDistribution)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / (totalCount?.length || 1)) * 100
      }))
      .sort((a, b) => b.count - a.count);

    const stats = {
      totalModules: totalCount?.length || 0,
      modulesByType: typeDistribution,
      recentActivity: recentActivity?.length || 0,
      totalTokensUsed: totalTokens,
      totalCost: totalCost,
      popularTypes: popularTypes.slice(0, 10)
    };

    return NextResponse.json({ stats });

  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}