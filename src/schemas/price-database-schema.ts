/**
 * @file src/schemas/price-database-schema.ts
 * Validações Zod estritas para artigos da base de dados de preços em Angola.
 */

import { z } from 'zod';

export const workCategoryEnum = z.enum([
  'estaleiro_demolicoes',
  'fundacoes_estruturas',
  'alvenarias_paredes',
  'coberturas_impermeabilizacoes',
  'revestimentos_acabamentos',
  'instalacoes_eletricas',
  'instalacoes_hidraulicas',
  'carpintarias_serralharias',
  'pinturas',
]);

export const measurementUnitEnum = z.enum([
  'm²',
  'm³',
  'm',
  'kg',
  'saco_50kg',
  'un',
  'h',
  'dia',
  'vg',
  'ton',
]);

export const priceItemSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().min(2),
  descricao: z.string().min(3),
  categoria: workCategoryEnum,
  unidade: measurementUnitEnum,
  precoBaseKz: z.number().nonnegative(),
  custoMaterialKz: z.number().nonnegative(),
  custoMaoDeObraKz: z.number().nonnegative(),
  custoEquipamentoKz: z.number().nonnegative(),
  rendimentoHomemHora: z.number().nonnegative(),
  dataAtualizacao: z.string(),
});

export type PriceItemValidation = z.infer<typeof priceItemSchema>;
