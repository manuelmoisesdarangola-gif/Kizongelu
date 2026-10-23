/**
 * @file lib/actions/consent.ts
 * Gestão de Consentimentos Granulares e Conformidade com a Lei n.º 22/11 de Angola.
 * 
 * Funcionalidades:
 * - Registo de logs de consentimento (ConsentLog) com tipo, timestamp, IP anonimizado e User-Agent.
 * - Gestão de consentimentos granulares: Essencial, Analítico, Funcional e Marketing.
 * - Exportação de dados do titular (Direito de Acesso e Portabilidade).
 * - Processo de eliminação faseada de conta (Direito ao Esquecimento - 7, 30 e 90 dias).
 */

import { z } from 'zod';

export type ConsentType = 'essential' | 'analytics' | 'functional' | 'marketing';

export const consentDecisionSchema = z.object({
  types: z.record(z.string(), z.boolean()),
  userId: z.string().optional(),
});

export const requestDataExportSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador obrigatório'),
});

export const requestAccountDeletionSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador obrigatório'),
});

export interface ConsentLog {
  id: string;
  userId?: string;
  ipHash: string;
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  userAgent: string;
}

export interface UserConsentsState {
  essential: boolean; // Sempre true
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  lastUpdated: string;
}

const STORAGE_CONSENT_LOGS_KEY = 'kizongelu_consent_logs';
const STORAGE_USER_CONSENTS_KEY = 'kizongelu_user_consents';
const STORAGE_EXPORT_REQUESTS_KEY = 'kizongelu_export_requests';
const STORAGE_DELETION_REQUESTS_KEY = 'kizongelu_deletion_requests';

const inMemoryConsentLogs: ConsentLog[] = [];
let inMemoryConsentsState: UserConsentsState = {
  essential: true,
  analytics: false,
  functional: true,
  marketing: false,
  lastUpdated: new Date().toISOString(),
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Erro ao ler ${key}:`, e);
  }
  return defaultValue;
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao guardar ${key}:`, e);
  }
}

/**
 * Hash simples e irreversível de IP para conformidade e privacidade
 */
export function hashIp(ip: string = '127.0.0.1'): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return 'ip_hash_' + Math.abs(hash).toString(16);
}

/**
 * Obtém o estado atual dos consentimentos do utilizador
 */
export function getUserConsents(): UserConsentsState {
  if (typeof window === 'undefined') {
    return inMemoryConsentsState;
  }
  return getStorage<UserConsentsState>(STORAGE_USER_CONSENTS_KEY, inMemoryConsentsState);
}

/**
 * Regista uma decisão de consentimento individual ou em lote
 */
export async function logConsentDecision(
  types: Partial<Record<ConsentType, boolean>>,
  userId?: string,
  userAgent: string = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Node'
): Promise<UserConsentsState> {
  const validated = consentDecisionSchema.safeParse({ types, userId });
  const validTypes = validated.success ? validated.data.types : types;
  const validUserId = validated.success ? validated.data.userId : userId;

  const current = getUserConsents();
  const now = new Date().toISOString();
  const ipHash = hashIp(typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');

  const updatedState: UserConsentsState = {
    ...current,
    essential: true, // Essenciais são estritamente necessários para o funcionamento
    analytics: validTypes.analytics !== undefined ? validTypes.analytics : current.analytics,
    functional: validTypes.functional !== undefined ? validTypes.functional : current.functional,
    marketing: validTypes.marketing !== undefined ? validTypes.marketing : current.marketing,
    lastUpdated: now,
  };

  // Cria os logs individuais
  const existingLogs = getStorage<ConsentLog[]>(STORAGE_CONSENT_LOGS_KEY, inMemoryConsentLogs);
  const newLogs: ConsentLog[] = Object.entries(validTypes).map(([type, granted]) => ({
    id: `consent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: validUserId,
    ipHash,
    type: type as ConsentType,
    granted: Boolean(granted),
    timestamp: now,
    userAgent,
  }));

  const allLogs = [...newLogs, ...existingLogs].slice(0, 100);

  // Guarda estado
  if (typeof window !== 'undefined') {
    setStorage(STORAGE_USER_CONSENTS_KEY, updatedState);
    setStorage(STORAGE_CONSENT_LOGS_KEY, allLogs);
    localStorage.setItem('kizongelu_ga_consent_accepted', updatedState.analytics ? 'true' : 'false');
  } else {
    inMemoryConsentsState = updatedState;
    inMemoryConsentLogs.unshift(...newLogs);
  }

  return updatedState;
}

/**
 * Retorna os logs de consentimento do utilizador (para a página de definições)
 */
export async function getConsentLogs(userId?: string): Promise<ConsentLog[]> {
  const logs = getStorage<ConsentLog[]>(STORAGE_CONSENT_LOGS_KEY, inMemoryConsentLogs);
  if (!userId) return logs;
  return logs.filter((l) => !l.userId || l.userId === userId);
}

/**
 * Revoga um consentimento específico
 */
export async function revokeConsentType(type: ConsentType, userId?: string): Promise<UserConsentsState> {
  if (type === 'essential') {
    throw new Error('Não é possível revogar cookies essenciais necessários ao funcionamento da plataforma.');
  }
  return logConsentDecision({ [type]: false }, userId);
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'READY';
  downloadUrl?: string;
  expiresAt?: string;
}

/**
 * Solicita a exportação integral de dados do utilizador (Artigo da Lei 22/11 de Angola)
 */
export async function requestDataExport(userId: string): Promise<DataExportRequest> {
  const validated = requestDataExportSchema.safeParse({ userId });
  const validUserId = validated.success ? validated.data.userId : userId;

  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Válido por 24h

  const request: DataExportRequest = {
    id: `export_${Date.now()}`,
    userId: validUserId,
    requestedAt: now.toISOString(),
    status: 'READY', // Processamento simulado como pronto para descarregamento
    downloadUrl: `/api/utilizador/exportar-dados?id=${validUserId}&t=${Date.now()}`,
    expiresAt: expires.toISOString(),
  };

  const allRequests = getStorage<DataExportRequest[]>(STORAGE_EXPORT_REQUESTS_KEY, []);
  setStorage(STORAGE_EXPORT_REQUESTS_KEY, [request, ...allRequests]);

  return request;
}

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  requestedAt: string;
  coolingOffUntil: string;   // 7 dias: Arrependimento
  personalDataPurgeAt: string; // 30 dias: Dados pessoais
  projectDataPurgeAt: string;  // 90 dias: Dados de projeto (exceto fiscais AGT)
  status: 'ACTIVE_COOLING_OFF' | 'CANCELLED' | 'CONFIRMED';
}

/**
 * Inicia o processo formal de encerramento e eliminação de conta em fases
 */
export async function requestAccountDeletion(userId: string): Promise<AccountDeletionRequest> {
  const validated = requestAccountDeletionSchema.safeParse({ userId });
  const validUserId = validated.success ? validated.data.userId : userId;

  const now = new Date();
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const day30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const day90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const req: AccountDeletionRequest = {
    id: `del_req_${Date.now()}`,
    userId: validUserId,
    requestedAt: now.toISOString(),
    coolingOffUntil: day7.toISOString(),
    personalDataPurgeAt: day30.toISOString(),
    projectDataPurgeAt: day90.toISOString(),
    status: 'ACTIVE_COOLING_OFF',
  };

  const allReqs = getStorage<AccountDeletionRequest[]>(STORAGE_DELETION_REQUESTS_KEY, []);
  setStorage(STORAGE_DELETION_REQUESTS_KEY, [req, ...allReqs]);

  return req;
}

/**
 * Cancela o pedido de eliminação dentro do prazo de arrependimento de 7 dias
 */
export async function cancelAccountDeletion(userId: string): Promise<boolean> {
  const allReqs = getStorage<AccountDeletionRequest[]>(STORAGE_DELETION_REQUESTS_KEY, []);
  const req = allReqs.find((r) => r.userId === userId && r.status === 'ACTIVE_COOLING_OFF');
  if (!req) return false;

  req.status = 'CANCELLED';
  setStorage(STORAGE_DELETION_REQUESTS_KEY, allReqs);
  return true;
}
