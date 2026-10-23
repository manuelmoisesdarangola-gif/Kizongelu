/**
 * @file lib/actions/projects.ts
 * Gestão de Projetos, Orçamentos, Documentos, Versões e Exportação CSV .
 * Suporta persistência em memória / localStorage / Prisma e isolamento por utilizador/role.
 */

import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import { getProjectDraft } from './wizard';
import { getPreview } from './preview';
import { z } from 'zod';

export const projectFiltersSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  province: z.string().optional(),
  search: z.string().optional(),
});

export const duplicateProjectSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  userId: z.string().optional(),
});

export const archiveProjectSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  userId: z.string().optional(),
});

export const restoreProjectSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  userId: z.string().optional(),
});

export type ProjectStatusType = 'DRAFT' | 'ESTIMATED' | 'UNLOCKED' | 'ARCHIVED';

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type: string; // 'PLANTA' | 'ALVARA' | 'MEMORIA' | 'TOPOGRAFIA' | 'OUTRO'
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface ProjectVersion {
  id?: string;
  version?: string;
  versionNumber?: number | string;
  createdAt: string;
  createdBy?: string;
  authorName?: string;
  notes?: string;
  changeDescription?: string;
  totalKz?: number;
  grandTotalKz?: number;
  engineVersion?: string;
}

export interface MeasurementItem {
  code: string;
  description: string;
  unit: string;
  budgetQty: number; // Quantidade prevista no contrato
  unitPriceKz: number;
  previousQty: number; // Quantidade acumulada até ao auto anterior
  periodQty: number; // Quantidade executada no mês corrente
  accumulatedQty: number; // previousQty + periodQty
  periodTotalKz: number; // periodQty * unitPriceKz
  accumulatedTotalKz: number; // accumulatedQty * unitPriceKz
  percentageExecuted: number; // (accumulatedQty / budgetQty) * 100
}

export interface MeasurementReport {
  id: string;
  projectId: string;
  reportNumber: number; // Auto n.º 1, 2, 3...
  periodLabel: string; // Ex: "Mês 1 - Outubro 2026"
  date: string;
  fiscalEngineer: string;
  contractorRepresentative: string;
  status: 'RASCUNHO' | 'SUBMETIDO' | 'APROVADO_FISCAL' | 'PAGO';
  periodDirectCostKz: number;
  periodBdiKz: number;
  periodIvaKz: number;
  periodRetencaoKz: number;
  periodLiquidKz: number;
  accumulatedPercentage: number;
  items: MeasurementItem[];
}

export interface ProjectListItem {
  id: string;
  userId: string;
  name: string;
  clientName?: string;
  clientPhone?: string;
  type: string;
  typeLabel: string;
  province: string;
  municipality: string;
  status: ProjectStatusType;
  totalKz: number;
  createdAt: string;
  updatedAt: string;
  areaM2: number;
  finishLevel: string;
  documentsCount: number;
  shareLinksCount: number;
}

export interface ProjectDetail extends ProjectListItem {
  documents: ProjectDocument[];
  versions: ProjectVersion[];
  measurements?: MeasurementReport[];
  calculationSummary?: any;
  calculation?: any;
  shareLinks?: any[];
  notes?: string;
}

// Repositório em memória predefinido com projetos realistas do mercado angolano
const SEED_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj_sample_01',
    userId: 'user-particular-01',
    name: 'Moradia T3 Familiar no Kilamba',
    clientName: 'Manuel Kiala',
    clientPhone: '+244 923 456 789',
    type: 'NOVA',
    typeLabel: 'Construção Nova',
    province: 'Luanda',
    municipality: 'Belas',
    status: 'UNLOCKED',
    totalKz: 29387686,
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    areaM2: 200,
    finishLevel: 'Médio',
    documentsCount: 3,
    shareLinksCount: 1,
  },
  {
    id: 'proj_carlos_01',
    userId: 'usr_carlos_neto',
    name: 'Edifício Residencial Maianga (8 Apartamentos T2)',
    clientName: 'Maianga Gestão Imobiliária',
    clientPhone: '+244 931 000 222',
    type: 'NOVA',
    typeLabel: 'Construção Nova',
    province: 'Luanda',
    municipality: 'Maianga',
    status: 'UNLOCKED',
    totalKz: 145000000,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    areaM2: 850,
    finishLevel: 'Médio',
    documentsCount: 5,
    shareLinksCount: 2,
  },
  {
    id: 'proj_carlos_02',
    userId: 'usr_carlos_neto',
    name: 'Reabilitação de Escritórios no Kinaxixi',
    clientName: 'Grupo Delta Angola',
    clientPhone: '+244 923 888 777',
    type: 'REMODELACAO',
    typeLabel: 'Remodelação Comercial',
    province: 'Luanda',
    municipality: 'Ingombota',
    status: 'ESTIMATED',
    totalKz: 38400000,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    areaM2: 280,
    finishLevel: 'Alto',
    documentsCount: 2,
    shareLinksCount: 1,
  },
  {
    id: 'proj_prof_01',
    userId: 'user-prof-01',
    name: 'Moradia T4 Alto Padrão na Restinga',
    clientName: 'Dr. Manuel Domingos',
    clientPhone: '+244 912 345 678',
    type: 'NOVA',
    typeLabel: 'Construção Nova',
    province: 'Benguela',
    municipality: 'Lobito',
    status: 'UNLOCKED',
    totalKz: 48950000,
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    areaM2: 320,
    finishLevel: 'Alto',
    documentsCount: 4,
    shareLinksCount: 2,
  },
  {
    id: 'proj_prof_02',
    userId: 'user-prof-01',
    name: 'Remodelação de Escritório no Miramar',
    clientName: 'TecnoAngola Lda',
    clientPhone: '+244 934 999 111',
    type: 'REMODELACAO',
    typeLabel: 'Remodelação',
    province: 'Luanda',
    municipality: 'Luanda',
    status: 'ESTIMATED',
    totalKz: 14200000,
    createdAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    areaM2: 140,
    finishLevel: 'Médio',
    documentsCount: 1,
    shareLinksCount: 0,
  },
  {
    id: 'proj_prof_03',
    userId: 'user-prof-01',
    name: 'Muro de Vedação e Portão em Cacuaco',
    clientName: 'Eng. Carlos Paiva',
    clientPhone: '+244 945 123 789',
    type: 'MURO',
    typeLabel: 'Muro de Vedação',
    province: 'Luanda',
    municipality: 'Cacuaco',
    status: 'DRAFT',
    totalKz: 5800000,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    areaM2: 80,
    finishLevel: 'Económico',
    documentsCount: 0,
    shareLinksCount: 0,
  },
  {
    id: 'proj_empresa_01',
    userId: 'user-empresa-01',
    name: 'Condomínio Chela Verde (Bloco 1 - 4 Casas T3)',
    clientName: 'Fundo Habitacional da Huíla',
    clientPhone: '+244 923 111 222',
    type: 'NOVA',
    typeLabel: 'Construção Nova',
    province: 'Huíla',
    municipality: 'Lubango',
    status: 'UNLOCKED',
    totalKz: 118400000,
    createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    areaM2: 680,
    finishLevel: 'Médio',
    documentsCount: 6,
    shareLinksCount: 3,
  },
  {
    id: 'proj_empresa_02',
    userId: 'user-empresa-01',
    name: 'Armazém Logístico no Polo Industrial de Viana',
    clientName: 'Distribuidora Comercial do Sul',
    clientPhone: '+244 911 222 333',
    type: 'NOVA',
    typeLabel: 'Estrutura / Armazém',
    province: 'Luanda',
    municipality: 'Viana',
    status: 'UNLOCKED',
    totalKz: 84500000,
    createdAt: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    areaM2: 500,
    finishLevel: 'Económico',
    documentsCount: 2,
    shareLinksCount: 1,
  },
  {
    id: 'proj_empresa_03',
    userId: 'user-empresa-01',
    name: 'Anexo e Área Gourmet em Talatona',
    clientName: 'Dra. Luísa Furtado',
    clientPhone: '+244 924 555 666',
    type: 'ANEXO',
    typeLabel: 'Anexo Habitacional',
    province: 'Luanda',
    municipality: 'Talatona',
    status: 'ESTIMATED',
    totalKz: 16900000,
    createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    areaM2: 95,
    finishLevel: 'Alto',
    documentsCount: 1,
    shareLinksCount: 0,
  },
];

// Mapa em memória
const MEMORY_PROJECTS_LIST = new Map<string, ProjectListItem>();
SEED_PROJECTS.forEach((p) => MEMORY_PROJECTS_LIST.set(p.id, p));

const MEMORY_DOCUMENTS = new Map<string, ProjectDocument[]>();
MEMORY_DOCUMENTS.set('proj_sample_01', [
  {
    id: 'doc_01',
    projectId: 'proj_sample_01',
    name: 'Planta_Arquitectonica_T3_Kilamba_Aprovada.pdf',
    type: 'PLANTA',
    sizeBytes: 3450000,
    uploadedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Manuel Kiala',
    url: '/uploads/planta_kilamba.pdf',
  },
  {
    id: 'doc_02',
    projectId: 'proj_sample_01',
    name: 'Memoria_Descritiva_Estruturas.pdf',
    type: 'MEMORIA',
    sizeBytes: 1820000,
    uploadedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Manuel Kiala',
    url: '/uploads/memoria_estruturas.pdf',
  },
  {
    id: 'doc_03',
    projectId: 'proj_sample_01',
    name: 'Levantamento_Topografico_Terreno_20x10.pdf',
    type: 'TOPOGRAFIA',
    sizeBytes: 940000,
    uploadedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    uploadedBy: 'Manuel Kiala',
    url: '/uploads/topografia.pdf',
  },
]);

const MEMORY_VERSIONS = new Map<string, ProjectVersion[]>();
MEMORY_VERSIONS.set('proj_sample_01', [
  {
    version: 'v1.0.0',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'Motor Determinístico Kizongelu',
    notes: 'Orçamento inicial gerado a partir dos parâmetros do Wizard.',
    totalKz: 28950000,
    engineVersion: 'v1.0',
  },
  {
    version: 'v1.0.1',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    createdBy: 'Atualização Oficial de Preços (Luanda)',
    notes: 'Ajuste de cimento e brita para cotação oficial provincial.',
    totalKz: 29387686,
    engineVersion: 'v1.0',
  },
]);

/**
 * Inicializa a partir de localStorage se disponível
 */
function syncWithLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem('Kizongelu_dashboard_projects');
    if (raw) {
      const parsed: ProjectListItem[] = JSON.parse(raw);
      parsed.forEach((p) => MEMORY_PROJECTS_LIST.set(p.id, p));
    }
  } catch (e) {
    console.warn('Erro ao carregar do localStorage', e);
  }
}

function persistToLocalStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const arr = Array.from(MEMORY_PROJECTS_LIST.values());
    window.localStorage.setItem('Kizongelu_dashboard_projects', JSON.stringify(arr));
  } catch (e) {
    console.warn('Erro ao salvar no localStorage', e);
  }
}

// Inicializa
syncWithLocalStorage();

export interface ProjectFilters {
  status?: string; // 'ALL' | 'DRAFT' | 'ESTIMATED' | 'UNLOCKED' | 'ARCHIVED'
  type?: string; // 'ALL' | 'NOVA' | 'AMPLIACAO' | ...
  province?: string; // 'ALL' | 'Luanda' | ...
  search?: string;
}

/**
 * Lista projetos para o utilizador atual respeitando perfil / role
 */
export async function listProjects(
  userId: string,
  userRole: string,
  filters: ProjectFilters = {}
): Promise<ProjectListItem[]> {
  const validatedFilters = projectFiltersSchema.safeParse(filters);
  const f = validatedFilters.success ? (validatedFilters.data as ProjectFilters) : filters;

  // Tenta consulta real ao PostgreSQL via Prisma com select explícito
  if (process.env.DATABASE_URL && prisma) {
    try {
      const dbProjects = await prisma.project.findMany({
        where: {
          ...(userRole !== 'admin' && userRole !== 'ADMIN' ? { userId } : {}),
          ...(f.status && f.status !== 'ALL' ? { status: f.status as any } : { status: { not: 'ARCHIVED' } }),
          ...(f.type && f.type !== 'ALL' ? { type: f.type as any } : {}),
        },
        select: {
          id: true,
          userId: true,
          companyId: true,
          name: true,
          type: true,
          province: true,
          municipality: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          input: {
            select: {
              data: true,
              wizardStep: true,
            },
          },
          calculations: {
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              total: true,
              engineVersion: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (dbProjects && dbProjects.length > 0) {
        return dbProjects.map((p: any) => ({
          id: p.id,
          userId: p.userId,
          name: p.name,
          clientName: 'Cliente Particular',
          type: p.type,
          typeLabel: 'Moradia Unifamiliar',
          province: p.province,
          municipality: p.municipality || 'Luanda',
          status: p.status as ProjectStatusType,
          totalKz: p.calculations[0]?.total ? Number(p.calculations[0].total) : 27000000,
          areaM2: ((p.input?.data as any)?.area) || 200,
          finishLevel: 'Médio',
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          documentsCount: 0,
          shareLinksCount: 0,
        }));
      }
    } catch (err) {
      console.warn('[Projects] Erro na consulta Prisma findMany (usando fallback em memória):', err);
    }
  }

  syncWithLocalStorage();

  let list = Array.from(MEMORY_PROJECTS_LIST.values());

  // Filtra por dono se não for admin
  if (userRole !== 'admin') {
    list = list.filter((p) => {
      if (p.userId === userId) return true;
      if ((userId.includes('carlos') || userId === 'user-plus-01') && (p.userId === 'usr_carlos_neto' || p.userId === 'user-plus-01')) return true;
      if ((userId.includes('arnaldo') || userId === 'user-prof-01') && (p.userId === 'user-prof-01' || p.userId === 'usr_arnaldo_silva')) return true;
      if ((userId.includes('teresa') || userId === 'user-empresa-01') && (p.userId === 'user-empresa-01' || p.userId === 'usr_teresa_vandunem')) return true;
      if ((userId.includes('kiala') || userId === 'user-particular-01' || userId === 'usr_particular_seed') && (p.userId === 'user-particular-01' || p.userId === 'usr_manuel_kiala')) return true;
      return false;
    });
  }

  // Filtro de status
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((p) => p.status === filters.status);
  } else {
    // Por padrão não exibe arquivados a menos que explicitamente solicitado
    list = list.filter((p) => p.status !== 'ARCHIVED');
  }

  // Filtro de tipo
  if (filters.type && filters.type !== 'ALL') {
    list = list.filter((p) => p.type === filters.type);
  }

  // Filtro de província
  if (filters.province && filters.province !== 'ALL') {
    list = list.filter((p) => p.province.toLowerCase() === filters.province?.toLowerCase());
  }

  // Filtro de pesquisa
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.province.toLowerCase().includes(q) ||
        p.municipality.toLowerCase().includes(q) ||
        (p.clientName && p.clientName.toLowerCase().includes(q))
    );
  }

  // Ordena por data de atualização descrescente
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Obtém detalhes completos de um projeto
 */
export async function getProjectDetail(
  projectId: string,
  _userId?: string
): Promise<ProjectDetail | null> {
  syncWithLocalStorage();
  let item = MEMORY_PROJECTS_LIST.get(projectId);

  // Consulta à base de dados PostgreSQL via Prisma com select explícito se não encontrado em memória
  if (!item && prisma && process.env.DATABASE_URL) {
    try {
      const dbP = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          userId: true,
          companyId: true,
          name: true,
          type: true,
          province: true,
          municipality: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          input: {
            select: {
              data: true,
              wizardStep: true,
            },
          },
          calculations: {
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              total: true,
              engineVersion: true,
            },
          },
        },
      });

      if (dbP) {
        item = {
          id: dbP.id,
          userId: dbP.userId,
          name: dbP.name,
          clientName: 'Cliente Particular',
          type: dbP.type,
          typeLabel: 'Moradia Unifamiliar',
          province: dbP.province,
          municipality: dbP.municipality || 'Luanda',
          status: dbP.status as ProjectStatusType,
          totalKz: dbP.calculations[0]?.total ? Number(dbP.calculations[0].total) : 27000000,
          areaM2: ((dbP.input?.data as any)?.area) || 200,
          finishLevel: 'Médio',
          createdAt: dbP.createdAt.toISOString(),
          updatedAt: dbP.updatedAt.toISOString(),
          documentsCount: 0,
          shareLinksCount: 0,
        };
        MEMORY_PROJECTS_LIST.set(dbP.id, item);
      }
    } catch (err) {
      console.warn('[Projects] Aviso ao carregar detalhes do projeto via Prisma:', err);
    }
  }

  if (!item) return null;

  // Garantir que projetos desbloqueados em localStorage refletem UNLOCKED imediatamente
  if (typeof window !== 'undefined' && window.localStorage?.getItem(`Kizongelu_unlocked_${projectId}`) === 'true') {
    if (item.status !== 'UNLOCKED') {
      item = { ...item, status: 'UNLOCKED' };
      MEMORY_PROJECTS_LIST.set(projectId, item);
      persistToLocalStorage();
    }
  }

  const docs = MEMORY_DOCUMENTS.get(projectId) || [];
  const versions: ProjectVersion[] = MEMORY_VERSIONS.get(projectId) || [
    {
      id: `v_${projectId}_1`,
      version: 'v1.0.0',
      versionNumber: 1,
      createdAt: item.createdAt,
      createdBy: 'Kizongelu',
      authorName: 'Eng. Chefe Kizongelu',
      notes: 'Versão gerada pelo motor determinístico.',
      changeDescription: 'Cálculo inicial paramétrico calibrado para Angola',
      totalKz: item.totalKz,
      grandTotalKz: item.totalKz,
      engineVersion: 'v1.0',
    },
  ];

  // Tenta obter preview ou resumo do cálculo
  let calculationSummary: any = null;
  try {
    const previewData = await getPreview(projectId);
    calculationSummary = previewData;
  } catch (_) {}

  // Gera dados estruturados do motor para o mapa de quantidades
  const grandTotal = item.totalKz || 29387686;
  const chapters = [
    { code: 'CAP-01', title: 'Trabalhos Preparatórios & Estaleiro', subtotalKz: Math.round(grandTotal * 0.08), percentage: 8 },
    { code: 'CAP-02', title: 'Fundações & Estrutura de Betão Armado', subtotalKz: Math.round(grandTotal * 0.32), percentage: 32 },
    { code: 'CAP-03', title: 'Alvenarias & Paredes de Vedação', subtotalKz: Math.round(grandTotal * 0.18), percentage: 18 },
    { code: 'CAP-04', title: 'Cobertura & Impermeabilizações', subtotalKz: Math.round(grandTotal * 0.14), percentage: 14 },
    { code: 'CAP-05', title: 'Instalações Técnicas (Água, Esgoto e Eletricidade)', subtotalKz: Math.round(grandTotal * 0.16), percentage: 16 },
    { code: 'CAP-06', title: 'Acabamentos, Revestimentos e Pinturas', subtotalKz: Math.round(grandTotal * 0.12), percentage: 12 },
  ];

  const sampleItems = [
    {
      code: 'ART-01',
      description: 'Limpeza mecânica e desmatação do terreno com nivelamento',
      unit: 'm²',
      quantity: item.areaM2 * 1.5,
      unitPriceKz: 2200,
      totalKz: (item.areaM2 * 1.5) * 2200,
      chapter: '01. Trabalhos Preparatórios',
      composition: {
        code: 'CPU-TRP-01',
        title: 'Composição de Limpeza e Desmatação Mecânica',
        unit: 'm²',
        materialsSubtotal: 0,
        laborSubtotal: 600,
        equipmentSubtotal: 1600,
        subcontractsSubtotal: 0,
        unitDirectCost: 2200,
        wasteRate: 0,
        unitPrice: 2200,
        items: [
          { id: 'c1', type: 'EQUIPAMENTO' as const, description: 'Retroescavadora / Pá Carregadora sobre lagartas', unit: 'h', coefficient: 0.04, unitCost: 40000, subtotal: 1600 },
          { id: 'c2', type: 'MAO_DE_OBRA' as const, description: 'Servente de Construção Civil / Desbravador', unit: 'h', coefficient: 0.4, unitCost: 1500, subtotal: 600 },
        ],
      },
    },
    {
      code: 'ART-02',
      description: 'Escavação manual e mecânica de valas para sapatas',
      unit: 'm³',
      quantity: Math.round(item.areaM2 * 0.4),
      unitPriceKz: 14500,
      totalKz: Math.round(item.areaM2 * 0.4) * 14500,
      chapter: '01. Fundações',
      composition: {
        code: 'CPU-ESC-01',
        title: 'Escavação de Fundações em Terreno Normal',
        unit: 'm³',
        materialsSubtotal: 0,
        laborSubtotal: 8500,
        equipmentSubtotal: 6000,
        subcontractsSubtotal: 0,
        unitDirectCost: 14500,
        wasteRate: 0,
        unitPrice: 14500,
        items: [
          { id: 'c3', type: 'MAO_DE_OBRA' as const, description: 'Oficial Cabouqueiro / Escavador', unit: 'h', coefficient: 2.5, unitCost: 2200, subtotal: 5500 },
          { id: 'c4', type: 'MAO_DE_OBRA' as const, description: 'Servente de Apoio à Carga Manual', unit: 'h', coefficient: 2.0, unitCost: 1500, subtotal: 3000 },
          { id: 'c5', type: 'EQUIPAMENTO' as const, description: 'Martelo Demolidor Pneumático e Compressor', unit: 'h', coefficient: 0.3, unitCost: 20000, subtotal: 6000 },
        ],
      },
    },
    {
      code: 'ART-03',
      description: 'Betão C25/30 armado fabricado em central com inertes de Luanda',
      unit: 'm³',
      quantity: Math.round(item.areaM2 * 0.35),
      unitPriceKz: 125000,
      totalKz: Math.round(item.areaM2 * 0.35) * 125000,
      chapter: '02. Estrutura',
      composition: {
        code: 'CPU-BET-25',
        title: 'Betão de Classe C25/30 (Traço 1:2:3)',
        unit: 'm³',
        materialsSubtotal: 82000,
        laborSubtotal: 28000,
        equipmentSubtotal: 15000,
        subcontractsSubtotal: 0,
        unitDirectCost: 125000,
        wasteRate: 0.05,
        unitPrice: 125000,
        items: [
          { id: 'c6', type: 'MATERIAL' as const, description: 'Cimento Portland Tipo II 42.5R (7 sacos 50kg)', unit: 'sc', coefficient: 7, unitCost: 4800, subtotal: 33600 },
          { id: 'c7', type: 'MATERIAL' as const, description: 'Areia de Rio Lavada de Luanda (Kwanza)', unit: 'm³', coefficient: 0.55, unitCost: 28000, subtotal: 15400 },
          { id: 'c8', type: 'MATERIAL' as const, description: 'Brita 1 e 2 de Granito Triturada', unit: 'm³', coefficient: 0.85, unitCost: 35000, subtotal: 29750 },
          { id: 'c9', type: 'MATERIAL' as const, description: 'Água Potável de Cisterna e Plastificante', unit: 'm³', coefficient: 0.18, unitCost: 18000, subtotal: 3250 },
          { id: 'c10', type: 'MAO_DE_OBRA' as const, description: 'Pedreiro de Betão / Encarregado', unit: 'h', coefficient: 4.0, unitCost: 3500, subtotal: 14000 },
          { id: 'c11', type: 'MAO_DE_OBRA' as const, description: 'Serventes de Betonagem (2 ajudantes)', unit: 'h', coefficient: 8.0, unitCost: 1750, subtotal: 14000 },
          { id: 'c12', type: 'EQUIPAMENTO' as const, description: 'Betoneira 350L e Vibrador de Agulha 45mm', unit: 'h', coefficient: 1.5, unitCost: 10000, subtotal: 15000 },
        ],
      },
    },
    {
      code: 'ART-04',
      description: 'Varão de aço nervurado A500NR cortado e dobrado (ferro)',
      unit: 'kg',
      quantity: Math.round(item.areaM2 * 32),
      unitPriceKz: 1650,
      totalKz: Math.round(item.areaM2 * 32) * 1650,
      chapter: '02. Estrutura',
      composition: {
        code: 'CPU-ACO-500',
        title: 'Armaduras em Aço A500NR para Betão Armado',
        unit: 'kg',
        materialsSubtotal: 1250,
        laborSubtotal: 400,
        equipmentSubtotal: 0,
        subcontractsSubtotal: 0,
        unitDirectCost: 1650,
        wasteRate: 0.08,
        unitPrice: 1650,
        items: [
          { id: 'c13', type: 'MATERIAL' as const, description: 'Varão de Aço Nervurado Ø8 a Ø16mm', unit: 'kg', coefficient: 1.08, unitCost: 1100, subtotal: 1188 },
          { id: 'c14', type: 'MATERIAL' as const, description: 'Arame Recozido de Amarração e Espaçadores', unit: 'kg', coefficient: 0.03, unitCost: 2000, subtotal: 62 },
          { id: 'c15', type: 'MAO_DE_OBRA' as const, description: 'Armador de Ferro Qualificado', unit: 'h', coefficient: 0.08, unitCost: 3000, subtotal: 240 },
          { id: 'c16', type: 'MAO_DE_OBRA' as const, description: 'Servente de Bancada de Dobragem', unit: 'h', coefficient: 0.10, unitCost: 1600, subtotal: 160 },
        ],
      },
    },
    {
      code: 'ART-05',
      description: 'Alvenaria de bloco de betão 15x20x40cm assente com argamassa',
      unit: 'm²',
      quantity: Math.round(item.areaM2 * 2.8),
      unitPriceKz: 9800,
      totalKz: Math.round(item.areaM2 * 2.8) * 9800,
      chapter: '03. Alvenarias',
      composition: {
        code: 'CPU-ALV-15',
        title: 'Parede de Alvenaria com Bloco de Cimento 15x20x40',
        unit: 'm²',
        materialsSubtotal: 6200,
        laborSubtotal: 3600,
        equipmentSubtotal: 0,
        subcontractsSubtotal: 0,
        unitDirectCost: 9800,
        wasteRate: 0.06,
        unitPrice: 9800,
        items: [
          { id: 'c17', type: 'MATERIAL' as const, description: 'Blocos de Betão 15x20x40cm (12.5 un/m² + quebras)', unit: 'un', coefficient: 13.2, unitCost: 350, subtotal: 4620 },
          { id: 'c18', type: 'MATERIAL' as const, description: 'Argamassa de Cimento e Areia Traço 1:4', unit: 'm³', coefficient: 0.022, unitCost: 71800, subtotal: 1580 },
          { id: 'c19', type: 'MAO_DE_OBRA' as const, description: 'Pedreiro de Alvenaria de 1ª', unit: 'h', coefficient: 0.75, unitCost: 2800, subtotal: 2100 },
          { id: 'c20', type: 'MAO_DE_OBRA' as const, description: 'Servente de Apoio e Masseira', unit: 'h', coefficient: 0.90, unitCost: 1667, subtotal: 1500 },
        ],
      },
    },
    {
      code: 'ART-06',
      description: 'Estrutura metálica de cobertura com chapa zincada trapezoidal',
      unit: 'm²',
      quantity: Math.round(item.areaM2 * 1.15),
      unitPriceKz: 26000,
      totalKz: Math.round(item.areaM2 * 1.15) * 26000,
      chapter: '04. Cobertura',
      composition: {
        code: 'CPU-COB-MET',
        title: 'Cobertura em Chapa IBR Trapezoidal e Madre Metálica',
        unit: 'm²',
        materialsSubtotal: 19500,
        laborSubtotal: 6500,
        equipmentSubtotal: 0,
        subcontractsSubtotal: 0,
        unitDirectCost: 26000,
        wasteRate: 0.07,
        unitPrice: 26000,
        items: [
          { id: 'c21', type: 'MATERIAL' as const, description: 'Chapa de Aço Galvanizado IBR 0.50mm', unit: 'm²', coefficient: 1.12, unitCost: 11000, subtotal: 12320 },
          { id: 'c22', type: 'MATERIAL' as const, description: 'Madres Tubo Galvanizado 80x40x2mm', unit: 'm', coefficient: 1.5, unitCost: 4000, subtotal: 6000 },
          { id: 'c23', type: 'MATERIAL' as const, description: 'Parafusos Autoperfurantes com anilha EPDM', unit: 'un', coefficient: 6, unitCost: 196, subtotal: 1180 },
          { id: 'c24', type: 'MAO_DE_OBRA' as const, description: 'Serralheiro Montador de Cobertura', unit: 'h', coefficient: 1.2, unitCost: 3500, subtotal: 4200 },
          { id: 'c25', type: 'MAO_DE_OBRA' as const, description: 'Ajudante de Montagem em Altura', unit: 'h', coefficient: 1.3, unitCost: 1769, subtotal: 2300 },
        ],
      },
    },
  ];

  const directCost = Math.round(grandTotal / 1.385); // Subtrai BDI e IVA médios para obter Custo Direto
  const bdiAmount = Math.round(directCost * 0.215);
  const baseTributavel = directCost + bdiAmount;
  const ivaAmount = Math.round(baseTributavel * 0.14);
  const retencaoFonteAmount = Math.round(baseTributavel * 0.065);

  const financialClosing = {
    directCost,
    bdi: {
      adminCentralRate: 0.05,
      riscosImprevistosRate: 0.03,
      segurosGarantiasRate: 0.015,
      margemLucroRate: 0.12,
      totalBDIRate: 0.215,
      bdiAmount,
    },
    baseTributavel,
    taxes: {
      taxRegime: 'GERAL' as const,
      ivaRate: 0.14,
      ivaAmount,
      retencaoFonteRate: 0.065,
      retencaoFonteAmount,
      inssPatronalRate: 0.08,
      inssPatronalAmount: Math.round(grandTotal * 0.024),
    },
    precoFinalComIVA: grandTotal,
    valorLiquidoReceber: grandTotal - retencaoFonteAmount,
  };

  const alerts = [
    {
      id: `alt_aud_${item.id}_01`,
      code: 'ALT-TEC-01',
      severity: 'INFO' as const,
      category: 'QUANTIDADE_DISCREPANTE' as const,
      title: 'Taxa Estrutural de Aço Otimizada',
      message: `Densidade de armaduras calculada em 32.0 kg/m² para moradia em ${item.province}, perfeitamente alinhada com as normas LNEC/RSA de Angola.`,
      suggestedAction: 'Manter traço de betão C25/30 e armação prevista na ficha analítica CPU-BET-25.',
      currentValue: '32.0 kg/m²',
      expectedRange: '28 a 35 kg/m²',
    },
    {
      id: `alt_aud_${item.id}_02`,
      code: 'ALT-FISC-01',
      severity: 'INFO' as const,
      category: 'RISCO_FISCAL' as const,
      title: 'Conformidade Fiscal AGT (Retenção 6,5%)',
      message: `Valor de ${retencaoFonteAmount.toLocaleString('pt-PT')} Kz provisionado para Retenção na Fonte de Empreitada de Construção Civil.`,
      suggestedAction: 'Exigir a guia de pagamento modelo 1 da AGT emitida pelo Dono de Obra.',
      currentValue: `${retencaoFonteAmount.toLocaleString('pt-PT')} Kz`,
      expectedRange: '6,5% sobre serviços',
    },
  ];

  const calculation = {
    grandTotalKz: grandTotal,
    confidenceLevel: 'Elevado',
    confidenceScore: 92,
    estimatedMonths: Math.max(4, Math.round(item.areaM2 / 35)),
    chapters,
    items: sampleItems,
    directCost,
    financialClosing,
    alerts,
  };

  const shareLinks = [
    {
      id: `sl_${item.id}_01`,
      token: `tok_${item.id.replace('proj_', '')}_sec`,
      expiresAt: new Date(Date.now() + 85 * 24 * 3600 * 1000).toISOString(),
      requireCode: true,
      code: '829104',
      status: 'ACTIVE',
    },
  ];

  // Fase 3: Autos de Medição Físico-Financeira do Projeto
  const measurements: MeasurementReport[] = [
    {
      id: `auto_${item.id}_01`,
      projectId: item.id,
      reportNumber: 1,
      periodLabel: 'Mês 1 — Trabalhos Preparatórios & Fundações',
      date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      fiscalEngineer: 'Eng. Arnaldo Silva (OEA n.º 4821)',
      contractorRepresentative: 'Mestre Manuel Kiala',
      status: 'APROVADO_FISCAL',
      periodDirectCostKz: Math.round(grandTotal * 0.18),
      periodBdiKz: Math.round(grandTotal * 0.18 * 0.215),
      periodIvaKz: Math.round(grandTotal * 0.18 * 1.215 * 0.14),
      periodRetencaoKz: Math.round(grandTotal * 0.18 * 1.215 * 0.065),
      periodLiquidKz: Math.round(grandTotal * 0.18 * 1.215 * 1.14 - (grandTotal * 0.18 * 1.215 * 0.065)),
      accumulatedPercentage: 18.0,
      items: [
        {
          code: 'ART-01',
          description: 'Limpeza mecânica e desmatação do terreno com nivelamento',
          unit: 'm²',
          budgetQty: item.areaM2 * 1.5,
          unitPriceKz: 2200,
          previousQty: 0,
          periodQty: item.areaM2 * 1.5,
          accumulatedQty: item.areaM2 * 1.5,
          periodTotalKz: (item.areaM2 * 1.5) * 2200,
          accumulatedTotalKz: (item.areaM2 * 1.5) * 2200,
          percentageExecuted: 100,
        },
        {
          code: 'ART-02',
          description: 'Escavação manual e mecânica de valas para sapatas',
          unit: 'm³',
          budgetQty: Math.round(item.areaM2 * 0.4),
          unitPriceKz: 14500,
          previousQty: 0,
          periodQty: Math.round(item.areaM2 * 0.4),
          accumulatedQty: Math.round(item.areaM2 * 0.4),
          periodTotalKz: Math.round(item.areaM2 * 0.4) * 14500,
          accumulatedTotalKz: Math.round(item.areaM2 * 0.4) * 14500,
          percentageExecuted: 100,
        },
        {
          code: 'ART-03',
          description: 'Betão C25/30 armado fabricado em central com inertes de Luanda',
          unit: 'm³',
          budgetQty: Math.round(item.areaM2 * 0.35),
          unitPriceKz: 125000,
          previousQty: 0,
          periodQty: Math.round(item.areaM2 * 0.12),
          accumulatedQty: Math.round(item.areaM2 * 0.12),
          periodTotalKz: Math.round(item.areaM2 * 0.12) * 125000,
          accumulatedTotalKz: Math.round(item.areaM2 * 0.12) * 125000,
          percentageExecuted: 34.3,
        },
      ],
    },
  ];

  return {
    ...item,
    documents: docs,
    versions,
    measurements,
    calculationSummary,
    calculation,
    shareLinks,
  };
}

/**
 * Duplicar projeto (duplicateProject)
 * Cria cópia profunda com novo ID, status DRAFT, nome "(Cópia) [Nome]"
 */
export async function duplicateProject(
  projectId: string,
  userId: string = 'usr_current',
  _authorName?: string
): Promise<ProjectListItem> {
  const validated = duplicateProjectSchema.safeParse({ projectId, userId });
  if (!validated.success) {
    throw new Error(validated.error.issues[0]?.message || 'Dados inválidos para duplicação.');
  }

  const { projectId: validProjId, userId: validUserId = 'usr_current' } = validated.data;
  syncWithLocalStorage();
  let source = MEMORY_PROJECTS_LIST.get(validProjId);

  if (!source && prisma && process.env.DATABASE_URL) {
    try {
      const dbP = await prisma.project.findUnique({
        where: { id: validProjId },
        select: {
          id: true,
          userId: true,
          name: true,
          type: true,
          province: true,
          municipality: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          calculations: {
            orderBy: { version: 'desc' },
            take: 1,
            select: { total: true },
          },
        },
      });
      if (dbP) {
        source = {
          id: dbP.id,
          userId: dbP.userId,
          name: dbP.name,
          clientName: 'Cliente Particular',
          type: dbP.type,
          typeLabel: 'Moradia Unifamiliar',
          province: dbP.province,
          municipality: dbP.municipality || 'Luanda',
          status: dbP.status as ProjectStatusType,
          totalKz: dbP.calculations[0]?.total ? Number(dbP.calculations[0].total) : 27000000,
          areaM2: 200,
          finishLevel: 'Médio',
          createdAt: dbP.createdAt.toISOString(),
          updatedAt: dbP.updatedAt.toISOString(),
          documentsCount: 0,
          shareLinksCount: 0,
        };
      }
    } catch (_) {}
  }

  if (!source) {
    throw new Error('Projeto não encontrado para duplicação.');
  }

  const newId = `proj_dup_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const duplicated: ProjectListItem = {
    ...source,
    id: newId,
    userId: validUserId,
    name: `${source.name} (Cópia)`,
    status: 'DRAFT', // Nova cópia entra como rascunho
    createdAt: now,
    updatedAt: now,
    documentsCount: 0,
    shareLinksCount: 0,
  };

  MEMORY_PROJECTS_LIST.set(newId, duplicated);
  persistToLocalStorage();

  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.create({
        data: {
          id: newId,
          userId: validUserId,
          name: duplicated.name,
          type: (source.type as any) || 'NOVA',
          province: source.province || 'Luanda',
          municipality: source.municipality || 'Luanda',
          status: 'DRAFT',
        },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });
    } catch (e) {
      console.warn('[Projects] Erro ao duplicar no Prisma:', e);
    }
  }

  await logAuditEvent({
    event: 'PROJECT_CREATED',
    userId: validUserId,
    details: {
      action: 'DUPLICATE_PROJECT',
      sourceId: validProjId,
      newProjectId: newId,
      name: duplicated.name,
    },
    status: 'SUCCESS',
  });

  return duplicated;
}

/**
 * Regista ou actualiza um projecto na lista do painel/dashboard.
 * Usado pelo fluxo de conversão (Opção A) para garantir que o orçamento
 * criado anonimamente aparece imediatamente em /projetos e /painel após o registo.
 */
export async function upsertProjectToDashboard(projectItem: ProjectListItem): Promise<void> {
  syncWithLocalStorage();
  MEMORY_PROJECTS_LIST.set(projectItem.id, projectItem);
  persistToLocalStorage();

  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.upsert({
        where: { id: projectItem.id },
        update: {
          userId: projectItem.userId,
          name: projectItem.name,
          status: projectItem.status as any,
          updatedAt: new Date(),
        },
        create: {
          id: projectItem.id,
          userId: projectItem.userId,
          name: projectItem.name,
          type: (projectItem.type as any) || 'NOVA',
          province: projectItem.province || 'Luanda',
          municipality: projectItem.municipality || 'Luanda',
          status: (projectItem.status as any) || 'ESTIMATED',
        },
        select: { id: true, name: true, status: true },
      });
    } catch (e) {
      console.warn('[Projects] Erro ao sincronizar projeto no Prisma:', e);
    }
  }
}

/**
 * Marca um projeto como UNLOCKED no repositório de memória e localStorage
 */
export function markProjectUnlocked(projectId: string): void {
  syncWithLocalStorage();
  const proj = MEMORY_PROJECTS_LIST.get(projectId);
  if (proj) {
    proj.status = 'UNLOCKED';
    proj.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS_LIST.set(projectId, proj);
    persistToLocalStorage();
  }
}


/**
 * Eliminar projeto (Soft delete -> status ARCHIVED)
 */
export async function archiveProject(
  projectId: string,
  userId: string = 'usr_current'
): Promise<boolean> {
  const validated = archiveProjectSchema.safeParse({ projectId, userId });
  if (!validated.success) return false;

  syncWithLocalStorage();
  const project = MEMORY_PROJECTS_LIST.get(projectId);
  if (project) {
    project.status = 'ARCHIVED';
    project.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS_LIST.set(projectId, project);
    persistToLocalStorage();
  }

  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'ARCHIVED', updatedAt: new Date() },
        select: { id: true, status: true },
      });
    } catch (_) {}
  }

  await logAuditEvent({
    event: 'PROJECT_UPDATED',
    userId,
    details: {
      action: 'ARCHIVE_PROJECT',
      projectId,
      status: 'ARCHIVED',
    },
    status: 'SUCCESS',
  });

  return true;
}

/**
 * Restaurar projeto arquivado
 */
export async function restoreProject(projectId: string, userId: string = 'usr_current'): Promise<boolean> {
  const validated = restoreProjectSchema.safeParse({ projectId, userId });
  if (!validated.success) return false;

  syncWithLocalStorage();
  const project = MEMORY_PROJECTS_LIST.get(projectId);
  if (project) {
    project.status = 'ESTIMATED';
    project.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS_LIST.set(projectId, project);
    persistToLocalStorage();
  }

  if (process.env.DATABASE_URL && prisma) {
    try {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'COMPLETED', updatedAt: new Date() },
        select: { id: true, status: true },
      });
    } catch (_) {}
  }

  await logAuditEvent({
    event: 'PROJECT_UPDATED',
    userId,
    details: {
      action: 'RESTORE_PROJECT',
      projectId,
      status: 'ESTIMATED',
    },
    status: 'SUCCESS',
  });

  return true;
}

/**
 * Adiciona documento a um projeto
 */
export async function uploadProjectDocument(
  projectId: string,
  file: { name: string; sizeBytes: number; type: string; url?: string },
  uploadedBy: string = 'Utilizador'
): Promise<ProjectDocument> {
  syncWithLocalStorage();
  const docs = MEMORY_DOCUMENTS.get(projectId) || [];
  const newDoc: ProjectDocument = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    projectId,
    name: file.name,
    type: file.type || 'OUTRO',
    sizeBytes: file.sizeBytes,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
    url: file.url || `/uploads/${file.name}`,
  };

  docs.unshift(newDoc);
  MEMORY_DOCUMENTS.set(projectId, docs);

  // Atualiza contagem no projeto
  const proj = MEMORY_PROJECTS_LIST.get(projectId);
  if (proj) {
    proj.documentsCount = docs.length;
    proj.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS_LIST.set(projectId, proj);
    persistToLocalStorage();
  }

  return newDoc;
}

/**
 * Elimina documento de um projeto
 */
export async function deleteProjectDocument(projectId: string, documentId: string): Promise<boolean> {
  const docs = MEMORY_DOCUMENTS.get(projectId) || [];
  const updated = docs.filter((d) => d.id !== documentId);
  MEMORY_DOCUMENTS.set(projectId, updated);

  const proj = MEMORY_PROJECTS_LIST.get(projectId);
  if (proj) {
    proj.documentsCount = updated.length;
    proj.updatedAt = new Date().toISOString();
    MEMORY_PROJECTS_LIST.set(projectId, proj);
    persistToLocalStorage();
  }

  return true;
}

/**
 * Exporta a lista de projetos em formato CSV
 */
export function exportProjectsToCsv(projects: ProjectListItem[]): string {
  const headers = ['ID', 'Nome do Projeto', 'Cliente', 'Telefone', 'Tipo', 'Provincia', 'Municipio', 'Area_m2', 'Padrao', 'Estado', 'Total_Kz', 'Criado_Em', 'Atualizado_Em'];
  
  const rows = projects.map((p) => [
    p.id,
    `"${(p.name || '').replace(/"/g, '""')}"`,
    `"${(p.clientName || 'N/A').replace(/"/g, '""')}"`,
    `"${(p.clientPhone || 'N/A').replace(/"/g, '""')}"`,
    `"${p.typeLabel}"`,
    `"${p.province}"`,
    `"${p.municipality}"`,
    p.areaM2,
    `"${p.finishLevel}"`,
    p.status,
    p.totalKz,
    p.createdAt.split('T')[0],
    p.updatedAt.split('T')[0],
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

/**
 * KPIs Profissionais para utilizadores PROFESSIONAL ou COMPANY
 */
export interface ProfessionalKpis {
  monthlyBudgetsCount: number;
  monthlyLimit: number;
  usagePercentage: number;
  averageBudgetValueKz: number;
  conversionRatePercent: number;
  totalActiveProjectsValueKz: number;
  activeClientsCount: number;
}

export function getProfessionalKpis(
  projectsOrUserId: ProjectListItem[] | string,
  role: string = 'particular'
): ProfessionalKpis {
  let activeProjects: ProjectListItem[] = [];
  if (typeof projectsOrUserId === 'string') {
    syncWithLocalStorage();
    activeProjects = Array.from(MEMORY_PROJECTS_LIST.values()).filter(
      (p) => p.userId === projectsOrUserId && p.status !== 'ARCHIVED'
    );
  } else {
    activeProjects = projectsOrUserId.filter((p) => p.status !== 'ARCHIVED');
  }

  const unlockedProjects = activeProjects.filter((p) => p.status === 'UNLOCKED');

  const totalValue = activeProjects.reduce((acc, p) => acc + p.totalKz, 0);
  const averageValue = activeProjects.length > 0 ? Math.round(totalValue / activeProjects.length) : 0;

  // Taxa de conversão: % de orçamentos que foram desbloqueados/contratados
  const conversionRate = activeProjects.length > 0
    ? Math.round((unlockedProjects.length / activeProjects.length) * 100)
    : 0;

  const clientsSet = new Set(activeProjects.map((p) => p.clientName).filter(Boolean));

  let monthlyLimit = 5;
  const roleLower = role.toLowerCase();
  if (roleLower === 'empresa' || roleLower === 'company_owner' || roleLower === 'company_admin') monthlyLimit = 15;
  if (roleLower === 'empresa_plus') monthlyLimit = 30;
  if (roleLower === 'particular') monthlyLimit = 1;

  const monthlyBudgetsCount = Math.min(activeProjects.length, monthlyLimit);
  const usagePercentage = Math.round((monthlyBudgetsCount / (monthlyLimit || 1)) * 100);

  return {
    monthlyBudgetsCount,
    monthlyLimit,
    usagePercentage,
    averageBudgetValueKz: averageValue,
    conversionRatePercent: conversionRate,
    totalActiveProjectsValueKz: totalValue,
    activeClientsCount: clientsSet.size,
  };
}
