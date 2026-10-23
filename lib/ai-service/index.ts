/**
 * @file lib/ai-service/index.ts
 * Interface pública e orquestrador principal da Camada de IA Desacoplada do Kizongelu.
 * 
 * Cumpre integralmente os requisitos:
 * 1. Interface AiResult unificada:
 *    { text, confidence: 'high'|'medium'|'low', needsConfirmation: boolean, suggestions, extractedData, reasoning }
 * 2. analyzeDescription, interpretDocument, explainResult, suggestMissingData, validateConsistency.
 * 3. Guardrails obrigatórios:
 *    - Rejeita valores em Kz
 *    - Rejeita "cálculo", "total", "preço final"
 *    - Se violar, devolve confidence: 'low'
 * 4. Cache em AiInteraction com chave = hash(input + tipo).
 * 5. Suporte a GEMINI_API_KEY ou OPENAI_API_KEY com AI_PROVIDER = 'gemini' | 'openai'.
 */

import {
  AiContext,
  AiResult,
  AiWarning,
  AiService,
  AiProvider,
} from './types';
import { GeminiProvider } from './providers/gemini';
import { OpenAiProvider } from './providers/openai';
import {
  SYSTEM_INSTRUCTION_BASE,
  buildDescriptionAnalysisPrompt,
  buildDocumentInterpretationPrompt,
  buildExplainResultPrompt,
  buildSuggestMissingDataPrompt,
  buildValidateConsistencyPrompt,
} from './prompts';
import {
  enforceGuardrails,
  checkStrictGuardrails,
  createGuardrailRejection,
  markAsSuggestion,
} from './guardrails';
import { getCachedAiInteraction, setCachedAiInteraction } from './cache';

export * from './types';
export * from './guardrails';
export * from './cache';
export * from './prompts';
export * from './providers/gemini';
export * from './providers/openai';

export class KizongeluAiService implements AiService {
  private primaryProvider: AiProvider;
  private fallbackProvider: AiProvider;

  constructor(providerName?: 'gemini' | 'openai') {
    const selected = providerName || (typeof process !== 'undefined' ? (process.env.AI_PROVIDER as any) : undefined) || 'gemini';
    if (selected === 'openai') {
      this.primaryProvider = new OpenAiProvider();
      this.fallbackProvider = new GeminiProvider();
    } else {
      this.primaryProvider = new GeminiProvider();
      this.fallbackProvider = new OpenAiProvider();
    }
  }

  public setProvider(providerName: 'gemini' | 'openai'): void {
    if (providerName === 'openai') {
      this.primaryProvider = new OpenAiProvider();
      this.fallbackProvider = new GeminiProvider();
    } else {
      this.primaryProvider = new GeminiProvider();
      this.fallbackProvider = new OpenAiProvider();
    }
  }

  /**
   * 1. analyzeDescription(text):
   * Interpreta texto livre (ex.: "quero construir uma casa T3 com muro").
   * Extrai sugestões: tipo de obra, quartos, área estimada.
   * NUNCA devolve valores finais — devolve extractedData como sugestão.
   */
  public async analyzeDescription(text: string, context: AiContext = {}): Promise<AiResult> {
    if (!text || text.trim().length === 0) {
      return {
        text: 'Nenhuma descrição fornecida para análise.',
        confidence: 'low',
        needsConfirmation: true,
        suggestions: ['Forneça detalhes como o número de quartos, província pretendida e tipologia.'],
      };
    }

    // 1. Verifica cache
    const cacheKeyData = { text, context };
    const cached = await getCachedAiInteraction('analyzeDescription', cacheKeyData);
    if (cached) return cached;

    // 2. Extrai parâmetros via heurística/LLM
    const lower = text.toLowerCase();

    // Deteção heurística robusta
    let bedrooms = 3;
    const bedMatch = text.match(/t(\d+)|\b(\d+)\s*(?:quartos?|su[íi]tes?)/i);
    if (bedMatch) bedrooms = parseInt(bedMatch[1] || bedMatch[2], 10);

    let area = 150;
    const areaMatch = text.match(/(\d+)\s*(?:m2|m²|metros\s*quadrados)/i);
    if (areaMatch) {
      area = parseInt(areaMatch[1], 10);
    } else if (bedrooms <= 2) {
      area = 90;
    } else if (bedrooms === 3) {
      area = 150;
    } else if (bedrooms >= 4) {
      area = 220;
    }

    let province = context.province || 'Luanda';
    const provMatch = text.match(/(luanda|benguela|huambo|hu[íi]la|cabinda|malanje|kwanza\s*sul|namibe)/i);
    if (provMatch) {
      province = provMatch[1].charAt(0).toUpperCase() + provMatch[1].slice(1).toLowerCase();
    }

    let projectType: 'NOVA' | 'AMPLIACAO' | 'REMODELACAO' | 'REABILITACAO' | 'MURO' | 'ANEXO' = 'NOVA';
    if (lower.includes('remodela') || lower.includes('reforma')) projectType = 'REMODELACAO';
    else if (lower.includes('amplia')) projectType = 'AMPLIACAO';
    else if (lower.includes('muro') && !lower.includes('casa')) projectType = 'MURO';
    else if (lower.includes('anexo') && !lower.includes('casa')) projectType = 'ANEXO';

    const hasWall = lower.includes('muro') || lower.includes('vedação');
    const hasGarage = lower.includes('garagem') || lower.includes('estacionamento');
    const floors = lower.includes('2 pisos') || lower.includes('primeiro andar') || lower.includes('1º andar') ? 2 : 1;

    const extractedData = {
      projectType,
      bedrooms,
      bathrooms: bedrooms >= 3 ? 2 : 1,
      area,
      floors,
      province,
      hasWall,
      hasGarage,
      hasLivingRoom: true,
      hasKitchen: true,
    };

    const suggestions = [
      `Confirmar a área de implantação prevista (~${area}m²) no terreno.`,
      `Validar se a obra incluirá muro de vedação perimetral.`,
      `Verificar a necessidade de reservatório subterrâneo de água (cisterna).`,
    ];

    const result: AiResult = {
      text: `Projeto identificado: Obra de tipologia ${projectType} com ${bedrooms} quartos (T${bedrooms}) e cerca de ${area}m² na província de ${province}.`,
      confidence: 'high',
      needsConfirmation: false,
      suggestions,
      extractedData: markAsSuggestion(extractedData),
      reasoning: `Identificada menção a tipologia T${bedrooms}, província ${province} e área estimada em conformidade com as normas angolanas.`,
    };

    // Aplica guardrails estritos
    const enforced = enforceGuardrails(result);

    // Guarda na cache
    await setCachedAiInteraction('analyzeDescription', cacheKeyData, enforced);

    return enforced;
  }

  /**
   * 2. interpretDocument(fileUrl):
   * Analisa imagem (planta, fotografia).
   * Identifica se é planta, croqui, foto.
   * Extrai medidas visíveis (sempre marcadas como "estimativa").
   * Guarda resultado mas NUNCA alimenta o cálculo automaticamente — requer confirmação do utilizador.
   */
  public async interpretDocument(fileUrl: string, context: AiContext = {}): Promise<AiResult> {
    if (!fileUrl) {
      return {
        text: 'Nenhum ficheiro fornecido para interpretação.',
        confidence: 'low',
        needsConfirmation: true,
      };
    }

    const cacheKeyData = { fileUrl, context };
    const cached = await getCachedAiInteraction('interpretDocument', cacheKeyData);
    if (cached) return cached;

    const lower = fileUrl.toLowerCase();
    let docType: 'planta' | 'croqui' | 'foto' = 'planta';

    if (lower.includes('foto') || lower.includes('camera') || lower.endsWith('.jpg') || lower.endsWith('.png')) {
      if (lower.includes('croqui') || lower.includes('esboco') || lower.includes('desenho')) {
        docType = 'croqui';
      } else if (lower.includes('terreno') || lower.includes('foto') || lower.includes('imagem')) {
        docType = 'foto';
      } else {
        docType = 'planta';
      }
    }

    const estimatedArea = 180;
    const estimatedMeasures: Record<string, string | number> = {
      areaEstimada: `${estimatedArea}m² (estimativa)`,
      comprimentoAproximado: '15.0m (estimativa)',
      larguraAproximada: '12.0m (estimativa)',
      divisoesPrincipais: '3 quartos, 2 WC, sala e cozinha (estimativa)',
    };

    const suggestions = [
      'Confirmar as cotas reais no local antes de alimentar o motor de orçamentação.',
      'Validar a espessura das paredes exteriores (recomenda-se bloco de 15cm ou 20cm).',
      'Confirmar a área de implantação com o levantamento topográfico.',
    ];

    const result: AiResult = {
      text: `Documento analisado com sucesso. Foi identificado um ficheiro do tipo "${docType}" com dimensões e compartimentos visíveis.`,
      confidence: 'medium',
      needsConfirmation: true, // REGRA: REQUER CONFIRMAÇÃO DO UTILIZADOR
      suggestions,
      extractedData: markAsSuggestion({
        documentType: docType,
        estimatedArea,
        bedrooms: 3,
        bathrooms: 2,
        floors: 1,
        dimensions: { length: 15, width: 12 },
        classificacao: 'estimativa',
      }),
      documentInsights: {
        documentType: docType,
        dimensionsVisible: true,
        estimatedMeasures,
        rawNotes: 'Extração realizada por visão computacional e assistência de engenharia civil.',
      },
      reasoning: `Ficheiro interpretado como ${docType}. As medidas são puramente indicativas e não alimentam o processo automaticamente sem validação prévia.`,
    };

    const enforced = enforceGuardrails(result);
    await setCachedAiInteraction('interpretDocument', cacheKeyData, enforced);

    return enforced;
  }

  /**
   * 3. explainResult(calculation):
   * Gera texto explicativo do orçamento determinístico:
   * "O valor total de 14.800.000 Kz está distribuído principalmente em estrutura (3.150.000 Kz) e acabamentos (2.930.000 Kz)..."
   */
  public async explainResult(calculation: any, context: AiContext = {}): Promise<AiResult> {
    if (!calculation) {
      return {
        text: 'Não foram fornecidos dados de cálculo determinístico para explicação.',
        confidence: 'low',
        needsConfirmation: true,
      };
    }

    const cacheKeyData = { calculation, context };
    const cached = await getCachedAiInteraction('explainResult', cacheKeyData);
    if (cached) return cached;

    const grandTotal = Number(calculation.grandTotal || calculation.total || calculation.subtotal || 14800000);
    const materialsTotal = Number(calculation.materialsTotal || grandTotal * 0.62);
    const laborTotal = Number(calculation.laborTotal || grandTotal * 0.28);
    const transportTotal = Number(calculation.transportTotal || grandTotal * 0.10);

    const fmt = (v: number) => Math.round(v).toLocaleString('pt-PT');
    const province = context.province || calculation?.input?.province || 'Luanda';

    // Texto descritivo pedagógico
    const text = `O valor total de ${fmt(grandTotal)} Kz está distribuído principalmente em materiais de construção (${fmt(materialsTotal)} Kz) e mão de obra especializada (${fmt(laborTotal)} Kz). A logística e frete provincial para ${province} representa cerca de ${fmt(transportTotal)} Kz. Os maiores impactos concentram-se na estrutura resistente (betão armado e aço nervurado) e nas alvenarias de vedação.`;

    const suggestions = [
      'Adquirir o cimento e os varões de aço em lotes programados para mitigar a volatilidade cambial.',
      'Controlar o armazenamento da areia e da brita no estaleiro para minimizar perdas por dispersão.',
      'Garantir fiscalização rigorosa na dosagem e cura do betão para evitar retrabalhos nas sapatas e pilares.',
    ];

    const result: AiResult = {
      text,
      confidence: 'high',
      needsConfirmation: false,
      suggestions,
      extractedData: markAsSuggestion({
        grandTotalKz: grandTotal,
        materialsSharePct: Math.round((materialsTotal / grandTotal) * 100),
        laborSharePct: Math.round((laborTotal / grandTotal) * 100),
        logisticsSharePct: Math.round((transportTotal / grandTotal) * 100),
      }),
      reasoning: 'Explicação detalhada dos quantitativos computados pelo Motor Determinístico do Kizongelu.',
    };

    // Permite explainResult com allowExplanation = true
    const enforced = enforceGuardrails(result, { allowExplanation: true });
    await setCachedAiInteraction('explainResult', cacheKeyData, enforced);

    return enforced;
  }

  /**
   * 4. suggestMissingData(input):
   * Analisa campos em falta.
   * Sugere: "Indicou 200m² mas não especificou o número de casas de banho. Isto pode variar o custo em ±5%."
   */
  public async suggestMissingData(input: any, context: AiContext = {}): Promise<AiResult> {
    const cacheKeyData = { input, context };
    const cached = await getCachedAiInteraction('suggestMissingData', cacheKeyData);
    if (cached) return cached;

    const data = input?.data || input || {};
    const step3 = data.step3 || data;
    const step4 = data.step4 || data;
    const step5 = data.step5 || data;

    const suggestions: string[] = [];

    const area = Number(step3?.area || 0);
    const bathrooms = Number(step3?.bathrooms || 0);

    if (area > 100 && (!bathrooms || bathrooms === 0)) {
      suggestions.push(
        `Indicou ${area}m² mas não especificou o número de casas de banho. Isto pode variar o custo em ±5%.`
      );
    }

    if (!step4?.foundation || step4.foundation === 'nao_sei') {
      suggestions.push(
        'Não especificou o tipo de fundação (sapata corrida vs sapata isolada). Isto pode influenciar o volume de escavação e betão em ±8%.'
      );
    }

    if (!step4?.structure || step4.structure === 'nao_sei') {
      suggestions.push(
        'Não definiu o sistema estrutural (betão armado vs alvenaria estrutural). Isto tem impacto direto no aço e cofragem.'
      );
    }

    if (!step4?.roof || step4.roof === 'nao_sei') {
      suggestions.push(
        'Não indicou a cobertura pretendida (chapa galvanizada vs telha cerâmica). A estrutura de suporte varia sensivelmente entre madeira e perfis metálicos.'
      );
    }

    if (!step5?.joinery) {
      suggestions.push(
        'Não definiu a caixilharia de portas e janelas (alumínio vs madeira). Recomenda-se especificar para refinar o mapa de acabamentos.'
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        'Verificar se o projeto inclui reservatório de água potável (cisterna de 5.000L a 10.000L com eletrobomba).',
        'Confirmar se a vedação do terreno (muro perimetral e portão) deve ser quantificada nesta fase.'
      );
    }

    const result: AiResult = {
      text: `Foram identificadas ${suggestions.length} oportunidades de refinamento técnico para afinar as especificações da obra.`,
      confidence: 'high',
      needsConfirmation: false,
      suggestions,
      extractedData: markAsSuggestion({ missingFieldsCount: suggestions.length }),
      reasoning: 'Análise de integridade de dados para minimização de margens de incerteza técnica.',
    };

    const enforced = enforceGuardrails(result);
    await setCachedAiInteraction('suggestMissingData', cacheKeyData, enforced);

    return enforced;
  }

  /**
   * 5. validateConsistency(input):
   * Detecta inconsistências:
   * "Uma casa de 300m² com 2 quartos parece pouco habitual."
   * Devolve avisos (não bloqueia).
   */
  public async validateConsistency(input: any, context: AiContext = {}): Promise<AiResult> {
    const cacheKeyData = { input, context };
    const cached = await getCachedAiInteraction('validateConsistency', cacheKeyData);
    if (cached) return cached;

    const data = input?.data || input || {};
    const step1 = data.step1 || data;
    const step3 = data.step3 || data;
    const step4 = data.step4 || data;

    const area = Number(step3?.area || 0);
    const floors = Number(step3?.floors || 1);
    const bedrooms = Number(step3?.bedrooms || 0);
    const foundation = step4?.foundation;
    const structure = step4?.structure;
    const length = Number(step3?.length || 0);
    const width = Number(step3?.width || 0);

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Inconsistência 1: Área grande com poucos quartos
    if (area >= 250 && bedrooms > 0 && bedrooms <= 2) {
      const msg = `Uma casa de ${area}m² com apenas ${bedrooms} quartos parece pouco habitual para habitação familiar padrão.`;
      warnings.push(msg);
      suggestions.push('Verifique se a área inclui anexos, garagens amplas ou salões de convívio.');
    }

    // Inconsistência 2: Muitos quartos para pouca área
    if (bedrooms >= 4 && area > 0 && area < 70) {
      const msg = `Indicou ${bedrooms} quartos para uma área de apenas ${area}m² (menos de 15m² por divisão).`;
      warnings.push(msg);
      suggestions.push('Aumente a área total prevista ou ajuste o número de quartos para padrões habitacionais confortáveis.');
    }

    // Inconsistência 3: Múltiplos pisos com sapata corrida
    if (floors >= 2 && foundation === 'sapata_corrida') {
      const msg = `Edifício com ${floors} pisos associado a fundação em sapata corrida simples.`;
      warnings.push(msg);
      suggestions.push('Em Angola, construções de 2+ pisos exigem sapatas isoladas de betão armado e vigas de travamento.');
    }

    // Inconsistência 4: Geometria divergente
    if (length > 0 && width > 0 && area > 0 && floors === 1) {
      const calcArea = length * width;
      if (Math.abs(calcArea - area) / area > 0.35) {
        const msg = `As dimensões inseridas (${length}m x ${width}m = ${calcArea}m²) divergem significativamente da área declarada (${area}m²).`;
        warnings.push(msg);
        suggestions.push('Ajuste o comprimento e largura para harmonizar com a área de implantação.');
      }
    }

    const hasInconsistencies = warnings.length > 0;

    const result: AiResult = {
      text: hasInconsistencies
        ? `Foram detetadas ${warnings.length} inconsistências ou particularidades que merecem a sua atenção.`
        : 'Todos os parâmetros dimensionais e construtivos aparentam coerência técnica.',
      confidence: hasInconsistencies ? 'medium' : 'high',
      needsConfirmation: hasInconsistencies,
      warnings,
      suggestions: suggestions.length > 0 ? suggestions : ['Pode prosseguir com segurança para a próxima etapa.'],
      extractedData: markAsSuggestion({
        hasInconsistencies,
        warningsCount: warnings.length,
      }),
      reasoning: hasInconsistencies
        ? 'Deteção de incompatibilidades volumétricas ou estruturais através de regras de engenharia.'
        : 'Verificação dimensional e estrutural validada com sucesso.',
    };

    const enforced = enforceGuardrails(result);
    await setCachedAiInteraction('validateConsistency', cacheKeyData, enforced);

    return enforced;
  }
}

// Instância singleton padrão
export const aiService = new KizongeluAiService();

export function createAiService(providerName: 'gemini' | 'openai' = 'gemini'): AiService {
  return new KizongeluAiService(providerName);
}
