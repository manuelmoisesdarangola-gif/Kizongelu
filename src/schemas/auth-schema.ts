/**
 * @file src/schemas/auth-schema.ts
 * Validações Zod estritas para utilizadores, permissões (RBAC) e planos.
 */

import { z } from 'zod';

export const userRoleEnum = z.enum([
  'particular',
  'profissional',
  'empresa',
  'empresa_plus',
  'admin',
]);

export const userProfileSchema = z.object({
  id: z.string().min(1),
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Introduza um endereço de e-mail válido.'),
  telefone: z.string().min(9, 'Telefone inválido.'),
  role: userRoleEnum,
  plano: z.string(),
  orçamentosDisponiveis: z.number().int().nonnegative(),
  orçamentosRealizados: z.number().int().nonnegative(),
  empresaNome: z.string().optional(),
  nif: z.string().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
