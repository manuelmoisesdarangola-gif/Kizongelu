/**
 * @file scripts/test-calc.ts
 * Script executável para testar o Motor de Cálculo Determinístico do Kizongelu.
 * 
 * Uso: npx tsx scripts/test-calc.ts
 */

import { calculate } from '../lib/calculation-engine';
import { CalculationInput } from '../lib/calculation-engine/types';

async function main() {
  console.log('========================================================================');
  console.log('        Kizongelu — MOTOR DE CÁLCULO DETERMINÍSTICO (v1.0)              ');
  console.log('========================================================================\n');

  // Input de exemplo: Moradia T3 com 200m² em Luanda
  const projectInput: CalculationInput = {
    type: 'NOVA',
    province: 'Luanda',
    municipality: 'Talatona',
    area: 200,
    length: 20,
    width: 10,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: true,
    hasBalcony: true,
    hasAnnex: false,
    foundation: 'sapata_corrida',
    structure: 'betao_armado',
    roof: 'chapa',
    finishLevel: 'medio',
    electrical: 'intermedia',
    plumbing: 'intermedia',
  };

  console.log('--- DADOS DO PROJETO DE ENTRADA ---');
  console.log(`Tipo de Obra:        ${projectInput.type}`);
  console.log(`Localização:         ${projectInput.province} (${projectInput.municipality || 'Capital'})`);
  console.log(`Área Bruta:          ${projectInput.area} m² (Dimensões: ${projectInput.length}m x ${projectInput.width}m, ${projectInput.floors} piso)`);
  console.log(`Tipologia:           T${projectInput.bedrooms} (${projectInput.bathrooms} WC)`);
  console.log(`Fundação / Estrutura: ${projectInput.foundation} / ${projectInput.structure}`);
  console.log(`Cobertura / Padrão:  ${projectInput.roof} / Acabamento ${projectInput.finishLevel}`);
  console.log('------------------------------------------------------------------------\n');

  console.log('Calculando quantidades, materiais, mão de obra e transporte...');
  const startTime = Date.now();
  const result = await calculate(projectInput, 'v1.0');
  const elapsedMs = Date.now() - startTime;

  console.log(`\nCálculo concluído em ${elapsedMs}ms.`);
  console.log(`Índice de Confiança: [${result.confidence.level}] Score: ${result.confidence.score}/100`);
  console.log(`Motivos / Observações: ${result.confidence.reasons.join('; ')}\n`);

  console.log('========================================================================');
  console.log('                      MAPA DE QUANTIDADES E CUSTOS                      ');
  console.log('========================================================================');
  console.log(
    'CÓDIGO'.padEnd(14) +
    'DESCRIÇÃO'.padEnd(36) +
    'QTD'.padStart(8) +
    'UN'.padStart(6) +
    'P.UNIT (Kz)'.padStart(14) +
    'TOTAL (Kz)'.padStart(16)
  );
  console.log('-'.repeat(94));

  let currentChapter = '';

  for (const item of result.items) {
    if (item.chapter !== currentChapter) {
      currentChapter = item.chapter;
      console.log(`\n▶ ${currentChapter.toUpperCase()}`);
    }

    const shortDesc = item.description.length > 34 ? item.description.substring(0, 31) + '...' : item.description;
    const qtyStr = typeof item.quantity === 'number' ? item.quantity.toLocaleString('pt-PT') : String(item.quantity);
    const unitPriceStr = item.unitPrice.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const totalStr = item.total.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    console.log(
      item.code.padEnd(14) +
      shortDesc.padEnd(36) +
      qtyStr.padStart(8) +
      item.unit.padStart(6) +
      unitPriceStr.padStart(14) +
      totalStr.padStart(16)
    );
  }

  console.log('\n========================================================================');
  console.log('                    RESUMO POR CAPÍTULO DA OBRA                         ');
  console.log('========================================================================');
  for (const ch of result.chapters) {
    console.log(
      `${ch.chapter.padEnd(32)}: ${ch.subtotal.toLocaleString('pt-PT').padStart(16)} Kz (${ch.itemsCount} itens)`
    );
  }

  console.log('------------------------------------------------------------------------');
  console.log(`SUBTOTAL MATERIAIS:               ${result.materialsTotal.toLocaleString('pt-PT').padStart(16)} Kz`);
  console.log(`SUBTOTAL MÃO DE OBRA:             ${result.laborTotal.toLocaleString('pt-PT').padStart(16)} Kz`);
  console.log(`TRANSPORTE E LOGÍSTICA:           ${result.transportTotal.toLocaleString('pt-PT').padStart(16)} Kz`);
  console.log('------------------------------------------------------------------------');
  console.log(`TOTAL ESTIMADO DA CONSTRUÇÃO:     ${result.grandTotal.toLocaleString('pt-PT').padStart(16)} Kz`);
  console.log('========================================================================\n');
}

main().catch((err) => {
  console.error('Erro ao executar o teste do motor de cálculo:', err);
  process.exit(1);
});
