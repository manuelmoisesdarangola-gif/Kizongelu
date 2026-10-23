/**
 * @file middleware.ts
 * Middleware de proteção de rotas e RBAC para Next.js App Router:
 * - Protege `/painel`, `/projeto`, `/wizard`, `/plano`, `/definicoes` (exige autenticação)
 * - Protege `/admin/*` (acesso exclusivo a role ADMIN)
 * - Redireciona utilizadores já autenticados para fora de `/entrar` e `/criar-conta`
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/painel', '/projeto', '/wizard', '/plano', '/definicoes'];
const AUTH_ROUTES = ['/entrar', '/criar-conta'];
const ADMIN_PREFIX = '/admin';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Busca cookie de sessão (NextAuth / Auth.js)
  const sessionToken =
    request.cookies.get('__Secure-authjs.session-token')?.value ||
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('Kizongelu-session')?.value;

  const userRole = request.cookies.get('Kizongelu-user-role')?.value;
  const isAuthenticated = !!sessionToken;

  // 1. Redireciona utilizador já autenticado se tentar aceder a /entrar ou /criar-conta
  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = '/painel';
    return NextResponse.redirect(url);
  }

  // 2. Proteção de rotas do painel e orçamentação (exige utilizador logado)
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/entrar';
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // 3. Proteção rigorosa de rotas de Administração (/admin/*)
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = '/entrar';
      url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      return NextResponse.redirect(url);
    }

    // Apenas utilizadores com role ADMIN podem prosseguir
    if (userRole !== 'ADMIN') {
      return new NextResponse(
        JSON.stringify({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Acesso negado: apenas administradores da Kizongelu podem aceder a esta secção.',
        }),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/painel/:path*',
    '/projeto/:path*',
    '/wizard/:path*',
    '/plano/:path*',
    '/definicoes/:path*',
    '/admin/:path*',
    '/entrar',
    '/criar-conta',
  ],
};
