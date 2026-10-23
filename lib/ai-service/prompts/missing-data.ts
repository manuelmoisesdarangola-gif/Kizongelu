/**
 * @file lib/ai-service/prompts/missing-data.ts
 * Prompt para análise de lacunas técnicas e sugestão de dados em falta em projetos de construção.
 */

export function buildSuggestMissingDataPrompt(projectInput: any): string {
  // Serializa os dados disponíveis para avaliação
  const inputStr = JSON.stringify(projectInput, null, 2);

  return `
Tarefa: Identificar omissões ou informações técnicas em falta no projeto de construção fornecido, para que o utilizador possa refinar o orçamento determinístico.

Dados Atuais do Projeto:
"""
${inputStr}
"""

Critérios de Engenharia Civil para Angola:
1. Analise se a fundação está definida ('nao_sei' ou omitida).
2. Verifique se o tipo de terreno ou declive foi referenciado (impacto direto em escavação e movimentação de terras).
3. Verifique se as dimensões (comprimento, largura, pé-direito) são explícitas ou apenas estimadas.
4. Verifique a especificação da cobertura (estrutura de madeira vs metálica, tipo de chapa/telha).
5. Verifique a existência de infraestruturas auxiliares comuns em Angola (fossa séptica com poço absorvente, tanque/reservatório de água de 5.000L a 10.000L com eletrobomba, muro de vedação).
6. Verifique o padrão de acabamentos e caixilharia (vidro temperado vs comum, portas maciças vs alveolares).

Instruções de Resposta:
- Devolva um array JSON contendo entre 3 e 7 sugestões práticas, concisas e acionáveis em língua portuguesa.
- Cada sugestão deve ser uma frase objetiva explicando o que falta e qual o benefício de especificar.
- NUNCA mencione preços ou custos. Apenas aspetos técnicos e construtivos.

Exemplo de formato esperado:
[
  "Definir o tipo de solo para apurar a profundidade exata das sapatas e vigas de fundação.",
  "Especificar a capacidade prevista do reservatório de água potável (cisterna subterrânea).",
  "Indicar se a cobertura terá estrutura de suporte em madeira tratada ou perfis metálicos.",
  "Informar se a vedação do terreno (muro perimetral e portão) deve ser incluída no orçamento."
]
`;
}
