// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

// Forçar runtime dinâmico
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout realizado com sucesso' });
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  });

  return response;
}