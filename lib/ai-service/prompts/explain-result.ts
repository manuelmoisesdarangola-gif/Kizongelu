/**
 * @file lib/ai-service/prompts/explain-result.ts
 * Prompt para gerar explicação técnica e executiva de um resultado de cálculo determinístico.
 */

import { AiContext } from '../types';

export function buildExplainResultPrompt(calculation: any, context: AiContext): string {
  const province = context.province || calculation?.input?.province || 'Luanda';
  const grandTotal = calculation?.grandTotal || calculation?.total || 0;
  const materialsTotal = calculation?.materialsTotal || 0;
  const laborTotal = calculation?.laborTotal || 0;
  const transportTotal = calculation?.transportTotal || 0;
  const confidenceScore = calculation?.confidence?.score ?? 85;
  const confidenceLevel = calculation?.confidence?.level ?? 'HIGH';
  const chaptersCount = calculation?.chapters?.length || 0;

  const chaptersSummary = Array.isArray(calculation?.chapters)
    ? calculation.chapters
        .map((c: any) => `- ${c.chapter || c.nomeCategoria || 'Capítulo'}: Subtotal ${Number(c.subtotal || c.subtotalGeralKz || 0).toLocaleString('pt-PT')} Kz`)
        .join('\n')
    : 'Capítulos consolidados na ficha técnica.';

  return `
Tarefa: Elaborar uma explicação técnica, pedagógica e estruturada sobre o resultado do orçamento calculado pelo Motor Determinístico do Kizongelu.

Dados Oficiais Calculados pelo Motor:
- Obra: ${context.projectTitle || calculation?.input?.type || 'Construção'} na província de ${province}
- Área considerada: ${calculation?.input?.area || 'Definida por projeto'} m²
- Nível de Confiança do Cálculo: ${confidenceLevel} (${confidenceScore}%)
- Valor Total Oficial: ${Number(grandTotal).toLocaleString('pt-PT')} Kz
- Materiais de Construção: ${Number(materialsTotal).toLocaleString('pt-PT')} Kz
- Mão de Obra Especializada: ${Number(laborTotal).toLocaleString('pt-PT')} Kz
- Logística e Frete Regional: ${Number(transportTotal).toLocaleString('pt-PT')} Kz
- Número de Capítulos Orçamentados: ${chaptersCount}

Resumo dos Capítulos Principais:
${chaptersSummary}

Diretrizes da Resposta:
1. NUNCA altere os valores numéricos acima nem invente outros preços. Explique exatamente o que o motor calculou.
2. Analise os pesos relativos: quanto do valor corresponde a materiais versus mão de obra e logística na província de ${province}.
3. Explique os principais fatores que influenciam o custo (estrutura de betão armado, blocos, fundações e cobertura).
4. Forneça recomendações práticas para a compra faseada dos materiais em Angola (ex.: negociar cimento e varões de aço em lote fechado; controlar o armazenamento de areia e brita para evitar perdas no estaleiro).
5. Estruture o texto em subtítulos claros:
   - "Síntese do Orçamento"
   - "Principais Vetores de Custo (Materiais vs Mão de Obra)"
   - "Impacto da Logística na Província de ${province}"
   - "Conselhos de Execução e Gestão de Compras"
6. Mantenha um tom profissional, encorajador e de alto rigor de engenharia.
`;
}
