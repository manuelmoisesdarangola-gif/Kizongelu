/**
 * @file lib/actions/share.ts
 * Gestão de Links de Partilha (ShareLink), Códigos de Acesso, Registo de Auditoria (ShareAccess)
 * e Verificação Pública de Autenticidade de Orçamentos Kizongelu.
 */

import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import { getProjectDraft } from './wizard';
import { getPreview } from './preview';
import { calculate } from '../calculation-engine';
import { z } from 'zod';

export const createShareLinkSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  requireCode: z.boolean().optional(),
  validDays: z.number().int().positive().optional(),
  createdBy: z.string().optional(),
});

export const verifyShareTokenSchema = z.object({
  tokenOrId: z.string().min(1, 'Token ou ID obrigatório'),
  accessCode: z.string().optional(),
});

export const revokeShareLinkSchema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  userId: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * Gera token UUID v4 seguro compatível tanto com Browser como com Node.js runtime
 */
function generateSecureToken(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type VerificationStatus =
  | 'AUTHENTIC' // Válido e atual (original)
  | 'OUTDATED' // Válido mas com preços/motor desatualizados
  | 'REVOKED' // Revogado explicitamente pelo autor ou administrador
  | 'EXPIRED' // Prazo de validade (90 dias padrão) expirado
  | 'CODE_REQUIRED' // Exige código de segurança de 6 dígitos
  | 'INVALID_CODE' // Código fornecido não confere
  | 'NOT_FOUND'; // Token inexistente

export interface ShareLinkRecord {
  id: string;
  documentId: string;
  projectId: string;
  token: string;
  expiresAt: string;
  requireCode: boolean;
  code?: string | null;
  revokedAt?: string | null;
  createdBy: string;
  createdAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface ShareAccessRecord {
  id: string;
  shareLinkId: string;
  ipHash: string;
  userAgent: string;
  accessedAt: string;
  event: 'VERIFICATION_VIEW' | 'DOWNLOAD_PDF';
}

export interface VerificationResult {
  status: VerificationStatus;
  message: string;
  token: string;
  budget?: {
    id: string;
    projectId: string;
    title: string;
    type: string;
    province: string;
    municipality: string;
    areaM2: number;
    floors: number;
    bedrooms: number;
    bathrooms: number;
    finishLevel: string;
    grandTotalKz: number;
    confidenceLevel: string;
    confidenceScore: number;
    engineVersion: string;
    issuedAt: string;
    expiresAt: string;
    revokedAt?: string | null;
    isOriginal: boolean;
    clientName?: string;
  };
  requireCode?: boolean;
}

// Armazenamento em memória (cache / fallback se BD offline)
const inMemoryShareLinks = new Map<string, ShareLinkRecord>();
const inMemoryShareAccesses: ShareAccessRecord[] = [];

/**
 * Função utilitária para hash seguro de IP compatível com Browser e Node.js
 */
export function hashIp(ip: string = '127.0.0.1'): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < ip.length; i++) {
    const ch = ip.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
  const hex4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
  return (hex1 + hex2 + hex3 + hex4).substring(0, 32);
}

/**
 * Cria ou recupera o documento e link de partilha único com validade padrão de 90 dias.
 */
export async function createShareLink(
  projectId: string,
  options: {
    requireCode?: boolean;
    code?: string;
    expiresInDays?: number;
    createdBy?: string;
  } = {}
): Promise<ShareLinkRecord> {
  const expiresInDays = options.expiresInDays || 90;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const token = generateSecureToken();
  const createdBy = options.createdBy || 'usr_current_or_admin';

  let code: string | null = null;
  if (options.code) {
    code = options.code;
  } else if (options.requireCode) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  }

  const linkRecord: ShareLinkRecord = {
    id: `sl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    documentId: `doc_${projectId}`,
    projectId,
    token,
    expiresAt,
    requireCode: !!options.requireCode,
    code,
    revokedAt: null,
    createdBy,
    createdAt: now.toISOString(),
    status: 'ACTIVE',
  };

  // Salva em memória
  inMemoryShareLinks.set(token, linkRecord);

  // Tenta persistir no Prisma se configurado
  if (process.env.DATABASE_URL) {
    try {
      // Garante ou localiza Documento com select explícito
      let doc = await prisma.document.findFirst({
        where: { projectId, type: 'ORCAMENTO_OFICIAL' },
        select: { id: true, projectId: true },
      });

      if (!doc) {
        doc = await prisma.document.create({
          data: {
            projectId,
            type: 'ORCAMENTO_OFICIAL',
            fileUrl: `/api/pdf/${projectId}`,
            uploadedBy: createdBy,
          },
          select: { id: true, projectId: true },
        });
      }

      await prisma.shareLink.create({
        data: {
          documentId: doc.id,
          token,
          expiresAt: new Date(expiresAt),
          requireCode: !!options.requireCode,
          code,
          createdBy,
        },
        select: {
          id: true,
          token: true,
        },
      });
    } catch (err) {
      console.warn('[ShareLink] Aviso ao persistir no Prisma (usando fallback em memória):', err);
    }
  }

  // Registo de auditoria
  await logAuditEvent({
    event: 'SHARE_LINK_CREATED',
    userId: createdBy,
    details: {
      projectId,
      token,
      expiresAt,
      requireCode: !!options.requireCode,
    },
    status: 'SUCCESS',
  });

  return linkRecord;
}

/**
 * Obtém ou gera automaticamente o link oficial do projeto
 */
export async function getOrCreateProjectShareLink(
  projectId: string,
  createdBy?: string
): Promise<ShareLinkRecord> {
  // Procura se já existe um ativo
  for (const link of inMemoryShareLinks.values()) {
    if (link.projectId === projectId && !link.revokedAt && new Date(link.expiresAt) > new Date()) {
      return link;
    }
  }

  // Tenta buscar no Prisma
  if (process.env.DATABASE_URL) {
    try {
      const dbLink = await prisma.shareLink.findFirst({
        where: {
          document: { projectId },
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          documentId: true,
          token: true,
          expiresAt: true,
          requireCode: true,
          code: true,
          revokedAt: true,
          createdBy: true,
          createdAt: true,
          document: {
            select: { projectId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbLink) {
        const record: ShareLinkRecord = {
          id: dbLink.id,
          documentId: dbLink.documentId,
          projectId: dbLink.document.projectId,
          token: dbLink.token,
          expiresAt: dbLink.expiresAt ? dbLink.expiresAt.toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
          requireCode: dbLink.requireCode,
          code: dbLink.code,
          revokedAt: dbLink.revokedAt ? dbLink.revokedAt.toISOString() : null,
          createdBy: dbLink.createdBy,
          createdAt: dbLink.createdAt.toISOString(),
          status: 'ACTIVE',
        };
        inMemoryShareLinks.set(record.token, record);
        return record;
      }
    } catch (_) {}
  }

  return await createShareLink(projectId, { createdBy });
}

/**
 * Revoga um link de partilha
 */
export async function revokeShareLink(
  token: string,
  userId: string = 'admin',
  reason: string = 'Revogado pelo titular'
): Promise<{ success: boolean; message: string }> {
  const link = inMemoryShareLinks.get(token);
  const now = new Date().toISOString();

  if (link) {
    link.revokedAt = now;
    link.status = 'REVOKED';
  }

  if (process.env.DATABASE_URL) {
    try {
      await prisma.shareLink.updateMany({
        where: { token },
        data: { revokedAt: new Date(now) },
      });
    } catch (err) {
      console.warn('[ShareLink] Aviso ao revogar no Prisma:', err);
    }
  }

  await logAuditEvent({
    event: 'SHARE_LINK_REVOKED',
    userId,
    details: { token, reason },
    status: 'WARNING',
  });

  return { success: true, message: 'Link de partilha e verificação revogado com sucesso.' };
}

/**
 * Verificação pública de um token ou ID de orçamento
 */
export async function verifyShareToken(
  tokenOrId: string,
  accessCode?: string,
  accessInfo?: { ip?: string; userAgent?: string }
): Promise<VerificationResult> {
  const cleanInput = (tokenOrId || '').trim();
  if (!cleanInput) {
    return {
      status: 'NOT_FOUND',
      message: 'Nenhum código ou token de verificação foi fornecido.',
      token: tokenOrId,
    };
  }

  // 1. Localiza o link de partilha
  let shareLink = inMemoryShareLinks.get(cleanInput);

  // Se não encontrou por token exato, tenta encontrar por projectId ou id do orçamento
  if (!shareLink) {
    for (const item of inMemoryShareLinks.values()) {
      if (item.projectId === cleanInput || item.id === cleanInput || item.token === cleanInput) {
        shareLink = item;
        break;
      }
    }
  }

  // Se ainda não encontrou, busca no Prisma
  if (!shareLink && process.env.DATABASE_URL) {
    try {
      const dbLink = await prisma.shareLink.findFirst({
        where: {
          OR: [
            { token: cleanInput },
            { document: { projectId: cleanInput } },
          ],
        },
        select: {
          id: true,
          documentId: true,
          token: true,
          expiresAt: true,
          requireCode: true,
          code: true,
          revokedAt: true,
          createdBy: true,
          createdAt: true,
          document: {
            select: { projectId: true },
          },
        },
      });

      if (dbLink) {
        shareLink = {
          id: dbLink.id,
          documentId: dbLink.documentId,
          projectId: dbLink.document.projectId,
          token: dbLink.token,
          expiresAt: dbLink.expiresAt ? dbLink.expiresAt.toISOString() : new Date(Date.now() + 90 * 86400000).toISOString(),
          requireCode: dbLink.requireCode,
          code: dbLink.code,
          revokedAt: dbLink.revokedAt ? dbLink.revokedAt.toISOString() : null,
          createdBy: dbLink.createdBy,
          createdAt: dbLink.createdAt.toISOString(),
          status: dbLink.revokedAt ? 'REVOKED' : 'ACTIVE',
        };
        inMemoryShareLinks.set(shareLink.token, shareLink);
      }
    } catch (_) {}
  }

  // Se não foi encontrado link prévio, mas existe um projeto válido no sistema, cria para o projeto
  if (!shareLink) {
    try {
      const preview = await getPreview(cleanInput);
      if (preview) {
        shareLink = await getOrCreateProjectShareLink(cleanInput);
      }
    } catch (_) {}
  }

  if (!shareLink) {
    return {
      status: 'NOT_FOUND',
      message: 'O token ou ID informado não corresponde a nenhum orçamento autêntico registado.',
      token: cleanInput,
    };
  }

  // 2. Verifica se foi revogado
  if (shareLink.revokedAt) {
    return {
      status: 'REVOKED',
      message: 'Este documento foi revogado pelo autor ou pela administração e já não possui validade jurídica.',
      token: shareLink.token,
      budget: {
        id: `KZ-2025-${shareLink.projectId.substring(0, 4).toUpperCase()}`,
        projectId: shareLink.projectId,
        title: 'Orçamento Revogado',
        type: 'Construção Civil',
        province: 'Angola',
        municipality: '',
        areaM2: 0,
        floors: 1,
        bedrooms: 0,
        bathrooms: 0,
        finishLevel: 'Standard',
        grandTotalKz: 0,
        confidenceLevel: 'LOW',
        confidenceScore: 0,
        engineVersion: 'v1.4-ao',
        issuedAt: shareLink.createdAt,
        expiresAt: shareLink.expiresAt,
        revokedAt: shareLink.revokedAt,
        isOriginal: false,
      },
    };
  }

  // 3. Verifica se expirou
  const now = new Date();
  const expiresAtDate = new Date(shareLink.expiresAt);
  if (now > expiresAtDate) {
    return {
      status: 'EXPIRED',
      message: 'O período de validade de 90 dias deste link de verificação expirou.',
      token: shareLink.token,
      budget: {
        id: `KZ-2025-${shareLink.projectId.substring(0, 4).toUpperCase()}`,
        projectId: shareLink.projectId,
        title: 'Orçamento com Prazo Expirado',
        type: 'Construção Civil',
        province: 'Angola',
        municipality: '',
        areaM2: 0,
        floors: 1,
        bedrooms: 0,
        bathrooms: 0,
        finishLevel: 'Standard',
        grandTotalKz: 0,
        confidenceLevel: 'LOW',
        confidenceScore: 0,
        engineVersion: 'v1.4-ao',
        issuedAt: shareLink.createdAt,
        expiresAt: shareLink.expiresAt,
        isOriginal: false,
      },
    };
  }

  // 4. Verifica se exige código de segurança de 6 dígitos
  if (shareLink.requireCode) {
    if (!accessCode) {
      return {
        status: 'CODE_REQUIRED',
        message: 'Este orçamento está protegido por um código de segurança de 6 dígitos.',
        token: shareLink.token,
        requireCode: true,
      };
    }

    if (accessCode.trim() !== shareLink.code) {
      return {
        status: 'INVALID_CODE',
        message: 'O código de segurança fornecido é incorreto.',
        token: shareLink.token,
        requireCode: true,
      };
    }
  }

  // 5. Carrega dados autênticos do orçamento para exibição segura
  const preview = await getPreview(shareLink.projectId);
  const budgetId = `KZ-2025-${shareLink.projectId.substring(0, 4).toUpperCase()}`;

  // Regista acesso em ShareAccess
  const ip = accessInfo?.ip || '127.0.0.1';
  const userAgent = accessInfo?.userAgent || 'Browser-Client';
  const ipHash = hashIp(ip);

  const accessRecord: ShareAccessRecord = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    shareLinkId: shareLink.id,
    ipHash,
    userAgent,
    accessedAt: new Date().toISOString(),
    event: 'VERIFICATION_VIEW',
  };
  inMemoryShareAccesses.push(accessRecord);

  // Tenta gravar no Prisma se disponível
  if (process.env.DATABASE_URL) {
    try {
      await prisma.shareAccess.create({
        data: {
          shareLinkId: shareLink.id,
          ipHash,
          userAgent,
          event: 'VERIFICATION_VIEW',
        },
        select: {
          id: true,
        },
      });
    } catch (_) {}
  }

  // Auditoria
  await logAuditEvent({
    event: 'DOCUMENT_VERIFIED',
    details: {
      projectId: shareLink.projectId,
      token: shareLink.token,
      ipHash,
    },
    status: 'SUCCESS',
  });

  return {
    status: 'AUTHENTIC',
    message: 'Documento autêntico certificado pela plataforma Kizongelu.',
    token: shareLink.token,
    requireCode: shareLink.requireCode,
    budget: {
      id: budgetId,
      projectId: shareLink.projectId,
      title: preview.title || 'Moradia Unifamiliar',
      type: preview.summary.typeLabel || 'Construção Nova',
      province: preview.summary.province || 'Luanda',
      municipality: preview.summary.municipality || 'Talatona',
      areaM2: preview.summary.area || 160,
      floors: preview.summary.floors || 1,
      bedrooms: preview.summary.bedrooms || 3,
      bathrooms: preview.summary.bathrooms || 2,
      finishLevel: preview.summary.finishLevelLabel || 'Standard',
      grandTotalKz: preview.totals.grandTotal || 29387686,
      confidenceLevel: preview.confidence.level || 'HIGH',
      confidenceScore: preview.confidence.score || 94,
      engineVersion: 'v1.4-ao (Determinístico)',
      issuedAt: shareLink.createdAt,
      expiresAt: shareLink.expiresAt,
      isOriginal: true,
      clientName: 'Manuel Moisés (Particular)',
    },
  };
}
