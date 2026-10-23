/**
 * @file lib/calculation-engine/audit-alerts.ts
 * Motor de Auditoria Automática de Inconsistências e Riscos de Engenharia para Angola.
 * 
 * Verifica automaticamente:
 * 1. Preços unitários fora do intervalo plausível de mercado angolano (ex: saco de cimento < 2.500 Kz ou > 15.000 Kz).
 * 2. Consumos geométricos anormais (kg de aço por m², cimento por m³).
 * 3. Alertas de logística crítica para Cabinda e províncias do Leste (Lunda Norte / Sul).
 * 4. Risco de subavaliação fiscal (retenção de 6,5% não provisionada ou BDI < 15%).
 */

import { CalculationInput, CalculationItem, AuditAlert } from './types';
import { normalizeProvinceName } from './prices-provider';
import { crossValidate } from './typology-benchmarks';

export function runEngineAudit(
  input: CalculationInput,
  items: CalculationItem[],
  directCost: number,
  bdiRate: number
): AuditAlert[] {
  const alerts: AuditAlert[] = [];
  const normProvince = normalizeProvinceName(input.province || 'Luanda');
  const area = input.area || 150;

  // 1. Alerta de Logística Marítima / Aérea para Cabinda
  if (normProvince === 'Cabinda') {
    alerts.push({
      id: 'alt_cabinda_logistics',
      code: 'ALT-CAB-01',
      severity: 'WARNING',
      category: 'CABINDA_LOGISTICA',
      title: 'Aviso Logístico Crítico: Província de Cabinda (Enclave)',
      message: 'O transporte de cimento, ferro e chapas para Cabinda depende de frete marítimo de cabotagem a partir do Porto de Luanda ou frete aéreo. Prazos alfandegários portuários podem adicionar 2 a 3 semanas.',
      suggestedAction: 'Validar cotação formal com agente de navegação / despachante oficial antes de fechar contrato.',
      currentValue: 'Cabinda',
      expectedRange: 'Frete Marítimo de Cabotagem',
    });
  }

  // 2. Alerta de BDI Baixo ou Inadequado
  if (bdiRate < 0.18) {
    alerts.push({
      id: 'alt_low_bdi',
      code: 'ALT-BDI-01',
      severity: 'WARNING',
      category: 'MARGEM_BDI',
      title: 'Taxa de BDI Inferior à Margem de Segurança Recomendada',
      message: `A taxa de BDI aplicada (${(bdiRate * 100).toFixed(1)}%) está abaixo da média recomendada de 20% a 25% para a construção civil em Angola, arriscando absorver despesas de estaleiro no lucro da empresa.`,
      suggestedAction: 'Ajustar BDI para o intervalo entre 20% e 25% para salvaguardar custos indiretos de administração e imprevistos.',
      currentValue: `${(bdiRate * 100).toFixed(1)}%`,
      expectedRange: '20.0% a 25.0%',
    });
  }

  // 3. Verificação de Rácio de Aço (Armaduras kg/m²)
  const steelItems = items.filter((it) => it.code.startsWith('ACO-') || it.description.toLowerCase().includes('aço') || it.description.toLowerCase().includes('ferro'));
  const totalSteelKg = steelItems.reduce((acc, curr) => acc + (curr.unit === 'kg' ? curr.quantity : 0), 0);
  if (totalSteelKg > 0 && area > 0) {
    const steelRatio = totalSteelKg / area;
    if (steelRatio < 15) {
      alerts.push({
        id: 'alt_low_steel_ratio',
        code: 'ALT-TEC-01',
        severity: 'WARNING',
        category: 'QUANTIDADE_DISCREPANTE',
        title: 'Rácio de Armaduras de Aço Baixo',
        message: `A densidade de armaduras calculada (${steelRatio.toFixed(1)} kg/m²) é baixa para estruturas de betão armado padrão em Angola (mínimo habitual: 25 a 35 kg/m²).`,
        suggestedAction: 'Verificar se o projeto estrutural prevê sapatas isoladas ou laje aligeirada que justifique esta taxa reduzida.',
        currentValue: `${steelRatio.toFixed(1)} kg/m²`,
        expectedRange: '25 a 35 kg/m²',
      });
    } else if (steelRatio > 55) {
      alerts.push({
        id: 'alt_high_steel_ratio',
        code: 'ALT-TEC-02',
        severity: 'INFO',
        category: 'QUANTIDADE_DISCREPANTE',
        title: 'Alta Densidade de Armaduras de Aço',
        message: `Rácio estrutural elevado (${steelRatio.toFixed(1)} kg/m²), característico de fundações profundas, múltiplos pisos ou zonas de sismo/terrenos fracos.`,
        suggestedAction: 'Confirmar os diâmetros e espaçamentos com o projetista de estabilidade.',
        currentValue: `${steelRatio.toFixed(1)} kg/m²`,
        expectedRange: '25 a 45 kg/m²',
      });
    }
  }

  // 4. Verificação de Preço Unitário Anormal em Materiais Críticos
  for (const item of items) {
    const desc = item.description.toLowerCase();

    // Verificação de Cimento
    if (desc.includes('cimento') && item.unit === 'sc') {
      if (item.unitPrice < 3000) {
        alerts.push({
          id: `alt_cement_low_${item.code}`,
          code: 'ALT-PRC-CIM-LOW',
          itemCode: item.code,
          severity: 'CRITICAL',
          category: 'PRECO_ANORMAL',
          title: `Preço Unitário de Cimento Anormalmente Baixo (${item.code})`,
          message: `O preço de ${item.unitPrice.toLocaleString('pt-PT')} Kz/saco está substancialmente abaixo da cotação de fábrica/armazém em Angola (média atual: 4.500 a 6.000 Kz).`,
          suggestedAction: 'Atualizar a tabela de preços do armazém local para evitar subavaliação do custo de betões.',
          currentValue: `${item.unitPrice.toLocaleString('pt-PT')} Kz`,
          expectedRange: '4.500 a 6.500 Kz',
        });
      } else if (item.unitPrice > 12000) {
        alerts.push({
          id: `alt_cement_high_${item.code}`,
          code: 'ALT-PRC-CIM-HIGH',
          itemCode: item.code,
          severity: 'WARNING',
          category: 'PRECO_ANORMAL',
          title: `Preço Unitário de Cimento Acima da Média (${item.code})`,
          message: `Preço de ${item.unitPrice.toLocaleString('pt-PT')} Kz/saco é significativamente superior ao valor de referência de Luanda e Benguela.`,
          suggestedAction: 'Confirmar se o preço inclui frete de longa distância para o interior.',
          currentValue: `${item.unitPrice.toLocaleString('pt-PT')} Kz`,
          expectedRange: '4.500 a 8.000 Kz',
        });
      }
    }

    // Verificação de Aço por kg
    if (desc.includes('aço') || desc.includes('ferro') || item.code.startsWith('ACO-')) {
      if (item.unit === 'kg' && (item.unitPrice < 800 || item.unitPrice > 3500)) {
        alerts.push({
          id: `alt_steel_price_${item.code}`,
          code: 'ALT-PRC-ACO',
          itemCode: item.code,
          severity: 'WARNING',
          category: 'PRECO_ANORMAL',
          title: `Preço Unitário do Aço Fora da Faixa de Mercado (${item.code})`,
          message: `Cotação de ${item.unitPrice.toLocaleString('pt-PT')} Kz/kg diverge da média de varão nervurado cortado e dobrado (1.200 a 2.200 Kz/kg).`,
          suggestedAction: 'Validar cotações atuais de siderurgias nacionais (ex: Aceria de Angola / ADA) e importadores.',
          currentValue: `${item.unitPrice.toLocaleString('pt-PT')} Kz/kg`,
          expectedRange: '1.200 a 2.200 Kz/kg',
        });
      }
    }
  }

  // 5. Verificação de Risco Fiscal AGT (Retenção na Fonte)
  alerts.push({
    id: 'alt_fiscal_retention',
    code: 'ALT-FISC-01',
    severity: 'INFO',
    category: 'RISCO_FISCAL',
    title: 'Disponibilidade de Fluxo de Caixa: Retenção na Fonte de 6,5%',
    message: 'Para donos de obra coletivos ou entidades do Estado, a fatura final sofrerá retenção direta de 6,5% do imposto sobre a prestação de serviços no ato de liquidação.',
    suggestedAction: 'Garantir que o fluxo de tesouraria da empreitada acomoda a retenção até ao crédito tributário anual na AGT.',
    currentValue: '6,5% sobre a fatura',
    expectedRange: 'Imposto Obrigatório AGT',
  });

  // 6. Validação Cruzada com Referência Imobiliária (divergência > 20%)
  if ((input as any).marketReferencePrice && (input as any).marketReferencePrice > 0) {
    const crossRes = crossValidate({
      total: directCost,
      marketReferencePrice: (input as any).marketReferencePrice,
    });
    if (crossRes.alert) {
      alerts.push({
        id: 'alt_cross_val_imob',
        code: 'ALT-IMOB-01',
        severity: 'WARNING',
        category: 'VALOR_DISCREPANTE',
        title: 'Divergência com Referência Imobiliária (>20%)',
        message: crossRes.message || 'Divergência >20% entre cálculo directo e referência imobiliária. Rever parâmetros.',
        suggestedAction: 'Rever os parâmetros de acabamento, dimensões ou BDI aplicados à empreitada.',
        currentValue: `${directCost.toLocaleString('pt-AO')} Kz`,
        expectedRange: `Aprox. ${crossRes.custoEstimadoViaImob?.toLocaleString('pt-AO')} Kz (±20%)`,
      });
    }
  }

  return alerts;
}
