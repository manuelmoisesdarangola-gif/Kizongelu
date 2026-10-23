/**
 * @file lib/ai-service/cache.ts
 * Sistema de Cache de Interações de IA (tabela AiInteraction).
 * 
 * Regra:
 * Evitar chamadas repetidas à API e reprocessamento desnecessário.
 * Chave de Cache: hash(input + tipo).
 */

import { prisma } from '../db/prisma';
import { AiResult } from './types';

// Fallback em memória para ambientes de testes e browsers
const memoryCache = new Map<string, AiResult>();

/**
 * Gera um hash determinístico para a chave de cache a partir do input e do tipo.
 */
export function generateCacheKey(type: string, input: any): string {
  const serialized = typeof input === 'string' ? input : JSON.stringify(input);
  let hash = 0;
  const combined = `${type}:${serialized}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Converte para inteiro de 32 bits
  }
  return `ai_${type}_${Math.abs(hash).toString(16)}`;
}

/**
 * Obtém uma resposta do cache de AiInteraction se existir.
 */
export async function getCachedAiInteraction(type: string, input: any): Promise<AiResult | null> {
  const cacheKey = generateCacheKey(type, input);

  // 1. Procura na cache em memória
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey) || null;
  }

  // 2. Procura na base de dados Prisma / AiInteraction
  try {
    if (prisma && (prisma as any).aiInteraction) {
      const record = await (prisma as any).aiInteraction.findUnique({
        where: { cacheKey },
      });
      if (record && record.response) {
        const cachedRes = record.response as AiResult;
        memoryCache.set(cacheKey, cachedRes);
        return cachedRes;
      }
    }
  } catch (err) {
    // Ignora erro de BD e continua
  }

  return null;
}

/**
 * Guarda uma resposta de IA na tabela AiInteraction.
 */
export async function setCachedAiInteraction(type: string, input: any, response: AiResult): Promise<void> {
  const cacheKey = generateCacheKey(type, input);

  // 1. Salva na cache em memória
  memoryCache.set(cacheKey, response);

  // 2. Salva na tabela AiInteraction
  try {
    if (prisma && (prisma as any).aiInteraction) {
      const inputHash = cacheKey.replace(`ai_${type}_`, '');
      await (prisma as any).aiInteraction.create({
        data: {
          cacheKey,
          type,
          inputHash,
          input: typeof input === 'string' ? { text: input } : input,
          response: response as any,
        },
      });
    }
  } catch (err) {
    // Se já existir ou erro de BD, tenta atualizar ou ignora
    try {
      if (prisma && (prisma as any).aiInteraction) {
        await (prisma as any).aiInteraction.update({
          where: { cacheKey },
          data: { response: response as any },
        });
      }
    } catch {
      // Ignora erro
    }
  }
}
