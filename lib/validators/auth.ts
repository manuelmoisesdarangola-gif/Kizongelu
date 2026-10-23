/**
 * @file lib/validators/auth.ts
 * Schemas Zod de validação para fluxos de autenticação em Angola.
 */

import { z } from 'zod';

/**
 * Perfis permitidos no registo público.
 * O perfil ADMIN não pode ser criado via formulário público.
 */
export const USER_ROLES_PUBLIC = ['PARTICULAR', 'PROFESSIONAL', 'COMPANY_OWNER'] as const;

export type UserRolePublic = (typeof USER_ROLES_PUBLIC)[number];

/**
 * Regex para validação de telemóveis de Angola:
 * Aceita:
 * - 9XXXXXXXX (9 dígitos começando por 91, 92, 93, 94, 95, 97, 99)
 * - +244 9XXXXXXXX ou +2449XXXXXXXX
 */
const ANGOLA_PHONE_REGEX = /^(?:\+244\s?)?[9][1-9][0-9]{7}$/;

/**
 * Schema para registo de novos utilizadores (Passo 1 + Passo 2).
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome não pode exceder 100 caracteres'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Endereço de email inválido'),
  phone: z
    .string()
    .trim()
    .regex(
      ANGOLA_PHONE_REGEX,
      'Número de telefone inválido para Angola (ex.: +244 923 123 456 ou 923123456)'
    ),
  password: z
    .string()
    .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A palavra-passe deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'A palavra-passe deve conter pelo menos um número'),
  role: z.enum(USER_ROLES_PUBLIC, {
    error: 'Seleccione um tipo de utilizador válido (Particular, Profissional ou Empresa)',
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Schema para início de sessão.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Introduza um email válido'),
  password: z
    .string()
    .min(1, 'A palavra-passe é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Schema para pedido de recuperação de palavra-passe.
 */
export const recoverySchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Introduza o endereço de email associado à sua conta'),
});

export type RecoveryInput = z.infer<typeof recoverySchema>;

/**
 * Schema para redefinição de palavra-passe com confirmação.
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'A nova palavra-passe deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A nova palavra-passe deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A nova palavra-passe deve conter pelo menos um número'),
    confirmPassword: z.string().min(1, 'Confirme a nova palavra-passe'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As palavras-passe não coincidem',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
