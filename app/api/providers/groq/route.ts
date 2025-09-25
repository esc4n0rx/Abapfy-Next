import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { GroqProvider } from '@/lib/providers/groq';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();
    const { messages, model, options = {} } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages são obrigatórias' },
        { status: 400 }
      );
    }

    // Buscar configurações do usuário
    const { data: settings } = await supabaseAdmin
      .from('user_provider_settings')
      .select('api_key, is_enabled')
      .eq('user_id', decoded.userId)
      .eq('provider', 'groq')
      .single();

    if (!settings || !settings.is_enabled || !settings.api_key) {
      return NextResponse.json(
        { error: 'Provider Groq não configurado ou desabilitado' },
        { status: 400 }
      );
    }

    // Inicializar provider
    const groqProvider = new GroqProvider(settings.api_key);
    
    // Fazer chamada
    const response = await groqProvider.chat(messages, model, options);

    // Registrar uso (não aguardar para não bloquear resposta)
    fetch('/api/providers/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'groq',
        model: response.model,
        tokensUsed: response.tokensUsed,
        costCents: response.costCents,
      }),
    }).catch(console.error);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Erro na API do Groq:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}