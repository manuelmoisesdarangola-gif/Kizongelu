/**
 * @file lib/calculation-engine/helpers.ts
 * Funções puras e utilitários geométricos para o Motor de Cálculo.
 */

import { CalculationInput } from './types';

/**
 * Arredonda um número para um número específico de casas decimais.
 */
export function roundDecimals(value: number, decimals: number = 2): number {
  if (isNaN(value) || !isFinite(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Garante que um valor numérico é válido e positivo, com fallback seguro.
 */
export function safeNumber(val: number | undefined | null, fallback: number = 0): number {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) {
    return fallback;
  }
  return Math.max(0, val);
}

/**
 * Determina a área útil total do projeto a partir da área explícita ou dimensões (comprimento × largura).
 */
export function calculateArea(input: CalculationInput): number {
  if (input.area && input.area > 0) {
    const floors = Math.max(1, input.floors || 1);
    return roundDecimals(input.area * floors, 2);
  }

  if (input.length && input.width && input.length > 0 && input.width > 0) {
    const floors = Math.max(1, input.floors || 1);
    return roundDecimals(input.length * input.width * floors, 2);
  }

  // Fallback baseado no tipo de projeto e tipologia (ex: T3 ≈ 120-150m²)
  const bedrooms = input.bedrooms || 2;
  const bathrooms = input.bathrooms || 1;
  const baseArea = 40 + bedrooms * 18 + bathrooms * 8 + (input.hasLivingRoom ? 24 : 0) + (input.hasKitchen ? 14 : 0);
  return roundDecimals(baseArea, 2);
}

/**
 * Calcula a área de implantação no solo (área de projeção para fundações e cobertura).
 */
export function calculateFootprintArea(input: CalculationInput): number {
  const totalArea = calculateArea(input);
  const floors = Math.max(1, input.floors || 1);
  return roundDecimals(totalArea / floors, 2);
}

/**
 * Calcula o perímetro de implantação da edificação.
 * Se houver comprimento e largura, usa 2 × (L + W).
 * Caso contrário, aproxima para uma planta retangular de proporção 1:1.3.
 */
export function calculatePerimeter(input: CalculationInput): number {
  if (input.length && input.width && input.length > 0 && input.width > 0) {
    return roundDecimals(2 * (input.length + input.width), 2);
  }

  const footprintArea = calculateFootprintArea(input);
  // Aproximação geométrica: r = 1.25 -> W = sqrt(A / 1.25), L = 1.25 * W
  const w = Math.sqrt(footprintArea / 1.25);
  const l = footprintArea / w;
  return roundDecimals(2 * (l + w), 2);
}

/**
 * Calcula a área total estimada de alvenaria/paredes.
 * Fórmula oficial: Área útil × fator pé-direito (2.8m).
 */
export function calculateWallArea(totalArea: number, wallHeightFactor: number = 2.8): number {
  return roundDecimals(totalArea * wallHeightFactor, 2);
}

/**
 * Calcula a área exterior das fachadas para reboco exterior e pintura.
 * Perímetro × Pé-direito × Número de pisos.
 */
export function calculateFacadeArea(
  perimeter: number,
  floors: number = 1,
  wallHeight: number = 2.8
): number {
  const effectiveFloors = Math.max(1, floors);
  return roundDecimals(perimeter * wallHeight * effectiveFloors, 2);
}

/**
 * Estima o número de pilares estruturais para sapatas isoladas.
 * Baseado na malha estrutural típica de Angola (vãos de 4m a 5m -> ~16m² a 20m² por pilar).
 */
export function estimatePillarsCount(footprintArea: number): number {
  // Mínimo estrutural de 9 pilares para um módulo habitacional fechado
  const calculated = Math.ceil(footprintArea / 18);
  return Math.max(9, calculated);
}
