/**
 * @file auth.ts
 * Configuração do NextAuth.js (Auth.js v5) para Kizongelu.
 * - Provider Credentials (email + palavra-passe)
 * - Adapter Prisma com tabela Session
 * - Cookies com httpOnly, secure, sameSite=lax
 * - Duração da sessão: 30 dias com refresh automático
 */

import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './lib/db/prisma';
import { verifyPassword } from './lib/auth/password';
import { loginSchema } from './lib/validators/auth';
import { checkRateLimit, resetRateLimit } from './lib/rate-limit';
import { logAuditEvent } from './lib/audit';
import { UserRole } from '@prisma/client';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'exemplo@empresa.co.ao' },
        password: { label: 'Palavra-passe', type: 'password' },
      },
      async authorize(credentials) {
        // Validação com Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Rate Limiting: 5 tentativas por 15 minutos (900s)
        const rateLimitKey = `login:${email.toLowerCase()}`;
        const limitCheck = await checkRateLimit(rateLimitKey, 5, 900);

        if (!limitCheck.success) {
          await logAuditEvent({
            event: 'LOGIN_FAILED',
            userEmail: email,
            details: { reason: 'RATE_LIMIT_EXCEEDED', resetInSeconds: limitCheck.resetInSeconds },
            status: 'ERROR',
          });
          throw new Error(
            `Demasiadas tentativas de início de sessão. A sua conta está temporariamente bloqueada por ${Math.ceil(
              limitCheck.resetInSeconds / 60
            )} minutos.`
          );
        }

        // Pesquisa utilizador no banco de dados
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          await logAuditEvent({
            event: 'LOGIN_FAILED',
            userEmail: email,
            details: { reason: 'USER_NOT_FOUND' },
            status: 'WARNING',
          });
          return null;
        }

        // Validação de senha com bcrypt
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          await logAuditEvent({
            event: 'LOGIN_FAILED',
            userId: user.id,
            userEmail: user.email,
            details: { reason: 'INVALID_PASSWORD', remainingAttempts: limitCheck.remaining },
            status: 'WARNING',
          });
          return null;
        }

        // Login bem sucedido: limpa o contador de tentativas e regista auditoria
        resetRateLimit(rateLimitKey);

        await logAuditEvent({
          event: 'LOGIN_SUCCESS',
          userId: user.id,
          userEmail: user.email,
          details: { role: user.role },
          status: 'SUCCESS',
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Compatível com edge middleware e credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 dias
    updateAge: 24 * 60 * 60, // Refresh automático a cada 24 horas
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/entrar',
    newUser: '/criar-conta',
    error: '/entrar',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: UserRole }).role || UserRole.PARTICULAR;
        token.phone = (user as unknown as { phone: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const u = session.user as unknown as { id: string; role: UserRole; phone?: string };
        u.id = token.id as string;
        u.role = token.role as UserRole;
        u.phone = token.phone as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
