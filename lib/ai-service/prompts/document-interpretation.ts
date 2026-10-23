/**
 * @file lib/ai-service/prompts/document-interpretation.ts
 * Prompt para interpretação técnica de peças escritas, plantas e especificações de projetos.
 */

import { AiContext } from '../types';

export function buildDocumentInterpretationPrompt(fileUrlOrReference: string, context: AiContext): string {
  return `
Tarefa: Interpretar e extrair especificações de engenharia civil e arquitectura a partir de um documento de projecto (memória descritiva, planta técnica, mapa de medições ou caderno de encargos).

Referência / Identificador do Documento:
"${fileUrlOrReference}"

Contexto da Obra:
- Província: ${context.province || 'Angola (geral)'}
- Tipo de Projeto: ${context.projectType || 'Não especificado'}
- Título do Projeto: ${context.projectTitle || 'Não especificado'}

Instruções:
1. Extraia o tipo de documento ('memoria_descritiva', 'planta', 'mapa_quantidades', 'especificacao', 'outro').
2. Identifique áreas úteis e brutas citadas no documento.
3. Extraia divisões, sistemas estruturais (betão armado B25/C20/25, aço A400 NR, sapatas isoladas, etc.).
4. Extraia especificações de acabamentos: cerâmicos, tintas, caixilharia de alumínio, coberturas.
5. Liste os capítulos de obra reconhecidos no documento (ex.: Movimento de Terras, Estruturas, Alvenarias, Revestimentos, Eletricidade, Águas e Esgotos).
6. NUNCA fixe ou declare preços finais; transfira apenas parâmetros dimensionais e especificações de materiais.

Responda ESTRITAMENTE em formato JSON com o schema:
{
  "summary": "Resumo executivo do conteúdo técnico identificado no documento.",
  "extractedParameters": {
    "title": "Título identificado no documento",
    "projectType": "NOVA | AMPLIACAO | REMODELACAO | REABILITACAO | MURO | ANEXO | OUTRA",
    "province": "${context.province || 'Luanda'}",
    "area": 180,
    "floors": 1,
    "bedrooms": 3,
    "bathrooms": 2,
    "hasLivingRoom": true,
    "hasKitchen": true,
    "foundation": "sapata_isolada",
    "structure": "betao_armado",
    "roof": "chapa",
    "finishLevel": "medio",
    "electrical": "intermedia",
    "plumbing": "intermedia"
  },
  "confidenceScore": 0.90,
  "detectedElements": ["Laje aligeirada vigotas", "Alvenaria bloco 15cm", "Cobertura chapa pré-lacada"],
  "documentInsights": {
    "fileName": "${fileUrlOrReference}",
    "documentType": "memoria_descritiva",
    "detectedChapters": ["Fundações", "Superestrutura", "Alvenarias", "Revestimentos"],
    "detectedAreasM2": 180,
    "rawNotes": "Encontradas notas relativas a solo argiloso exigindo vigas de lintelamento reforçadas."
  },
  "suggestedNextSteps": ["Validar cota do terreno", "Conferir memorial de caixilharias"],
  "warnings": []
}
`;
}
