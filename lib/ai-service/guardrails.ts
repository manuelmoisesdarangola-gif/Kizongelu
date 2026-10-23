/**
 * @file lib/ai-service/guardrails.ts
 * Sistema de Guardrails e Segurança Cognitiva para a Camada de IA.
 * 
 * GUARDRAILS OBRIGATÓRIOS:
 * 1. Validar que a resposta nunca contém valores em Kz.
 * 2. Validar que a resposta nunca menciona "cálculo", "total", "preço final".
 * 3. Se violar, rejeitar e devolver confidence: 'low' e needsConfirmation: true.
 */

import { AiResult } from './types';

export const FORBIDDEN_WORDS = [
  { pattern: /\bkz\b/i, name: 'Kz' },
  { pattern: /\bkwanzas?\b/i, name: 'kwanza' },
  { pattern: /\baoa\b/i, name: 'AOA' },
  { pattern: /\bc[áa]lculo\b/i, name: 'cálculo' },
  { pattern: /\btotal\b/i, name: 'total' },
  { pattern: /\bpre[çc]o\s+final\b/i, name: 'preço final' },
];

export interface GuardrailValidation {
  valid: boolean;
  violations: string[];
}

/**
 * Valida se um texto contém termos proibidos pelo guardrail estrito.
 */
export function checkStrictGuardrails(text: string): GuardrailValidation {
  if (!text) return { valid: true, violations: [] };

  const violations: string[] = [];

  for (const item of FORBIDDEN_WORDS) {
    if (item.pattern.test(text)) {
      violations.push(item.name);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Cria uma resposta padrão de rejeição por violação de guardrail.
 */
export function createGuardrailRejection(reason: string): AiResult {
  return {
    text: 'A resposta violou as regras de segurança cognitiva de orçamentação e foi rejeitada por conter valores ou termos monetários restritos.',
    confidence: 'low',
    needsConfirmation: true,
    suggestions: [],
    extractedData: undefined,
    reasoning: `Rejeitado pelos guardrails de segurança do Kizongelu: foram detetados termos não autorizados (${reason}). A IA não calcula nem emite preços.`,
  };
}

/**
 * Garante que qualquer extractedData seja formalmente demarcado como sugestão.
 */
export function markAsSuggestion(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;

  return {
    ...data,
    isSuggestion: true,
    classificacao: 'sugestao',
    aviso: 'Sugerido pela IA — confirmar antes de calcular',
  };
}

/**
 * Aplica guardrails rigorosos a um AiResult.
 * Se o texto ou raciocínio contiver termos proibidos, a resposta é rejeitada e rebaixada para 'low'.
 */
export function enforceGuardrails(result: AiResult, options?: { allowExplanation?: boolean }): AiResult {
  // Se for explainResult explícito e autorizado, permite descrever os valores calculados
  if (options?.allowExplanation) {
    return {
      ...result,
      extractedData: markAsSuggestion(result.extractedData),
    };
  }

  // Verificação estrita para analyzeDescription, interpretDocument, suggestMissingData e validateConsistency
  const checkText = checkStrictGuardrails(result.text || '');
  const checkReasoning = checkStrictGuardrails(result.reasoning || '');

  const allViolations = Array.from(new Set([...checkText.violations, ...checkReasoning.violations]));

  if (allViolations.length > 0) {
    return createGuardrailRejection(allViolations.join(', '));
  }

  // Verifica também se o extractedData contém chaves proibidas de preço
  if (result.extractedData) {
    const forbiddenKeys = ['total', 'preco', 'custo', 'valortotal', 'precofinal', 'grandtotal'];
    for (const key of Object.keys(result.extractedData)) {
      if (forbiddenKeys.includes(key.toLowerCase())) {
        return createGuardrailRejection(`chave proibida no payload: ${key}`);
      }
    }
  }

  return {
    ...result,
    extractedData: markAsSuggestion(result.extractedData),
  };
}
