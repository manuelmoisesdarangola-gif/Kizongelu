/**
 * @file lib/ai-service/types.ts
 * Definições de tipos e interfaces estritas para a Camada de IA Desacoplada do Kizongelu.
 * 
 * PRINCÍPIO CARDINAL:
 * A IA atua única e exclusivamente como camada de assistência cognitiva:
 * interpreta texto/documentos, sugere dados em falta, valida consistência técnica e explica cálculos.
 * A IA NUNCA calcula nem define preços ou quantitativos finais.
 */

export interface AiContext {
  userId?: string;
  projectId?: string;
  province?: string;
  municipality?: string;
  projectType?: string;
  projectTitle?: string;
  currency?: string;
  language?: string; // padrão: 'pt-AO'
  clientType?: 'particular' | 'profissional' | 'empresa' | 'admin';
  additionalData?: Record<string, unknown>;
}

export type AiConfidence = 'high' | 'medium' | 'low';

/**
 * Interface principal solicitada:
 * AiResult:
 * {
 *   text: string,
 *   confidence: 'high' | 'medium' | 'low',
 *   needsConfirmation: boolean,
 *   suggestions?: string[],
 *   extractedData?: Record<string, any>, // sempre marcado como "sugestão"
 *   reasoning?: string
 * }
 */
export interface AiResult {
  text: string;
  confidence: AiConfidence;
  needsConfirmation: boolean;
  suggestions?: string[];
  extractedData?: Record<string, any>; // sempre marcado como "sugestão"
  reasoning?: string;
  warnings?: string[];
  documentInsights?: {
    documentType?: 'planta' | 'croqui' | 'foto' | 'memoria_descritiva' | 'outro';
    dimensionsVisible?: boolean;
    estimatedMeasures?: Record<string, string | number>;
    rawNotes?: string;
  };
}

export interface AiWarning {
  code: string;
  field?: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface AiProvider {
  name: string;
  isAvailable(): boolean;
  generateText(prompt: string, options?: { systemInstruction?: string; temperature?: number }): Promise<string>;
  generateStructured<T>(prompt: string, schemaDescription: string, options?: { systemInstruction?: string; temperature?: number }): Promise<T>;
}

export interface AiService {
  analyzeDescription(text: string, context?: AiContext): Promise<AiResult>;
  interpretDocument(fileUrl: string, context?: AiContext): Promise<AiResult>;
  explainResult(calculation: any, context?: AiContext): Promise<AiResult>;
  suggestMissingData(input: any, context?: AiContext): Promise<AiResult>;
  validateConsistency(input: any, context?: AiContext): Promise<AiResult>;
}
