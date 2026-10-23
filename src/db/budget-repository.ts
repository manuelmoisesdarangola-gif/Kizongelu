/**
 * @file src/db/budget-repository.ts
 * Repositório de Orçamentos com isolamento estrito por `userId` e persistência local/memória.
 * 
 * Satisfaz a REGRA CRÍTICA 4: "Isolamento por userId em todas as queries — nenhum user vê dados de outro."
 * Satisfaz a REGRA CRÍTICA 5: "Validação Zod em TODOS os inputs de API."
 */

import { BudgetRecord } from '../types/domain';
import { budgetCreationSchema, BudgetCreationInput } from '../schemas/budget-schema';
import { CalculationEngine } from '../engine/calculation-engine';

const STORAGE_KEY_BUDGETS = 'Kizongelu_budgets_store_v1';

// Dados de semente para demonstração com isolamento real
const INITIAL_SEED_BUDGETS: BudgetRecord[] = [
  {
    id: 'orc-001',
    userId: 'user-particular-01',
    titulo: 'Construção de Moradia T3 - Viana',
    clienteNome: 'Manuel Kiala',
    clienteTelefone: '+244 923 456 789',
    provincia: 'luanda',
    localizacaoExata: 'Viana, Projecto Morar Mais',
    areaEstimadaM2: 180,
    tipoConstrucao: 'habitacional_unifamiliar',
    itens: [
      { artigoId: 'art-001', quantidade: 350 },
      { artigoId: 'art-003', quantidade: 45 },
      { artigoId: 'art-004', quantidade: 6 },
      { artigoId: 'art-005', quantidade: 28 },
      { artigoId: 'art-006', quantidade: 3200 },
      { artigoId: 'art-007', quantidade: 140 },
      { artigoId: 'art-008', quantidade: 210 },
      { artigoId: 'art-011', quantidade: 195 },
      { artigoId: 'art-013', quantidade: 480 },
      { artigoId: 'art-015', quantidade: 160 },
      { artigoId: 'art-016', quantidade: 24 },
      { artigoId: 'art-017', quantidade: 36 },
      { artigoId: 'art-018', quantidade: 1 },
      { artigoId: 'art-019', quantidade: 14 },
      { artigoId: 'art-020', quantidade: 12 },
      { artigoId: 'art-021', quantidade: 1 },
      { artigoId: 'art-024', quantidade: 480 },
      { artigoId: 'art-025', quantidade: 220 },
    ],
    status: 'calculado',
    observacoes: 'Orçamento com materiais de primeira qualidade e acabamentos cerâmicos retificados.',
    dataCriacao: '2026-03-12T10:00:00.000Z',
    dataAtualizacao: '2026-03-12T10:30:00.000Z',
  },
  {
    id: 'orc-002',
    userId: 'user-prof-01',
    titulo: 'Armazém Comercial e Escritórios - Lobito',
    clienteNome: 'Comércio Geral do Lobito Lda.',
    clienteTelefone: '+244 912 888 123',
    provincia: 'benguela',
    localizacaoExata: 'Zona Industrial da Catumbela / Lobito',
    areaEstimadaM2: 450,
    tipoConstrucao: 'comercial',
    itens: [
      { artigoId: 'art-001', quantidade: 800 },
      { artigoId: 'art-002', quantidade: 120 },
      { artigoId: 'art-003', quantidade: 110 },
      { artigoId: 'art-005', quantidade: 65 },
      { artigoId: 'art-006', quantidade: 7800 },
      { artigoId: 'art-009', quantidade: 420 },
      { artigoId: 'art-010', quantidade: 450 },
      { artigoId: 'art-011', quantidade: 460 },
      { artigoId: 'art-018', quantidade: 2 },
    ],
    status: 'aprovado',
    observacoes: 'Etapa de fundações e estrutura metálica de alta resistência para armazém.',
    dataCriacao: '2026-03-15T14:20:00.000Z',
    dataAtualizacao: '2026-03-15T16:00:00.000Z',
  },
  {
    id: 'orc-003',
    userId: 'user-empresa-01',
    titulo: 'Reabilitação Edifício Multifamiliar - Lubango',
    clienteNome: 'Imobiliária Chela Sul',
    clienteTelefone: '+244 934 111 222',
    provincia: 'huila',
    localizacaoExata: 'Bairro Comercial, Lubango',
    areaEstimadaM2: 320,
    tipoConstrucao: 'reabilitacao',
    itens: [
      { artigoId: 'art-013', quantidade: 640 },
      { artigoId: 'art-014', quantidade: 320 },
      { artigoId: 'art-015', quantidade: 320 },
      { artigoId: 'art-016', quantidade: 42 },
      { artigoId: 'art-017', quantidade: 58 },
      { artigoId: 'art-024', quantidade: 750 },
      { artigoId: 'art-025', quantidade: 420 },
    ],
    status: 'em_execucao',
    observacoes: 'Substituição integral de pavimentos e nova pintura exterior lavável.',
    dataCriacao: '2026-03-18T09:15:00.000Z',
    dataAtualizacao: '2026-03-18T11:45:00.000Z',
  },
];

export class BudgetRepository {
  private static getStoredBudgets(): BudgetRecord[] {
    if (typeof window === 'undefined') {
      return INITIAL_SEED_BUDGETS.map((b) => this.attachCalculation(b));
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (data) {
        const parsed: unknown = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return (parsed as BudgetRecord[]).map((b) => this.attachCalculation(b));
        }
      }
    } catch {
      // Fallback
    }

    const initialWithCalc = INITIAL_SEED_BUDGETS.map((b) => this.attachCalculation(b));
    this.saveBudgets(initialWithCalc);
    return initialWithCalc;
  }

  private static saveBudgets(budgets: BudgetRecord[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    }
  }

  private static attachCalculation(budget: BudgetRecord): BudgetRecord {
    const calc = CalculationEngine.calculate({
      provincia: budget.provincia,
      itens: budget.itens,
    });
    return {
      ...budget,
      calculo: calc,
    };
  }

  /**
   * Obtém orçamentos com isolamento estrito por `userId`.
   * Um utilizador com role diferente de 'admin' NUNCA tem acesso aos orçamentos de outros.
   */
  public static getByUserId(userId: string, userRole: string): BudgetRecord[] {
    const all = this.getStoredBudgets();
    if (userRole === 'admin') {
      return all;
    }
    return all.filter((budget) => budget.userId === userId);
  }

  /**
   * Obtém um orçamento específico garantindo a titularidade do utilizador.
   */
  public static getById(id: string, userId: string, userRole: string): BudgetRecord | null {
    const all = this.getStoredBudgets();
    const found = all.find((b) => b.id === id);
    if (!found) return null;

    if (userRole !== 'admin' && found.userId !== userId) {
      throw new Error('Acesso negado: Tentativa de aceder a orçamento pertencente a outro utilizador.');
    }

    return found;
  }

  /**
   * Cria um orçamento com validação Zod e associa ao `userId` autenticado.
   */
  public static create(input: unknown, userId: string): BudgetRecord {
    // Validação estrita Zod
    const validated: BudgetCreationInput = budgetCreationSchema.parse(input);

    const newRecord: BudgetRecord = {
      id: 'orc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      titulo: validated.titulo,
      clienteNome: validated.clienteNome,
      clienteTelefone: validated.clienteTelefone,
      provincia: validated.provincia,
      localizacaoExata: validated.localizacaoExata,
      areaEstimadaM2: validated.areaEstimadaM2,
      tipoConstrucao: validated.tipoConstrucao,
      itens: validated.itens,
      status: 'calculado',
      observacoes: validated.observacoes,
      dataCriacao: new Date().toISOString(),
      dataAtualizacao: new Date().toISOString(),
    };

    const recordWithCalc = this.attachCalculation(newRecord);
    const all = this.getStoredBudgets();
    all.unshift(recordWithCalc);
    this.saveBudgets(all);

    return recordWithCalc;
  }

  /**
   * Atualiza o estado de um orçamento mantendo isolamento.
   */
  public static updateStatus(
    id: string,
    novoStatus: BudgetRecord['status'],
    userId: string,
    userRole: string
  ): BudgetRecord {
    const all = this.getStoredBudgets();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Orçamento não encontrado.');
    }

    const budget = all[index];
    if (userRole !== 'admin' && budget.userId !== userId) {
      throw new Error('Acesso negado: Não pode alterar orçamentos de outros utilizadores.');
    }

    budget.status = novoStatus;
    budget.dataAtualizacao = new Date().toISOString();
    all[index] = budget;
    this.saveBudgets(all);

    return budget;
  }

  /**
   * Elimina um orçamento mantendo isolamento estrito.
   */
  public static delete(id: string, userId: string, userRole: string): void {
    const all = this.getStoredBudgets();
    const index = all.findIndex((b) => b.id === id);
    if (index === -1) {
      throw new Error('Orçamento não encontrado.');
    }

    const budget = all[index];
    if (userRole !== 'admin' && budget.userId !== userId) {
      throw new Error('Acesso negado: Não tem permissão para eliminar este orçamento.');
    }

    all.splice(index, 1);
    this.saveBudgets(all);
  }
}
