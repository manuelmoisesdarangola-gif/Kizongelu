/**
 * @file prisma/seed-prices.ts
 * Seed completo de materiais e base de preços para Angola (Amostragem 2025).
 * - 66 materiais abrangendo todas as categorias exigidas
 * - Preços base para Luanda em Kwanzas (Kz)
 * - Cobertura de 8 províncias com factores de ponderação logística:
 *   • Luanda (Base: 1.00)
 *   • Benguela (+5%: 1.05)
 *   • Huíla (+8%: 1.08)
 *   • Huambo (+10%: 1.10)
 *   • Malanje (+12%: 1.12)
 *   • Cabinda (+18%: 1.18)
 *   • Lunda Norte (+22%: 1.22)
 *   • Lunda Sul (+25%: 1.25)
 */

import { MaterialCategory } from '@prisma/client';
import { prisma } from '../lib/db/prisma';

export interface BaseMaterialSeed {
  code: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  basePriceLuanda: number; // Kz
  description?: string;
}

export const PROVINCE_FACTORS: Record<string, { factor: number; note: string }> = {
  'Luanda': { factor: 1.00, note: 'Capital e Porto de Luanda (Referência: 1.00)' },
  'Benguela': { factor: 1.08, note: 'Porto do Lobito / Transporte Costeiro (+8%)' },
  'Cuanza Sul': { factor: 1.11, note: 'Sumbe / Porto Amboim (+11%)' },
  'Huíla': { factor: 1.18, note: 'Lubango / Interior Sul (+18%)' },
  'Huambo': { factor: 1.15, note: 'Planalto Central (+15%)' },
  'Malanje': { factor: 1.20, note: 'Corredor Norte / Leste (+20%)' },
  'Cabinda': { factor: 1.29, note: 'Enclave Marítimo / Desembaraço Alfandegário (+29%)' },
  'Lunda Norte': { factor: 1.35, note: 'Dundo / Rota Leste (+35%)' },
  'Lunda Sul': { factor: 1.33, note: 'Saurimo / Logística Leste (+33%)' },
  'Moxico': { factor: 1.38, note: 'Luena / Corredor Ferroviário Leste (+38%)' },
  'Outras': { factor: 1.15, note: 'Demais províncias de Angola (+15%)' },
};

export const SEED_MATERIALS: BaseMaterialSeed[] = [
  // 1. Cimento
  { code: 'CIM-001', name: 'Cimento Portland Tipo I 42,5R 50 kg', category: MaterialCategory.CIMENTO, unit: 'saco', basePriceLuanda: 6500 },
  { code: 'CIM-002', name: 'Cimento Portland Comum 32,5N 25 kg', category: MaterialCategory.CIMENTO, unit: 'saco', basePriceLuanda: 3600 },
  { code: 'CIM-003', name: 'Cimento Branco Estrutural 25 kg', category: MaterialCategory.CIMENTO, unit: 'saco', basePriceLuanda: 8500 },
  { code: 'CIM-004', name: 'Cimento Cola Flexível C2TE 25 kg', category: MaterialCategory.CIMENTO, unit: 'saco', basePriceLuanda: 4200 },

  // 2. Areia
  { code: 'ARE-001', name: 'Areia Média Lavada de Rio (Kwanza/Bengo)', category: MaterialCategory.AREIA, unit: 'm³', basePriceLuanda: 18000 },
  { code: 'ARE-002', name: 'Areia Grossa Britada para Betão', category: MaterialCategory.AREIA, unit: 'm³', basePriceLuanda: 21000 },
  { code: 'ARE-003', name: 'Areia Fina Peneirada para Reboco', category: MaterialCategory.AREIA, unit: 'm³', basePriceLuanda: 19500 },
  { code: 'ARE-004', name: 'Saibro Seleccionado para Aterro e Compactação', category: MaterialCategory.AREIA, unit: 'm³', basePriceLuanda: 9500 },

  // 3. Brita
  { code: 'BRI-001', name: 'Brita de Granito n.º 1 (9,5 mm a 19 mm)', category: MaterialCategory.BRITA, unit: 'm³', basePriceLuanda: 24500 },
  { code: 'BRI-002', name: 'Brita de Granito n.º 2 (19 mm a 25 mm)', category: MaterialCategory.BRITA, unit: 'm³', basePriceLuanda: 26000 },
  { code: 'BRI-003', name: 'Pó de Pedra Granítico Lavado', category: MaterialCategory.BRITA, unit: 'm³', basePriceLuanda: 16500 },
  { code: 'BRI-004', name: 'Tout-Venant 0-31,5 mm para Base de Pavimentos', category: MaterialCategory.BRITA, unit: 'm³', basePriceLuanda: 14000 },

  // 4. Blocos
  { code: 'BLO-001', name: 'Bloco de Betão Normal 20 × 20 × 40 cm', category: MaterialCategory.BLOCOS, unit: 'un', basePriceLuanda: 320 },
  { code: 'BLO-002', name: 'Bloco de Betão Normal 15 × 20 × 40 cm', category: MaterialCategory.BLOCOS, unit: 'un', basePriceLuanda: 260 },
  { code: 'BLO-003', name: 'Bloco de Betão Normal 10 × 20 × 40 cm', category: MaterialCategory.BLOCOS, unit: 'un', basePriceLuanda: 210 },
  { code: 'BLO-004', name: 'Abobadilha de Betão 20 × 40 cm para Lajes Aligeiradas', category: MaterialCategory.BLOCOS, unit: 'un', basePriceLuanda: 450 },
  { code: 'BLO-005', name: 'Tijolo Maciço Cerâmico Vermelho', category: MaterialCategory.BLOCOS, unit: 'un', basePriceLuanda: 180 },

  // 5. Aço
  { code: 'ACO-001', name: 'Varão de Aço Nervurado A400 NR Ø6 mm', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1450 },
  { code: 'ACO-002', name: 'Varão de Aço Nervurado A400 NR Ø8 mm', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1400 },
  { code: 'ACO-003', name: 'Varão de Aço Nervurado A400 NR Ø10 mm', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1350 },
  { code: 'ACO-004', name: 'Varão de Aço Nervurado A400 NR Ø12 mm', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1350 },
  { code: 'ACO-005', name: 'Varão de Aço Nervurado A400 NR Ø16 mm', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1380 },
  { code: 'ACO-006', name: 'Malha Electrosoldada Malhasol CQ-38 (2,4 × 5 m)', category: MaterialCategory.ACO, unit: 'un', basePriceLuanda: 32000 },
  { code: 'ACO-007', name: 'Arame Recozido Queimado para Amarração', category: MaterialCategory.ACO, unit: 'kg', basePriceLuanda: 1800 },

  // 6. Madeira
  { code: 'MAD-001', name: 'Tábua de Madeira de Pinho 2,5 × 15 cm × 4 m (Cofragem)', category: MaterialCategory.MADEIRA, unit: 'un', basePriceLuanda: 4800 },
  { code: 'MAD-002', name: 'Sarrafo de Madeira 5 × 5 cm × 4 m', category: MaterialCategory.MADEIRA, unit: 'un', basePriceLuanda: 2600 },
  { code: 'MAD-003', name: 'Barrote de Madeira 7 × 7 cm × 4 m para Vigamento', category: MaterialCategory.MADEIRA, unit: 'un', basePriceLuanda: 5500 },
  { code: 'MAD-004', name: 'Placa de Contraplacado Marítimo Filmado 18 mm 2,44 × 1,22 m', category: MaterialCategory.MADEIRA, unit: 'un', basePriceLuanda: 28000 },
  { code: 'MAD-005', name: 'Pontalete Roliço de Eucalipto 3 m (Escoramento)', category: MaterialCategory.MADEIRA, unit: 'un', basePriceLuanda: 1700 },

  // 7. Cobertura
  { code: 'CKZ-001', name: 'Chapa de Aço Zincada Ondulada 0,40 mm × 3 m', category: MaterialCategory.COBERTURA, unit: 'un', basePriceLuanda: 7800 },
  { code: 'CKZ-002', name: 'Chapa Pré-Pintada Trapezoidal 0,50 mm × 4 m', category: MaterialCategory.COBERTURA, unit: 'un', basePriceLuanda: 16500 },
  { code: 'CKZ-003', name: 'Telha Cerâmica Vermelha Tipo Lusa', category: MaterialCategory.COBERTURA, unit: 'un', basePriceLuanda: 520 },
  { code: 'CKZ-004', name: 'Telha de Betão Coppo Venetto Pigmentada', category: MaterialCategory.COBERTURA, unit: 'un', basePriceLuanda: 680 },
  { code: 'CKZ-005', name: 'Cumeeira Cerâmica de Encaixe', category: MaterialCategory.COBERTURA, unit: 'un', basePriceLuanda: 1200 },
  { code: 'CKZ-006', name: 'Parafuso Auto-Broquante c/ Vedante EPDM (Cento)', category: MaterialCategory.COBERTURA, unit: 'cento', basePriceLuanda: 6500 },

  // 8. Cerâmica
  { code: 'CER-001', name: 'Mosaico Cerâmico Pavimento Interior 40 × 40 cm', category: MaterialCategory.CERAMICA, unit: 'm²', basePriceLuanda: 7200 },
  { code: 'CER-002', name: 'Mosaico Cerâmico Pavimento Interior 60 × 60 cm', category: MaterialCategory.CERAMICA, unit: 'm²', basePriceLuanda: 9800 },
  { code: 'CER-003', name: 'Porcelanato Polido e Rectificado 60 × 120 cm', category: MaterialCategory.CERAMICA, unit: 'm²', basePriceLuanda: 18500 },
  { code: 'CER-004', name: 'Azulejo de Parede Esmaltado 30 × 60 cm', category: MaterialCategory.CERAMICA, unit: 'm²', basePriceLuanda: 6800 },
  { code: 'CER-005', name: 'Rodapé Cerâmico Biselado 8 × 60 cm', category: MaterialCategory.CERAMICA, unit: 'ml', basePriceLuanda: 1250 },
  { code: 'CER-006', name: 'Argamassa de Juntas / Betume Impermeável 5 kg', category: MaterialCategory.CERAMICA, unit: 'un', basePriceLuanda: 3100 },

  // 9. Tinta
  { code: 'TIN-001', name: 'Tinta Plástica Mate Lavável Interior (Balde 15 L)', category: MaterialCategory.TINTA, unit: 'balde', basePriceLuanda: 29500 },
  { code: 'TIN-002', name: 'Tinta Acrílica 100% Exterior Anti-Fungos (Balde 15 L)', category: MaterialCategory.TINTA, unit: 'balde', basePriceLuanda: 44000 },
  { code: 'TIN-003', name: 'Primário Aquoso Acrílico Selante (Lata 5 L)', category: MaterialCategory.TINTA, unit: 'lata', basePriceLuanda: 14200 },
  { code: 'TIN-004', name: 'Verniz Poliuretano Marítimo Brilhante (Galão 4 L)', category: MaterialCategory.TINTA, unit: 'lata', basePriceLuanda: 19800 },
  { code: 'TIN-005', name: 'Massa de Acabamento em Pasta 20 kg', category: MaterialCategory.TINTA, unit: 'un', basePriceLuanda: 16000 },

  // 10. Tubos
  { code: 'TUB-001', name: 'Tubo de Esgoto Sanitário PVC Ø32 mm barra 3 m', category: MaterialCategory.TUBOS, unit: 'barra', basePriceLuanda: 2100 },
  { code: 'TUB-002', name: 'Tubo de Esgoto Sanitário PVC Ø50 mm barra 3 m', category: MaterialCategory.TUBOS, unit: 'barra', basePriceLuanda: 3400 },
  { code: 'TUB-003', name: 'Tubo de Queda e Esgoto PVC Ø100 mm barra 3 m', category: MaterialCategory.TUBOS, unit: 'barra', basePriceLuanda: 6900 },
  { code: 'TUB-004', name: 'Tubo de Água Pressão PPR Ø20 mm barra 4 m', category: MaterialCategory.TUBOS, unit: 'barra', basePriceLuanda: 2800 },
  { code: 'TUB-005', name: 'Tubo de Água Pressão PPR Ø25 mm barra 4 m', category: MaterialCategory.TUBOS, unit: 'barra', basePriceLuanda: 3900 },
  { code: 'TUB-006', name: 'Tubo Dreno Corrugado Perfurado Ø110 mm Rolo 50 m', category: MaterialCategory.TUBOS, unit: 'rolo', basePriceLuanda: 68000 },

  // 11. Cabos
  { code: 'CAB-001', name: 'Cabo Elétrico Flexível H07V-K 1,5 mm² (Rolo 100 m)', category: MaterialCategory.CABOS, unit: 'rolo', basePriceLuanda: 18500 },
  { code: 'CAB-002', name: 'Cabo Elétrico Flexível H07V-K 2,5 mm² (Rolo 100 m)', category: MaterialCategory.CABOS, unit: 'rolo', basePriceLuanda: 29000 },
  { code: 'CAB-003', name: 'Cabo Elétrico Flexível H07V-K 4,0 mm² (Rolo 100 m)', category: MaterialCategory.CABOS, unit: 'rolo', basePriceLuanda: 46000 },
  { code: 'CAB-004', name: 'Cabo Elétrico Flexível H07V-K 6,0 mm² (Rolo 100 m)', category: MaterialCategory.CABOS, unit: 'rolo', basePriceLuanda: 68500 },
  { code: 'CAB-005', name: 'Tubo Corrugado Espiralado VD Ø20 mm (Rolo 100 m)', category: MaterialCategory.CABOS, unit: 'rolo', basePriceLuanda: 12000 },

  // 12. Equipamentos
  { code: 'EQU-001', name: 'Aluguer de Betoneira de Obra 350 L (Gasolina/Eléctrica)', category: MaterialCategory.EQUIPAMENTOS, unit: 'dia', basePriceLuanda: 18000 },
  { code: 'EQU-002', name: 'Aluguer de Gerador Trifásico Diesel 15 kVA', category: MaterialCategory.EQUIPAMENTOS, unit: 'dia', basePriceLuanda: 28000 },
  { code: 'EQU-003', name: 'Aluguer de Andaime Tubular Metálico (Módulo Completo)', category: MaterialCategory.EQUIPAMENTOS, unit: 'dia', basePriceLuanda: 2200 },
  { code: 'EQU-004', name: 'Aluguer de Compactador Saltitão (Sapo mecânico)', category: MaterialCategory.EQUIPAMENTOS, unit: 'dia', basePriceLuanda: 14500 },
  { code: 'EQU-005', name: 'Aluguer de Vibrador de Agulha Ø45 mm para Betão', category: MaterialCategory.EQUIPAMENTOS, unit: 'dia', basePriceLuanda: 9000 },

  // 13. Mão de Obra
  { code: 'MOD-001', name: 'Pedreiro de 1ª Categoria de Alvenaria e Estrutura', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 12500 },
  { code: 'MOD-002', name: 'Servente / Ajudante de Construção Civil', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 6500 },
  { code: 'MOD-003', name: 'Carpinteiro Especialista em Cofragem e Lajes', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 13000 },
  { code: 'MOD-004', name: 'Electricista Instalador de Redes e Quadros BT', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 15000 },
  { code: 'MOD-005', name: 'Canalizador / Instalador de Redes Hidrossanitárias', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 14000 },
  { code: 'MOD-006', name: 'Pintor Especializado em Aplicação de Massa e Acabamentos', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 11500 },
  { code: 'MOD-007', name: 'Serralheiro de Estruturas e Caixilharia', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 14500 },
  { code: 'MOD-008', name: 'Operador de Máquinas e Equipamentos Pesados', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 17000 },
  { code: 'MOD-009', name: 'Armador de Ferro / Ferreiro de Estruturas', category: MaterialCategory.MAO_OBRA, unit: 'dia', basePriceLuanda: 13500 },

  // 14. Transporte
  { code: 'TRA-001', name: 'Transporte Rodoviário de Inertes por m³ (Raio até 15km)', category: MaterialCategory.TRANSPORTE, unit: 'm³', basePriceLuanda: 2500 },
  { code: 'TRA-002', name: 'Transporte Rodoviário Carga Geral por Tonelada', category: MaterialCategory.TRANSPORTE, unit: 'ton', basePriceLuanda: 8000 },
  { code: 'TRA-003', name: 'Frete de Camião Basculante 16m³ por Quilómetro', category: MaterialCategory.TRANSPORTE, unit: 'km', basePriceLuanda: 1850 },
  { code: 'TRA-004', name: 'Custo Fixo de Carga/Descarga e Manuseamento por Viagem', category: MaterialCategory.TRANSPORTE, unit: 'viagem', basePriceLuanda: 15000 },
  { code: 'TRA-005', name: 'Frete de Carrinha Urbana Ligeira Canter (Viagem)', category: MaterialCategory.TRANSPORTE, unit: 'viagem', basePriceLuanda: 25000 },
];

/**
 * Função principal de execução do seed de materiais e base de preços provincial.
 */
export async function seedPrices() {
  console.log(`[SeedPrices] A iniciar povoamento de ${SEED_MATERIALS.length} materiais e 8 províncias...`);

  let materialsCount = 0;
  let pricesCount = 0;

  for (const mat of SEED_MATERIALS) {
    // 1. Garante a criação ou existência do Material
    let materialRecord = await prisma.material.findUnique({
      where: { code: mat.code },
    });

    if (!materialRecord) {
      materialRecord = await prisma.material.create({
        data: {
          code: mat.code,
          name: mat.name,
          category: mat.category,
          unit: mat.unit,
          active: true,
        },
      });
      materialsCount++;
    } else {
      materialRecord = await prisma.material.update({
        where: { id: materialRecord.id },
        data: {
          name: mat.name,
          category: mat.category,
          unit: mat.unit,
          active: true,
        },
      });
    }

    // 2. Cria ou atualiza preços para cada uma das 8 províncias
    for (const [provinceName, { factor, note }] of Object.entries(PROVINCE_FACTORS)) {
      // Arredonda para centenas inteiras de Kz para clareza comercial
      const adjustedPrice = Math.round(mat.basePriceLuanda * factor);

      const existingPrice = await prisma.price.findFirst({
        where: {
          materialId: materialRecord.id,
          province: provinceName,
        },
      });

      if (!existingPrice) {
        await prisma.price.create({
          data: {
            materialId: materialRecord.id,
            province: provinceName,
            municipality: null,
            price: adjustedPrice,
            source: `Amostragem 2025 (${note})`,
            validFrom: new Date('2025-01-01T00:00:00.000Z'),
            active: true,
            createdBy: 'usr-admin-01',
          },
        });
        pricesCount++;
      } else {
        await prisma.price.update({
          where: { id: existingPrice.id },
          data: {
            price: adjustedPrice,
            active: true,
            source: `Amostragem 2025 (${note})`,
          },
        });
      }
    }
  }

  // 3. Povoa a tabela ProvinceFactor com as 21 províncias de Angola (Outubro 2026)
  const { ALL_21_PROVINCE_FACTORS } = await import('../lib/data/province-factors');
  for (const pf of ALL_21_PROVINCE_FACTORS) {
    await (prisma as any).provinceFactor.upsert({
      where: { province: pf.province },
      update: {
        factor: pf.factor,
        note: pf.note,
      },
      create: {
        province: pf.province,
        factor: pf.factor,
        note: pf.note,
      },
    });
  }

  console.log(`[SeedPrices] Concluído! ${materialsCount} novos materiais, ${pricesCount} preços registados e 21 ProvinceFactors configurados.`);
  return { materialsCount, pricesCount, totalMaterials: SEED_MATERIALS.length };
}

// Execução direta se invocado via CLI
if (typeof require !== 'undefined' && require.main === module) {
  seedPrices()
    .then((res) => {
      console.log('[SeedPrices] Sucesso:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SeedPrices] Erro:', err);
      process.exit(1);
    });
}
