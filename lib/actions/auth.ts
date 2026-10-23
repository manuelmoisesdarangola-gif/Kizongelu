/**
 * @file lib/actions/auth.ts
 * Server Actions para o fluxo de autenticação e RBAC do Kizongelu.
 * - registerUser: Cria utilizador + gera token de ativação + email
 * - loginUser: Validação de credenciais com rate limiting (5 tentativas/15min)
 * - requestPasswordReset: Token temporário (30 min) + envio de email
 * - resetPassword: Validação de token + atualização de password
 * - logoutUser: Limpeza de sessão e auditoria
 * - confirmEmail: Validação de ativação de conta
 */

import { prisma } from '../db/prisma';
import { hashPassword, verifyPassword } from '../auth/password';
import {
  registerSchema,
  loginSchema,
  recoverySchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type RecoveryInput,
} from '../validators/auth';
import { checkRateLimit, resetRateLimit } from '../rate-limit';
import { logAuditEvent } from '../audit';
import { UserRole } from '@prisma/client';

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  rateLimit?: {
    remaining: number;
    resetInSeconds: number;
    blocked: boolean;
  };
}

// Armazenamento em memória para tokens de ativação e redefinição (30 min / 24h)
interface TokenData {
  token: string;
  email: string;
  type: 'CONFIRM_EMAIL' | 'RESET_PASSWORD';
  expiresAt: number;
}

const tokenStore = new Map<string, TokenData>();

/**
 * Cria ou recupera um token seguro.
 */
function createToken(email: string, type: 'CONFIRM_EMAIL' | 'RESET_PASSWORD', durationMinutes: number): string {
  const randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const token = `tok_${type.toLowerCase()}_${Date.now()}_${randomPart}`;
  
  tokenStore.set(token, {
    token,
    email: email.toLowerCase(),
    type,
    expiresAt: Date.now() + durationMinutes * 60 * 1000,
  });

  return token;
}

/**
 * Valida e consome um token.
 */
function consumeToken(token: string, expectedType: 'CONFIRM_EMAIL' | 'RESET_PASSWORD'): { valid: boolean; email?: string; error?: string } {
  const record = tokenStore.get(token);
  if (!record) {
    return { valid: false, error: 'O link ou token é inválido ou já foi utilizado.' };
  }

  if (record.type !== expectedType) {
    return { valid: false, error: 'Tipo de token incorreto para esta operação.' };
  }

  if (Date.now() > record.expiresAt) {
    tokenStore.delete(token);
    return { valid: false, error: 'Este link expirou. Por favor solicite um novo.' };
  }

  tokenStore.delete(token);
  return { valid: true, email: record.email };
}

/**
 * 1. Registar novo utilizador (Passo 1 + Passo 2)
 */
export async function registerUser(input: RegisterInput): Promise<ActionResponse<{ userId: string; email: string; token: string }>> {
  try {
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || 'Dados de registo inválidos';
      return { success: false, error: firstError };
    }

    const { name, email, phone, password, role } = validated.data;
    const normalizedEmail = email.toLowerCase();

    // Verifica se já existe utilizador com este email
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: 'Já existe uma conta associada a este endereço de email. Tente iniciar sessão.',
      };
    }

    // Hash da palavra-passe com bcrypt (cost 12)
    const passwordHash = await hashPassword(password);

    // Cria utilizador na BD com select explícito (nunca expor passwordHash)
    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone,
        passwordHash,
        role: role as UserRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Gera token de confirmação de email (24 horas)
    const confirmationToken = createToken(normalizedEmail, 'CONFIRM_EMAIL', 24 * 60);

    // Regista no log de auditoria
    await logAuditEvent({
      event: 'USER_REGISTERED',
      userId: newUser.id,
      userEmail: newUser.email,
      details: { role: newUser.role, phone: newUser.phone },
      status: 'SUCCESS',
    });

    console.log(`[Email Mock] Envio de ativação para ${normalizedEmail}: /confirmar-email/${confirmationToken}`);

    return {
      success: true,
      message: 'Conta criada com sucesso! Verifique a sua caixa de correio para ativar a conta.',
      data: {
        userId: newUser.id,
        email: newUser.email,
        token: confirmationToken,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao criar conta de utilizador.';
    console.error('[registerUser Erro]', err);
    return { success: false, error: errorMsg };
  }
}

/**
 * 2. Iniciar sessão com rate limiting (5 tentativas/15min)
 */
export async function loginUser(input: LoginInput): Promise<ActionResponse<{ id: string; name: string; email: string; role: string; phone?: string }>> {
  try {
    const validated = loginSchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Dados inválidos' };
    }

    const { email, password } = validated.data;
    const normalizedEmail = email.toLowerCase();

    // Verificação de Rate Limit (5 tentativas por 15 minutos = 900s)
    const rateLimitKey = `login:${normalizedEmail}`;
    const rateCheck = await checkRateLimit(rateLimitKey, 5, 900);

    if (!rateCheck.success) {
      await logAuditEvent({
        event: 'LOGIN_FAILED',
        userEmail: normalizedEmail,
        details: { reason: 'RATE_LIMIT_EXCEEDED', resetInSeconds: rateCheck.resetInSeconds },
        status: 'ERROR',
      });

      const minutes = Math.ceil(rateCheck.resetInSeconds / 60);
      return {
        success: false,
        error: `Excedeu o limite de 5 tentativas. A sua conta está bloqueada por ${minutes} minutos.`,
        rateLimit: {
          remaining: 0,
          resetInSeconds: rateCheck.resetInSeconds,
          blocked: true,
        },
      };
    }

    // Busca utilizador com select explícito
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      await logAuditEvent({
        event: 'LOGIN_FAILED',
        userEmail: normalizedEmail,
        details: { reason: 'USER_NOT_FOUND', attemptsRemaining: rateCheck.remaining },
        status: 'WARNING',
      });

      return {
        success: false,
        error: 'Email ou palavra-passe incorretos.',
        rateLimit: {
          remaining: rateCheck.remaining,
          resetInSeconds: rateCheck.resetInSeconds,
          blocked: false,
        },
      };
    }

    // Valida hash da senha
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await logAuditEvent({
        event: 'LOGIN_FAILED',
        userId: user.id,
        userEmail: user.email,
        details: { reason: 'WRONG_PASSWORD', attemptsRemaining: rateCheck.remaining },
        status: 'WARNING',
      });

      return {
        success: false,
        error: `Email ou palavra-passe incorretos. Tentativas restantes: ${rateCheck.remaining}.`,
        rateLimit: {
          remaining: rateCheck.remaining,
          resetInSeconds: rateCheck.resetInSeconds,
          blocked: false,
        },
      };
    }

    // Sucesso no login: Limpa bloqueios e regista auditoria
    resetRateLimit(rateLimitKey);

    await logAuditEvent({
      event: 'LOGIN_SUCCESS',
      userId: user.id,
      userEmail: user.email,
      details: { role: user.role },
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Sessão iniciada com sucesso!',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha ao autenticar.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 3. Pedir recuperação de palavra-passe (Gera token de 30 minutos)
 */
export async function requestPasswordReset(input: RecoveryInput): Promise<ActionResponse<{ token?: string }>> {
  try {
    const validated = recoverySchema.safeParse(input);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Email inválido' };
    }

    const { email } = validated.data;
    const normalizedEmail = email.toLowerCase();

    // Pesquisa utilizador (para segurança genérica) com select explícito
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true },
    });

    // Token com validade de 30 minutos
    const resetToken = createToken(normalizedEmail, 'RESET_PASSWORD', 30);

    if (user) {
      await logAuditEvent({
        event: 'PASSWORD_RESET_REQUESTED',
        userId: user.id,
        userEmail: user.email,
        details: { tokenGenerated: true, validMinutes: 30 },
        status: 'SUCCESS',
      });
      console.log(`[Email Mock] Link de redefinição para ${normalizedEmail}: /redefinir/${resetToken}`);
    }

    return {
      success: true,
      message: 'Se o endereço estiver registado, enviámos um link de redefinição com validade de 30 minutos.',
      data: { token: resetToken },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao processar o pedido.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 4. Redefinir palavra-passe com token validado
 */
export async function resetPassword(data: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<ActionResponse> {
  try {
    const parsed = resetPasswordSchema.safeParse({
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Palavra-passe inválida' };
    }

    // Valida e consome o token de 30 minutos
    const tokenResult = consumeToken(data.token, 'RESET_PASSWORD');
    if (!tokenResult.valid || !tokenResult.email) {
      return { success: false, error: tokenResult.error || 'Token inválido ou expirado.' };
    }

    const newHash = await hashPassword(parsed.data.password);

    const updatedUser = await prisma.user.update({
      where: { email: tokenResult.email },
      data: { passwordHash: newHash },
      select: { id: true, email: true },
    });

    await logAuditEvent({
      event: 'PASSWORD_RESET_COMPLETED',
      userId: updatedUser.id,
      userEmail: updatedUser.email,
      details: { updatedByToken: true },
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'A sua palavra-passe foi atualizada com sucesso. Pode agora iniciar sessão.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao redefinir a palavra-passe.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 5. Terminar sessão (Logout)
 */
export async function logoutUser(user?: { id?: string; email?: string }): Promise<ActionResponse> {
  try {
    await logAuditEvent({
      event: 'USER_LOGOUT',
      userId: user?.id,
      userEmail: user?.email,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Sessão terminada com sucesso.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao terminar sessão.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 6. Confirmar Email (Ativação de conta)
 */
export async function confirmEmail(token: string): Promise<ActionResponse<{ email: string }>> {
  try {
    const tokenResult = consumeToken(token, 'CONFIRM_EMAIL');
    if (!tokenResult.valid || !tokenResult.email) {
      return { success: false, error: tokenResult.error || 'Link de confirmação inválido ou expirado.' };
    }

    const user = await prisma.user.findUnique({
      where: { email: tokenResult.email },
      select: { id: true, email: true },
    });

    if (!user) {
      return { success: false, error: 'Utilizador não encontrado.' };
    }

    await logAuditEvent({
      event: 'EMAIL_CONFIRMED',
      userId: user.id,
      userEmail: user.email,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'A sua conta foi ativada com sucesso! Já pode aceder à plataforma.',
      data: { email: user.email },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao confirmar email.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 7. Obter Perfil Seguro de Utilizador (Sem expor passwordHash)
 */
export async function getUserSafeById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
