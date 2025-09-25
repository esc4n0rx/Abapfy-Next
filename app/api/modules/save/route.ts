// app/api/modules/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { CreateModuleRequest } from '@/types/modules';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body: CreateModuleRequest = await request.json();

    const { name, type, description, code, metadata, tags, isPublic } = body;

    if (!name || !type || !description || !code) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, type, description, code' },
        { status: 400 }
      );
    }

    // Salvar módulo no banco
    const { data: module, error } = await supabaseAdmin
      .from('abap_modules')
      .insert({
        user_id: decoded.userId,
        name: name.trim(),
        type,
        description: description.trim(),
        code,
        metadata: metadata || {},
        tags: tags || [],
        is_public: isPublic || false
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar módulo:', error);
      return NextResponse.json(
        { error: 'Erro ao salvar módulo no banco de dados' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Módulo salvo com sucesso',
      module 
    });

  } catch (error: any) {
    console.error('Erro ao salvar módulo:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}