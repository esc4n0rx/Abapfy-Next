import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { ProvidersManager } from '@/lib/providers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Buscar configurações dos providers
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    const { data: settings, error } = await supabaseAdmin
      .from('user_provider_settings')
      .select('*')
      .eq('user_id', decoded.userId);

    if (error) {
      throw error;
    }

    // Merge com configurações padrão
    const defaultConfigs = ProvidersManager.getDefaultConfigs();
    const providers = defaultConfigs.map(defaultConfig => {
      const userSetting = settings?.find(s => s.provider === defaultConfig.type);
      
      if (userSetting) {
        return {
          ...defaultConfig,
          apiKey: userSetting.api_key,
          defaultModel: userSetting.default_model || defaultConfig.defaultModel,
          isEnabled: userSetting.is_enabled,
          settings: userSetting.settings || {},
        };
      }
      
      return defaultConfig;
    });

    return NextResponse.json({ providers });
  } catch (error: any) {
    console.error('Erro ao buscar configurações dos providers:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Salvar configurações de provider
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body = await request.json();
    const { provider, apiKey, defaultModel, isEnabled, settings } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider é obrigatório' },
        { status: 400 }
      );
    }

    // Upsert das configurações
    const { data, error } = await supabaseAdmin
      .from('user_provider_settings')
      .upsert({
        user_id: decoded.userId,
        provider,
        api_key: apiKey,
        default_model: defaultModel,
        is_enabled: isEnabled ?? true,
        settings: settings || {},
      }, {
        onConflict: 'user_id,provider',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: 'Configurações salvas com sucesso',
      setting: data 
    });
  } catch (error: any) {
    console.error('Erro ao salvar configurações do provider:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}