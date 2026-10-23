/**
 * @file src/schemas/budget-schema.ts
 * Validações Zod estritas para orçamentos, províncias e mapas de quantidades.
 */

import { z } from 'zod';

export const angolaProvincesEnum = z.enum([
  'luanda',
  'malanje',
  'benguela',
  'huila',
  'huambo',
  'cabinda',
  'lunda-norte',
  'lunda-sul',
]);

export const constructionTypeEnum = z.enum([
  'habitacional_unifamiliar',
  'habitacional_multifamiliar',
  'comercial',
  'reabilitacao',
]);

export const budgetItemInputSchema = z.object({
  artigoId: z.string().min(1, 'O identificador do artigo é obrigatório.'),
  quantidade: z.number().positive('A quantidade deve ser um valor positivo.'),
  notas: z.string().max(300, 'As notas não podem exceder 300 caracteres.').optional(),
});

export const budgetCreationSchema = z.object({
  titulo: z.string().min(3, 'O título da obra deve ter pelo menos 3 caracteres.').max(100),
  clienteNome: z.string().min(2, 'O nome do cliente é obrigatório.').max(80),
  clienteTelefone: z
    .string()
    .min(9, 'Insira um contacto válido de Angola (mínimo 9 dígitos).')
    .max(20),
  provincia: angolaProvincesEnum,
  localizacaoExata: z.string().min(2, 'Especifique o município ou bairro da obra.').max(120),
  areaEstimadaM2: z.number().positive('A área estimada deve ser superior a zero.'),
  tipoConstrucao: constructionTypeEnum,
  itens: z.array(budgetItemInputSchema).min(1, 'O orçamento deve conter pelo menos um artigo quantificado.'),
  taxaBDI: z.number().min(0).max(0.5),
  taxaEncargosSociais: z.number().min(0).max(0.6),
  taxaIVA: z.number().min(0).max(0.3),
  observacoes: z.string().max(500),
});

export type BudgetCreationInput = z.infer<typeof budgetCreationSchema>;
