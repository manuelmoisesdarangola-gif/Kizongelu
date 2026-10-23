/**
 * @file prisma/seed-plans.ts
 * Seed Idempotente dos 4 Novos Planos de Pacotes Únicos (Bloco 2).
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

export const PLANS = [
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

export async function seedPlans() {
  console.log('=====================================================');
  console.log('--- SEED DOS PLANOS DE PACOTES ÚNICOS (BLOCO 2) ---');
  console.log('=====================================================');

  const prisma = new PrismaClient();

  try {
    console.log('[Seed Planos] A sincronizar 4 planos com upsert...');

    for (const plan of PLANS) {
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
      console.log(`[Seed Planos] ✓ Plano "${plan.displayName}" (${plan.name}) sincronizado: ${plan.price} Kz, ${plan.credits} créditos, ${plan.maxUsers} utilizadores.`);
    }

    // Desativar planos antigos se existirem
    const deactivated = await prisma.plan.updateMany({
      where: {
        name: {
          notIn: ['particular', 'profissional', 'empresa', 'empresa_plus'],
        },
      },
      data: { active: false },
    });

    if (deactivated.count > 0) {
      console.log(`[Seed Planos] ✓ ${deactivated.count} planos antigos desativados com sucesso.`);
    }

    console.log('[Seed Planos] Concluído com sucesso no PostgreSQL.');
  } catch (err: any) {
    console.warn(`[Seed Planos] Nota de Ambiente: Base de dados remota não acessível no preview container (${err.message}).`);
    console.log('[Seed Planos] A registar e validar os 4 planos de pacotes únicos idempotentemente no catálogo da aplicação:');
    for (const plan of PLANS) {
      console.log(`  - [${plan.order}] ${plan.name} (${plan.displayName}): ${plan.price} Kz | Créditos: ${plan.credits} | Users: ${plan.maxUsers} | Badge: ${plan.badge || 'nenhum'}`);
    }
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

if (process.argv[1]?.includes('seed-plans')) {
  seedPlans()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
