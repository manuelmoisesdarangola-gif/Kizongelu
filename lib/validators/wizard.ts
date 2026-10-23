/**
 * @file lib/validators/wizard.ts
 * Schemas de validação Zod por etapa para o Wizard de 7 etapas do Kizongelu.
 */

import { z } from 'zod';

// ETAPA 1: Tipo de Obra
export const ProjectTypeEnum = z.enum([
  'NOVA',
  'AMPLIACAO',
  'REMODELACAO',
  'REABILITACAO',
  'MURO',
  'ANEXO',
  'GARAGEM',
  'OUTRA',
]);

export const step1Schema = z.object({
  type: ProjectTypeEnum,
  workType: ProjectTypeEnum.optional(),
  title: z
    .string()
    .nullish()
    .transform((val) => (val ? val.trim() : ''))
    .refine((val) => !val || val.length >= 2, {
      message: 'O título da obra deve ter pelo menos 2 caracteres quando preenchido.',
    })
    .default(''),
});

// ETAPA 2: Localização
export const step2Schema = z.object({
  province: z.string().min(1, 'A província é obrigatória.'),
  municipality: z.string().min(1, 'O município é obrigatório.'),
  address: z.string().optional(),
});

// ETAPA 3: Características
export const step3Schema = z.object({
  areaUnknown: z.boolean().default(false),
  area: z.number().min(5, 'A área deve ter no mínimo 5m²').optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  floors: z.number().min(1, 'Mínimo de 1 piso').max(10, 'Máximo de 10 pisos').default(1),
  bedrooms: z.number().min(0, 'Mínimo de 0 quartos').default(3),
  bathrooms: z.number().min(1, 'Mínimo de 1 casa de banho').default(2),
  hasLivingRoom: z.boolean().default(true),
  hasKitchen: z.boolean().default(true),
  hasGarage: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasAnnex: z.boolean().default(false),
}).refine(
  (data) => {
    if (!data.areaUnknown && (!data.area || data.area <= 0)) {
      if ((!data.length || data.length <= 0) || (!data.width || data.width <= 0)) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Indique a área ou o comprimento e largura da construção, ou seleccione "Não sei".',
    path: ['area'],
  }
);

// ETAPA 4: Construtivas
export const step4Schema = z.object({
  foundation: z.enum(['sapata_corrida', 'sapata_isolada', 'laje', 'nao_sei']),
  structure: z.enum(['betao_armado', 'alvenaria_estrutural', 'nao_sei']),
  roof: z.enum(['chapa', 'telha', 'laje', 'nao_sei']),
  finishLevel: z.enum(['economico', 'medio', 'alto']),
});

// ETAPA 5: Instalações e Acabamentos
export const step5Schema = z.object({
  flooring: z.string().default('ceramica_padrao'),
  walls: z.string().default('tinta_plastica'),
  electrical: z.enum(['basica', 'intermedia', 'completa']).default('intermedia'),
  plumbing: z.enum(['basica', 'intermedia', 'completa']).default('intermedia'),
  joinery: z.string().default('aluminio_standard'),
});

// ETAPA 6: Orçamento Disponível
export const step6Schema = z.object({
  targetBudget: z.string().min(1, 'Seleccione uma faixa de orçamento ou "Ainda não sei".'),
});

// ETAPA 7: Documentos
export const step7Schema = z.object({
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.number().max(20 * 1024 * 1024, 'Ficheiro excede o tamanho máximo de 20MB'),
      type: z.string(),
      url: z.string().optional(),
    })
  ).default([]),
  skipDocuments: z.boolean().default(false),
});

// Schema Completo Agregado do Wizard
export const fullWizardSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type FullWizardData = z.infer<typeof fullWizardSchema>;
