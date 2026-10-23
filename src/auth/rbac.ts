/**
 * @file src/auth/rbac.ts
 * Definições de RBAC (Controlo de Acesso Baseado em Funções) e quotas de utilizador.
 * 
 * Satisfaz as regras do sistema:
 * - Particular (12.999 Kz — 1 orçamento)
 * - Profissional (15.999 Kz — 3 orçamentos)
 * - Empresa (29.999 Kz — 6 orçamentos)
 * - Empresa Plus (49.999 Kz — 12 orçamentos)
 * - Admin (acesso irrestrito e gestão da base de preços)
 */

import { UserRole, UserProfile } from '../types/domain';

export interface PlanConfig {
  nome: string;
  precoKz: number;
  tipoPagamento: 'avulso' | 'mensal';
  limiteOrcamentos: number;
  descricao: string;
  suportePrioritario: boolean;
  exportacaoPDF: boolean;
  exportacaoExcel: boolean;
  logotipoPersonalizado: boolean;
}

export const PLANOS_CONFIG: Record<UserRole, PlanConfig> = {
  particular: {
    nome: 'Particular',
    precoKz: 12999,
    tipoPagamento: 'avulso',
    limiteOrcamentos: 1,
    descricao: 'Pacote de 12.999 Kz por 1 orçamento sem expiração.',
    suportePrioritario: false,
    exportacaoPDF: true,
    exportacaoExcel: false,
    logotipoPersonalizado: false,
  },
  profissional: {
    nome: 'Profissional',
    precoKz: 15999,
    tipoPagamento: 'avulso',
    limiteOrcamentos: 3,
    descricao: 'Pacote de 15.999 Kz com 3 orçamentos sem expiração.',
    suportePrioritario: false,
    exportacaoPDF: true,
    exportacaoExcel: true,
    logotipoPersonalizado: true,
  },
  empresa: {
    nome: 'Empresa',
    precoKz: 29999,
    tipoPagamento: 'avulso',
    limiteOrcamentos: 6,
    descricao: 'Pacote empresarial de 29.999 Kz com 6 orçamentos sem expiração.',
    suportePrioritario: true,
    exportacaoPDF: true,
    exportacaoExcel: true,
    logotipoPersonalizado: true,
  },
  empresa_plus: {
    nome: 'Empresa Plus',
    precoKz: 49999,
    tipoPagamento: 'avulso',
    limiteOrcamentos: 12,
    descricao: 'Pacote corporativo de 49.999 Kz com 12 orçamentos sem expiração.',
    suportePrioritario: true,
    exportacaoPDF: true,
    exportacaoExcel: true,
    logotipoPersonalizado: true,
  },
  admin: {
    nome: 'Administrador do Sistema',
    precoKz: 0,
    tipoPagamento: 'mensal',
    limiteOrcamentos: 999999,
    descricao: 'Gestão completa do sistema, base de dados de preços e utilizadores.',
    suportePrioritario: true,
    exportacaoPDF: true,
    exportacaoExcel: true,
    logotipoPersonalizado: true,
  },
};

export class RBACManager {
  /**
   * Valida se a função possui permissão para aceder à gestão da base de preços.
   * Apenas administradores podem alterar coeficientes e preços base.
   */
  public static canManagePriceDatabase(role: UserRole): boolean {
    return role === 'admin';
  }

  /**
   * Valida se o utilizador possui quota disponível para criar um novo orçamento.
   */
  public static canCreateBudget(user: UserProfile): { allowed: boolean; motivo?: string } {
    if (user.role === 'admin') {
      return { allowed: true };
    }

    if (user.orçamentosDisponiveis <= 0) {
      return {
        allowed: false,
        motivo: `Atingiu o limite de orçamentos do pacote ${user.plano}. Adquira um novo pacote de orçamentos para continuar a criar projectos.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Valida se um utilizador pode aceder a um registo específico de orçamento.
   * Satisfaz a Regra 4: "Isolamento por userId em todas as queries — nenhum user vê dados de outro".
   */
  public static canAccessBudget(userId: string, budgetOwnerId: string, role: UserRole): boolean {
    if (role === 'admin') {
      return true; // Administrador de suporte tem autorização de sistema
    }
    return userId === budgetOwnerId;
  }
}
