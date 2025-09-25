// app/api/programs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { CreateProgramRequest } from '@/types/programs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Buscar programas do usuário
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data: programs, error } = await supabaseAdmin
      .from('abap_programs')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({ programs });
  } catch (error: any) {
    console.error('Erro ao buscar programas:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo programa
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const body: CreateProgramRequest = await request.json();

    const {
      name,
      type,
      description,
      code,
      programContext,
      specification,
      metadata,
      tags,
      isPublic
    } = body;

    if (!name || !type || !description || !code) {
      return NextResponse.json(
        { error: 'Nome, tipo, descrição e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe programa com mesmo nome para o usuário
    const { data: existingProgram } = await supabaseAdmin
      .from('abap_programs')
      .select('id')
      .eq('user_id', decoded.userId)
      .eq('name', name)
      .single();

    if (existingProgram) {
      return NextResponse.json(
        { error: 'Já existe um programa com este nome' },
        { status: 409 }
      );
    }

    const { data: program, error } = await supabaseAdmin
      .from('abap_programs')
      .insert({
        user_id: decoded.userId,
        name,
        type,
        description,
        code,
        program_context: programContext || {},
        specification,
        metadata: metadata || {},
        tags: tags || [],
        is_public: isPublic || false
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Erro ao criar programa:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}