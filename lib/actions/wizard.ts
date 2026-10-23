/**
 * @file lib/actions/wizard.ts
 * Server actions e serviços de persistência para o Wizard de Orçamentação .
 * Suporta persistência real no PostgreSQL (Prisma) e fallback gracioso offline/browser.
 */

import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import { calculate, saveCalculation } from '../calculation-engine';
import { CalculationInput } from '../calculation-engine/types';
import { FullWizardData } from '../validators/wizard';
import { upsertProjectToDashboard } from './projects';
import { z } from 'zod';

export const createProjectDraftSchema = z.object({
  title: z.string().optional(),
  userId: z.string().optional(),
  initialData: z.record(z.string(), z.unknown()).optional(),
});

export const wizardStepSaveSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  stepNumber: z.number().int().min(1).max(7),
  stepData: z.record(z.string(), z.unknown()),
});

// Armazenamento local em memória para ambiente browser/offline
const MEMORY_PROJECTS = new Map<string, any>();

export interface WizardProjectState {
  id: string;
  userId?: string;
  title: string;
  status: 'DRAFT' | 'ESTIMATED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStep: number;
  data: Partial<FullWizardData>;
  createdAt: string;
  updatedAt: string;
  calculationId?: string;
}

/**
 * Cria um novo projeto vazio ou com dados iniciais e devolve o ID.
 */
export async function createProject(
  initialData?: Partial<FullWizardData>,
  userId: string = 'usr_guest',
  customId?: string
): Promise<WizardProjectState> {
  const validated = createProjectDraftSchema.safeParse({ initialData: initialData as any, userId });
  const safeUserId = validated.success && validated.data.userId ? validated.data.userId : userId;

  const projectId = customId || `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newProject: WizardProjectState = {
    id: projectId,
    userId: safeUserId,
    title: initialData?.step1?.title || 'Novo Orçamento de Construção',
    status: 'DRAFT',
    currentStep: 1,
    data: initialData || {
      step1: { type: '' as any, title: '' },
      step2: { province: '', municipality: '', address: '' },
      step3: {
        areaUnknown: false,
        area: 200,
        length: 20,
        width: 10,
        floors: 1,
        bedrooms: 3,
        bathrooms: 2,
        hasLivingRoom: true,
        hasKitchen: true,
        hasGarage: false,
        hasBalcony: false,
        hasAnnex: false,
      },
      step4: {
        foundation: 'sapata_corrida',
        structure: 'betao_armado',
        roof: 'chapa',
        finishLevel: 'medio',
      },
      step5: {
        flooring: 'ceramica_padrao',
        walls: 'tinta_plastica',
        electrical: 'intermedia',
        plumbing: 'intermedia',
        joinery: 'aluminio_standard',
      },
      step6: {
        targetBudget: '10M_20M',
      },
      step7: {
        documents: [],
        skipDocuments: false,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  // Persistência em memória / localStorage
  MEMORY_PROJECTS.set(projectId, newProject);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`Kizongelu_project_${projectId}`, JSON.stringify(newProject));
      window.localStorage.setItem('Kizongelu_active_draft_id', projectId);
    }
  } catch (e) {
    console.warn('LocalStorage indisponível', e);
  }

  // Tenta persistência real na Base de Dados se o Prisma estiver configurado
  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.create({
        data: {
          id: projectId,
          name: newProject.title || 'Novo Orçamento de Obra',
          type: 'NOVA',
          province: (newProject.data as any)?.step1?.province || 'Luanda',
          municipality: (newProject.data as any)?.step1?.municipality || null,
          status: 'DRAFT',
          userId: safeUserId,
          input: {
            create: {
              data: newProject.data,
              wizardStep: 1,
            },
          },
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      await logAuditEvent({
        event: 'PROJECT_CREATED',
        userId: safeUserId,
        details: { projectId, title: newProject.title },
        status: 'SUCCESS',
      });
    } catch (dbErr) {
      console.warn('Persistência BD em background ignorada, a usar storage local:', dbErr);
    }
  }

  return newProject;
}

/**
 * Guarda o progresso da etapa (Auto-save).
 */
export async function saveWizardStep(
  projectId: string,
  stepNumber: number,
  stepData: any
): Promise<{ success: boolean; updatedAt: string }> {
  const validated = wizardStepSaveSchema.safeParse({ projectId, stepNumber, stepData });
  const validStepNumber = validated.success ? validated.data.stepNumber : stepNumber;
  const validStepData = validated.success ? validated.data.stepData : stepData;

  const now = new Date().toISOString();
  let project = MEMORY_PROJECTS.get(projectId);

  if (!project) {
    // Tenta carregar do localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(`Kizongelu_project_${projectId}`);
      if (saved) {
        try {
          project = JSON.parse(saved);
        } catch (_) {}
      }
    }
  }

  if (!project) {
    project = {
      id: projectId,
      title: 'Orçamento em Andamento',
      status: 'DRAFT',
      currentStep: validStepNumber,
      data: {},
      createdAt: now,
      updatedAt: now,
    };
  }

  project.currentStep = validStepNumber;
  project.updatedAt = now;
  const stepKey = `step${validStepNumber}` as keyof FullWizardData;
  project.data = {
    ...project.data,
    [stepKey]: validStepData,
  };

  if (validStepNumber === 1 && validStepData?.title) {
    project.title = validStepData.title;
  }

  MEMORY_PROJECTS.set(projectId, project);

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`Kizongelu_project_${projectId}`, JSON.stringify(project));
    window.localStorage.setItem('Kizongelu_active_draft_id', projectId);
  }

  // Tenta BD se disponível com select explícito
  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          name: project.title,
          updatedAt: new Date(),
          input: {
            upsert: {
              update: {
                data: project.data,
                wizardStep: validStepNumber,
              },
              create: {
                data: project.data,
                wizardStep: validStepNumber,
              },
            },
          },
        },
        select: {
          id: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      // Falha silenciosa para manter resiliência
    }
  }

  return { success: true, updatedAt: now };
}

/**
 * Obtém os dados de um projeto existente.
 */
export async function getProjectDraft(projectId: string): Promise<WizardProjectState | null> {
  if (MEMORY_PROJECTS.has(projectId)) {
    return MEMORY_PROJECTS.get(projectId);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(`Kizongelu_project_${projectId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        MEMORY_PROJECTS.set(projectId, parsed);
        return parsed;
      } catch (_) {}
    }
  }

  // Consulta à base de dados PostgreSQL via Prisma com select explícito se não encontrado no storage
  if (process.env.DATABASE_URL && prisma) {
    try {
      const dbP = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          userId: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          input: {
            select: {
              data: true,
              wizardStep: true,
            },
          },
        },
      });

      if (dbP) {
        const parsed: WizardProjectState = {
          id: dbP.id,
          userId: dbP.userId,
          title: dbP.name,
          status: dbP.status as any,
          currentStep: dbP.input?.wizardStep || 1,
          data: (dbP.input?.data as any) || {},
          createdAt: dbP.createdAt.toISOString(),
          updatedAt: dbP.updatedAt.toISOString(),
        };
        MEMORY_PROJECTS.set(projectId, parsed);
        return parsed;
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Procura um rascunho recente nos últimos 30 dias para a funcionalidade de retoma.
 */
export async function findRecentDraft(userId: string = 'usr_guest'): Promise<WizardProjectState | null> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const activeDraftId = window.localStorage.getItem('Kizongelu_active_draft_id');
    if (activeDraftId) {
      const draft = await getProjectDraft(activeDraftId);
      if (draft && draft.status === 'DRAFT') {
        const updatedAt = new Date(draft.updatedAt).getTime();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - updatedAt < thirtyDaysMs) {
          return draft;
        }
      }
    }
  }

  // Procura no mapa em memória
  for (const proj of MEMORY_PROJECTS.values()) {
    if (proj.status === 'DRAFT') {
      return proj;
    }
  }

  return null;
}

/**
 * Conclui a Etapa 7: Executa calculate() da e gera a persistência oficial do cálculo.
 */
export async function finalizeWizardCalculation(
  projectId: string,
  fullData: FullWizardData
): Promise<{ success: boolean; calculation: any; previewUrl: string }> {
  // Constrói o CalculationInput requerido pelo motor de cálculo
  const areaCalc = fullData.step3.areaUnknown
    ? (fullData.step3.length || 15) * (fullData.step3.width || 10)
    : (fullData.step3.area || 150);

  const calcInput: CalculationInput = {
    type: fullData.step1.type as any,
    province: fullData.step2.province,
    municipality: fullData.step2.municipality,
    area: areaCalc,
    length: fullData.step3.length || Math.sqrt(areaCalc * 1.5),
    width: fullData.step3.width || Math.sqrt(areaCalc / 1.5),
    floors: fullData.step3.floors,
    bedrooms: fullData.step3.bedrooms,
    bathrooms: fullData.step3.bathrooms,
    hasLivingRoom: fullData.step3.hasLivingRoom,
    hasKitchen: fullData.step3.hasKitchen,
    hasGarage: fullData.step3.hasGarage,
    hasBalcony: fullData.step3.hasBalcony,
    hasAnnex: fullData.step3.hasAnnex,
    foundation: fullData.step4.foundation as any,
    structure: fullData.step4.structure as any,
    roof: fullData.step4.roof as any,
    finishLevel: fullData.step4.finishLevel as any,
    electrical: fullData.step5.electrical,
    plumbing: fullData.step5.plumbing,
  };

  // Chama o motor determinístico
  const calculationResult = await calculate(calcInput, 'v1.0');

  // Guarda o cálculo e gera registo de auditoria
  const savedCalc = await saveCalculation(projectId, calculationResult.items, 'v1.0');

  // Atualiza estado do projeto
  const project = await getProjectDraft(projectId);
  if (project) {
    project.status = 'ESTIMATED';
    project.calculationId = savedCalc.id;
    project.data = fullData;
    project.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS.set(projectId, project);

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`Kizongelu_project_${projectId}`, JSON.stringify(project));
      window.localStorage.setItem(`Kizongelu_calculation_${projectId}`, JSON.stringify(calculationResult));
    }
  }

  return {
    success: true,
    calculation: calculationResult,
    previewUrl: `/projeto/${projectId}/preview`,
  };
}

/**
 * Associa um projeto de utilizador anónimo a uma conta de utilizador recém-criada ou autenticada,
 * e regista-o imediatamente no painel de projetos do utilizador.
 */
export async function assignProjectToUser(projectId: string, userId: string): Promise<void> {
  const project = await getProjectDraft(projectId);
  if (project) {
    project.userId = userId;
    MEMORY_PROJECTS.set(projectId, project);
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`Kizongelu_project_${projectId}`, JSON.stringify(project));
      window.localStorage.setItem('Kizongelu_active_draft_id', projectId);
    }

    // Tenta carregar cálculo salvo para calcular total exato
    let totalKz = 27000000;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawCalc = window.localStorage.getItem(`Kizongelu_calculation_${projectId}`);
        if (rawCalc) {
          const parsed = JSON.parse(rawCalc);
          if (parsed?.grandTotal) totalKz = parsed.grandTotal;
        }
      }
    } catch (_) {}

    const typeStr = project.data?.step1?.type || 'NOVA';
    const typeLabel =
      typeStr === 'NOVA'
        ? 'Construção Nova'
        : typeStr === 'REABILITACAO'
        ? 'Reabilitação'
        : typeStr === 'AMPLIACAO'
        ? 'Ampliação'
        : 'Obra Residencial';

    const areaM2 = project.data?.step3?.areaUnknown
      ? (project.data?.step3?.length || 15) * (project.data?.step3?.width || 10)
      : project.data?.step3?.area || 150;

    // Regista o projecto no repositório de Dashboard (sincronização automática)
    await upsertProjectToDashboard({
      id: project.id,
      userId,
      name: project.title || 'Orçamento de Construção',
      clientName: 'Orçamento Próprio',
      type: typeStr,
      typeLabel,
      province: project.data?.step2?.province || 'Luanda',
      municipality: project.data?.step2?.municipality || 'Talatona',
      status: project.status === 'ESTIMATED' ? 'ESTIMATED' : 'DRAFT',
      totalKz,
      areaM2,
      finishLevel: project.data?.step4?.finishLevel === 'alto' ? 'Alto' : project.data?.step4?.finishLevel === 'economico' ? 'Económico' : 'Médio',
      createdAt: project.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documentsCount: project.data?.step7?.documents?.length || 0,
      shareLinksCount: 0,
    });
  }
}

/**
 * 2.4 Limpeza de rascunhos anónimos (TTL de 30 dias).
 * Remove rascunhos antigos e chaves órfãs para evitar acumulação no storage do cliente.
 */
export function cleanupExpiredDrafts(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const ttlMs = 30 * 24 * 60 * 60 * 1000; // 30 dias
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('Kizongelu_project_')) {
        const val = window.localStorage.getItem(key);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (parsed.status === 'DRAFT') {
              const updated = new Date(parsed.updatedAt || parsed.createdAt || 0).getTime();
              if (now - updated > ttlMs) {
                keysToRemove.push(key);
                const projId = key.replace('Kizongelu_project_', '');
                keysToRemove.push(`Kizongelu_calculation_${projId}`);
              }
            }
          } catch (_) {
            keysToRemove.push(key);
          }
        }
      }
    }

    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch (err) {
    console.warn('Erro ao limpar rascunhos expirados:', err);
  }
}
