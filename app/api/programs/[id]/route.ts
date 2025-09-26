// app/api/programs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET - Buscar programa específico
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { id } = await context.params;

    const { data: program, error } = await supabaseAdmin
      .from('abap_programs')
      .select('*')
      .eq('id', id)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !program) {
      return NextResponse.json(
        { error: 'Programa não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Erro ao buscar programa:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar programa
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { id } = await context.params;
    const body = await request.json();

    const { data: program, error } = await supabaseAdmin
      .from('abap_programs')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', decoded.userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ program });
  } catch (error: any) {
    console.error('Erro ao atualizar programa:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar programa
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const { id } = await context.params;

    const { error } = await supabaseAdmin
      .from('abap_programs')
      .delete()
      .eq('id', id)
      .eq('user_id', decoded.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao deletar programa:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
