/**
 * @file src/types/domain.ts
 * Tipos de domínio e interfaces centrais da plataforma Kizongelu.
 * Estrito TypeScript, sem recurso ao tipo `any`.
 */

export type UserRole = 'particular' | 'profissional' | 'empresa' | 'empresa_plus' | 'admin';

export type AngolaProvince =
  | 'luanda'
  | 'bengo'
  | 'benguela'
  | 'bie'
  | 'cabinda'
  | 'cuando'
  | 'cubango'
  | 'cuanza-norte'
  | 'cuanza-sul'
  | 'cunene'
  | 'huambo'
  | 'huila'
  | 'icolo-e-bengo'
  | 'lunda-norte'
  | 'lunda-sul'
  | 'malanje'
  | 'moxico'
  | 'moxico-leste'
  | 'namibe'
  | 'uige'
  | 'zaire';

export interface ProvinceData {
  id: AngolaProvince;
  nome: string;
  capital: string;
  coeficienteLogistica: number; // Coeficiente multiplicador sobre materiais devido a frete/distância
  coeficienteMaoDeObra: number; // Coeficiente de ajuste salarial regional
}

export type WorkCategory =
  | 'estaleiro_demolicoes'
  | 'fundacoes_estruturas'
  | 'alvenarias_paredes'
  | 'coberturas_impermeabilizacoes'
  | 'revestimentos_acabamentos'
  | 'instalacoes_eletricas'
  | 'instalacoes_hidraulicas'
  | 'carpintarias_serralharias'
  | 'pinturas';

export type MeasurementUnit = 'm²' | 'm³' | 'm' | 'kg' | 'saco_50kg' | 'un' | 'h' | 'dia' | 'vg' | 'ton';

export interface PriceItem {
  id: string;
  codigo: string;
  descricao: string;
  categoria: WorkCategory;
  unidade: MeasurementUnit;
  precoBaseKz: number; // Preço de referência em Luanda (Kz)
  custoMaterialKz: number;
  custoMaoDeObraKz: number;
  custoEquipamentoKz: number;
  rendimentoHomemHora: number; // Horas de trabalho por unidade produzida
  dataAtualizacao: string;
  ativo?: boolean;
}

export interface BudgetItemInput {
  artigoId: string;
  quantidade: number;
  notas?: string;
}

export interface CalculatedBudgetItem {
  artigoId: string;
  codigo: string;
  descricao: string;
  categoria: WorkCategory;
  unidade: MeasurementUnit;
  quantidade: number;
  precoUnitarioKz: number; // Preço unitário ajustado à província
  custoMaterialKz: number;
  custoMaoDeObraKz: number;
  custoEquipamentoKz: number;
  subtotalKz: number;
  horasEstimadasTrabalho: number;
  notas?: string;
}

export interface BudgetChapterSummary {
  categoria: WorkCategory;
  nomeCategoria: string;
  itens: CalculatedBudgetItem[];
  subtotalMateriaisKz: number;
  subtotalMaoDeObraKz: number;
  subtotalEquipamentosKz: number;
  subtotalGeralKz: number;
}

export interface BudgetCalculationResult {
  custoDiretoMateriaisKz: number;
  custoDiretoMaoDeObraKz: number;
  custoDiretoEquipamentosKz: number;
  custoDiretoTotalKz: number;
  taxaBDI: number; // Percentagem de Benefícios e Despesas Indiretas (ex.: 0.22 para 22%)
  valorBDIKz: number;
  taxaEncargosSociais: number; // Percentagem de encargos sobre mão de obra (ex.: 0.25 para 25%)
  valorEncargosSociaisKz: number;
  taxaIVA: number; // Taxa de IVA de Angola (ex.: 0.14 para 14% ou 0% se isento)
  valorIVAKz: number;
  precoTotalFinalKz: number;
  totalHorasTrabalhoEstimadas: number;
  diasEstimadosObra: number; // Baseado em equipa padrão de 6 operários com 8h/dia
  capitulos: BudgetChapterSummary[];
}

export type BudgetStatus = 'rascunho' | 'calculado' | 'aprovado' | 'em_execucao' | 'concluido';

export interface BudgetRecord {
  id: string;
  userId: string;
  titulo: string;
  clienteNome: string;
  clienteTelefone: string;
  provincia: AngolaProvince;
  localizacaoExata: string;
  areaEstimadaM2: number;
  tipoConstrucao: 'habitacional_unifamiliar' | 'habitacional_multifamiliar' | 'comercial' | 'reabilitacao';
  itens: BudgetItemInput[];
  calculo?: BudgetCalculationResult;
  status: BudgetStatus;
  observacoes: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface UserProfile {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: UserRole;
  plano: string;
  orçamentosDisponiveis: number;
  orçamentosRealizados: number;
  empresaNome?: string;
  nif?: string;
}
