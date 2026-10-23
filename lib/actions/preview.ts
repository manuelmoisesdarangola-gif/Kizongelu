/**
 * @file lib/actions/preview.ts
 * Server Action e lógica de negócio para a :
 * Preview do Cálculo, Índices de Confiança, Comparação Orçamental e Paywall Seguro.
 */

import { getProjectDraft } from './wizard';
import { calculate } from '../calculation-engine';
import { CalculationInput, ConfidenceResult } from '../calculation-engine/types';
import { prisma } from '../db/prisma';
import { z } from 'zod';
import { markProjectUnlocked } from './projects';

export const unlockProjectSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  userType: z.enum(['PARTICULAR', 'PROFISSIONAL']),
  hasActiveSubscription: z.boolean().optional(),
});

export const getPreviewSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
});

export interface PreviewChapter {
  id: string;
  number: number;
  name: string;
  subtotal: number;
  percentage: number;
  isLocked: boolean;
  sampleItems?: { name: string; quantity: number; unit: string; total: number }[];
}

export interface PreviewPhase {
  number: number;
  name: string;
  description: string;
  cost: number;
  accumulatedCost: number;
  percentage: number;
  isLocked: boolean;
}

export interface BudgetComparison {
  targetBudgetBracket: string;
  targetBudgetValue: number | null;
  targetBudgetLabel: string;
  estimatedTotal: number;
  difference: number;
  status: 'ABOVE' | 'COMPATIBLE' | 'BELOW' | 'UNKNOWN';
  message: string;
}

export interface ProjectPreviewData {
  projectId: string;
  title: string;
  status: 'DRAFT' | 'ESTIMATED' | 'UNLOCKED';
  isUnlocked: boolean;
  userType: 'PARTICULAR' | 'PROFISSIONAL';
  hasActiveSubscription: boolean;
  summary: {
    type: string;
    typeLabel: string;
    province: string;
    municipality: string;
    area: number;
    floors: number;
    bedrooms: number;
    bathrooms: number;
    finishLevel: string;
    finishLevelLabel: string;
  };
  confidence: ConfidenceResult;
  totals: {
    grandTotal: number;
    materialsTotal: number;
    laborTotal: number;
    transportTotal: number;
    directCost?: number;
    financialClosing?: any;
  };
  chapters: PreviewChapter[];
  phases: PreviewPhase[];
  budgetComparison: BudgetComparison;
  milestoneCoverage: {
    coberturaCost: number;
    coberturaPercentage: number;
    coberturaMessage: string;
  };
  alerts?: any[];
}

// Mapa de preços de desbloqueio
export const UNLOCK_PRICE_KZ = 12999;

// Estado de desbloqueio em memória / storage
const UNLOCKED_PROJECTS = new Set<string>();

/**
 * Traduz o valor nominal da faixa de orçamento da Etapa 6
 */
function parseBudgetBracket(bracket?: string): { value: number | null; label: string } {
  switch (bracket) {
    case 'ATE_5M':
      return { value: 5000000, label: 'Até 5.000.000 Kz' };
    case '5M_10M':
      return { value: 10000000, label: '10.000.000 Kz' };
    case '10M_20M':
      return { value: 20000000, label: '20.000.000 Kz' };
    case '20M_40M':
      return { value: 40000000, label: '40.000.000 Kz' };
    case '40M_80M':
      return { value: 80000000, label: '80.000.000 Kz' };
    case 'MAIS_80M':
      return { value: 100000000, label: 'Mais de 80.000.000 Kz' };
    default:
      return { value: null, label: 'Sem orçamento definido' };
  }
}

/**
 * Devolve os dados seguros para a página de pré-visualização.
 * REGRA DE SEGURANÇA: Itens de capítulos bloqueados NUNCA são enviados para o cliente.
 */
export async function getPreview(
  projectId: string,
  userContext?: { role?: 'PARTICULAR' | 'PROFISSIONAL'; hasActiveSubscription?: boolean }
): Promise<ProjectPreviewData> {
  const project = await getProjectDraft(projectId);

  // Dados padrão caso o projeto seja invocado diretamente
  const data = project?.data || {};
  const step1 = data.step1 || { type: 'NOVA', title: 'Moradia Familiar T3' };
  const step2 = data.step2 || { province: 'Luanda', municipality: 'Talatona' };
  const step3: any = data.step3 || {
    area: 200,
    areaUnknown: false,
    length: 20,
    width: 10,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: true,
    hasBalcony: false,
    hasAnnex: false,
  };
  const step4 = data.step4 || {
    foundation: 'sapata_corrida',
    structure: 'betao_armado',
    roof: 'chapa',
    finishLevel: 'medio',
  };
  const step5 = data.step5 || { electrical: 'intermedia', plumbing: 'intermedia' };
  const step6 = data.step6 || { targetBudget: '20M_40M' };

  // Verifica se o projeto já foi desbloqueado
  const isUnlocked = UNLOCKED_PROJECTS.has(projectId) || (typeof window !== 'undefined' && !!window.localStorage?.getItem(`Kizongelu_unlocked_${projectId}`));

  // Executa o cálculo determinístico
  const areaCalc = step3.areaUnknown ? (step3.length || 15) * (step3.width || 10) : (step3.area || 150);
  const calcInput: CalculationInput = {
    type: step1.type as any,
    province: step2.province,
    municipality: step2.municipality,
    area: areaCalc,
    length: step3.length || 20,
    width: step3.width || 10,
    floors: step3.floors || 1,
    bedrooms: step3.bedrooms || 3,
    bathrooms: step3.bathrooms || 2,
    hasLivingRoom: step3.hasLivingRoom ?? true,
    hasKitchen: step3.hasKitchen ?? true,
    hasGarage: step3.hasGarage ?? false,
    hasBalcony: step3.hasBalcony ?? false,
    hasAnnex: step3.hasAnnex ?? false,
    foundation: step4.foundation as any,
    structure: step4.structure as any,
    roof: step4.roof as any,
    finishLevel: step4.finishLevel as any,
    electrical: step5.electrical,
    plumbing: step5.plumbing,
  };

  const calcResult = await calculate(calcInput, 'v1.0');
  const grandTotal = Math.round(calcResult.grandTotal);

  // Organiza os 6 capítulos principais
  const rawChapters = [
    { id: 'fundacoes', number: 1, name: 'Fundações e Movimento de Terras', ratio: 0.12 },
    { id: 'estrutura', number: 2, name: 'Estrutura de Betão Armado', ratio: 0.28 },
    { id: 'alvenaria', number: 3, name: 'Alvenarias e Vedações', ratio: 0.18 },
    { id: 'cobertura', number: 4, name: 'Cobertura e Impermeabilizações', ratio: 0.14 },
    { id: 'instalacoes', number: 5, name: 'Instalações Técnicas (Água e Eletricidade)', ratio: 0.13 },
    { id: 'acabamentos', number: 6, name: 'Acabamentos, Pavimentos e Pinturas', ratio: 0.15 },
  ];

  const chapters: PreviewChapter[] = rawChapters.map((ch, idx) => {
    const subtotal = Math.round(grandTotal * ch.ratio);
    const isLocked = !isUnlocked && idx >= 3; // Primeiros 3 visíveis, últimos 3 bloqueados

    // Amostra de itens apenas para os capítulos desbloqueados
    let sampleItems: any[] | undefined = undefined;
    if (!isLocked) {
      if (ch.id === 'fundacoes') {
        sampleItems = [
          { name: 'Escavação manual e mecânica de valas', quantity: Math.round(areaCalc * 0.35), unit: 'm³', total: Math.round(subtotal * 0.25) },
          { name: 'Betão de limpeza e enchimento ciclópico', quantity: Math.round(areaCalc * 0.18), unit: 'm³', total: Math.round(subtotal * 0.45) },
          { name: 'Armaduras de aço em varão nervurado A400', quantity: Math.round(areaCalc * 4.2), unit: 'kg', total: Math.round(subtotal * 0.30) },
        ];
      } else if (ch.id === 'estrutura') {
        sampleItems = [
          { name: 'Pilares e lintéis em betão armado C25/30', quantity: Math.round(areaCalc * 0.15), unit: 'm³', total: Math.round(subtotal * 0.55) },
          { name: 'Vigas de travamento e lintéis estruturais', quantity: Math.round(areaCalc * 0.12), unit: 'm³', total: Math.round(subtotal * 0.45) },
        ];
      } else if (ch.id === 'alvenaria') {
        sampleItems = [
          { name: 'Alvenaria de blocos de cimento 15x20x40', quantity: Math.round(areaCalc * 2.8), unit: 'm²', total: Math.round(subtotal * 0.70) },
          { name: 'Argamassa de assentamento ao traço 1:4', quantity: Math.round(areaCalc * 0.04), unit: 'm³', total: Math.round(subtotal * 0.30) },
        ];
      }
    }

    return {
      id: ch.id,
      number: ch.number,
      name: ch.name,
      subtotal,
      percentage: Math.round(ch.ratio * 100),
      isLocked,
      sampleItems,
    };
  });

  // 10 Fases da Construção com Custos Acumulados
  const phaseDistributions = [
    { name: 'Desmatação, Estaleiro e Marcação', desc: 'Limpeza do terreno, vedação provisória e implantação topográfica', ratio: 0.03 },
    { name: 'Abertura de Valas e Fundações', desc: 'Escavações, sapatas e vigas de fundação', ratio: 0.11 },
    { name: 'Estrutura: Pilares e Vigas Base', desc: 'Armaduras de aço, cofragens e betonagem estrutural', ratio: 0.18 },
    { name: 'Alvenarias de Elevação', desc: 'Paredes exteriores e divisórias em bloco de cimento', ratio: 0.12 },
    { name: 'Estrutura da Cobertura e Telhado', desc: 'Asnas metálicas/madeira, chapas IBR e caleiras', ratio: 0.12 },
    { name: 'Instalações Técnicas Embutidas', desc: 'Tubagens elétricas, esgotos e água nas paredes e pavimentos', ratio: 0.09 },
    { name: 'Rebocos e Betonilhas', desc: 'Argamassas interiores, exteriores e betonilha de assentamento', ratio: 0.11 },
    { name: 'Revestimentos Cerâmicos e Azulejos', desc: 'Pavimentos gerais, casas de banho e cozinha', ratio: 0.10 },
    { name: 'Pinturas, Caixilharia e Portas', desc: 'Tintas plásticas/acrílicas, janelas de alumínio e portas interiores', ratio: 0.10 },
    { name: 'Arremates Finais e Entrega', desc: 'Aparelhagem elétrica, louças sanitárias e limpeza final', ratio: 0.04 },
  ];

  let currentAccum = 0;
  const phases: PreviewPhase[] = phaseDistributions.map((p, pIdx) => {
    const isLast = pIdx === phaseDistributions.length - 1;
    const cost = isLast ? grandTotal - currentAccum : Math.round(grandTotal * p.ratio);
    currentAccum += cost;
    return {
      number: pIdx + 1,
      name: p.name,
      description: p.desc,
      cost,
      accumulatedCost: currentAccum,
      percentage: Math.round(p.ratio * 100),
      isLocked: !isUnlocked && pIdx > 0, // Apenas a 1ª fase visível, restantes bloqueadas
    };
  });

  // Cálculo da Cobertura (Fases 1 a 5)
  const coberturaCost = phases.slice(0, 5).reduce((acc, ph) => acc + ph.cost, 0);
  const coberturaPercentage = Math.round((coberturaCost / grandTotal) * 100);

  // Comparação com Orçamento do Cliente
  const budgetInfo = parseBudgetBracket(step6.targetBudget);
  let budgetDiff = 0;
  let budgetStatus: BudgetComparison['status'] = 'UNKNOWN';
  let budgetMessage = 'O utilizador optou por não definir um teto orçamental inicial.';

  if (budgetInfo.value !== null) {
    budgetDiff = grandTotal - budgetInfo.value;
    if (budgetDiff > 0) {
      budgetStatus = 'ABOVE';
      budgetMessage = `A estimativa técnica (${grandTotal.toLocaleString('pt-PT')} Kz) encontra-se acima do orçamento indicado (${budgetInfo.label}) em ${Math.abs(budgetDiff).toLocaleString('pt-PT')} Kz.`;
    } else {
      budgetStatus = 'COMPATIBLE';
      budgetMessage = `A estimativa técnica (${grandTotal.toLocaleString('pt-PT')} Kz) é perfeitamente compatível com o seu orçamento disponível (${budgetInfo.label}).`;
    }
  }

  const role = userContext?.role || 'PARTICULAR';
  const hasSub = !!userContext?.hasActiveSubscription;

  return {
    projectId: project?.id || projectId,
    title: project?.title || 'Moradia T3 em Angola',
    status: isUnlocked ? 'UNLOCKED' : 'ESTIMATED',
    isUnlocked,
    userType: role,
    hasActiveSubscription: hasSub,
    summary: {
      type: step1.type,
      typeLabel:
        {
          NOVA: 'Construção Nova',
          AMPLIACAO: 'Ampliação',
          REMODELACAO: 'Remodelação',
          REABILITACAO: 'Reabilitação',
          MURO: 'Muro de Vedação',
          ANEXO: 'Anexo',
          GARAGEM: 'Garagem',
          OUTRA: 'Outro tipo de obra',
        }[step1.type] || step1.type,
      province: step2.province,
      municipality: step2.municipality,
      area: areaCalc,
      floors: step3.floors || 1,
      bedrooms: step3.bedrooms ?? 3,
      bathrooms: step3.bathrooms ?? 2,
      finishLevel: step4.finishLevel,
      finishLevelLabel:
        step4.finishLevel === 'alto'
          ? 'Alto / Luxo'
          : step4.finishLevel === 'medio'
          ? 'Padrão Médio'
          : 'Económico',
    },
    confidence: calcResult.confidence,
    totals: {
      grandTotal,
      materialsTotal: Math.round(calcResult.materialsTotal),
      laborTotal: Math.round(calcResult.laborTotal),
      transportTotal: Math.round(calcResult.transportTotal),
      directCost: Math.round(calcResult.directCost),
      financialClosing: calcResult.financialClosing,
    },
    chapters,
    phases,
    budgetComparison: {
      targetBudgetBracket: step6.targetBudget,
      targetBudgetValue: budgetInfo.value,
      targetBudgetLabel: budgetInfo.label,
      estimatedTotal: grandTotal,
      difference: budgetDiff,
      status: budgetStatus,
      message: budgetMessage,
    },
    milestoneCoverage: {
      coberturaCost,
      coberturaPercentage,
      coberturaMessage: `Para chegar à fase de Cobertura (Fases 1 a 5 concluídas com a casa tosca coberta), necessita de aproximadamente ${coberturaCost.toLocaleString('pt-PT')} Kz (${coberturaPercentage}% do valor total da obra).`,
    },
    alerts: calcResult.alerts || [],
  };
}

/**
 * Desbloqueia o projeto de acordo com o plano do utilizador:
 * - Particular: paga 12.999 Kz (simulado ou pagamento aprovado)
 * - Profissional com subscrição: desbloqueio direto gratuito
 */
export async function unlockProject(
  projectId: string,
  userType: 'PARTICULAR' | 'PROFISSIONAL',
  hasActiveSubscription: boolean = false
): Promise<{ success: boolean; message: string; amountCharged: number }> {
  const validated = unlockProjectSchema.safeParse({ projectId, userType, hasActiveSubscription });
  const validProjectId = validated.success ? validated.data.projectId : projectId;
  const validUserType = validated.success ? validated.data.userType : userType;
  const validHasActiveSubscription = validated.success ? !!validated.data.hasActiveSubscription : hasActiveSubscription;

  UNLOCKED_PROJECTS.add(validProjectId);

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(`Kizongelu_unlocked_${validProjectId}`, 'true');
  }

  markProjectUnlocked(validProjectId);

  if (prisma && process.env.DATABASE_URL) {
    try {
      await prisma.project.update({
        where: { id: validProjectId },
        data: {
          status: 'UNLOCKED',
          updatedAt: new Date(),
        },
        select: {
          id: true,
          status: true,
        },
      });
    } catch (_) {}
  }

  if (validUserType === 'PROFISSIONAL' && validHasActiveSubscription) {
    return {
      success: true,
      message: 'Orçamento concluído diretamente através do seu Pacote de Orçamentos ativo.',
      amountCharged: 0,
    };
  }

  return {
    success: true,
    message: `Orçamento concluído com sucesso pelo valor de ${UNLOCK_PRICE_KZ.toLocaleString('pt-PT')} Kz.`,
    amountCharged: UNLOCK_PRICE_KZ,
  };
}
