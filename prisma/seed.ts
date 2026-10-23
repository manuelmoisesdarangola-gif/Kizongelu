/**
 * @file prisma/seed.ts
 * Script de Seed Idempotente para Inicialização e Povoamento Integral do Kizongelu.
 * 
 * Popula:
 * 1. 4 Utilizadores com papéis distintos (Admin, Particular, Profissional, Empresa)
 * 2. 1 Empresa Exemplo ("Construções Kambas Lda") com membro de equipa
 * 3. 1 Projeto de exemplo para o utilizador Particular com inputs do Wizard
 * 4. 4 Planos Oficiais de Subscrição em Angola (Particular 27.000, Profissional 15.000, Empresa 35.000, Empresa Plus 60.000 Kz)
 * 5. 1 EngineVersion (v1.0 DRAFT / ACTIVE)
 * 6. 7 Fórmulas técnicas do motor de cálculo (1 por capítulo)
 * 7. Coeficientes padrão do motor (>40 coeficientes de engenharia para Angola)
 * 8. 66+ Materiais de construção e 528 Preços para as 8 Províncias com fatores logísticos
 */

import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  ProjectType,
  ProjectStatus,
  EngineVersionStatus,
} from '@prisma/client';
import { DEFAULT_ENGINE_COEFFICIENTS } from '../lib/calculation-engine/coefficients';
import { seedPrices } from './seed-prices';

const prisma = new PrismaClient();

// Hash bcrypt de 'Kizongelu2026!' e 'Admin2026!'
const DEFAULT_PASSWORD_HASH = '$2b$10$N0goxYiDzYG1.jLEjpzNluULsbiZrRqGprdcFdDQcdCPr1kmTU.Z2';
const ADMIN_PASSWORD_HASH = '$2b$10$Kp0wp9iwG3Clzbq3.7KVdONDdfB83/O9Oq927GgXKsKqvddRTx/32'; // Admin2026!

export async function main() {
  console.log('=====================================================');
  console.log('--- INICIANDO SEED INTEGRAL KIZONGELU (IDEMPOTENTE) ---');
  console.log('=====================================================');

  // -----------------------------------------------------------------
  // 1. UTILIZADORES DE TESTE (Admin, Particular, Profissional, Empresa)
  // -----------------------------------------------------------------
  console.log('[Seed] 1. A povoar utilizadores...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kizongelu.ao' },
    update: {
      name: 'Admin Kizongelu',
      phone: '+244 923 000 001',
      role: UserRole.ADMIN,
      passwordHash: ADMIN_PASSWORD_HASH,
    },
    create: {
      id: 'usr-admin-01',
      name: 'Admin Kizongelu',
      email: 'admin@kizongelu.ao',
      phone: '+244 923 000 001',
      role: UserRole.ADMIN,
      passwordHash: ADMIN_PASSWORD_HASH,
    },
  });

  const particularUser = await prisma.user.upsert({
    where: { email: 'particular@kizongelu.ao' },
    update: {
      name: 'João Manuel (Particular)',
      phone: '+244 923 111 222',
      role: UserRole.PARTICULAR,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    create: {
      id: 'usr-particular-01',
      name: 'João Manuel (Particular)',
      email: 'particular@kizongelu.ao',
      phone: '+244 923 111 222',
      role: UserRole.PARTICULAR,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
  });

  const profissionalUser = await prisma.user.upsert({
    where: { email: 'engenheiro@kizongelu.ao' },
    update: {
      name: 'Eng. Mateus Silva (Profissional)',
      phone: '+244 923 333 444',
      role: UserRole.PROFESSIONAL,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    create: {
      id: 'usr-prof-01',
      name: 'Eng. Mateus Silva (Profissional)',
      email: 'engenheiro@kizongelu.ao',
      phone: '+244 923 333 444',
      role: UserRole.PROFESSIONAL,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
  });

  const empresaUser = await prisma.user.upsert({
    where: { email: 'empresa@kizongelu.ao' },
    update: {
      name: 'Dr. António Kamba (Construções Kambas)',
      phone: '+244 923 555 666',
      role: UserRole.COMPANY_OWNER,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
    create: {
      id: 'usr-empresa-01',
      name: 'Dr. António Kamba (Construções Kambas)',
      email: 'empresa@kizongelu.ao',
      phone: '+244 923 555 666',
      role: UserRole.COMPANY_OWNER,
      passwordHash: DEFAULT_PASSWORD_HASH,
    },
  });

  console.log(`[Seed] 4 Utilizadores sincronizados com sucesso:
    - Admin: ${adminUser.email}
    - Particular: ${particularUser.email}
    - Profissional: ${profissionalUser.email}
    - Empresa: ${empresaUser.email}`);

  // -----------------------------------------------------------------
  // 2. EMPRESA E MEMBROS DE EQUIPA
  // -----------------------------------------------------------------
  console.log('[Seed] 2. A povoar Empresa e Associação de Membros...');

  let company = await prisma.company.findFirst({
    where: { ownerId: empresaUser.id },
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        id: 'comp-kambas-01',
        name: 'Construções Kambas Lda',
        nif: '5001298450',
        province: 'Luanda',
        ownerId: empresaUser.id,
      },
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: 'Construções Kambas Lda',
        nif: '5001298450',
        province: 'Luanda',
      },
    });
  }

  // Vincular engenheiro como membro da empresa
  await prisma.companyMember.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: profissionalUser.id,
      },
    },
    update: {
      role: UserRole.COMPANY_MEMBER,
    },
    create: {
      companyId: company.id,
      userId: profissionalUser.id,
      role: UserRole.COMPANY_MEMBER,
    },
  });

  console.log(`[Seed] Empresa criada: "${company.name}" com membro "${profissionalUser.name}".`);

  // -----------------------------------------------------------------
  // 3. PROJETO DE TESTE PARA UTILIZADOR PARTICULAR
  // -----------------------------------------------------------------
  console.log('[Seed] 3. A povoar Projeto de Teste...');

  let testProject = await prisma.project.findFirst({
    where: { userId: particularUser.id, name: 'Moradia T3 Familiar no Talatona' },
  });

  const projectInputData = {
    type: 'NOVA',
    province: 'Luanda',
    municipality: 'Talatona',
    area: 200,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: true,
    hasBalcony: true,
    hasAnnex: false,
    foundation: 'sapata_isolada',
    structure: 'betao_armado',
    roof: 'chapa',
    finishLevel: 'medio',
    electrical: 'intermedia',
    plumbing: 'intermedia',
    budget: 15000000,
  };

  if (!testProject) {
    testProject = await prisma.project.create({
      data: {
        id: 'proj-particular-01',
        userId: particularUser.id,
        name: 'Moradia T3 Familiar no Talatona',
        type: ProjectType.NOVA,
        province: 'Luanda',
        municipality: 'Talatona',
        status: ProjectStatus.COMPLETED,
        input: {
          create: {
            data: projectInputData,
            wizardStep: 7,
            completedAt: new Date(),
          },
        },
      },
    });
  } else {
    await prisma.projectInput.upsert({
      where: { projectId: testProject.id },
      update: {
        data: projectInputData,
        wizardStep: 7,
        completedAt: new Date(),
      },
      create: {
        projectId: testProject.id,
        data: projectInputData,
        wizardStep: 7,
        completedAt: new Date(),
      },
    });
  }

  console.log(`[Seed] Projeto de Teste criado: "${testProject.name}" (ID: ${testProject.id})`);

  // -----------------------------------------------------------------
  // 4. 4 PLANOS SAAS OFICIAIS (PACOTES ÚNICOS: Particular 12.999, Profissional 15.999, Empresa 29.999, Empresa Plus 49.999 Kz)
  // -----------------------------------------------------------------
  console.log('[Seed] 4. A povoar Planos SaaS (Pacotes Únicos)...');

  const plans = [
    {
      name: 'particular',
      displayName: 'Particular',
      price: 12999,
      credits: 1,
      maxUsers: 1,
      order: 1,
      badge: null,
      active: true,
      features: {
        orcamentos: 1,
        utilizadores: 1,
        pdfQR: true,
        acessoPermanente: true,
      },
    },
    {
      name: 'profissional',
      displayName: 'Profissional',
      price: 15999,
      credits: 3,
      maxUsers: 1,
      order: 2,
      badge: null,
      active: true,
      features: {
        orcamentos: 3,
        utilizadores: 1,
        pdfQR: true,
        suporteWhatsApp: true,
      },
    },
    {
      name: 'empresa',
      displayName: 'Empresa',
      price: 29999,
      credits: 6,
      maxUsers: 2,
      order: 3,
      badge: 'recommended',
      active: true,
      features: {
        orcamentos: 6,
        utilizadores: 2,
        pdfQR: true,
        logotipo: true,
        configMargens: true,
        exportacaoExcel: true,
      },
    },
    {
      name: 'empresa_plus',
      displayName: 'Empresa Plus',
      price: 49999,
      credits: 12,
      maxUsers: 5,
      order: 4,
      badge: 'best_value',
      active: true,
      features: {
        orcamentos: 12,
        utilizadores: 5,
        pdfQR: true,
        logotipo: true,
        configMargens: true,
        exportacaoExcel: true,
        dossieCredito: true,
        gestorEngenheiro: true,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        price: plan.price,
        credits: plan.credits,
        maxUsers: plan.maxUsers,
        order: plan.order,
        badge: plan.badge,
        active: plan.active,
        features: plan.features,
      },
      create: plan,
    });
  }

  // Desativar planos antigos se existirem
  await prisma.plan.updateMany({
    where: {
      name: {
        notIn: ['particular', 'profissional', 'empresa', 'empresa_plus'],
      },
    },
    data: { active: false },
  });

  console.log('[Seed] 4 Planos de Pacotes Únicos sincronizados com sucesso.');

  // -----------------------------------------------------------------
  // 5. ENGINEVERSION v1.0
  // -----------------------------------------------------------------
  console.log('[Seed] 5. A povoar EngineVersion...');

  const engineVersion = await prisma.engineVersion.upsert({
    where: { version: 'v1.0' },
    update: {
      status: EngineVersionStatus.ACTIVE,
      reason: 'Versão oficial do Motor de Cálculo Determinístico com coeficientes para Angola',
    },
    create: {
      version: 'v1.0',
      status: EngineVersionStatus.ACTIVE,
      createdBy: adminUser.id,
      reason: 'Versão oficial do Motor de Cálculo Determinístico com coeficientes para Angola',
    },
  });
  console.log(`[Seed] EngineVersion ativa: ${engineVersion.version} (${engineVersion.status})`);

  // -----------------------------------------------------------------
  // 6. FÓRMULAS TÉCNICAS DOS 7 CAPÍTULOS
  // -----------------------------------------------------------------
  console.log('[Seed] 6. A povoar Fórmulas dos 7 Capítulos de Obra...');

  const formulasData = [
    {
      code: 'FORM_01_FUNDACOES',
      category: '01. Fundações',
      expression: 'area * 0.15 * 350',
      readable: 'Volume de betão da fundação (Área de implantação × espessura média 15cm) × dosagem de cimento (350 kg/m³)',
    },
    {
      code: 'FORM_02_ESTRUTURA',
      category: '02. Estrutura',
      expression: 'area * 0.12 * 100',
      readable: 'Volume de elementos verticais e lajes (Área × 0.12 m³/m²) × taxa de armadura de aço (100 kg/m³)',
    },
    {
      code: 'FORM_03_ALVENARIA',
      category: '03. Alvenaria',
      expression: '(area * 0.8 * 2.8) / 0.08 * 1.05',
      readable: 'Paredes estimadas (Área × 0.8 linear × 2.8m pé-direito) ÷ 0.08m² por bloco × 1.05 (5% quebra)',
    },
    {
      code: 'FORM_04_COBERTURA',
      category: '04. Cobertura',
      expression: 'area * 1.10',
      readable: 'Área coberta calculada com fator de inclinação e sobreposição de chapas/telhas (10%)',
    },
    {
      code: 'FORM_05_INSTALACOES',
      category: '05. Instalações',
      expression: 'area * 12.0 + wcs * 2.0',
      readable: 'Metros lineares de condutores e pontos elétricos/hidráulicos dimensionados por área e WCs',
    },
    {
      code: 'FORM_06_ACABAMENTOS',
      category: '06. Acabamentos',
      expression: 'area * 1.07 * 5.0',
      readable: 'Área de assentamento cerâmico com 7% desperdício e 5 kg/m² de cimento cola flexível',
    },
    {
      code: 'FORM_07_MAODEOBRA',
      category: '07. Mão de Obra e Logística',
      expression: 'materiaisDirectos * 0.35',
      readable: 'Taxa média ponderada de 35% de mão de obra direta para construção civil em Angola',
    },
  ];

  for (const f of formulasData) {
    const existing = await prisma.formula.findFirst({
      where: {
        engineVersionId: engineVersion.id,
        code: f.code,
      },
    });

    if (existing) {
      await prisma.formula.update({
        where: { id: existing.id },
        data: {
          category: f.category,
          expression: f.expression,
          readable: f.readable,
        },
      });
    } else {
      await prisma.formula.create({
        data: {
          engineVersionId: engineVersion.id,
          code: f.code,
          category: f.category,
          expression: f.expression,
          readable: f.readable,
        },
      });
    }
  }
  console.log(`[Seed] ${formulasData.length} Fórmulas de cálculo dos 7 capítulos sincronizadas.`);

  // -----------------------------------------------------------------
  // 7. COEFICIENTES TÉCNICOS PADRÃO DO MOTOR (>40 COEFICIENTES)
  // -----------------------------------------------------------------
  console.log(`[Seed] 7. A povoar ${DEFAULT_ENGINE_COEFFICIENTS.length} Coeficientes técnicos padrão...`);

  for (const coef of DEFAULT_ENGINE_COEFFICIENTS) {
    const existing = await prisma.coefficient.findFirst({
      where: {
        engineVersionId: engineVersion.id,
        code: coef.code,
      },
    });

    if (existing) {
      await prisma.coefficient.update({
        where: { id: existing.id },
        data: {
          value: coef.value,
          unit: coef.unit,
        },
      });
    } else {
      await prisma.coefficient.create({
        data: {
          engineVersionId: engineVersion.id,
          code: coef.code,
          value: coef.value,
          unit: coef.unit,
        },
      });
    }
  }
  console.log(`[Seed] ${DEFAULT_ENGINE_COEFFICIENTS.length} Coeficientes técnicos inseridos/atualizados.`);

  // -----------------------------------------------------------------
  // 8. MATERIAIS (66+) E PREÇOS (528) DAS 8 PROVÍNCIAS
  // -----------------------------------------------------------------
  console.log('[Seed] 8. A sincronizar 66+ materiais e 528 preços das 8 províncias com fatores logísticos...');
  const pricesSummary = await seedPrices();
  console.log(`[Seed] Base de preços concluída: ${pricesSummary.totalMaterials} materiais com preços provinciais.`);

  console.log('=====================================================');
  console.log('--- SEED CONCLUÍDO COM SUCESSO E 100% IDEMPOTENTE ---');
  console.log('=====================================================');
}

main()
  .catch((e) => {
    console.error('[Seed Erro]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
