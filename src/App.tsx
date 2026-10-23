/**
 * @file src/App.tsx
 * Kizongelu — Arquitectura de 4 Layouts Distintos com Sistema Integral de Rotas e Guards.
 * 
 * 1. PÚBLICO (sem auth):
 *    - /, /como-funciona, /precos, /blog, /blog/:slug, /sobre, /contactos,
 *      /termos, /privacidade, /cookies, /aviso-tecnico, /ferramentas,
 *      /ferramentas/:slug, /verificar, /verificar/:token
 * 
 * 2. AUTH:
 *    - /entrar, /criar-conta, /recuperar, /redefinir/:token, /confirmar-email/:token
 * 
 * 3. APP (requer login):
 *    - /painel, /projetos, /projetos/:id, /projetos/:id/preview,
 *      /projetos/:id/desbloquear, /wizard/:projectId, /pagamentos, /plano,
 *      /documentos, /definicoes, /equipa, /notificacoes
 * 
 * 4. ADMIN (requer role=admin):
 *    - /admin, /admin/pagamentos, /admin/precos, /admin/formulas,
 *      /admin/auditoria, /admin/utilizadores, /admin/assinaturas, /admin/definicoes
 * 
 * GUARDS:
 * - Layout APP redirecciona para /entrar se não autenticado.
 * - Layout ADMIN redirecciona para /painel se role ≠ admin (e para /entrar se não autenticado).
 * - Layout AUTH redirecciona para /painel se já autenticado.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './auth/auth-context';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import { normalizeAppPath, buildExternalUrl } from './lib/router-utils';

// 1. Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout, AppNavSection } from './layouts/AppLayout';

// 2. Componentes do Layout 1 (Público)
import { PublicLandingPage } from './components/public/PublicLandingPage';
import {
  ComoFuncionaPage,
  PrecosPage,
  BlogPage,
  ContactosPage,
  SobrePage,
  FerramentasPage,
} from './components/public/PublicSubPages';
import { BlogArticlePage } from './components/public/BlogArticlePage';
import { FerramentaDetalhePage } from './components/public/FerramentaDetalhePage';
import { ProvinciaPage } from './components/public/ProvinciaPage';
import { PublicVerificationView } from './components/public/PublicVerificationView';
import { FaqPage } from './components/public/FaqPage';

// Páginas Legais Completas (Fase 16)
import { TermosPage } from './components/legal/TermosPage';
import { PrivacidadePage } from './components/legal/PrivacidadePage';
import { CookiesPage } from './components/legal/CookiesPage';
import { AvisoTecnicoPage } from './components/legal/AvisoTecnicoPage';
import { ReembolsosPage } from './components/legal/ReembolsosPage';
import { UtilizacaoAceitavelPage } from './components/legal/UtilizacaoAceitavelPage';
import { ConformidadePage } from './components/legal/ConformidadePage';
import { AcessibilidadePage } from './components/legal/AcessibilidadePage';
import { PoliticaIAPage } from './components/legal/PoliticaIAPage';
import { SegurancaPage } from './components/legal/SegurancaPage';

// Páginas Institucionais (Fase 16)
import {
  CarreirasPage,
  ParceirosPage,
  ImprensaPage,
  EstadoSistemaPage,
} from './components/public/InstitutionalPages';

// Componentes da Fase 17: Transparência do Motor e Auditoria Técnica
import { MotorCalculoPage } from './components/public/MotorCalculoPage';
import { PrecosAngolaPage } from './components/public/PrecosAngolaPage';
import { PrecosIndicePage } from './components/public/PrecosIndicePage';
import { ProjetoAuditoriaPage } from '../app/(app)/projeto/[id]/auditoria/page';

// Páginas de Gestão de Privacidade & Direitos (Fase 16)
import { ConsentimentosSettingsPage } from './components/privacy-settings/ConsentimentosSettingsPage';
import { ExportarDadosSettingsPage } from './components/privacy-settings/ExportarDadosSettingsPage';
import { ApagarContaSettingsPage } from './components/privacy-settings/ApagarContaSettingsPage';

// 3. Componentes do Layout 2 (Autenticação)
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { RecoverPasswordPage } from './components/auth/RecoverPasswordPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ConfirmEmailPage } from './components/auth/ConfirmEmailPage';

// 4. Componentes do Layout 3 (Aplicação)
import { PainelPage } from '../app/(app)/painel/page';
import { ProjetoListPage } from '../app/(app)/projeto/page';
import { ProjetoDetailPage } from '../app/(app)/projeto/[id]/page';
import { ProjectPreviewPage } from '../app/(app)/projeto/[projectId]/preview/page';
import { PaymentUnlockPage } from './components/payment/PaymentUnlockPage';
import { WizardOrchestratorPage } from '../app/(app)/wizard/[projectId]/page';
import { PagamentosPage } from '../app/(app)/pagamentos/page';
import { PlanoPage } from '../app/(app)/plano/page';
import { DefinicoesPage } from '../app/(app)/definicoes/page';
import { DocumentosPage } from '../app/(app)/documentos/page';
import { EquipaPage } from '../app/(app)/equipa/page';
import { NotificacoesPage } from '../app/(app)/notificacoes/page';
import { BudgetWizard } from './components/budget/BudgetWizard';

// Componentes da Fase 13: Subscrições e Faturação
import { RenovarPlanoPage } from '../app/(app)/plano/renovar/page';
import { CancelarPlanoPage } from '../app/(app)/plano/cancelar/page';
import { FaturaDetalhePage } from '../app/(app)/plano/facturas/[id]/page';
import { ConvitePage } from '../app/(app)/convite/[token]/page';
import { QuotaExceededModal } from './components/subscriptions/QuotaExceededModal';
import { incrementBudgetUsage } from '@/lib/actions/subscriptions';
import { getUserCredits } from '@/lib/actions/packages';

// Componentes da Fase 14: Onboarding, Ajuda & Feedback
import { BemVindoPage } from './components/onboarding/BemVindoPage';
import { BemVindoPerfilPage } from './components/onboarding/BemVindoPerfilPage';
import { BemVindoComecarPage } from './components/onboarding/BemVindoComecarPage';
import { BemVindoEmpresaPage } from './components/onboarding/BemVindoEmpresaPage';
import { AjudaPage } from './components/onboarding/AjudaPage';
import { FeedbackModal } from './components/onboarding/FeedbackModal';

// 5. Componentes do Layout 4 (Administração)
import { AdminPortal } from './components/admin/AdminPortal';
import { AdminNavSection } from './layouts/AdminLayout';

import { X } from 'lucide-react';

const queryClient = new QueryClient();

export type CurrentLayout = 'public' | 'auth' | 'app' | 'admin';

/**
 * Componente utilitário para executar redirecionamento seguro dos Guards.
 */
const RedirectGuard: React.FC<{
  to: string;
  message?: string;
  toastType?: 'error' | 'info';
  onRedirect: (to: string) => void;
}> = ({ to, message, toastType, onRedirect }) => {
  const { error: toastError, info: toastInfo } = useToast();

  useEffect(() => {
    if (message) {
      if (toastType === 'error') {
        toastError('Acesso Restrito', message);
      } else {
        toastInfo(message, 'Autenticação Necessária');
      }
    }
    onRedirect(to);
  }, [to, message, toastType, onRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-9 h-9 border-3 border-[#0F3D5C] border-t-[#F59E0B] rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">A redirecionar...</span>
      </div>
    </div>
  );
};

const MainRoutingManager: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { success } = useToast();

  // Estado Central de Rota (Normalizado para suportar GitHub Pages e subdirectórios)
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return normalizeAppPath(window.location.pathname, window.location.hash);
    }
    return '/';
  });

  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{ id: string; name: string } | null>(null);

  // Gestão de Bloqueio por Falta de Créditos de Pacotes
  const [isQuotaExceededModalOpen, setIsQuotaExceededModalOpen] = useState(false);

  // Navegação universal com sincronização do histórico do navegador e suporte a subdirectórios
  const navigateTo = useCallback((path: string) => {
    const normalizedTarget = normalizeAppPath(path);
    const externalUrl = buildExternalUrl(normalizedTarget);
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname + window.location.search !== externalUrl) {
          window.history.pushState({}, '', externalUrl);
        }
      } catch (e) {
        // Fallback para sandbox/iframe
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPath(normalizedTarget);
  }, []);

  // Abre o Wizard guiado de 7 etapas a partir de um novo projectId
  const handleOpenNewBudget = useCallback(() => {
    const newProjectId = `proj_${Date.now()}`;
    navigateTo(`/wizard/${newProjectId}/etapa-1`);
  }, [navigateTo]);

  // Abertura do Construtor Manual de Orçamentos (opção secundária)
  const handleOpenManualConstructor = useCallback(() => {
    setIsNewBudgetModalOpen(true);
  }, []);

  // Centraliza o início do Wizard de 7 etapas (Opção A: navegação directa sem conta)
  const handleStartWizard = useCallback((options?: any) => {
    if (options && typeof options === 'object') {
      if (options.tipo) {
        try {
          sessionStorage.setItem('kizongelu_preset_type', options.tipo);
          if (options.subtipo) sessionStorage.setItem('kizongelu_preset_subtype', options.subtipo);
          if (options.step) sessionStorage.setItem('kizongelu_preset_step', String(options.step));
        } catch {}
      }
    } else if (typeof options === 'string') {
      try {
        sessionStorage.setItem('kizongelu_preset_province', options);
      } catch {}
    } else {
      try {
        sessionStorage.removeItem('kizongelu_preset_type');
        sessionStorage.removeItem('kizongelu_preset_subtype');
        sessionStorage.removeItem('kizongelu_preset_step');
        sessionStorage.removeItem('kizongelu_preset_province');
      } catch {}
    }
    const newProjectId = `proj_${Date.now()}`;
    navigateTo(`/wizard/${newProjectId}/etapa-1`);
  }, [navigateTo]);

  // Listener para botões retroceder/avançar do navegador e mudanças de hash
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const nextPath = normalizeAppPath(window.location.pathname, window.location.hash);
        setCurrentPath(nextPath);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // 3.3 SEO Dinâmico: Aplica <meta name="robots" content="noindex, nofollow"> em rotas privadas, wizard e previews
  useEffect(() => {
    if (typeof document === 'undefined') return;
    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    const shouldNoIndex =
      currentPath.startsWith('/wizard') ||
      currentPath.includes('/preview') ||
      currentPath.startsWith('/admin') ||
      currentPath.startsWith('/entrar') ||
      currentPath.startsWith('/criar-conta') ||
      currentPath.startsWith('/recuperar') ||
      currentPath.startsWith('/redefinir') ||
      currentPath.startsWith('/confirmar-email');

    if (shouldNoIndex) {
      robotsMeta.content = 'noindex, nofollow';
    } else {
      robotsMeta.content = 'index, follow, max-image-preview:large, max-snippet:-1';
    }
  }, [currentPath]);

  // Classificação da rota
  const isPublicRoute = (path: string): boolean => {
    return (
      path === '/' ||
      path === '/como-funciona' ||
      path === '/precos' ||
      path === '/blog' ||
      path.startsWith('/blog/') ||
      path.startsWith('/obras-em/') ||
      path === '/faq' ||
      path.startsWith('/faq/') ||
      path === '/sobre' ||
      path === '/contactos' ||
      path === '/termos' ||
      path === '/privacidade' ||
      path === '/cookies' ||
      path === '/aviso-tecnico' ||
      path === '/reembolsos' ||
      path === '/utilizacao-aceitavel' ||
      path === '/conformidade' ||
      path === '/acessibilidade' ||
      path === '/ia' ||
      path === '/seguranca' ||
      path === '/carreiras' ||
      path === '/parceiros' ||
      path === '/imprensa' ||
      path === '/estado' ||
      path === '/ajuda' ||
      path === '/ferramentas' ||
      path.startsWith('/ferramentas/') ||
      path === '/motor-calculo' ||
      path === '/precos-angola' ||
      path === '/precos-angola/indice' ||
      path === '/verificar' ||
      path.startsWith('/verificar/')
    );
  };

  const isAuthRoute = (path: string): boolean => {
    return (
      path === '/entrar' ||
      path === '/criar-conta' ||
      path === '/recuperar' ||
      path.startsWith('/redefinir/') ||
      path.startsWith('/confirmar-email/')
    );
  };

  const isAdminRoute = (path: string): boolean => {
    return path === '/admin' || path.startsWith('/admin/');
  };

  // Rotas do Wizard e Pré-visualização sem restrição de autenticação (Opção A)
  const isWizardRoute = (path: string): boolean => {
    return (
      path === '/wizard' ||
      path.startsWith('/wizard/') ||
      /^\/projetos?\/[^/]+\/preview$/.test(path)
    );
  };

  // Determinação do layout activo
  const getLayout = (): CurrentLayout => {
    if (isPublicRoute(currentPath)) return 'public';
    if (isAuthRoute(currentPath)) return 'auth';
    if (isAdminRoute(currentPath)) return 'admin';
    return 'app';
  };

  const currentLayout = getLayout();

  // =========================================================================
  // SISTEMA DE GUARDS
  // =========================================================================

  // GUARD 1: Layout AUTH redirecciona para /painel se já autenticado
  if (currentLayout === 'auth' && isAuthenticated) {
    return <RedirectGuard to="/painel" onRedirect={navigateTo} />;
  }

  // GUARD 2: Layout ADMIN redirecciona para /entrar se não autenticado
  if (currentLayout === 'admin') {
    if (!isAuthenticated) {
      return (
        <RedirectGuard
          to="/entrar"
          message="Inicie sessão com conta de administrador para aceder ao portal de gestão."
          toastType="info"
          onRedirect={navigateTo}
        />
      );
    }
    // Se o utilizador autenticado não for admin, o AdminLayout exibe o ecrã RBAC
    // com opção imediata de alternar para a conta de administrador para testes.
  }

  // GUARD 3: Layout APP redirecciona para /entrar se não autenticado (excepto rotas do Wizard / Preview anónimo)
  if (currentLayout === 'app' && !isAuthenticated && !isWizardRoute(currentPath)) {
    return (
      <RedirectGuard
        to="/entrar"
        message="Acesso restrito. Inicie sessão para gerir os seus orçamentos e obras."
        toastType="info"
        onRedirect={navigateTo}
      />
    );
  }

  // =========================================================================
  // 1. LAYOUT 1 — PÚBLICO (Marketing, Sem Autenticação)
  // =========================================================================
  if (currentLayout === 'public') {
    // Sub-rota dinâmica /blog/:slug
    const blogMatch = currentPath.match(/^\/blog\/(.+)$/);
    if (blogMatch) {
      const slug = blogMatch[1];
      return (
        <PublicLayout
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartWizard={handleStartWizard}
          onLogin={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
        >
          <BlogArticlePage
            slug={slug}
            onNavigateBlog={() => navigateTo('/blog')}
            onNavigateArticle={(artSlug) => navigateTo(`/blog/${artSlug}`)}
            onStartWizard={handleStartWizard}
          />
        </PublicLayout>
      );
    }

    // Sub-rota dinâmica /obras-em/:provincia
    const provMatch = currentPath.match(/^\/obras-em\/(.+)$/);
    if (provMatch) {
      const provinciaSlug = provMatch[1];
      return (
        <PublicLayout
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartWizard={handleStartWizard}
          onLogin={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
        >
          <ProvinciaPage
            provinciaSlug={provinciaSlug}
            onNavigate={navigateTo}
            onStartWizard={(prov) => handleStartWizard(prov)}
          />
        </PublicLayout>
      );
    }

    // Sub-rota dinâmica /ferramentas/:slug
    const toolMatch = currentPath.match(/^\/ferramentas\/(.+)$/);
    if (toolMatch) {
      const slug = toolMatch[1];
      return (
        <PublicLayout
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartWizard={handleStartWizard}
          onLogin={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
        >
          <FerramentaDetalhePage
            slug={slug}
            onNavigateTools={() => navigateTo('/ferramentas')}
            onStartWizard={handleStartWizard}
          />
        </PublicLayout>
      );
    }

    // Sub-rota dinâmica /verificar ou /verificar/:token
    if (currentPath === '/verificar' || currentPath.startsWith('/verificar/')) {
      const verifyMatch = currentPath.match(/^\/verificar\/(.+)$/);
      const token = verifyMatch ? verifyMatch[1] : undefined;
      return (
        <PublicLayout
          currentPath={currentPath}
          onNavigate={navigateTo}
          onStartWizard={handleStartWizard}
          onLogin={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
        >
          <PublicVerificationView initialToken={token} />
        </PublicLayout>
      );
    }

    return (
      <PublicLayout
        currentPath={currentPath}
        onNavigate={navigateTo}
        onStartWizard={handleStartWizard}
        onLogin={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
      >
        {currentPath === '/' && (
          <PublicLandingPage
            onEnterApp={() => navigateTo(isAuthenticated ? '/painel' : '/entrar')}
            onStartWizard={handleStartWizard}
            onNavigateToAdmin={() => navigateTo('/admin')}
            onNavigate={navigateTo}
          />
        )}

        {currentPath === '/como-funciona' && (
          <ComoFuncionaPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}

        {currentPath === '/precos' && (
          <PrecosPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}

        {currentPath === '/blog' && (
          <BlogPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}

        {currentPath === '/faq' && (
          <FaqPage
            onNavigate={navigateTo}
            onStartWizard={handleStartWizard}
          />
        )}

        {currentPath === '/sobre' && (
          <SobrePage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}

        {currentPath === '/contactos' && (
          <ContactosPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}

        {/* Páginas Legais com Estrutura Completa (Fase 16) */}
        {currentPath === '/termos' && (
          <TermosPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/privacidade' && (
          <PrivacidadePage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/cookies' && (
          <CookiesPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/aviso-tecnico' && (
          <AvisoTecnicoPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/reembolsos' && (
          <ReembolsosPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/utilizacao-aceitavel' && (
          <UtilizacaoAceitavelPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/conformidade' && (
          <ConformidadePage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/acessibilidade' && (
          <AcessibilidadePage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/ia' && (
          <PoliticaIAPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}
        {currentPath === '/seguranca' && (
          <SegurancaPage onNavigateHome={() => navigateTo('/')} onNavigate={navigateTo} />
        )}

        {/* Páginas Institucionais & Estado (Fase 16) */}
        {currentPath === '/carreiras' && (
          <CarreirasPage onStartWizard={handleStartWizard} onNavigate={navigateTo} />
        )}
        {currentPath === '/parceiros' && (
          <ParceirosPage onStartWizard={handleStartWizard} onNavigate={navigateTo} />
        )}
        {currentPath === '/imprensa' && (
          <ImprensaPage onStartWizard={handleStartWizard} onNavigate={navigateTo} />
        )}
        {currentPath === '/estado' && (
          <EstadoSistemaPage onStartWizard={handleStartWizard} onNavigate={navigateTo} />
        )}
        {currentPath === '/ajuda' && <AjudaPage />}

        {/* Rotas de Transparência do Motor & Observatório de Preços (Fase 17) */}
        {currentPath === '/motor-calculo' && (
          <MotorCalculoPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
          />
        )}

        {currentPath === '/precos-angola' && (
          <PrecosAngolaPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
          />
        )}

        {currentPath === '/precos-angola/indice' && (
          <PrecosIndicePage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
          />
        )}

        {currentPath === '/ferramentas' && (
          <FerramentasPage
            onStartWizard={handleStartWizard}
            onNavigate={navigateTo}
            onLogin={() => navigateTo('/entrar')}
          />
        )}
      </PublicLayout>
    );
  }

  // =========================================================================
  // 2. LAYOUT 2 — AUTENTICAÇÃO (Login, Criar Conta, Recuperar, Redefinir, Confirmar)
  // =========================================================================
  if (currentLayout === 'auth') {
    // Redefinição de Palavra-passe /redefinir/:token
    const resetMatch = currentPath.match(/^\/redefinir\/(.+)$/);
    if (resetMatch) {
      const token = resetMatch[1];
      return (
        <ResetPasswordPage
          token={token}
          onSuccess={() => navigateTo('/entrar')}
          onNavigateLogin={() => navigateTo('/entrar')}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // Confirmação de Email /confirmar-email/:token
    const confirmMatch = currentPath.match(/^\/confirmar-email\/(.+)$/);
    if (confirmMatch) {
      const token = confirmMatch[1];
      return (
        <ConfirmEmailPage
          token={token}
          onNavigateLogin={() => navigateTo('/entrar')}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    if (currentPath === '/criar-conta') {
      return (
        <RegisterPage
          onSuccess={() => navigateTo('/bem-vindo')}
          onNavigateLogin={() => navigateTo('/entrar')}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    if (currentPath === '/recuperar') {
      return (
        <RecoverPasswordPage
          onNavigateLogin={() => navigateTo('/entrar')}
          onNavigateHome={() => navigateTo('/')}
        />
      );
    }

    // Padrão do Layout 2: /entrar
    return (
      <LoginPage
        onSuccess={() => {
          const storedUser = typeof window !== 'undefined' ? localStorage.getItem('Kizongelu_active_user_id_v1') : null;
          if (storedUser === 'user-admin-01') {
            navigateTo('/admin');
          } else {
            navigateTo('/painel');
          }
        }}
        onNavigateRegister={() => navigateTo('/criar-conta')}
        onNavigateRecover={() => navigateTo('/recuperar')}
        onNavigateHome={() => navigateTo('/')}
        onNavigateTermos={() => navigateTo('/termos')}
        onNavigatePrivacidade={() => navigateTo('/privacidade')}
      />
    );
  }

  // =========================================================================
  // 4. LAYOUT 4 — ADMINISTRAÇÃO (role admin)
  // =========================================================================
  if (currentLayout === 'admin') {
    let sectionPart = currentPath.replace(/^\/admin\/?/, '') || 'dashboard';
    if (sectionPart === 'formulas/versoes') {
      sectionPart = 'formulas-versoes';
    } else if (sectionPart === 'motor/simulador' || sectionPart === 'simulador') {
      sectionPart = 'motor-simulador';
    } else if (sectionPart === 'motor/certificacao' || sectionPart === 'certificacao') {
      sectionPart = 'motor-certificacao';
    } else if (sectionPart === 'checklist' || sectionPart === 'checklist-producao') {
      sectionPart = 'checklist-producao';
    } else if (sectionPart === 'pacotes') {
      sectionPart = 'assinaturas';
    }

    const validSections: AdminNavSection[] = [
      'dashboard',
      'utilizadores',
      'projectos',
      'orcamentos',
      'pagamentos',
      'assinaturas',
      'precos',
      'materiais',
      'formulas',
      'formulas-versoes',
      'motor-simulador',
      'motor-certificacao',
      'auditoria',
      'checklist-producao',
      'notificacoes',
      'definicoes',
    ];

    const adminSection: AdminNavSection = validSections.includes(sectionPart as AdminNavSection)
      ? (sectionPart as AdminNavSection)
      : 'dashboard';

    return (
      <AdminPortal
        initialSection={adminSection}
        onSectionChange={(sec) => {
          let pathTarget = `/admin/${sec}`;
          if (sec === 'formulas-versoes') pathTarget = '/admin/formulas/versoes';
          else if (sec === 'motor-simulador') pathTarget = '/admin/motor/simulador';
          else if (sec === 'motor-certificacao') pathTarget = '/admin/motor/certificacao';
          else if (sec === 'assinaturas') pathTarget = '/admin/pacotes';
          navigateTo(pathTarget);
        }}
        onBackToApp={() => navigateTo('/painel')}
        onNavigateToPublic={() => navigateTo('/')}
      />
    );
  }

  // =========================================================================
  // 3. LAYOUT 3 — APLICAÇÃO (Utilizador Autenticado)
  // =========================================================================

  // Rotas de Onboarding (Fase 14)
  if (currentPath === '/bem-vindo') {
    return (
      <BemVindoPage
        userName={currentUser.nome}
        onStart={() => navigateTo('/bem-vindo/perfil')}
        onSkip={() => navigateTo('/painel')}
      />
    );
  }

  if (currentPath === '/bem-vindo/perfil') {
    return (
      <BemVindoPerfilPage
        currentRole={currentUser.role}
        onSelectRole={(role) => {
          if (role === 'empresa') {
            navigateTo('/bem-vindo/empresa');
          } else {
            navigateTo('/bem-vindo/comecar');
          }
        }}
        onBack={() => navigateTo('/bem-vindo')}
      />
    );
  }

  if (currentPath === '/bem-vindo/comecar') {
    return (
      <BemVindoComecarPage
        onStartBudget={() => {
          navigateTo('/painel');
          setIsNewBudgetModalOpen(true);
        }}
        onBack={() => navigateTo('/bem-vindo/perfil')}
      />
    );
  }

  if (currentPath === '/bem-vindo/empresa') {
    return (
      <BemVindoEmpresaPage
        onComplete={(data) => {
          success(`Empresa "${data.nome}" configurada com sucesso!`);
          navigateTo('/painel');
        }}
        onBack={() => navigateTo('/bem-vindo/perfil')}
      />
    );
  }

  // Sub-rota dinâmica /convite/:token (Fase 13)
  const conviteMatch = currentPath.match(/^\/convite\/([^/]+)$/);
  if (conviteMatch) {
    const inviteToken = conviteMatch[1];
    return (
      <ConvitePage
        token={inviteToken}
        onAccepted={() => navigateTo('/equipa')}
        onNavigateHome={() => navigateTo('/painel')}
      />
    );
  }

  // Sub-rota dinâmica /plano/facturas/:id (Fase 13)
  const faturaMatch = currentPath.match(/^\/plano\/facturas\/([^/]+)$/);
  if (faturaMatch) {
    const invoiceId = faturaMatch[1];
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <FaturaDetalhePage
          invoiceId={invoiceId}
          onBack={() => navigateTo('/plano')}
        />
      </div>
    );
  }

  // Rota /plano/renovar (Fase 13)
  if (currentPath === '/plano/renovar') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8">
        <RenovarPlanoPage
          onBack={() => navigateTo('/plano')}
          onRenewed={() => navigateTo('/plano')}
        />
      </div>
    );
  }

  // Rota /plano/cancelar (Fase 13)
  if (currentPath === '/plano/cancelar') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-8">
        <CancelarPlanoPage
          onBack={() => navigateTo('/plano')}
          onCancelled={() => navigateTo('/plano')}
        />
      </div>
    );
  }

  // Sub-rota dinâmica /wizard, /wizard/:projectId ou /wizard/:projectId/etapa-:step
  const wizardEtapaDirectMatch = currentPath.match(/^\/wizard\/etapa-(\d+)$/);
  const wizardMatch = currentPath.match(/^\/wizard(?:\/([^/]+)(?:\/etapa-(\d+))?)?$/);
  if (wizardEtapaDirectMatch || wizardMatch || currentPath === '/wizard' || currentPath.startsWith('/wizard')) {
    let wizardProjectId = wizardMatch?.[1];
    let stepNum = wizardMatch?.[2] ? parseInt(wizardMatch[2], 10) : undefined;

    if (wizardEtapaDirectMatch) {
      wizardProjectId = `proj_${Date.now()}`;
      stepNum = parseInt(wizardEtapaDirectMatch[1], 10);
    } else if (wizardProjectId && wizardProjectId.startsWith('etapa-')) {
      stepNum = parseInt(wizardProjectId.replace('etapa-', ''), 10) || 1;
      wizardProjectId = `proj_${Date.now()}`;
    } else if (!wizardProjectId) {
      wizardProjectId = `proj_${Date.now()}`;
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <WizardOrchestratorPage
          projectId={wizardProjectId}
          initialStep={stepNum}
          onExit={() => navigateTo(isAuthenticated ? '/painel' : '/')}
          onCalculationFinished={(res) => {
            const pid = res?.id || wizardProjectId;
            navigateTo(`/projetos/${pid}/preview`);
          }}
        />
      </div>
    );
  }

  // Sub-rota dinâmica /projetos/:id/preview ou /projeto/:id/preview
  const previewMatch = currentPath.match(/^\/projetos?\/([^/]+)\/preview$/);
  if (previewMatch) {
    const projectId = previewMatch[1];
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <ProjectPreviewPage
          projectId={projectId}
          onNavigateToOverview={() => navigateTo(isAuthenticated ? `/projetos/${projectId}` : '/painel')}
        />
      </div>
    );
  }

  // Sub-rota dinâmica /projetos/:id/desbloquear
  const unlockMatch = currentPath.match(/^\/projetos\/([^/]+)\/desbloquear$/);
  if (unlockMatch) {
    const projectId = unlockMatch[1];
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PaymentUnlockPage
          projectId={projectId}
          onBack={() => navigateTo(`/projetos/${projectId}`)}
          onNavigateToStatus={() => navigateTo('/pagamentos')}
        />
      </div>
    );
  }

  // Sub-rota dinâmica /projetos/:id/auditoria ou /projeto/:id/auditoria (Fase 17)
  const auditMatch = currentPath.match(/^\/projetos?\/([^/]+)\/auditoria$/);
  if (auditMatch) {
    const projectId = auditMatch[1];
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <ProjetoAuditoriaPage
          projectId={projectId}
          onBack={() => navigateTo(`/projetos/${projectId}`)}
          onNavigateToProject={() => navigateTo(`/projetos/${projectId}`)}
        />
      </div>
    );
  }

  const getAppSection = (): AppNavSection => {
    if (currentPath.startsWith('/projetos') || currentPath.startsWith('/projeto')) return 'projetos';
    if (currentPath.startsWith('/orcamentos')) return 'orcamentos';
    if (currentPath.startsWith('/pagamentos')) return 'pagamentos';
    if (currentPath.startsWith('/plano')) return 'plano';
    if (currentPath.startsWith('/documentos')) return 'documentos';
    if (currentPath.startsWith('/equipa')) return 'equipa';
    if (currentPath.startsWith('/definicoes')) return 'definicoes';
    if (currentPath.startsWith('/notificacoes')) return 'notificacoes';
    if (currentPath.startsWith('/ajuda')) return 'ajuda';
    return 'painel';
  };

  const getPageTitle = (): string => {
    if (currentPath === '/orcamentos') return 'Meus Orçamentos de Obra';
    if (currentPath === '/projetos') return 'Meus Projectos e Obras';
    if (currentPath.startsWith('/projetos/')) return 'Detalhe Técnico da Obra';
    if (currentPath === '/pagamentos') return 'Pagamentos e Multicaixa Express';
    if (currentPath === '/plano') return 'Plano e Facturação';
    if (currentPath === '/documentos') return 'Documentos e Mapas de Quantidades';
    if (currentPath === '/equipa') return 'Gestão da Equipa Técnica';
    if (currentPath === '/definicoes/privacidade/consentimentos') return 'Gestão de Consentimentos (Lei 22/11)';
    if (currentPath === '/definicoes/privacidade/exportar') return 'Exportar Dados Pessoais (Art. 10.º)';
    if (currentPath === '/definicoes/privacidade/apagar') return 'Eliminação de Conta (Art. 12.º)';
    if (currentPath.startsWith('/definicoes')) return 'Definições da Conta';
    if (currentPath === '/notificacoes') return 'Centro de Notificações';
    if (currentPath === '/ajuda') return 'Centro de Ajuda & FAQ';
    return 'Painel de Controlo';
  };

  // Extrai ID do projeto se for rota /projetos/:id
  const projectDetailMatch = currentPath.match(/^\/projetos\/([^/]+)$/);
  const activeDetailProjectId = projectDetailMatch ? projectDetailMatch[1] : null;

  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <AppLayout
        currentRoute={getAppSection()}
        pageTitle={getPageTitle()}
        onNavigate={(section) => {
          if (section === 'admin') {
            navigateTo('/admin');
            return;
          }
          if (section === 'projetos') {
            navigateTo('/projetos');
            return;
          }
          if (section === 'orcamentos') {
            navigateTo('/orcamentos');
            return;
          }
          navigateTo(`/${section}`);
        }}
        onNewBudget={handleOpenNewBudget}
        onNavigateToPublic={() => navigateTo('/')}
        onNavigateToAdmin={() => navigateTo('/admin')}
        onLogout={() => {
          logout();
          navigateTo('/entrar');
        }}
        canGoBack={Boolean(activeDetailProjectId)}
        onBack={() => navigateTo('/projetos')}
      >
        {/* /painel */}
        {getAppSection() === 'painel' && (
          <PainelPage
            onNewBudget={handleOpenNewBudget}
            onOpenProject={(projId) => navigateTo(`/projetos/${projId}`)}
            onNavigateToProjects={() => navigateTo('/projetos')}
            onNavigateToPlan={() => navigateTo('/plano')}
            onNavigateToPayments={() => navigateTo('/pagamentos')}
          />
        )}

        {/* /projetos ou /orcamentos (lista) */}
        {(getAppSection() === 'projetos' || getAppSection() === 'orcamentos') && !activeDetailProjectId && (
          <ProjetoListPage
            onNewBudget={handleOpenNewBudget}
            onOpenManualConstructor={handleOpenManualConstructor}
            onOpenProject={(projId) => navigateTo(`/projetos/${projId}`)}
            pageMode={getAppSection() === 'orcamentos' ? 'orcamentos' : 'projetos'}
          />
        )}

        {/* /projetos/:id (detalhe) */}
        {activeDetailProjectId && (
          <ProjetoDetailPage
            projectId={activeDetailProjectId}
            onBack={() => navigateTo('/projetos')}
            onUnlockProject={(pId) => navigateTo(`/projetos/${pId}/preview`)}
            onOpenPdfModal={(pId) => navigateTo(`/projetos/${pId}/preview`)}
            onOpenPublicVerification={(token) => navigateTo(`/verificar/${token}`)}
            onNavigateToAuditoria={(pId) => navigateTo(`/projetos/${pId}/auditoria`)}
          />
        )}

        {/* /pagamentos */}
        {getAppSection() === 'pagamentos' && (
          <PagamentosPage
            onNewBudget={handleOpenNewBudget}
            onOpenProject={(projId) => navigateTo(`/projetos/${projId}`)}
          />
        )}

        {/* /plano */}
        {getAppSection() === 'plano' && (
          <PlanoPage
            onNavigatePlanos={() => navigateTo('/plano')}
            onNavigateRenovar={() => navigateTo('/plano/renovar')}
            onNavigateInvoiceDetail={(invId) => navigateTo(`/plano/facturas/${invId}`)}
          />
        )}

        {/* /documentos */}
        {getAppSection() === 'documentos' && (
          <DocumentosPage
            onOpenProject={(projId) => navigateTo(`/projetos/${projId}`)}
            onNewBudget={handleOpenNewBudget}
          />
        )}

        {/* /equipa */}
        {getAppSection() === 'equipa' && <EquipaPage />}

        {/* /definicoes e sub-rotas de privacidade (Fase 16) */}
        {getAppSection() === 'definicoes' && (
          <>
            {currentPath === '/definicoes/privacidade/consentimentos' && (
              <ConsentimentosSettingsPage
                onBack={() => navigateTo('/definicoes')}
                onNavigate={navigateTo}
              />
            )}
            {currentPath === '/definicoes/privacidade/exportar' && (
              <ExportarDadosSettingsPage
                onBack={() => navigateTo('/definicoes')}
                onNavigate={navigateTo}
              />
            )}
            {currentPath === '/definicoes/privacidade/apagar' && (
              <ApagarContaSettingsPage
                onBack={() => navigateTo('/definicoes')}
                onNavigate={navigateTo}
              />
            )}
            {currentPath === '/definicoes' && (
              <DefinicoesPage onNavigate={navigateTo} />
            )}
          </>
        )}

        {/* /notificacoes */}
        {getAppSection() === 'notificacoes' && <NotificacoesPage />}

        {/* /ajuda */}
        {getAppSection() === 'ajuda' && <AjudaPage />}
      </AppLayout>

      {/* Modal de Criação de Novo Orçamento (Full-screen sheet em mobile, modal em desktop) */}
      {isNewBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-3xl max-w-4xl w-full p-5 sm:p-8 shadow-2xl border-0 sm:border border-slate-200 h-full sm:h-auto max-h-full sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-xs z-10 -mx-5 px-5 pt-3 sm:pt-0 sm:mx-0 sm:px-0">
              <div className="flex items-center space-x-2.5">
                <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                  O.ia
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#0F3D5C]">
                    Novo Orçamento de Construção
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#64748B] line-clamp-1">
                    Assistente com cálculo determinístico de quantidades em Kwanzas (Kz)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewBudgetModalOpen(false)}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BudgetWizard
              onCancel={() => setIsNewBudgetModalOpen(false)}
              onBudgetCreated={async (newBudget) => {
                setIsNewBudgetModalOpen(false);
                // Incrementa contador de orçamentos consumidos (créditos / pacote)
                try {
                  await incrementBudgetUsage(currentUser.id);
                } catch (e) {
                  console.warn('Erro ao incrementar quota:', e);
                }
                navigateTo(`/projetos/${newBudget.id}`);
                setFeedbackData({ id: newBudget.id, name: newBudget.titulo });
                success(
                  'Orçamento Gerado com Sucesso!',
                  `O projecto "${newBudget.titulo}" foi calculado em Kwanzas e adicionado à sua carteira.`
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de Bloqueio por Falta de Créditos (Pacotes) */}
      {isQuotaExceededModalOpen && (
        <QuotaExceededModal
          isOpen={isQuotaExceededModalOpen}
          onUpgrade={() => {
            setIsQuotaExceededModalOpen(false);
            navigateTo('/plano');
          }}
          onClose={() => setIsQuotaExceededModalOpen(false)}
        />
      )}

      {/* Modal de Feedback após conclusão do primeiro orçamento (Fase 14) */}
      {feedbackData && (
        <FeedbackModal
          projectId={feedbackData.id}
          projectName={feedbackData.name}
          isOpen={Boolean(feedbackData)}
          onClose={() => setFeedbackData(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            {/* Acessibilidade WCAG 2.1 AA: Skip to main content */}
            <a href="#main-content" className="skip-link">
              Saltar para o conteúdo principal
            </a>
            {/* Banner PWA "Instalar no telemóvel" após 2 visitas */}
            <PWAInstallBanner />
            <div id="main-content" tabIndex={-1} className="focus:outline-none">
              <MainRoutingManager />
            </div>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
