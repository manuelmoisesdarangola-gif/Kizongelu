/**
 * @file lib/ai-service/prompts/description-analysis.ts
 * Prompt para análise de descrições livres de obras em Angola.
 */

import { AiContext } from '../types';

export function buildDescriptionAnalysisPrompt(text: string, context: AiContext): string {
  return `
Tarefa: Analisar a descrição de um projeto de construção civil em Angola e extrair todos os parâmetros técnicos relevantes no formato JSON estrito.

Contexto do Projeto:
- Província de Referência: ${context.province || 'Não especificada (sugerir Luanda se não inferida)'}
- Município: ${context.municipality || 'Não especificado'}
- Tipo de Utilizador: ${context.clientType || 'particular'}
- Título/Tema prévio: ${context.projectTitle || 'Não especificado'}

Texto fornecido pelo utilizador:
"""
${text}
"""

Instruções Específicas:
1. Extraia o tipo de obra ('NOVA', 'AMPLIACAO', 'REMODELACAO', 'REABILITACAO', 'MURO', 'ANEXO', 'OUTRA').
2. Extraia dimensões: área em m² (se inferida ou explícita), comprimento, largura, número de pisos, quartos, casas de banho, sala, cozinha, garagem, varanda, anexo.
3. Identifique o tipo provável de fundação ('sapata_corrida', 'sapata_isolada', 'laje', 'nao_sei') e estrutura ('betao_armado', 'alvenaria_estrutural', 'nao_sei').
4. Identifique o tipo de cobertura ('chapa', 'telha', 'laje', 'nao_sei') e nível de acabamentos ('economico', 'medio', 'alto').
5. NUNCA invente preços ou quantitativos financeiros em Kwanzas. Apenas extraia propriedades físicas e construtivas.
6. Forneça uma lista de avisos se houver ambiguidades técnicas e passos seguintes sugeridos.

Responda ESTRITAMENTE em formato JSON com o seguinte schema:
{
  "summary": "Resumo técnico sucinto do projeto (máximo 2 parágrafos)",
  "extractedParameters": {
    "title": "Título sugerido para o projeto",
    "projectType": "NOVA | AMPLIACAO | REMODELACAO | REABILITACAO | MURO | ANEXO | OUTRA",
    "province": "nome da província em Angola",
    "municipality": "município identificado ou null",
    "area": 120,
    "length": 12,
    "width": 10,
    "floors": 1,
    "bedrooms": 3,
    "bathrooms": 2,
    "hasLivingRoom": true,
    "hasKitchen": true,
    "hasGarage": false,
    "hasBalcony": false,
    "hasAnnex": false,
    "foundation": "sapata_corrida | sapata_isolada | laje | nao_sei",
    "structure": "betao_armado | alvenaria_estrutural | nao_sei",
    "roof": "chapa | telha | laje | nao_sei",
    "finishLevel": "economico | medio | alto",
    "electrical": "basica | intermedia | completa",
    "plumbing": "basica | intermedia | completa",
    "specialRequirements": ["ex: reservatório subterrâneo", "gerador"],
    "notes": ["apontamento construtivo relevante"]
  },
  "confidenceScore": 0.85,
  "detectedElements": ["quarto suíte", "cobertura em chapa IBR", "garagem coberta"],
  "suggestedNextSteps": ["Confirmar o tipo de solo para cálculo de fundações", "Definir padrão de loiças sanitárias"],
  "warnings": ["Área inferida com base na contagem de divisões, recomenda-se confirmação no local."]
}
`;
}
