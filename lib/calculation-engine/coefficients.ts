/**
 * @file lib/calculation-engine/coefficients.ts
 * Gestão de coeficientes e fatores de cálculo associados à tabela `Coefficient` na Base de Dados.
 * Garante que nenhuma fórmula depende de valores mágicos fixos no código.
 */

import { prisma } from '../db/prisma';
import { CoefficientsMap, EngineCoefficient } from './types';

/**
 * Coeficientes padrão do Motor de Cálculo (v1.0) para Angola.
 * Devem existir na tabela `Coefficient` vinculados à versão da Engine.
 */
export const DEFAULT_ENGINE_COEFFICIENTS: EngineCoefficient[] = [
  // 1. Alvenaria
  { code: 'MASONRY_WALL_HEIGHT_FACTOR', value: 2.8, unit: 'm', description: 'Pé-direito padrão para estimativa de área de paredes' },
  { code: 'MASONRY_BLOCK_AREA', value: 0.08, unit: 'm²', description: 'Área frontal de 1 bloco padrão 20x40 cm' },
  { code: 'MASONRY_WASTE_RATE', value: 0.05, unit: 'fator', description: 'Taxa de quebra e desperdício de blocos (5%)' },
  { code: 'MORTAR_VOLUME_PER_M2', value: 0.02, unit: 'm³/m²', description: 'Volume de argamassa de assentamento por m² de parede' },
  { code: 'MORTAR_CEMENT_KG_PER_M3', value: 350.0, unit: 'kg/m³', description: 'Consumo de cimento por m³ de argamassa' },
  { code: 'MORTAR_SAND_M3_PER_M3', value: 0.5, unit: 'm³/m³', description: 'Consumo de areia por m³ de argamassa' },

  // 2. Estrutura (Betão Armado)
  { code: 'CONCRETE_SLAB_THICKNESS', value: 0.15, unit: 'm', description: 'Espessura média equivalente de laje e elementos estruturais' },
  { code: 'CONCRETE_CEMENT_KG_PER_M3', value: 350.0, unit: 'kg/m³', description: 'Dosagem de cimento para betão estrutural C25/30' },
  { code: 'CONCRETE_SAND_M3_PER_M3', value: 0.5, unit: 'm³/m³', description: 'Consumo de areia por m³ de betão estrutural' },
  { code: 'CONCRETE_GRAVEL_M3_PER_M3', value: 0.8, unit: 'm³/m³', description: 'Consumo de brita por m³ de betão estrutural' },
  { code: 'STEEL_SLAB_KG_PER_M3', value: 80.0, unit: 'kg/m³', description: 'Densidade de aço para lajes' },
  { code: 'STEEL_BEAMS_COLUMNS_KG_PER_M3', value: 120.0, unit: 'kg/m³', description: 'Densidade de aço para vigas e pilares' },
  { code: 'STEEL_WASTE_RATE', value: 0.10, unit: 'fator', description: 'Taxa de desperdício em pontas e dobras de aço (10%)' },

  // 3. Fundações
  { code: 'FOUNDATION_CONTINUOUS_WIDTH', value: 0.6, unit: 'm', description: 'Largura da vala/sapata corrida' },
  { code: 'FOUNDATION_CONTINUOUS_DEPTH', value: 0.4, unit: 'm', description: 'Altura da sapata corrida' },
  { code: 'FOUNDATION_ISOLATED_WIDTH', value: 1.2, unit: 'm', description: 'Largura da sapata isolada' },
  { code: 'FOUNDATION_ISOLATED_LENGTH', value: 1.2, unit: 'm', description: 'Comprimento da sapata isolada' },
  { code: 'FOUNDATION_ISOLATED_DEPTH', value: 0.4, unit: 'm', description: 'Altura da sapata isolada' },

  // 4. Cobertura
  { code: 'ROOF_SHEET_FACTOR', value: 1.10, unit: 'fator', description: 'Fator de inclinação e sobreposição para chapa canelada' },
  { code: 'ROOF_TILE_FACTOR', value: 1.15, unit: 'fator', description: 'Fator de inclinação e sobreposição para telhas' },
  { code: 'ROOF_TIMBER_LINEAR_M_PER_M2', value: 3.5, unit: 'm/m²', description: 'Metros lineares de estrutura de madeira por m² de cobertura' },
  { code: 'ROOF_SCREWS_PER_M2', value: 12.0, unit: 'un/m²', description: 'Parafusos auto-roscantes com anilha por m² de cobertura' },

  // 5. Instalações Elétricas
  { code: 'ELECTRICAL_CABLE_BASIC_M_PER_M2', value: 8.0, unit: 'm/m²', description: 'Metros lineares de cabo por m² (básica)' },
  { code: 'ELECTRICAL_CABLE_INTERMEDIATE_M_PER_M2', value: 12.0, unit: 'm/m²', description: 'Metros lineares de cabo por m² (intermédia)' },
  { code: 'ELECTRICAL_CABLE_COMPLETE_M_PER_M2', value: 18.0, unit: 'm/m²', description: 'Metros lineares de cabo por m² (completa)' },
  { code: 'ELECTRICAL_OUTLETS_AREA_DIVISOR_BASIC', value: 12.0, unit: 'm²', description: 'Área por ponto de tomada (básica)' },
  { code: 'ELECTRICAL_OUTLETS_AREA_DIVISOR_INTERMEDIATE', value: 8.0, unit: 'm²', description: 'Área por ponto de tomada (intermédia)' },
  { code: 'ELECTRICAL_OUTLETS_AREA_DIVISOR_COMPLETE', value: 6.0, unit: 'm²', description: 'Área por ponto de tomada (completa)' },
  { code: 'ELECTRICAL_BOARDS_BASIC', value: 1.0, unit: 'un', description: 'Número de quadros elétricos (básica)' },
  { code: 'ELECTRICAL_BOARDS_INTERMEDIATE', value: 2.0, unit: 'un', description: 'Número de quadros elétricos (intermédia)' },
  { code: 'ELECTRICAL_BOARDS_COMPLETE', value: 3.0, unit: 'un', description: 'Número de quadros elétricos (completa)' },

  // 6. Canalização
  { code: 'PLUMBING_PIPES_M_PER_M2', value: 1.5, unit: 'm/m²', description: 'Metros lineares de tubagem hidráulica por m² de área' },
  { code: 'PLUMBING_WATER_POINTS_PER_WC', value: 2.0, unit: 'un', description: 'Multiplicador de pontos de água por casa de banho' },

  // 7. Pavimentos
  { code: 'FLOORING_WASTE_RATE', value: 0.07, unit: 'fator', description: 'Desperdício de material de pavimento cerâmico (7%)' },
  { code: 'FLOORING_ADHESIVE_KG_PER_M2', value: 5.0, unit: 'kg/m²', description: 'Consumo de cimento cola por m² de pavimento' },

  // 8. Pintura
  { code: 'PAINT_INTERIOR_COATS', value: 2.0, unit: 'demãos', description: 'Número de demãos de tinta interior' },
  { code: 'PAINT_INTERIOR_COVERAGE_M2_PER_L', value: 8.0, unit: 'm²/L', description: 'Rendimento por litro de tinta plástica interior' },
  { code: 'PAINT_EXTERIOR_COATS', value: 2.0, unit: 'demãos', description: 'Número de demãos de tinta exterior de fachada' },
  { code: 'PAINT_EXTERIOR_COVERAGE_M2_PER_L', value: 6.0, unit: 'm²/L', description: 'Rendimento por litro de tinta exterior' },

  // 9. Mão de Obra (% dos materiais)
  { code: 'LABOR_RATE_MASONRY', value: 0.25, unit: '%', description: 'Percentual de mão de obra para alvenaria (25%)' },
  { code: 'LABOR_RATE_STRUCTURE', value: 0.30, unit: '%', description: 'Percentual de mão de obra para estrutura e fundações (30%)' },
  { code: 'LABOR_RATE_INSTALLATIONS', value: 0.35, unit: '%', description: 'Percentual de mão de obra para instalações técnicas (35%)' },
  { code: 'LABOR_RATE_FINISHES', value: 0.40, unit: '%', description: 'Percentual de mão de obra para acabamentos (40%)' },

  // 10. Transporte e Logística por Província (Factores Validados 2026)
  { code: 'TRANSPORT_RATE_LUANDA', value: 0.00, unit: '%', description: 'Fator logístico Luanda (Base: 1.00)' },
  { code: 'TRANSPORT_RATE_BENGUELA', value: 0.07, unit: '%', description: 'Fator logístico Benguela (+7%)' },
  { code: 'TRANSPORT_RATE_CUANZA_SUL', value: 0.07, unit: '%', description: 'Fator logístico Cuanza Sul (+7%)' },
  { code: 'TRANSPORT_RATE_HUILA', value: 0.08, unit: '%', description: 'Fator logístico Huíla (+8%)' },
  { code: 'TRANSPORT_RATE_HUAMBO', value: 0.08, unit: '%', description: 'Fator logístico Huambo (+8%)' },
  { code: 'TRANSPORT_RATE_MALANJE', value: 0.12, unit: '%', description: 'Fator logístico Malanje (+12%)' },
  { code: 'TRANSPORT_RATE_CABINDA', value: 0.20, unit: '%', description: 'Fator logístico Cabinda (+20%)' },
  { code: 'TRANSPORT_RATE_LUNDA_NORTE', value: 0.20, unit: '%', description: 'Fator logístico Lunda Norte (+20%)' },
  { code: 'TRANSPORT_RATE_LUNDA_SUL', value: 0.22, unit: '%', description: 'Fator logístico Lunda Sul (+22%)' },
  { code: 'TRANSPORT_RATE_MOXICO', value: 0.20, unit: '%', description: 'Fator logístico Moxico (+20%)' },
  { code: 'TRANSPORT_RATE_OUTRAS', value: 0.15, unit: '%', description: 'Fator logístico demais províncias (+15%)' },

  // 11. BDI Analítico (Benefícios e Despesas Indiretas para Angola)
  { code: 'BDI_ADMIN_CENTRAL', value: 0.05, unit: '%', description: 'Taxa de Administração Central da Construtora (5%)' },
  { code: 'BDI_RISCOS_IMPREVISTOS', value: 0.03, unit: '%', description: 'Taxa de Riscos, Chuvas e Imprevistos Locais (3%)' },
  { code: 'BDI_SEGUROS_GARANTIAS', value: 0.015, unit: '%', description: 'Taxa de Seguros e Garantias Contratuais de Obra (1.5%)' },
  { code: 'BDI_MARGEM_LUCRO', value: 0.12, unit: '%', description: 'Margem de Lucro Bruto Operacional (12%)' },
];

/**
 * Retorna os coeficientes padrão como um mapa chave-valor em memória.
 */
export function getDefaultCoefficientsMap(): CoefficientsMap {
  const map: CoefficientsMap = {};
  for (const c of DEFAULT_ENGINE_COEFFICIENTS) {
    map[c.code] = c.value;
  }
  return map;
}

/**
 * Carrega todos os coeficientes da tabela `Coefficient` para a versão solicitada da Engine.
 * Se a BD ainda não tiver coeficientes para esta versão, popula automaticamente a partir do seed padrão.
 */
export async function loadEngineCoefficients(engineVersionStr: string = 'v1.0'): Promise<CoefficientsMap> {
  if (process.env.DATABASE_URL) {
    try {
      // Procura a EngineVersion correspondente
      const engineVersion = await prisma.engineVersion.findUnique({
        where: { version: engineVersionStr },
        select: {
          id: true,
          coefficients: {
            select: {
              code: true,
              value: true,
            },
          },
        },
      });

      if (engineVersion && engineVersion.coefficients.length > 0) {
        const map: CoefficientsMap = {};
        for (const c of engineVersion.coefficients) {
          map[c.code] = Number(c.value);
        }
        return map;
      }

      // Se a versão existir mas não tiver coeficientes, inicializa no banco
      if (engineVersion) {
        await seedCoefficientsForVersion(engineVersion.id);
        return loadEngineCoefficients(engineVersionStr);
      }
    } catch (err) {
      console.warn('[EngineCoefficients] Aviso ao aceder à BD, a utilizar coeficientes de contingência:', err);
    }
  }

  return getDefaultCoefficientsMap();
}

/**
 * Cria ou atualiza os coeficientes na tabela `Coefficient` para um engineVersionId.
 */
export async function seedCoefficientsForVersion(engineVersionId: string): Promise<void> {
  for (const coeff of DEFAULT_ENGINE_COEFFICIENTS) {
    await prisma.coefficient.upsert({
      where: {
        id: `${engineVersionId}-${coeff.code}`,
      },
      update: {
        value: coeff.value,
        unit: coeff.unit,
      },
      create: {
        id: `${engineVersionId}-${coeff.code}`,
        code: coeff.code,
        value: coeff.value,
        unit: coeff.unit,
        engineVersionId,
      },
    });
  }
}
