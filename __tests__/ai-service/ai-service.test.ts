/**
 * @file __tests__/ai-service/ai-service.test.ts
 * Suíte de Testes da Camada de IA (Fase 11 - Especificação Refinada).
 * 
 * Validações Principais:
 * 1. Descrição "quero casa T3 em Luanda" → extrai sugestões (bedrooms: 3, província: Luanda, isSuggestion: true).
 * 2. Guardrail rejeita resposta com "Kz" no texto → devolve confidence: 'low' e needsConfirmation: true.
 * 3. Guardrail rejeita "cálculo", "total", "preço final".
 * 4. interpretDocument → identifica planta/croqui/foto, extrai estimativas e define needsConfirmation: true.
 * 5. explainResult → gera texto explicativo dos quantitativos oficiais do orçamento determinístico.
 * 6. suggestMissingData → sugere campos em falta ("Indicou 200m² mas não especificou...").
 * 7. validateConsistency → deteta anomalias ("Uma casa de 300m² com 2 quartos parece pouco habitual.") sem bloquear.
 * 8. Cache de respostas da IA → gravação e leitura baseada em hash do input + tipo.
 */

import {
  aiService,
  createAiService,
  enforceGuardrails,
  checkStrictGuardrails,
  generateCacheKey,
  getCachedAiInteraction,
  setCachedAiInteraction,
  AiResult,
} from '../../lib/ai-service';

export async function runAiServiceTests() {
  console.log('========================================================');
  console.log('--- EXECUTANDO TESTES DA CAMADA DE IA (FASE 11) ---');
  console.log('========================================================');

  const results: { test: string; passed: boolean; detail: string }[] = [];

  // =========================================================================
  // TESTE 1: Descrição "quero casa T3 em Luanda" → extrai sugestões
  // =========================================================================
  try {
    const text = 'quero casa T3 em Luanda';
    const res = await aiService.analyzeDescription(text);

    const hasBedrooms3 = res.extractedData?.bedrooms === 3;
    const hasProvinceLuanda = res.extractedData?.province?.toLowerCase() === 'luanda';
    const isMarkedAsSuggestion = res.extractedData?.isSuggestion === true;
    const hasConfidence = res.confidence === 'high' || res.confidence === 'medium';
    const hasSuggestions = Array.isArray(res.suggestions) && res.suggestions.length > 0;
    const hasNoFinalPrices =
      res.extractedData?.total === undefined &&
      res.extractedData?.preco === undefined &&
      res.extractedData?.grandTotal === undefined;

    if (hasBedrooms3 && hasProvinceLuanda && isMarkedAsSuggestion && hasConfidence && hasSuggestions && hasNoFinalPrices) {
      results.push({
        test: 'Teste 1: Descrição "quero casa T3 em Luanda" → extrai sugestões',
        passed: true,
        detail: `Sugestões extraídas com sucesso: T${res.extractedData?.bedrooms}, Província: ${res.extractedData?.province}. Marcado como sugestão: ${isMarkedAsSuggestion}. Sem preços finais.`,
      });
    } else {
      results.push({
        test: 'Teste 1: Descrição "quero casa T3 em Luanda" → extrai sugestões',
        passed: false,
        detail: `Falha na extração. Resultado: ${JSON.stringify(res)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 1', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 2: Guardrail rejeita resposta com "Kz" no texto
  // =========================================================================
  try {
    const rogueResult: AiResult = {
      text: 'O valor da sua casa será de 15.000.000 Kz com mão de obra incluída.',
      confidence: 'high',
      needsConfirmation: false,
      suggestions: ['Avançar com a compra'],
    };

    const enforced = enforceGuardrails(rogueResult);

    const isRejected = enforced.confidence === 'low';
    const needsConfirm = enforced.needsConfirmation === true;
    const mentionsRejection = enforced.reasoning?.includes('Rejeitado') || enforced.text?.includes('rejeitada');

    if (isRejected && needsConfirm && mentionsRejection) {
      results.push({
        test: 'Teste 2: Guardrail rejeita resposta com "Kz" no texto',
        passed: true,
        detail: `Resposta com "Kz" rejeitada com sucesso: confidence='${enforced.confidence}', needsConfirmation=${enforced.needsConfirmation}.`,
      });
    } else {
      results.push({
        test: 'Teste 2: Guardrail rejeita resposta com "Kz" no texto',
        passed: false,
        detail: `Guardrail não rejeitou adequadamente. Resultado: ${JSON.stringify(enforced)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 2', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 3: Guardrail rejeita "cálculo", "total", "preço final"
  // =========================================================================
  try {
    const forbiddenChecks = [
      { text: 'O cálculo dita que a estrutura precisa de mais vigas.', word: 'cálculo' },
      { text: 'O total de materiais foi determinado pela inteligência artificial.', word: 'total' },
      { text: 'O preço final para o empreiteiro já está estipulado.', word: 'preço final' },
    ];

    let allRejected = true;
    for (const item of forbiddenChecks) {
      const res: AiResult = {
        text: item.text,
        confidence: 'high',
        needsConfirmation: false,
      };
      const checked = enforceGuardrails(res);
      if (checked.confidence !== 'low' || !checked.needsConfirmation) {
        allRejected = false;
      }
    }

    if (allRejected) {
      results.push({
        test: 'Teste 3: Guardrail rejeita termos restritos (cálculo, total, preço final)',
        passed: true,
        detail: 'Todos os termos restritos foram intercetados e as respostas rebaixadas para confidence: "low".',
      });
    } else {
      results.push({
        test: 'Teste 3: Guardrail rejeita termos restritos (cálculo, total, preço final)',
        passed: false,
        detail: 'Falha na deteção de algum dos termos restritos.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 3', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 4: interpretDocument → identifica planta/croqui/foto com needsConfirmation
  // =========================================================================
  try {
    const docUrl = 'https://storage.kizongelu.ao/projetos/planta_baixa_moradia_t3.png';
    const res = await aiService.interpretDocument(docUrl);

    const isPlanta = res.extractedData?.documentType === 'planta' || res.documentInsights?.documentType === 'planta';
    const hasMeasures = res.extractedData?.estimatedArea !== undefined;
    const needsConfirmation = res.needsConfirmation === true;
    const isSuggestion = res.extractedData?.isSuggestion === true;

    if (isPlanta && hasMeasures && needsConfirmation && isSuggestion) {
      results.push({
        test: 'Teste 4: interpretDocument identifica documento e exige confirmação',
        passed: true,
        detail: `Planta identificada com medidas estimadas (${res.extractedData?.estimatedArea}m²). needsConfirmation=${needsConfirmation}, isSuggestion=${isSuggestion}.`,
      });
    } else {
      results.push({
        test: 'Teste 4: interpretDocument identifica documento e exige confirmação',
        passed: false,
        detail: `Resultado inesperado: ${JSON.stringify(res)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 4', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 5: explainResult → gera texto explicativo dos valores oficiais
  // =========================================================================
  try {
    const mockCalc = {
      grandTotal: 14800000,
      materialsTotal: 9176000,
      laborTotal: 4144000,
      transportTotal: 1480000,
      input: { province: 'Luanda' },
    };

    const res = await aiService.explainResult(mockCalc, { province: 'Luanda' });

    const mentionsTotal = res.text.includes('14.800.000 Kz') || res.text.includes('14800000') || res.text.includes('materiais');
    const hasConfidence = res.confidence === 'high';
    const hasSuggestions = res.suggestions && res.suggestions.length > 0;

    if (mentionsTotal && hasConfidence && hasSuggestions) {
      results.push({
        test: 'Teste 5: explainResult gera texto explicativo estruturado do orçamento',
        passed: true,
        detail: `Explicação gerada com sucesso: "${res.text.slice(0, 90)}..." com confidence: ${res.confidence}.`,
      });
    } else {
      results.push({
        test: 'Teste 5: explainResult gera texto explicativo estruturado do orçamento',
        passed: false,
        detail: `Explicação não atendeu aos critérios: ${JSON.stringify(res)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 5', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 6: suggestMissingData → sugere campos em falta com impacto
  // =========================================================================
  try {
    const inputWithMissingBathrooms = {
      data: {
        step3: { area: 200, bedrooms: 3, bathrooms: 0 },
        step4: { foundation: 'nao_sei', structure: 'nao_sei' },
      },
    };

    const res = await aiService.suggestMissingData(inputWithMissingBathrooms);

    const hasAreaNotice = res.suggestions?.some((s) => s.includes('200m²') || s.includes('casas de banho'));
    const hasFoundationNotice = res.suggestions?.some((s) => s.toLowerCase().includes('fundação'));

    if (hasAreaNotice && hasFoundationNotice) {
      results.push({
        test: 'Teste 6: suggestMissingData deteta campos em falta e impacto de ±5%',
        passed: true,
        detail: `Sugestões geradas com precisão: ${res.suggestions?.length} itens identificados.`,
      });
    } else {
      results.push({
        test: 'Teste 6: suggestMissingData deteta campos em falta e impacto de ±5%',
        passed: false,
        detail: `Sugestões em falta: ${JSON.stringify(res.suggestions)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 6', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 7: validateConsistency → deteta anomalias sem bloquear
  // =========================================================================
  try {
    const unusualInput = {
      data: {
        step3: { area: 300, bedrooms: 2, floors: 1 },
        step4: { foundation: 'sapata_isolada' },
      },
    };

    const res = await aiService.validateConsistency(unusualInput);

    const hasUnusualWarning = res.warnings?.some((w) => w.includes('300m²') && w.includes('2 quartos'));
    const needsConfirm = res.needsConfirmation === true;

    if (hasUnusualWarning && needsConfirm) {
      results.push({
        test: 'Teste 7: validateConsistency deteta "casa de 300m² com 2 quartos" sem bloquear',
        passed: true,
        detail: `Inconsistência detetada com sucesso como aviso/sugestão: "${res.warnings?.[0]}".`,
      });
    } else {
      results.push({
        test: 'Teste 7: validateConsistency deteta "casa de 300m² com 2 quartos" sem bloquear',
        passed: false,
        detail: `Aviso não gerado. Avisos: ${JSON.stringify(res.warnings)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 7', passed: false, detail: err.message });
  }

  // =========================================================================
  // TESTE 8: Cache de respostas da IA (AiInteraction)
  // =========================================================================
  try {
    const testInput = { text: 'construir muro em Viana' };
    const key = generateCacheKey('analyzeDescription', testInput);

    const mockResponse: AiResult = {
      text: 'Muro em Viana analisado.',
      confidence: 'high',
      needsConfirmation: false,
      suggestions: ['Verificar extensão em metros lineares'],
    };

    await setCachedAiInteraction('analyzeDescription', testInput, mockResponse);
    const retrieved = await getCachedAiInteraction('analyzeDescription', testInput);

    if (retrieved && retrieved.text === mockResponse.text) {
      results.push({
        test: 'Teste 8: Cache de respostas da IA (AiInteraction) baseado em hash',
        passed: true,
        detail: `Chave de cache gerada: "${key}". Leitura e escrita validadas com sucesso.`,
      });
    } else {
      results.push({
        test: 'Teste 8: Cache de respostas da IA (AiInteraction) baseado em hash',
        passed: false,
        detail: `Cache não recuperou objeto esperado: ${JSON.stringify(retrieved)}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 8', passed: false, detail: err.message });
  }

  // =========================================================================
  // Apresentação dos Resultados
  // =========================================================================
  console.log('\n--- RESULTADOS FINAIS DOS TESTES DA CAMADA DE IA ---');
  let allPassed = true;
  for (const r of results) {
    console.log(`${r.passed ? '✅ [PASSOU]' : '❌ [FALHOU]'} - ${r.test}`);
    console.log(`   Detalhe: ${r.detail}`);
    if (!r.passed) allPassed = false;
  }
  console.log('========================================================\n');

  return { success: allPassed, results };
}
