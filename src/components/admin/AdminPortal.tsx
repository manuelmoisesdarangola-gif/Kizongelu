/**
 * @file src/components/admin/AdminPortal.tsx
 * LAYOUT 4 — PORTAL ADMINISTRATIVO DO Kizongelu (Fase 10).
 * 
 * Orquestrador Central com Roteamento Integral:
 * - /admin (dashboard com 5 KPIs, receita 30 dias SVG, províncias, donut utilizadores, alertas)
 * - /admin/utilizadores (tabela, perfis, alterar role com motivo, suspender, assumir sessão)
 * - /admin/projectos (supervisão de projetos e status)
 * - /admin/orcamentos (mapas de quantidades e valores globais)
 * - /admin/pagamentos (filtros, tabela, modais de aprovação com preview e rejeição com motivo)
 * - /admin/assinaturas (planos, alterar plano manualmente, estender período)
 * - /admin/precos (base nacional de preços, importação CSV, duplicação por província, evolução temporal)
 * - /admin/formulas (accordion por categoria, edição inline, sticky bar, modal com motivo)
 * - /admin/formulas/versoes (histórico de versões, duplicação em rascunho, ativação com confirmação dupla)
 * - /admin/auditoria (filtros, tabela com descrição humana, drawer com diff lado a lado)
 * - /admin/definicoes (coordenadas bancárias oficiais, WhatsApp de suporte, visibilidade pública de preços)
 */

import React, { useState } from 'react';
import { AdminLayout, AdminNavSection } from '../../layouts/AdminLayout';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';

// Componentes Administrativos Especializados
import { AdminDashboard } from './AdminDashboard';
import { AdminPayments } from './AdminPayments';
import { PriceDatabaseManager } from './PriceDatabaseManager';
import { AdminFormulas } from './AdminFormulas';
import { AdminEngineVersions } from './AdminEngineVersions';
import { AdminAudit } from './AdminAudit';
import { AdminUsers } from './AdminUsers';
import { AdminPackages } from './AdminPackages';
import { AdminSettings } from './AdminSettings';
import { AdminProjectsAndBudgets } from './AdminProjectsAndBudgets';
import { AdminNotifications } from './AdminNotifications';
import { MotorSimuladorPage } from './MotorSimuladorPage';
import { AdminCertificacaoPage } from './AdminCertificacaoPage';
import { ProductionChecklistPage } from './ProductionChecklistPage';
import { AdminMaterials } from './AdminMaterials';

interface AdminPortalProps {
  initialSection?: AdminNavSection;
  onSectionChange?: (section: AdminNavSection) => void;
  onBackToApp: () => void;
  onNavigateToPublic: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  initialSection = 'dashboard',
  onSectionChange,
  onBackToApp,
  onNavigateToPublic,
}) => {
  const { currentUser } = useAuth();
  const [currentSection, setCurrentSection] = useState<AdminNavSection>(initialSection);
  const [reviewPaymentId, setReviewPaymentId] = useState<string | null>(null);

  React.useEffect(() => {
    setCurrentSection(initialSection);
  }, [initialSection]);

  const handleSectionNavigate = (sec: AdminNavSection) => {
    setCurrentSection(sec);
    onSectionChange?.(sec);
  };

  const sectionTitles: Record<AdminNavSection, string> = {
    dashboard: 'Painel Central Executivo de Controlo',
    utilizadores: 'Gestão de Utilizadores e Controlo de Acesso (RBAC)',
    projectos: 'Supervisão de Projectos Cadastrados',
    orcamentos: 'Mapas de Quantidades e Orçamentos Emitidos',
    pagamentos: 'Validação de Pagamentos Multicaixa Express e Transferências',
    assinaturas: 'Planos, Faturação e Pacotes',
    precos: 'Base de Preços e Materiais de Construção (Angola)',
    materiais: 'Catálogo de Materiais e Insumos do Motor (Angola)',
    formulas: 'Fórmulas Determinísticas de Engenharia',
    'formulas-versoes': 'Histórico de Versões do Motor',
    'motor-simulador': 'Simulador Paramétrico de Fórmulas e Teste A/B',
    'motor-certificacao': 'Responsabilidade Técnica do Motor',
    auditoria: 'Auditoria de Segurança e Registos de Acesso',
    'checklist-producao': 'Checklist Final de Produção & Verificação de Deploy',
    notificacoes: 'Gestor Central de Notificações Multicanal',
    definicoes: 'Configurações Globais do Sistema e Coordenadas Bancárias',
  };

  // Dados sintéticos de pagamentos para alimentar os contadores do topo e dashboard
  const pendingPaymentsSample = [
    {
      id: 'pay_001',
      projectId: 'proj_sample_01',
      projectName: 'Moradia T3 no Kilamba',
      clientName: 'Eng. João Baptista',
      amount: 12999,
      method: 'MULTICAIXA_EXPRESS',
      reference: 'KZ-2026-8421',
      status: 'PENDING_APPROVAL',
      submittedAt: 'Hoje, 16:47',
      packageType: 'Particular',
    },
    {
      id: 'pay_002',
      projectId: 'proj_sample_02',
      projectName: 'Armazém Industrial em Viana',
      clientName: 'Eng. Arnaldo Silva',
      amount: 49999,
      method: 'TRANSFERENCIA',
      reference: 'KZ-2026-3190',
      status: 'PENDING_APPROVAL',
      submittedAt: 'Hoje, 15:02',
      packageType: 'Empresa Plus',
    },
    {
      id: 'pay_003',
      projectId: 'proj_sample_03',
      projectName: 'Vivenda T4 no Talatona',
      clientName: 'Dra. Teresa Van-Dúnem',
      amount: 12999,
      method: 'MULTICAIXA_EXPRESS',
      reference: 'KZ-2026-5512',
      status: 'PENDING_APPROVAL',
      submittedAt: 'Hoje, 14:15',
      packageType: 'Particular',
    },
  ];

  const sectionBreadcrumbLabels: Partial<Record<AdminNavSection, string>> = {
    dashboard: 'Dashboard',
    utilizadores: 'Utilizadores',
    projectos: 'Projectos',
    orcamentos: 'Orçamentos',
    pagamentos: 'Pagamentos',
    assinaturas: 'Pacotes',
    precos: 'Preços (BPU)',
    materiais: 'Materiais',
    formulas: 'Fórmulas',
    'formulas-versoes': 'Versões do Motor',
    'motor-simulador': 'Simulador',
    'motor-certificacao': 'Responsabilidade Técnica',
    auditoria: 'Auditoria',
    'checklist-producao': 'Checklist Técnico',
    notificacoes: 'Notificações',
    definicoes: 'Definições',
  };

  return (
    <AdminLayout
      currentSection={currentSection}
      pageTitle={sectionTitles[currentSection] || 'Administração'}
      breadcrumbs={[
        { label: 'Administração' },
        { label: sectionBreadcrumbLabels[currentSection] || 'Dashboard' },
      ]}
      pendingPaymentsCount={3}
      onNavigate={handleSectionNavigate}
      onBackToApp={onBackToApp}
    >
      {/* 1. SECÇÃO: DASHBOARD */}
      {currentSection === 'dashboard' && (
        <AdminDashboard
          onNavigateToSection={handleSectionNavigate}
          pendingCount={3}
          paymentsList={pendingPaymentsSample}
          onReviewPayment={(id) => {
            setReviewPaymentId(id);
            handleSectionNavigate('pagamentos');
          }}
        />
      )}

      {/* 2. SECÇÃO: UTILIZADORES (RBAC) */}
      {currentSection === 'utilizadores' && <AdminUsers />}

      {/* 3. SECÇÃO: PROJECTOS */}
      {currentSection === 'projectos' && (
        <AdminProjectsAndBudgets
          mode="projects"
          onNavigateToProject={() => onBackToApp()}
        />
      )}

      {/* 4. SECÇÃO: ORÇAMENTOS */}
      {currentSection === 'orcamentos' && (
        <AdminProjectsAndBudgets
          mode="budgets"
          onNavigateToProject={() => onBackToApp()}
        />
      )}

      {/* 5. SECÇÃO: PAGAMENTOS */}
      {currentSection === 'pagamentos' && (
        <AdminPayments
          initialPaymentIdToReview={reviewPaymentId}
          onClearInitialReview={() => setReviewPaymentId(null)}
        />
      )}

      {/* 6. SECÇÃO: ASSINATURAS / PACOTES */}
      {currentSection === 'assinaturas' && <AdminPackages />}

      {/* 7. SECÇÃO: PREÇOS (BPU) */}
      {currentSection === 'precos' && (
        <PriceDatabaseManager
          onBack={onBackToApp}
          onNavigateToSection={handleSectionNavigate}
        />
      )}

      {/* 7.1. SECÇÃO: MATERIAIS ISOLADOS DO MOTOR */}
      {currentSection === 'materiais' && (
        <AdminMaterials
          onNavigateToSection={handleSectionNavigate}
          onBackToPrecos={() => handleSectionNavigate('precos')}
        />
      )}

      {/* 8. SECÇÃO: FÓRMULAS DETERMINÍSTICAS */}
      {currentSection === 'formulas' && (
        <AdminFormulas
          onNavigateToVersions={() => handleSectionNavigate('formulas-versoes')}
        />
      )}

      {/* 8.1. SUB-SECÇÃO: VERSÕES DO MOTOR */}
      {currentSection === 'formulas-versoes' && (
        <AdminEngineVersions
          onBackToFormulas={() => handleSectionNavigate('formulas')}
        />
      )}

      {/* 8.2. SUB-SECÇÃO: SIMULADOR DO MOTOR */}
      {currentSection === 'motor-simulador' && <MotorSimuladorPage />}

      {/* 8.3. SUB-SECÇÃO: CERTIFICAÇÃO DO MOTOR */}
      {currentSection === 'motor-certificacao' && <AdminCertificacaoPage />}

      {/* 9. SECÇÃO: AUDITORIA */}
      {currentSection === 'auditoria' && <AdminAudit />}

      {/* 9.1. SECÇÃO: CHECKLIST FINAL DE PRODUÇÃO & DEPLOY (FASE 18) */}
      {currentSection === 'checklist-producao' && <ProductionChecklistPage />}

      {/* 9.2. SECÇÃO: NOTIFICAÇÕES (FASE 12) */}
      {currentSection === 'notificacoes' && <AdminNotifications />}

      {/* 10. SECÇÃO: DEFINIÇÕES */}
      {currentSection === 'definicoes' && <AdminSettings />}
    </AdminLayout>
  );
};

export default AdminPortal;
