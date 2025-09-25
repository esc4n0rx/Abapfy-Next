import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Buscar uso dos providers
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let query = supabaseAdmin
      .from('provider_usage')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('date', date);

    if (provider) {
      query = query.eq('provider', provider);
    }

    const { data: usage, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ usage });
  } catch (error: any) {
    console.error('Erro ao buscar uso dos providers:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Registrar uso de provider
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();
    const { provider, model, tokensUsed, costCents } = body;

    if (!provider || !model) {
      return NextResponse.json(
        { error: 'Provider e modelo são obrigatórios' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Upsert do uso
    const { data, error } = await supabaseAdmin
      .from('provider_usage')
      .upsert({
        user_id: decoded.userId,
        provider,
        model,
        date: today,
        tokens_used: tokensUsed || 0,
        requests_made: 1,
        cost_cents: costCents || 0,
      }, {
        onConflict: 'user_id,provider,model,date',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      const { data: currentUsage, error: fetchError } = await supabaseAdmin
        .from('provider_usage')
        .select('tokens_used, requests_made, cost_cents')
        .eq('user_id', decoded.userId)
        .eq('provider', provider)
        .eq('model', model)
        .eq('date', today)
        .single();

      if (fetchError || !currentUsage) {
        throw fetchError || new Error('Registro de uso não encontrado para atualização');
      }

      const updatedTokensUsed = (currentUsage.tokens_used || 0) + (tokensUsed || 0);
      const updatedRequestsMade = (currentUsage.requests_made || 0) + 1;
      const updatedCostCents = (currentUsage.cost_cents || 0) + (costCents || 0);

      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('provider_usage')
        .update({
          tokens_used: updatedTokensUsed,
          requests_made: updatedRequestsMade,
          cost_cents: updatedCostCents,
        })
        .eq('user_id', decoded.userId)
        .eq('provider', provider)
        .eq('model', model)
        .eq('date', today)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ usage: updateData });
    }

    return NextResponse.json({ usage: data });
  } catch (error: any) {
    console.error('Erro ao registrar uso do provider:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}