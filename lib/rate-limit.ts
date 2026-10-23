/**
 * @file lib/rate-limit.ts
 * Sistema de Rate Limiting para controlo de tentativas de acesso (5 tentativas por 15 min).
 * Implementado com suporte in-memory para desenvolvimento/testes e compatível com Upstash.
 */

interface RateLimitRecord {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  blocked: boolean;
}

/**
 * Verifica e contabiliza uma tentativa para uma determinada chave (ex: `login:email@domain.ao`).
 *
 * @param key Identificador único (ex: email ou IP)
 * @param maxAttempts Máximo de tentativas permitidas (padrão: 5)
 * @param windowSeconds Janela temporal em segundos (padrão: 15 minutos = 900s)
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttemptAt: now,
    });
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      resetInSeconds: windowSeconds,
      blocked: false,
    };
  }

  // Verifica se o tempo da janela já expirou
  if (now - existing.firstAttemptAt > windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttemptAt: now,
    });
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts - 1,
      resetInSeconds: windowSeconds,
      blocked: false,
    };
  }

  // Se já excedeu as tentativas
  if (existing.count >= maxAttempts) {
    const timeRemainingMs = windowMs - (now - existing.firstAttemptAt);
    const resetInSeconds = Math.max(1, Math.ceil(timeRemainingMs / 1000));
    return {
      success: false,
      limit: maxAttempts,
      remaining: 0,
      resetInSeconds,
      blocked: true,
    };
  }

  // Incrementa a tentativa
  existing.count += 1;
  const timeRemainingMs = windowMs - (now - existing.firstAttemptAt);
  const resetInSeconds = Math.max(1, Math.ceil(timeRemainingMs / 1000));

  return {
    success: true,
    limit: maxAttempts,
    remaining: Math.max(0, maxAttempts - existing.count),
    resetInSeconds,
    blocked: false,
  };
}

/**
 * Limpa o contador de tentativas quando um login ou ação for bem-sucedida.
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Consulta o estado atual de rate limit sem incrementar.
 */
export function getRateLimitStatus(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = 900
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitStore.get(key);

  if (!existing || now - existing.firstAttemptAt > windowMs) {
    return {
      success: true,
      limit: maxAttempts,
      remaining: maxAttempts,
      resetInSeconds: windowSeconds,
      blocked: false,
    };
  }

  const isBlocked = existing.count >= maxAttempts;
  const timeRemainingMs = windowMs - (now - existing.firstAttemptAt);
  const resetInSeconds = Math.max(1, Math.ceil(timeRemainingMs / 1000));

  return {
    success: !isBlocked,
    limit: maxAttempts,
    remaining: Math.max(0, maxAttempts - existing.count),
    resetInSeconds,
    blocked: isBlocked,
  };
}
