/**
 * @file lib/calculation-engine/confidence.ts
 * Cálculo determinístico do Índice de Confiança dos dados fornecidos para o orçamento.
 */

import { CalculationInput, ConfidenceResult, ConfidenceScoreLevel } from './types';

/**
 * Avalia a precisão dos inputs fornecidos pelo utilizador e determina o nível de confiança:
 * - HIGH: todos os campos essenciais preenchidos com exatidão (área, tipo, província, acabamento, estrutura, cobertura).
 * - MEDIUM: faltam 1–2 campos não-críticos (ex: dimensões exatas, número de pisos ou louças).
 * - LOW: faltam 3+ campos ou seleção de "não sei" em fundação ou estrutura.
 */
export function calculateConfidence(input: CalculationInput): ConfidenceResult {
  const reasons: string[] = [];
  let score = 100;

  // 1. Verificação de Campos Críticos/Essenciais
  const hasAreaOrDimensions = (input.area && input.area > 0) || (input.length && input.width && input.length > 0 && input.width > 0);
  if (!hasAreaOrDimensions) {
    score -= 30;
    reasons.push('Área ou dimensões do projeto não fornecidas; cálculo utiliza estimativa baseada na tipologia.');
  }

  if (!input.type) {
    score -= 15;
    reasons.push('Tipo de projeto não especificado.');
  }

  if (!input.province || input.province.trim() === '') {
    score -= 20;
    reasons.push('Província não informada; preços regionais podem diferir.');
  }

  if (!input.finishLevel) {
    score -= 15;
    reasons.push('Padrão de acabamento não indicado; assumido nível médio.');
  }

  if (!input.structure) {
    score -= 15;
    reasons.push('Tipo de estrutura não especificado.');
  }

  if (!input.roof) {
    score -= 15;
    reasons.push('Tipo de cobertura não especificado.');
  }

  // 2. Penalizações por incerteza ("não sei")
  let unknownCount = 0;
  if (input.structure === 'nao_sei') {
    unknownCount++;
    score -= 15;
    reasons.push('Estrutura marcada como "não sei"; assumido betão armado padrão.');
  }

  if (input.foundation === 'nao_sei') {
    unknownCount++;
    score -= 15;
    reasons.push('Fundação marcada como "não sei"; assumida sapata corrida padrão.');
  }

  // 3. Campos não-críticos
  let missingNonCritical = 0;
  if (!input.municipality) {
    missingNonCritical++;
  }
  if (!input.electrical) {
    missingNonCritical++;
    reasons.push('Nível de instalação elétrica omitido; assumido intermédio.');
  }
  if (!input.plumbing) {
    missingNonCritical++;
    reasons.push('Nível de canalização omitido; assumido intermédio.');
  }
  if (input.floors === undefined || input.floors <= 0) {
    missingNonCritical++;
  }

  // 4. Determinação do Nível de Confiança
  let level: ConfidenceScoreLevel = 'HIGH';

  if (unknownCount >= 1 || score < 60 || (!hasAreaOrDimensions && missingNonCritical >= 2)) {
    level = 'LOW';
  } else if (score < 85 || missingNonCritical >= 2) {
    level = 'MEDIUM';
  } else {
    level = 'HIGH';
  }

  // Se estiver em HIGH e sem motivos, adiciona confirmação positiva
  if (reasons.length === 0) {
    reasons.push('Todos os dados estruturais, dimensionais e geográficos essenciais foram preenchidos.');
  }

  return {
    level,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}
