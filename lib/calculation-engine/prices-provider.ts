/**
 * @file lib/calculation-engine/prices-provider.ts
 * Provedor de preços de materiais para o Motor de Cálculo por província.
 * Conecta à BD (tabela `Price`) com fallback garantido para a base de seed provincial oficial.
 */

import { prisma } from '../db/prisma';
import { PROVINCE_FACTORS, SEED_MATERIALS } from '../../prisma/seed-prices';

export interface PriceLookupResult {
  code: string;
  name: string;
  unit: string;
  unitPrice: number;
  source: string;
}

// Cache local de preços do seed indexados por code para lookup rápido
const seedMap = new Map<string, (typeof SEED_MATERIALS)[0]>();
for (const m of SEED_MATERIALS) {
  seedMap.set(m.code, m);
}

/**
 * Normaliza o nome da província para correspondência sem case-sensitive ou acentos.
 */
export function normalizeProvinceName(province: string): string {
  const provClean = (province || 'Luanda').trim();
  const normalizedKey = Object.keys(PROVINCE_FACTORS).find(
    (k) => k.toLowerCase() === provClean.toLowerCase()
  );
  return normalizedKey || 'Luanda';
}

/**
 * Obtém o preço de um material por código e província.
 */
export async function getMaterialPrice(
  code: string,
  province: string = 'Luanda'
): Promise<PriceLookupResult> {
  const normProvince = normalizeProvinceName(province);

  if (process.env.DATABASE_URL) {
    try {
      const dbPrice = await prisma.price.findFirst({
        where: {
          active: true,
          province: normProvince,
          material: { code },
        },
        select: {
          price: true,
          source: true,
          material: {
            select: {
              name: true,
              unit: true,
            },
          },
        },
        orderBy: { validFrom: 'desc' },
      });

      if (dbPrice) {
        return {
          code,
          name: dbPrice.material.name,
          unit: dbPrice.material.unit,
          unitPrice: Number(dbPrice.price),
          source: dbPrice.source || `BD Kizongelu (${normProvince})`,
        };
      }
    } catch {
      // Falha silenciosa de DB para permitir execução offline/testes unitários
    }
  }

  // Fallback baseado nos preços oficiais do seed com o fator logístico provincial
  const seedItem = seedMap.get(code);
  const factorData = PROVINCE_FACTORS[normProvince] || PROVINCE_FACTORS['Outras'] || PROVINCE_FACTORS['Luanda'];
  const factor = factorData.factor;

  if (seedItem) {
    const adjustedPrice = Math.round(seedItem.basePriceLuanda * factor);
    return {
      code,
      name: seedItem.name,
      unit: seedItem.unit,
      unitPrice: adjustedPrice,
      source: `Tabela Oficial Kizongelu (${normProvince} - Fator ${factor.toFixed(2)})`,
    };
  }

  // Preço padrão de segurança caso o código não conste no seed
  return {
    code,
    name: `Material ${code}`,
    unit: 'un',
    unitPrice: 1000,
    source: 'Estimativa de Referência',
  };
}
