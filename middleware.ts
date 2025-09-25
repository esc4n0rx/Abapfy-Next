// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rotas que precisam de autenticação
  const protectedPaths = ['/dashboard', '/programas', '/modulos', '/debugger', '/code-review'];
  
  // Verificar se a rota atual é protegida
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Apenas verificação básica do token aqui
    // A verificação completa será feita nas API routes
    try {
      // Verificação simples se o token existe e tem formato JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token inválido');
      }
      return NextResponse.next();
    } catch (error) {
      // Token inválido, redirecionar para login
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth-token');
      return response;
    }
  }

  // Se estiver logado e tentar acessar a página de login, redirecionar para dashboard
  if (pathname === '/') {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      try {
        // Verificação simples do token
        const parts = token.split('.');
        if (parts.length === 3) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        // Token inválido, permitir acesso à página de login
        const response = NextResponse.next();
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};