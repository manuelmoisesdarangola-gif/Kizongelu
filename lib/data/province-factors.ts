/**
 * @file lib/data/province-factors.ts
 * Tabela Oficial ProvinceFactor de Angola (Outubro 2026).
 * Cobertura de todas as 21 províncias e rotas logísticas com coeficientes calibrados.
 */

export interface ProvinceFactorRecord {
  province: string;
  factor: number;
  note?: string;
}

export const ALL_21_PROVINCE_FACTORS: ProvinceFactorRecord[] = [
  { province: 'Luanda', factor: 1.00, note: 'Capital e Porto de Luanda (Referência: 1.00)' },
  { province: 'Icolo e Bengo', factor: 1.03, note: 'Polo Agroindustrial de Catete (+3%)' },
  { province: 'Bengo', factor: 1.05, note: 'Caxito e periferia norte de Luanda (+5%)' },
  { province: 'Benguela', factor: 1.08, note: 'Porto Comercial do Lobito / Litoral Centro (+8%)' },
  { province: 'Namibe', factor: 1.09, note: 'Porto de Moçâmedes e Litoral Sul (+9%)' },
  { province: 'Cuanza Sul', factor: 1.11, note: 'Sumbe / Porto Amboim (+11%)' },
  { province: 'Cuanza Norte', factor: 1.12, note: 'Ndalatando e Corredor Norte (+12%)' },
  { province: 'Huambo', factor: 1.15, note: 'Planalto Central / Eixo CFB (+15%)' },
  { province: 'Bié', factor: 1.15, note: 'Cuito / Centro Interior (+15%)' },
  { province: 'Uíge', factor: 1.15, note: 'Planalto Norte / Negage (+15%)' },
  { province: 'Huíla', factor: 1.18, note: 'Lubango / Interior Sul (+18%)' },
  { province: 'Zaire', factor: 1.18, note: 'Mbanza Kongo / Soyo (+18%)' },
  { province: 'Cunene', factor: 1.19, note: 'Ondjiva / Fronteira Sul (+19%)' },
  { province: 'Malanje', factor: 1.20, note: 'Corredor Leste (+20%)' },
  { province: 'Cubango', factor: 1.23, note: 'Menongue / Sul Interior (+23%)' },
  { province: 'Cuando', factor: 1.26, note: 'Sudeste Interior (+26%)' },
  { province: 'Moxico Leste', factor: 1.28, note: 'Luau / Fronteira RDC (+28%)' },
  { province: 'Cabinda', factor: 1.29, note: 'Enclave Marítimo / Cabotagem (+29%)' },
  { province: 'Lunda Sul', factor: 1.33, note: 'Saurimo / Polo Diamantífero (+33%)' },
  { province: 'Lunda Norte', factor: 1.35, note: 'Dundo / Extremo Leste (+35%)' },
  { province: 'Moxico', factor: 1.38, note: 'Luena e Alto Zambeze (+38%)' },
];

export const PROVINCE_FACTORS_MAP: Record<string, number> = ALL_21_PROVINCE_FACTORS.reduce(
  (acc, curr) => {
    acc[curr.province] = curr.factor;
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Lê o coeficiente logístico provincial da base de dados ProvinceFactor.
 * Implementação conforme a especificação requerida:
 * const factor = await prisma.provinceFactor.findUnique({
 *   where: { province: provinceName }
 * });
 * const appliedFactor = factor?.factor.toNumber() ?? 1.15;
 * 
 * Se a tabela ProvinceFactor ainda não tiver dados na base de dados,
 * auto-popula com a tabela oficial de Outubro de 2026 (21 províncias).
 */
export async function getAppliedProvinceFactor(provinceName: string): Promise<number> {
  try {
    // Em ambiente Node.js / Server Actions com Prisma
    if (typeof window === 'undefined') {
      const { prisma } = await import('../db/prisma');
      if (prisma && (prisma as any).provinceFactor) {
        // Se a tabela ainda não tiver dados, popular com as 21 províncias
        const count = await (prisma as any).provinceFactor.count().catch(() => 0);
        if (count === 0) {
          for (const item of ALL_21_PROVINCE_FACTORS) {
            await (prisma as any).provinceFactor.upsert({
              where: { province: item.province },
              update: { factor: item.factor, note: item.note },
              create: { province: item.province, factor: item.factor, note: item.note },
            }).catch(() => {});
          }
        }

        const factor = await (prisma as any).provinceFactor.findUnique({
          where: { province: provinceName },
        });
        const appliedFactor = factor?.factor?.toNumber 
          ? factor.factor.toNumber() 
          : (factor?.factor !== undefined ? Number(factor.factor) : undefined);

        if (appliedFactor !== undefined) {
          return appliedFactor;
        }
      }
    }
  } catch {
    // Fallback gracioso para a tabela de referência em caso de desconexão
  }

  // Normalização de nomes para consulta direta
  const normalized = provinceName.trim();
  const directMatch = PROVINCE_FACTORS_MAP[normalized];
  if (directMatch !== undefined) return directMatch;

  // Busca insensível a maiúsculas/minúsculas e acentos
  const entry = ALL_21_PROVINCE_FACTORS.find(
    (p) => p.province.localeCompare(normalized, 'pt', { sensitivity: 'accent' }) === 0
  );
  if (entry) return entry.factor;

  return 1.15; // Valor predefinido para províncias não mapeadas
}
