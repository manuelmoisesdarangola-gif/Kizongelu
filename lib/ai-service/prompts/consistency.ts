/**
 * @file lib/ai-service/prompts/consistency.ts
 * Prompt para validação de coerência técnica e deteção de anomalias em parâmetros de obra.
 */

export function buildValidateConsistencyPrompt(projectInput: any): string {
  const inputStr = JSON.stringify(projectInput, null, 2);

  return `
Tarefa: Executar uma auditoria de coerência técnica e física aos parâmetros de entrada do projeto de construção fornecido.

Dados de Entrada:
"""
${inputStr}
"""

Regras e Anomalias a Auditar no Contexto de Angola:
1. Relação Área vs Divisões:
   - Exemplo: Mais de 4 quartos com menos de 70m² de área total (incompatibilidade de área útil mínima habitacional).
   - Exemplo: 1 único quarto para uma área superior a 300m² sem ser salão ou armazém.
2. Relação Pisos vs Estrutura e Fundação:
   - Exemplo: Edifício com 2 ou mais pisos configurado com fundação em 'sapata_corrida' simples ou alvenaria sem pilares de betão armado (risco estrutural severo).
3. Relação Instalações vs Tipologia:
   - Exemplo: Obra de alto padrão com instalações elétricas ou hidráulicas básicas.
   - Exemplo: Muro de vedação com quartos e salas assinaladas.
4. Relação Dimensões:
   - Comprimento e largura incompatíveis com a área declarada (ex.: 10m x 10m declarados mas área definida como 50m²).

Formato de Resposta:
Devolva ESTRITAMENTE um array JSON de objetos no formato:
[
  {
    "code": "STRUCT_FLOORS_FOUNDATION_MISMATCH",
    "field": "foundation",
    "message": "Construção de 2 pisos com fundação simples de alvenaria. Edifícios com múltiplos pisos exigem pilares de betão armado e sapatas isoladas calculadas.",
    "severity": "high",
    "recommendation": "Altere a fundação para sapatas isoladas e a estrutura para betão armado."
  }
]

Se os dados estiverem consistentes e sem incongruências, devolva um array vazio [].
`;
}
