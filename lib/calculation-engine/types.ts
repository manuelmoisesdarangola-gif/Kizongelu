/**
 * @file lib/calculation-engine/types.ts
 * Definições de tipos e interfaces estritas para o Motor de Cálculo Determinístico do Kizongelu.
 */

import { ProjectType } from '@prisma/client';

export type FoundationType = 'sapata_corrida' | 'sapata_isolada' | 'laje' | 'outra' | 'nao_sei';
export type StructureType = 'betao_armado' | 'alvenaria_estrutural' | 'outra' | 'nao_sei';
export type RoofType = 'chapa' | 'telha' | 'laje' | 'inclinada' | 'outra';
export type FinishLevel = 'economico' | 'medio' | 'alto';
export type InstallationLevel = 'basica' | 'intermedia' | 'completa';

export interface CalculationInput {
  type: ProjectType | string;
  province: string;
  municipality?: string;
  area?: number;
  length?: number;
  width?: number;
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  hasLivingRoom: boolean;
  hasKitchen: boolean;
  hasGarage: boolean;
  hasBalcony: boolean;
  hasAnnex: boolean;
  foundation: FoundationType;
  structure: StructureType;
  roof: RoofType;
  finishLevel: FinishLevel;
  floorType?: string;
  wallType?: string;
  electrical: InstallationLevel;
  plumbing: InstallationLevel;
  doorsWindows?: string;
  budget?: number;
}

export type CompositionInsumoType = 'MATERIAL' | 'MAO_DE_OBRA' | 'EQUIPAMENTO' | 'SUBEMPREITADA';

export interface PriceCompositionItem {
  id: string;
  type: CompositionInsumoType;
  description: string;
  unit: string;
  coefficient: number; // rendimento / consumo unitário por unidade de serviço
  unitCost: number; // custo unitário do insumo em Kwanzas
  subtotal: number; // coefficient * unitCost
}

export interface PriceComposition {
  code: string;
  title: string;
  unit: string;
  materialsSubtotal: number;
  laborSubtotal: number;
  equipmentSubtotal: number;
  subcontractsSubtotal: number;
  unitDirectCost: number; // custo unitário direto
  wasteRate: number; // taxa de quebra/desperdício (ex: 0.05 para 5%)
  unitPrice: number; // preço unitário final do serviço
  items: PriceCompositionItem[];
}

export interface CalculationItem {
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  chapter: string;
  composition?: PriceComposition;
  formula: string;
  readableFormula: string;
  inputsUsed: Record<string, any>;
  sources: {
    material?: string;
    coefficient?: string;
    price?: string;
  };
}

export type ConfidenceScoreLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ConfidenceResult {
  level: ConfidenceScoreLevel;
  score: number; // 0 - 100
  reasons: string[];
}

export interface CalculationChapterSummary {
  chapter: string;
  materialsTotal: number;
  laborTotal: number;
  subtotal: number;
  itemsCount: number;
}

export interface BDIBreakdown {
  adminCentralRate: number; // ex: 0.05 (5%)
  riscosImprevistosRate: number; // ex: 0.03 (3%)
  segurosGarantiasRate: number; // ex: 0.015 (1.5%)
  margemLucroRate: number; // ex: 0.12 (12%)
  totalBDIRate: number; // Somatório das taxas BDI
  bdiAmount: number; // Valor Kz do BDI
}

export interface TaxBreakdown {
  taxRegime: 'GERAL' | 'SIMPLIFICADO' | 'ISENTO';
  ivaRate: number; // 0.14 ou 0.07 ou 0
  ivaAmount: number;
  retencaoFonteRate: number; // 0.065 (6.5% prestação de serviços construção civil)
  retencaoFonteAmount: number;
  inssPatronalRate: number; // 0.08 (8% patronal sobre salários)
  inssPatronalAmount: number;
}

export interface FinancialClosing {
  directCost: number; // Custo Direto (Materiais + Mão de Obra + Transporte)
  bdi: BDIBreakdown;
  baseTributavel: number; // Preço sem IVA (Custo Direto + BDI)
  taxes: TaxBreakdown;
  precoFinalComIVA: number; // Valor global a facturar ao cliente
  valorLiquidoReceber: number; // Preço Final deduzido da Retenção na Fonte (6,5%)
}

export type AuditAlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AuditAlert {
  id: string;
  code: string;
  itemCode?: string;
  severity: AuditAlertSeverity;
  category: 'PRECO_ANORMAL' | 'QUANTIDADE_DISCREPANTE' | 'CABINDA_LOGISTICA' | 'RISCO_FISCAL' | 'MARGEM_BDI' | 'VALOR_DISCREPANTE';
  title: string;
  message: string;
  suggestedAction: string;
  currentValue?: number | string;
  expectedRange?: string;
}

export interface CalculationResult {
  engineVersion: string;
  calculatedAt: string;
  input: CalculationInput;
  confidence: ConfidenceResult;
  items: CalculationItem[];
  chapters: CalculationChapterSummary[];
  materialsTotal: number;
  laborTotal: number;
  transportTotal: number;
  directCost: number;
  financialClosing: FinancialClosing;
  alerts: AuditAlert[];
  grandTotal: number;
  currency: string; // 'Kz'
}

export interface EngineCoefficient {
  code: string;
  value: number;
  unit: string;
  description?: string;
}

export type CoefficientsMap = Record<string, number>;
