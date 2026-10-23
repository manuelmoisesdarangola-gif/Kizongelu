/**
 * @file lib/actions/prices.ts
 * Server Actions para gestão da Base de Preços e Materiais .
 * - listPrices: listagem paginada com join em Material, filtros por província, categoria, estado e pesquisa
 * - getPriceById: obtenção de preço com histórico completo (PriceHistory)
 * - createPrice: criação de preço + PriceHistory inicial + AuditLog
 * - updatePrice: atualização + gravação de histórico (motivo obrigatório se variação > 20%) + AuditLog
 * - duplicatePriceToProvinces: duplicação em massa para províncias com ajuste percentual
 * - deactivatePrice: desativação lógica (soft delete)
 */

import { MaterialCategory } from '@prisma/client';
import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import { SEED_MATERIALS, PROVINCE_FACTORS } from '../../prisma/seed-prices';
import { z } from 'zod';

export const createPriceSchema = z.object({
  materialCode: z.string().min(1, 'Código do material obrigatório'),
  province: z.string().min(1, 'Província obrigatória'),
  municipality: z.string().optional().nullable(),
  price: z.number().positive('Preço deve ser superior a zero Kz'),
  source: z.string().optional(),
  userId: z.string().optional(),
});

export const updatePriceSchema = z.object({
  id: z.string().min(1, 'ID do preço obrigatório'),
  price: z.number().positive('Preço deve ser superior a zero Kz'),
  source: z.string().optional(),
  reason: z.string().optional(),
  userId: z.string().optional(),
});

export const listPricesFiltersSchema = z.object({
  province: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export interface PriceRecordWithMaterial {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  category: MaterialCategory;
  unit: string;
  province: string;
  municipality: string | null;
  price: number;
  source: string;
  validFrom: string;
  active: boolean;
  createdBy: string;
  updatedAt: string;
  history?: PriceHistoryItem[];
}

export interface PriceHistoryItem {
  id: string;
  priceId: string;
  oldPrice: number;
  newPrice: number;
  variationPercent: number;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface ListPricesFilters {
  province?: string;
  category?: MaterialCategory | 'ALL';
  search?: string;
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'OUTDATED';
  page?: number;
  pageSize?: number;
}

export interface ListPricesResult {
  items: PriceRecordWithMaterial[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  kpis: {
    totalMaterials: number;
    activePrices: number;
    outdatedPrices: number; // > 90 dias
    updatedThisWeek: number;
  };
}

// Armazenamento em memória unificado e reativo para demonstração e server actions
class PriceDatabaseStore {
  private materials = new Map<string, { id: string; code: string; name: string; category: MaterialCategory; unit: string; active: boolean }>();
  private prices = new Map<string, PriceRecordWithMaterial>();
  private histories: PriceHistoryItem[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    let priceIdCounter = 1;
    const now = new Date();
    const ninetyFiveDaysAgo = new Date(now.getTime() - 95 * 24 * 60 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
    const todayStr = now.toISOString();

    for (const mat of SEED_MATERIALS) {
      const matId = `mat_${mat.code.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      this.materials.set(matId, {
        id: matId,
        code: mat.code,
        name: mat.name,
        category: mat.category,
        unit: mat.unit,
        active: true,
      });

      // Cria preços para cada província
      let pIdx = 0;
      for (const [prov, { factor, note }] of Object.entries(PROVINCE_FACTORS)) {
        pIdx++;
        const pId = `prc_${priceIdCounter++}`;
        const finalPrice = Math.round(mat.basePriceLuanda * factor);

        // Distribui datas para demonstração de KPIs (alguns desatualizados >90 dias, alguns atualizados esta semana)
        let recordDate = todayStr;
        if (pIdx % 7 === 0) {
          recordDate = ninetyFiveDaysAgo;
        } else if (pIdx % 3 === 0) {
          recordDate = fiveDaysAgo;
        }

        const priceItem: PriceRecordWithMaterial = {
          id: pId,
          materialId: matId,
          materialCode: mat.code,
          materialName: mat.name,
          category: mat.category,
          unit: mat.unit,
          province: prov,
          municipality: prov === 'Luanda' ? 'Luanda' : null,
          price: finalPrice,
          source: `Amostragem 2025 (${note})`,
          validFrom: '2025-01-01T00:00:00.000Z',
          active: true,
          createdBy: 'usr_admin_default',
          updatedAt: recordDate,
        };

        this.prices.set(pId, priceItem);

        // Cria histórico inicial
        this.histories.push({
          id: `hist_init_${pId}`,
          priceId: pId,
          oldPrice: Math.round(finalPrice * 0.9),
          newPrice: finalPrice,
          variationPercent: 11.1,
          changedBy: 'Admin Kizongelu',
          changedAt: recordDate,
          reason: 'Calibração inicial da Base de Preços 2025.',
        });
      }
    }

    this.initialized = true;
  }

  public getAllMaterials() {
    return Array.from(this.materials.values());
  }

  public getAllPrices() {
    return Array.from(this.prices.values());
  }

  public getPrice(id: string): PriceRecordWithMaterial | null {
    const item = this.prices.get(id);
    if (!item) return null;
    const history = this.histories
      .filter((h) => h.priceId === id)
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
    return { ...item, history };
  }

  public setPrice(item: PriceRecordWithMaterial) {
    this.prices.set(item.id, item);
  }

  public addHistory(hist: PriceHistoryItem) {
    this.histories.push(hist);
  }
}

const store = new PriceDatabaseStore();

/**
 * 1. Listar Preços com filtros completos e KPIs agregados
 */
export async function listPrices(filters: ListPricesFilters = {}): Promise<ListPricesResult> {
  const {
    province,
    category,
    search,
    status = 'ALL',
    page = 1,
    pageSize = 25,
  } = filters;

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let all = store.getAllPrices();

  // KPIs globais
  const totalMaterials = store.getAllMaterials().length;
  const activePrices = all.filter((p) => p.active).length;
  const outdatedPrices = all.filter((p) => p.active && new Date(p.updatedAt) < ninetyDaysAgo).length;
  const updatedThisWeek = all.filter((p) => new Date(p.updatedAt) >= sevenDaysAgo).length;

  // Filtragem
  if (province && province !== 'ALL') {
    all = all.filter((p) => p.province.toLowerCase() === province.toLowerCase());
  }

  if (category && category !== 'ALL') {
    all = all.filter((p) => p.category === category);
  }

  if (status && status !== 'ALL') {
    if (status === 'ACTIVE') all = all.filter((p) => p.active);
    if (status === 'INACTIVE') all = all.filter((p) => !p.active);
    if (status === 'OUTDATED') all = all.filter((p) => p.active && new Date(p.updatedAt) < ninetyDaysAgo);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    all = all.filter(
      (p) =>
        p.materialName.toLowerCase().includes(q) ||
        p.materialCode.toLowerCase().includes(q) ||
        p.source.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q)
    );
  }

  const total = all.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * pageSize;
  const items = all.slice(startIndex, startIndex + pageSize);

  return {
    items,
    total,
    page: safePage,
    pageSize,
    totalPages,
    kpis: {
      totalMaterials,
      activePrices,
      outdatedPrices,
      updatedThisWeek,
    },
  };
}

/**
 * 2. Obter preço por ID com histórico completo
 */
export async function getPriceById(id: string): Promise<PriceRecordWithMaterial | null> {
  const mem = store.getPrice(id);
  if (mem) return mem;

  if (prisma && process.env.DATABASE_URL) {
    try {
      const dbP = await prisma.price.findUnique({
        where: { id },
        select: {
          id: true,
          materialId: true,
          province: true,
          municipality: true,
          price: true,
          source: true,
          validFrom: true,
          active: true,
          createdBy: true,
          material: {
            select: {
              code: true,
              name: true,
              category: true,
              unit: true,
            },
          },
          history: {
            orderBy: { changedAt: 'desc' },
            select: {
              id: true,
              priceId: true,
              oldPrice: true,
              newPrice: true,
              changedBy: true,
              changedAt: true,
              reason: true,
            },
          },
        },
      });

      if (dbP) {
        return {
          id: dbP.id,
          materialId: dbP.materialId,
          materialCode: dbP.material.code,
          materialName: dbP.material.name,
          category: dbP.material.category,
          unit: dbP.material.unit,
          province: dbP.province,
          municipality: dbP.municipality,
          price: Number(dbP.price),
          source: dbP.source,
          validFrom: dbP.validFrom.toISOString(),
          active: dbP.active,
          createdBy: dbP.createdBy,
          updatedAt: dbP.validFrom.toISOString(),
          history: dbP.history.map((h: any) => ({
            id: h.id,
            priceId: h.priceId,
            oldPrice: Number(h.oldPrice),
            newPrice: Number(h.newPrice),
            variationPercent:
              Number(h.oldPrice) > 0
                ? Math.round(Math.abs((Number(h.newPrice) - Number(h.oldPrice)) / Number(h.oldPrice)) * 100)
                : 100,
            changedBy: h.changedBy,
            changedAt: h.changedAt.toISOString(),
            reason: h.reason || undefined,
          })),
        };
      }
    } catch (_) {}
  }

  return null;
}

/**
 * 3. Criar Novo Preço
 */
export async function createPrice(data: {
  materialCode: string;
  province: string;
  municipality?: string | null;
  price: number;
  source: string;
  userId?: string;
}): Promise<{ success: boolean; data?: PriceRecordWithMaterial; error?: string }> {
  try {
    const validated = createPriceSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Dados inválidos.' };
    }

    const materials = store.getAllMaterials();
    const material = materials.find((m) => m.code === data.materialCode);
    if (!material) {
      return { success: false, error: `Material com código ${data.materialCode} não encontrado.` };
    }

    const newId = `prc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const newRecord: PriceRecordWithMaterial = {
      id: newId,
      materialId: material.id,
      materialCode: material.code,
      materialName: material.name,
      category: material.category,
      unit: material.unit,
      province: data.province,
      municipality: data.municipality || null,
      price: Math.round(data.price),
      source: data.source || 'Amostragem Manual Admin',
      validFrom: nowIso,
      active: true,
      createdBy: data.userId || 'usr_admin_default',
      updatedAt: nowIso,
    };

    store.setPrice(newRecord);

    // Cria primeiro registo histórico
    store.addHistory({
      id: `hist_${Date.now()}`,
      priceId: newId,
      oldPrice: 0,
      newPrice: newRecord.price,
      variationPercent: 100,
      changedBy: data.userId || 'Admin Kizongelu',
      changedAt: nowIso,
      reason: 'Criação inicial do preço.',
    });

    if (prisma && process.env.DATABASE_URL) {
      try {
        const mat = await prisma.material.findUnique({
          where: { code: material.code },
          select: { id: true },
        });
        if (mat) {
          await prisma.price.create({
            data: {
              id: newId,
              materialId: mat.id,
              province: data.province,
              municipality: data.municipality || null,
              price: Math.round(data.price),
              source: data.source || 'Amostragem Manual Admin',
              active: true,
              createdBy: data.userId || 'usr_admin_default',
              history: {
                create: {
                  oldPrice: 0,
                  newPrice: Math.round(data.price),
                  changedBy: data.userId || 'Admin Kizongelu',
                  reason: 'Criação inicial do preço.',
                },
              },
            },
            select: {
              id: true,
              price: true,
            },
          });
        }
      } catch (err) {
        console.warn('[Prices] Aviso ao criar preço via Prisma:', err);
      }
    }

    await logAuditEvent({
      event: 'PRICE_CREATED',
      userId: data.userId,
      details: { priceId: newId, materialCode: material.code, province: data.province, price: newRecord.price },
      status: 'SUCCESS',
    });

    return { success: true, data: newRecord };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao criar preço.' };
  }
}

/**
 * 4. Atualizar Preço (com exigência de motivo se variação > 20%)
 */
export async function updatePrice(
  id: string,
  data: {
    price: number;
    source?: string;
    reason?: string;
    userId?: string;
  }
): Promise<{ success: boolean; data?: PriceRecordWithMaterial; error?: string }> {
  try {
    const validated = updatePriceSchema.safeParse({ id, ...data });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || 'Dados inválidos.' };
    }

    const existing = store.getPrice(id);
    if (!existing) {
      return { success: false, error: 'Registo de preço não encontrado.' };
    }

    const oldPrice = existing.price;
    const newPrice = Math.round(data.price);

    const variationPercent = Math.abs(((newPrice - oldPrice) / oldPrice) * 100);

    // Regra de Negócio: Se variação > 20%, o motivo é estritamente obrigatório
    if (variationPercent > 20 && (!data.reason || data.reason.trim().length < 5)) {
      return {
        success: false,
        error: `A variação de preço é de ${variationPercent.toFixed(1)}% (>20%). É obrigatório justificar o motivo da alteração (mínimo 5 caracteres).`,
      };
    }

    const nowIso = new Date().toISOString();

    const updatedRecord: PriceRecordWithMaterial = {
      ...existing,
      price: newPrice,
      source: data.source || existing.source,
      updatedAt: nowIso,
      validFrom: nowIso,
    };

    store.setPrice(updatedRecord);

    store.addHistory({
      id: `hist_${Date.now()}`,
      priceId: id,
      oldPrice,
      newPrice,
      variationPercent: Math.round(variationPercent),
      changedBy: data.userId || 'Admin Kizongelu',
      changedAt: nowIso,
      reason: data.reason || 'Atualização manual de preço.',
    });

    if (prisma && process.env.DATABASE_URL) {
      try {
        await prisma.$transaction([
          prisma.price.update({
            where: { id },
            data: {
              price: newPrice,
              source: data.source || undefined,
              validFrom: new Date(),
            },
            select: {
              id: true,
              price: true,
            },
          }),
          prisma.priceHistory.create({
            data: {
              priceId: id,
              oldPrice,
              newPrice,
              changedBy: data.userId || 'Admin Kizongelu',
              reason: data.reason || 'Atualização de preço',
            },
            select: {
              id: true,
            },
          }),
        ]);
      } catch (err) {
        console.warn('[Prices] Aviso ao atualizar preço via Prisma:', err);
      }
    }

    const updated: PriceRecordWithMaterial = {
      ...existing,
      price: newPrice,
      source: data.source || existing.source,
      updatedAt: nowIso,
    };

    store.setPrice(updated);

    const historyItem: PriceHistoryItem = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      priceId: id,
      oldPrice,
      newPrice,
      variationPercent: Number(variationPercent.toFixed(1)),
      changedBy: data.userId || 'Admin Kizongelu',
      changedAt: nowIso,
      reason: data.reason || 'Atualização periódica de tabela.',
    };

    store.addHistory(historyItem);

    await logAuditEvent({
      event: 'PRICE_UPDATED',
      userId: data.userId,
      details: {
        priceId: id,
        materialCode: existing.materialCode,
        province: existing.province,
        oldPrice,
        newPrice,
        variationPercent,
        reason: data.reason,
      },
      status: 'SUCCESS',
    });

    return { success: true, data: updated };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao atualizar preço.' };
  }
}

/**
 * 5. Duplicar Preço para Outras Províncias (em massa)
 */
export async function duplicatePriceToProvinces(
  id: string,
  targetProvinces: string[],
  adjustFactor: number = 1.0,
  userId?: string
): Promise<{ success: boolean; createdCount: number; updatedCount: number; error?: string }> {
  try {
    const sourcePrice = store.getPrice(id);
    if (!sourcePrice) {
      return { success: false, createdCount: 0, updatedCount: 0, error: 'Preço de origem não encontrado.' };
    }

    let createdCount = 0;
    let updatedCount = 0;
    const nowIso = new Date().toISOString();

    for (const prov of targetProvinces) {
      if (prov.toLowerCase() === sourcePrice.province.toLowerCase()) continue;

      const calculatedPrice = Math.round(sourcePrice.price * adjustFactor);

      // Pesquisa se já existe preço para esta província
      const existing = store
        .getAllPrices()
        .find((p) => p.materialId === sourcePrice.materialId && p.province.toLowerCase() === prov.toLowerCase());

      if (existing) {
        // Atualiza existente
        await updatePrice(existing.id, {
          price: calculatedPrice,
          source: `Duplicado de ${sourcePrice.province} (Fator: ${adjustFactor})`,
          reason: `Duplicação em massa a partir de ${sourcePrice.province} com fator ${adjustFactor}`,
          userId,
        });
        updatedCount++;
      } else {
        // Cria novo
        const newPId = `prc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const newRecord: PriceRecordWithMaterial = {
          ...sourcePrice,
          id: newPId,
          province: prov,
          municipality: null,
          price: calculatedPrice,
          source: `Duplicado de ${sourcePrice.province} (Fator: ${adjustFactor})`,
          validFrom: nowIso,
          updatedAt: nowIso,
          createdBy: userId || 'usr_admin_default',
        };
        store.setPrice(newRecord);
        store.addHistory({
          id: `hist_${Date.now()}`,
          priceId: newPId,
          oldPrice: 0,
          newPrice: calculatedPrice,
          variationPercent: 100,
          changedBy: userId || 'Admin Kizongelu',
          changedAt: nowIso,
          reason: `Duplicação inicial a partir de ${sourcePrice.province}`,
        });
        createdCount++;
      }
    }

    await logAuditEvent({
      event: 'PRICES_BULK_DUPLICATED',
      userId,
      details: { sourceId: id, targetProvinces, adjustFactor, createdCount, updatedCount },
      status: 'SUCCESS',
    });

    return { success: true, createdCount, updatedCount };
  } catch (err: unknown) {
    return { success: false, createdCount: 0, updatedCount: 0, error: err instanceof Error ? err.message : 'Erro na duplicação.' };
  }
}

/**
 * 6. Desativar Preço (Soft Delete)
 */
export async function deactivatePrice(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = store.getPrice(id);
    if (!existing) {
      return { success: false, error: 'Preço não encontrado.' };
    }

    existing.active = false;
    existing.updatedAt = new Date().toISOString();
    store.setPrice(existing);

    await logAuditEvent({
      event: 'PRICE_DEACTIVATED',
      userId,
      details: { priceId: id, materialCode: existing.materialCode, province: existing.province },
      status: 'SUCCESS',
    });

    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : 'Erro ao desativar preço.' };
  }
}

/**
 * 7. Importação CSV de Preços com validação de linha
 */
export interface CsvImportRow {
  code: string;
  province: string;
  price: number;
  source?: string;
}

export interface CsvImportResult {
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: { line: number; error: string; raw: string }[];
  importedPrices: PriceRecordWithMaterial[];
}

export async function importPricesFromCsv(csvText: string, userId?: string): Promise<CsvImportResult> {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length <= 1) {
    return {
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      errors: [{ line: 1, error: 'Ficheiro CSV vazio ou sem cabeçalho.', raw: '' }],
      importedPrices: [],
    };
  }

  // Detecta delimitador (, ou ;)
  const headerLine = lines[0];
  const delim = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delim).map((h) => h.trim().toLowerCase());

  const codeIdx = headers.findIndex((h) => h.includes('cod') || h.includes('material'));
  const provIdx = headers.findIndex((h) => h.includes('prov'));
  const priceIdx = headers.findIndex((h) => h.includes('preco') || h.includes('preço') || h.includes('valor'));
  const sourceIdx = headers.findIndex((h) => h.includes('fonte') || h.includes('origem'));

  if (codeIdx === -1 || provIdx === -1 || priceIdx === -1) {
    return {
      totalRows: lines.length - 1,
      validRows: 0,
      errorRows: lines.length - 1,
      errors: [
        {
          line: 1,
          error: 'O cabeçalho do CSV deve conter as colunas: codigo, provincia, preco.',
          raw: headerLine,
        },
      ],
      importedPrices: [],
    };
  }

  const materials = store.getAllMaterials();
  const validPrices: PriceRecordWithMaterial[] = [];
  const errors: { line: number; error: string; raw: string }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cols = rawLine.split(delim).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    const code = cols[codeIdx]?.toUpperCase();
    const province = cols[provIdx];
    const priceStr = cols[priceIdx]?.replace(/\s/g, '').replace(',', '.');
    const source = sourceIdx !== -1 && cols[sourceIdx] ? cols[sourceIdx] : 'Importação CSV';

    if (!code) {
      errors.push({ line: i + 1, error: 'Código de material em falta', raw: rawLine });
      continue;
    }

    const material = materials.find((m) => m.code === code);
    if (!material) {
      errors.push({ line: i + 1, error: `Material '${code}' não existe no catálogo`, raw: rawLine });
      continue;
    }

    if (!province) {
      errors.push({ line: i + 1, error: 'Província em falta', raw: rawLine });
      continue;
    }

    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum <= 0) {
      errors.push({ line: i + 1, error: `Preço inválido: '${cols[priceIdx]}'`, raw: rawLine });
      continue;
    }

    // Validação bem-sucedida: Atualiza ou cria
    const existing = store
      .getAllPrices()
      .find((p) => p.materialId === material.id && p.province.toLowerCase() === province.toLowerCase());

    if (existing) {
      await updatePrice(existing.id, {
        price: priceNum,
        source,
        reason: 'Atualização via Importação CSV',
        userId,
      });
      validPrices.push(store.getPrice(existing.id)!);
    } else {
      const created = await createPrice({
        materialCode: code,
        province,
        price: priceNum,
        source,
        userId,
      });
      if (created.success && created.data) {
        validPrices.push(created.data);
      }
    }
  }

  await logAuditEvent({
    event: 'PRICES_CSV_IMPORTED',
    userId,
    details: { totalRows: lines.length - 1, validRows: validPrices.length, errorRows: errors.length },
    status: errors.length > 0 ? 'WARNING' : 'SUCCESS',
  });

  return {
    totalRows: lines.length - 1,
    validRows: validPrices.length,
    errorRows: errors.length,
    errors,
    importedPrices: validPrices,
  };
}

/**
 * 8. API Pública: Agregação de Médias e Mínimos/Máximos sem dados internos
 */
export async function getPublicAggregatedPrices(params: { category?: string; province?: string }) {
  let prices = store.getAllPrices().filter((p) => p.active);

  if (params.category && params.category !== 'ALL') {
    prices = prices.filter((p) => p.category === params.category);
  }
  if (params.province && params.province !== 'ALL') {
    const provLower = params.province.toLowerCase();
    prices = prices.filter((p) => p.province.toLowerCase() === provLower);
  }

  // Agrupa por categoria e material
  const groups = new Map<string, { code: string; name: string; category: string; unit: string; prices: number[] }>();

  for (const p of prices) {
    const key = p.materialCode;
    if (!groups.has(key)) {
      groups.set(key, {
        code: p.materialCode,
        name: p.materialName,
        category: p.category,
        unit: p.unit,
        prices: [],
      });
    }
    groups.get(key)!.prices.push(p.price);
  }

  const results = Array.from(groups.values()).map((g) => {
    const count = g.prices.length;
    const sum = g.prices.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / (count || 1));
    const min = Math.min(...g.prices);
    const max = Math.max(...g.prices);

    return {
      code: g.code,
      name: g.name,
      category: g.category,
      unit: g.unit,
      avgPriceKz: avg,
      minPriceKz: min,
      maxPriceKz: max,
      sampleSize: count,
      currency: 'Kz',
      asOf: '2025',
    };
  });

  return results;
}
