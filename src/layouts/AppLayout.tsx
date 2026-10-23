/**
 * @file src/layouts/AppLayout.tsx
 * LAYOUT 3 — APLICAÇÃO (utilizador autenticado)
 * 
 * Rotas: /painel, /projetos, /projetos/:id, /projetos/:id/preview,
 * /projetos/:id/desbloquear, /wizard/:projectId, /pagamentos, /plano,
 * /documentos, /definicoes, /equipa, /notificacoes
 * 
 * DESKTOP (>= 1024px):
 * - Sidebar fixa à esquerda (240px, fundo branco, border-right 1px #E2E8F0).
 *   - Topo: logo Kizongelu compacto + separador.
 *   - Navegação vertical com ícones Lucide (stroke 1.5):
 *     - Painel (LayoutDashboard)
 *     - Projetos (FolderOpen)
 *     - Orçamentos (FileText)
 *     - Pagamentos (CreditCard)
 *     - Plano e facturação (Crown)
 *     - Documentos (FileStack)
 *     - Equipa (Users) — só visível para role Empresa
 *     - Definições (Settings)
 *   - Item activo: fundo azul suave #EFF6FF, texto azul #0F3D5C,
 *     barra vertical laranja à esquerda (3px).
 *   - Fundo da sidebar:
 *     - Botão "+ Novo orçamento" (laranja, full-width, 48px).
 *     - Mini-card do plano actual (nome + barra de uso + link "Gerir").
 *     - Botão ghost "Precisa de ajuda?" -> abre WhatsApp.
 * - Área de conteúdo:
 *   - Header sticky (64px):
 *     - Esquerda: título da página (18px semibold) + breadcrumb 12px cinza.
 *     - Direita: campo de pesquisa + sino de notificações com badge laranja
 *       + avatar com dropdown (Ver perfil · Definições · Terminar sessão).
 *   - Conteúdo: padding 32px, largura máxima 1280px, centrado.
 *   - Espaçamento generoso entre secções (32px).
 * 
 * MOBILE (< 1024px):
 * - Sem sidebar.
 * - Header sticky (56px):
 *   - Esquerda: logo pequeno OU botão voltar (chevron) em ecrãs internos.
 *   - Direita: sino + avatar.
 * - Bottom navigation fixa no fundo (64px + safe area):
 *   - 5 itens: Painel · Projetos · + Novo (FAB central) · Pagamentos · Perfil.
 *   - Item activo: azul #0F3D5C, ícone preenchido + label 11px.
 *   - Item inactivo: cinza #64748B.
 *   - FAB "+ Novo": círculo laranja 56px elevado 16px acima da barra,
 *     com sombra suave e ícone Plus branco.
 * - Drawer lateral (swipe da esquerda ou botão hamburger) com:
 *   Orçamentos · Plano · Documentos · Equipa · Definições · Ajuda · Sair.
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  FileText,
  CreditCard,
  Crown,
  FileStack,
  Users,
  Settings,
  Plus,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MessageCircle,
  LogOut,
  User,
  HardHat,
  ShieldCheck,
  Check,
  HelpCircle,
  Package,
} from 'lucide-react';
import { useAuth, getDefaultCredits } from '../auth/auth-context';
import { getUserCredits } from '@/lib/actions/packages';
import { InAppChannel, InAppNotificationRecord } from '@/lib/notifications';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { useVirtualKeyboard } from '@/src/hooks/useVirtualKeyboard';
import { HelpWidget } from '@/src/components/onboarding/HelpWidget';

export type AppNavSection =
  | 'painel'
  | 'projetos'
  | 'projeto'
  | 'projeto-detail'
  | 'orcamentos'
  | 'pagamentos'
  | 'plano'
  | 'documentos'
  | 'equipa'
  | 'definicoes'
  | 'notificacoes'
  | 'ajuda'
  | 'admin'
  | 'admin-precos';

export interface AppLayoutProps {
  currentRoute: AppNavSection;
  pageTitle?: string;
  breadcrumbs?: { label: string; route?: AppNavSection }[];
  onNavigate: (route: AppNavSection) => void;
  onNewBudget: () => void;
  onNavigateToPublic?: () => void;
  onNavigateToAdmin?: () => void;
  onLogout?: () => void;
  canGoBack?: boolean;
  onBack?: () => void;
  onOpenUserSwitcher?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentRoute,
  pageTitle = 'Painel de Controlo',
  breadcrumbs = [{ label: 'Aplicação' }, { label: pageTitle }],
  onNavigate,
  onNewBudget,
  onNavigateToPublic,
  onNavigateToAdmin,
  onLogout,
  canGoBack,
  onBack,
  onOpenUserSwitcher,
  children,
}) => {
  const { currentUser } = useAuth();
  const { isKeyboardOpen, dismissKeyboard } = useVirtualKeyboard();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotificationRecord[]>(() =>
    InAppChannel.getNotifications(currentUser.id)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(InAppChannel.getNotifications(currentUser.id));
    };
    window.addEventListener('kizongelu:notification:received', handleUpdate);
    window.addEventListener('kizongelu:notification:updated', handleUpdate);
    return () => {
      window.removeEventListener('kizongelu:notification:received', handleUpdate);
      window.removeEventListener('kizongelu:notification:updated', handleUpdate);
    };
  }, [currentUser.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const normalizedRole = (currentUser?.role || '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';
  const isCompany = ['EMPRESA', 'EMPRESA_PLUS', 'COMPANY_OWNER', 'COMPANY_ADMIN'].includes(normalizedRole);
  const showTeamMenu = isAdmin || isCompany;

  // Lógica Dinâmica de Créditos (sem hardcoded por id ou email)
  const [credits, setCredits] = useState<number>(() => {
    if (isAdmin) return 999999;
    if (typeof currentUser?.orçamentosDisponiveis === 'number') {
      return currentUser.orçamentosDisponiveis;
    }
    return getDefaultCredits(currentUser?.role);
  });

  useEffect(() => {
    if (isAdmin) {
      setCredits(999999);
    } else if (typeof currentUser?.orçamentosDisponiveis === 'number') {
      setCredits(currentUser.orçamentosDisponiveis);
    } else {
      setCredits(getDefaultCredits(currentUser?.role));
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.orçamentosDisponiveis, isAdmin]);

  useEffect(() => {
    async function loadCredits() {
      if (currentUser?.id) {
        try {
          const c = await getUserCredits(currentUser.id, currentUser.role);
          setCredits(c);
        } catch (e) {
          console.warn('Erro ao carregar créditos no layout:', e);
        }
      }
    }
    loadCredits();
    window.addEventListener('kizongelu:credits:updated', loadCredits);
    window.addEventListener('kizongelu_packages_updated', loadCredits);
    return () => {
      window.removeEventListener('kizongelu:credits:updated', loadCredits);
      window.removeEventListener('kizongelu_packages_updated', loadCredits);
    };
  }, [currentUser?.id, currentUser?.role]);

  // Badge dinâmico do plano actual no header (Secção 5.2)
  const getPlanBadgeLabel = () => {
    if (isAdmin) {
      return 'Administrador · Acesso ilimitado';
    }
    let planName = 'Particular';
    if (normalizedRole === 'EMPRESA_PLUS') planName = 'Empresa Plus';
    else if (['EMPRESA', 'COMPANY_OWNER', 'COMPANY_ADMIN'].includes(normalizedRole)) planName = 'Empresa';
    else if (normalizedRole === 'PROFISSIONAL') planName = 'Profissional';
    else if (normalizedRole === 'PARTICULAR') planName = 'Particular';
    else if (currentUser.plano) planName = currentUser.plano.split('(')[0].trim();

    return `${planName} · ${credits} ${credits === 1 ? 'crédito' : 'créditos'}`;
  };

  const handleMarkAsRead = (id: string) => {
    InAppChannel.markAsRead(currentUser.id, id);
    setNotifications(InAppChannel.getNotifications(currentUser.id));
  };

  const openWhatsAppHelp = () => {
    window.open('https://wa.me/244923000000?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Kizongelu', '_blank');
  };

  // Scroll suave/imediato ao topo na mudança de navegação
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentRoute, pageTitle]);

  // Itens de navegação principal
  const navItems = [
    { key: 'painel', label: 'Painel', icon: LayoutDashboard },
    { key: 'projetos', label: 'Projectos', icon: FolderOpen },
    { key: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { key: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
    { key: 'plano', label: 'Os meus pacotes', icon: Crown },
    { key: 'documentos', label: 'Documentos', icon: FileStack },
    ...(showTeamMenu ? [{ key: 'equipa', label: 'Equipa', icon: Users }] : []),
    { key: 'definicoes', label: 'Definições', icon: Settings },
    { key: 'ajuda', label: 'Ajuda & FAQ', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-['Inter',sans-serif] flex flex-col lg:flex-row selection:bg-amber-400 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR DESKTOP FIXA (240px, FUNDO BRANCO, BORDER-RIGHT 1px #E2E8F0)    */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-[#E2E8F0] shrink-0 sticky top-0 h-screen justify-between z-30">
        <div>
          {/* Topo: Logo Kizongelu compacto + Separador */}
          <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
            <button
              onClick={() => onNavigate('painel')}
              className="flex items-center space-x-2.5 text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center font-black shadow-xs">
                <HardHat className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#0F3D5C]">
                Kizongelu
              </span>
            </button>
          </div>

          {/* Navegação Vertical */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key as AppNavSection)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#0F3D5C] border-l-[3px] border-[#F59E0B] pl-3'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[1.5] ${isActive ? 'text-[#0F3D5C]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Acesso Admin Exclusivo se role for admin */}
            {isAdmin && onNavigateToAdmin && (
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={onNavigateToAdmin}
                  className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/80 hover:bg-amber-100 transition-colors cursor-pointer text-left"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Área de Gestão Admin</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Fundo da Sidebar Desktop */}
        <div className="p-3 border-t border-[#E2E8F0] space-y-3 bg-slate-50/50">
          {/* Botão "+ Novo orçamento" (laranja, full-width, 48px) */}
          <button
            onClick={onNewBudget}
            className="w-full h-12 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Novo orçamento</span>
          </button>

          {/* Mini-card de créditos de pacotes (Bloco 6.2) - Oculto para Administrador */}
          {!isAdmin && (
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <Package className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">
                    {credits > 0 ? `${credits} ${credits === 1 ? 'crédito disponível' : 'créditos disponíveis'}` : '0 créditos disponíveis'}
                  </span>
                </div>
                <span
                  className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0 ${
                    credits === 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {credits === 0 ? 'Sem créditos' : 'Activo'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>{credits > 0 ? 'Sem expiração' : 'Adquira um pacote'}</span>
                <button
                  onClick={() => onNavigate('plano')}
                  className="font-bold text-[#0F3D5C] hover:underline cursor-pointer"
                >
                  {credits === 0 ? 'Comprar Pacote' : 'Ver pacotes'}
                </button>
              </div>
            </div>
          )}

          {/* Botão ghost "Precisa de ajuda?" -> abre WhatsApp */}
          <button
            onClick={openWhatsAppHelp}
            className="w-full py-2 px-3 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Precisa de ajuda? WhatsApp</span>
          </button>

          {/* Trust Signals Oficiais de Angola no rodapé da Sidebar */}
          <div className="pt-2 border-t border-slate-200/70 space-y-1.5 text-[10px] text-slate-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Regulamentos Técnicos & Normas Aplicáveis</span>
              </span>
              <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                Engenharia
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-[#0F3D5C]" />
                <span>Multicaixa Express</span>
              </span>
              <span className="text-[9px] text-slate-600 font-mono">EMIS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL (DESKTOP E MOBILE)                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Header Sticky Desktop (64px) / Mobile (56px) */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 h-14 lg:h-16 flex items-center justify-between">
          {/* Esquerda: Em Desktop título 18px + breadcrumb 12px; Em Mobile logo ou botão voltar */}
          <div className="flex items-center space-x-3">
            {/* Mobile: Botão Voltar ou Logo */}
            <div className="lg:hidden flex items-center space-x-2">
              {canGoBack && onBack ? (
                <button
                  onClick={onBack}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-slate-600 hover:text-slate-900"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={() => setMobileDrawerOpen(true)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-slate-600 hover:text-slate-900"
                >
                  <Menu className="w-6 h-6" />
                </button>
              )}
              <span className="font-bold text-sm text-[#0F3D5C] truncate max-w-[180px]">
                {pageTitle}
              </span>
            </div>

            {/* Desktop: Breadcrumb + Título 18px semibold */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <span>/</span>}
                    {crumb.route ? (
                      <button
                        onClick={() => onNavigate(crumb.route!)}
                        className="hover:text-[#0F3D5C] cursor-pointer"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={idx === breadcrumbs.length - 1 ? 'text-slate-600 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Direita: Badge do Plano Actual + Campo de pesquisa + Sino + Avatar com dropdown */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Badge do Plano Actual no Header — Secção 5.2 */}
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-900 border border-amber-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>{getPlanBadgeLabel()}</span>
            </div>

            {/* Campo de pesquisa opcional (desktop) */}
            <div className="hidden xl:flex items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar obras, itens..."
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] w-40 transition-all focus:w-56"
              />
            </div>

            {/* Sino de Notificações com badge laranja */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative cursor-pointer"
                title="Notificações"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Dropdown Notificações */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Notificações ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => notifications.forEach((n) => handleMarkAsRead(n.id))}
                        className="text-[11px] text-[#0F3D5C] hover:underline font-semibold cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                          <Check className="w-4 h-4" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">Tudo em ordem</p>
                        <p className="text-[11px] text-slate-400">Não tem notificações pendentes.</p>
                      </div>
                    ) : (
                      notifications.slice(0, 4).map((n) => (
                        <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{n.title}</span>
                            <span className="text-[10px] text-slate-400">
                              {formatRelativeTime((n as any).timestamp || (n as any).createdAt || Date.now() - 3600000)}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-2">
                            {n.body || (n as any).message || (n as any).description}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        onNavigate('notificacoes');
                      }}
                      className="text-xs text-[#0F3D5C] hover:text-[#F59E0B] font-bold cursor-pointer"
                    >
                      Ver todas as notificações &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar com Dropdown (Ver perfil · Definições · Terminar sessão) */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F3D5C] text-white flex items-center justify-center font-black text-xs">
                  {currentUser.nome.charAt(0)}
                </div>
                <span className="hidden sm:block text-xs font-semibold text-slate-800">
                  {currentUser.nome.split(' ')[0]}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{currentUser.nome}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  </div>
                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('definicoes');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Ver perfil</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onNavigate('definicoes');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Definições</span>
                    </button>
                    {onNavigateToPublic && (
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          onNavigateToPublic();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center space-x-2 text-slate-700 border-t border-slate-100"
                      >
                        <span>Site Público</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center space-x-2 text-rose-600 border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Terminar sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo: padding 20px (px-5) em mobile conforme regra de 20px, pb-24 para nunca ficar sob a bottom nav, max 1280px */}
        <main className="flex-1 px-5 py-6 sm:p-6 lg:p-8 pb-24 sm:pb-8 max-w-[1280px] w-full mx-auto">
          {/* Transição de fade de 200ms entre as navegações do AppLayout */}
          <div
            key={`${currentRoute}-${pageTitle}`}
            className="page-fade-in w-full space-y-8"
          >
            {children}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE DRAWER LATERAL (< 1024px)                                       */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-white flex items-center justify-center">
                    <HardHat className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <span className="font-extrabold text-base text-[#0F3D5C]">Kizongelu</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-900 border border-amber-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>{getPlanBadgeLabel()}</span>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1 rounded-xl text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-1 flex-1 overflow-y-auto text-sm">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('projetos');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-3 transition-colors ${
                  currentRoute === 'projetos'
                    ? 'bg-[#EFF6FF] text-[#0F3D5C] font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-slate-500" />
                <span>Projectos</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('orcamentos');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-3 transition-colors ${
                  currentRoute === 'orcamentos'
                    ? 'bg-[#EFF6FF] text-[#0F3D5C] font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Orçamentos</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('plano');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
              >
                <Crown className="w-4 h-4 text-slate-500" />
                <span>Os meus pacotes</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('documentos');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
              >
                <FileStack className="w-4 h-4 text-slate-500" />
                <span>Documentos</span>
              </button>
              {showTeamMenu && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('equipa');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Equipa</span>
                </button>
              )}
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('definicoes');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Definições</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('ajuda');
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 flex items-center space-x-3 text-slate-700"
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Ajuda & FAQ (15 Perguntas)</span>
              </button>
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  openWhatsAppHelp();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 flex items-center space-x-3 text-emerald-700"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Ajuda via WhatsApp</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cálculo Técnico Auditado</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Compatível com boas práticas de engenharia civil e normas técnicas aplicáveis do sector em Angola.
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full py-2.5 text-xs text-rose-600 font-bold hover:bg-rose-50 rounded-xl flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminar sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BARRA DE TECLADO VIRTUAL MOBILE (QUANDO TECLADO ABERTO)                 */}
      {/* Esconde a bottom nav para não ocupar ecrã e mostra botão "Concluir"        */}
      {/* ========================================================================= */}
      {isKeyboardOpen && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-5 py-2 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-150">
          <span className="text-xs text-slate-500 font-medium">A introduzir dados</span>
          <button
            type="button"
            onClick={dismissKeyboard}
            className="h-10 px-5 bg-[#0F3D5C] text-white text-xs font-bold rounded-xl active:scale-95 transition-transform flex items-center space-x-1.5 shadow-sm"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Concluir</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MOBILE BOTTOM NAVIGATION (64px + SAFE AREA COM FAB 16px ACIMA DA BARRA) */}
      {/* Sempre visível em área autenticada, exceto quando teclado está aberto      */}
      {/* ========================================================================= */}
      <nav
        aria-label="Navegação móvel"
        className={`lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 shadow-xl px-2 h-16 pb-[env(safe-area-inset-bottom)] flex items-center justify-around select-none transition-transform duration-200 ${
          isKeyboardOpen ? 'translate-y-full pointer-events-none' : 'translate-y-0'
        }`}
      >
        {/* 1. Painel */}
        <button
          onClick={() => onNavigate('painel')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[11px] transition-colors cursor-pointer ${
            currentRoute === 'painel' ? 'text-[#0F3D5C] font-bold' : 'text-[#64748B]'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 mb-0.5 ${currentRoute === 'painel' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span>Painel</span>
        </button>

        {/* 2. Projectos */}
        <button
          onClick={() => onNavigate('projetos')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[11px] transition-colors cursor-pointer ${
            currentRoute === 'projetos' || currentRoute === 'orcamentos' ? 'text-[#0F3D5C] font-bold' : 'text-[#64748B]'
          }`}
        >
          <FolderOpen className={`w-5 h-5 mb-0.5 ${currentRoute === 'projetos' || currentRoute === 'orcamentos' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span>Projectos</span>
        </button>

        {/* 3. FAB Central "+ Novo" — Exactamente 16px acima da bottom nav (-top-4 = -16px) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onNewBudget}
            className="w-14 h-14 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white flex items-center justify-center shadow-lg shadow-amber-500/40 border-2 border-white active:scale-95 transition-transform cursor-pointer"
            title="Criar Novo Orçamento"
          >
            <Plus className="w-7 h-7 stroke-[3] text-slate-950" />
          </button>
        </div>

        {/* 4. Pagamentos */}
        <button
          onClick={() => onNavigate('pagamentos')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[11px] transition-colors cursor-pointer ${
            currentRoute === 'pagamentos' ? 'text-[#0F3D5C] font-bold' : 'text-[#64748B]'
          }`}
        >
          <CreditCard className={`w-5 h-5 mb-0.5 ${currentRoute === 'pagamentos' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span>Pagamentos</span>
        </button>

        {/* 5. Perfil / Definições */}
        <button
          onClick={() => onNavigate('definicoes')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[11px] transition-colors cursor-pointer ${
            currentRoute === 'definicoes' || currentRoute === 'plano' ? 'text-[#0F3D5C] font-bold' : 'text-[#64748B]'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${currentRoute === 'definicoes' || currentRoute === 'plano' ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
          <span>Perfil</span>
        </button>
      </nav>

      {/* Fase 14: Widget de Ajuda Contextual Flutuante "?" */}
      <HelpWidget
        currentScreen={
          currentRoute === 'painel'
            ? 'painel'
            : currentRoute === 'orcamentos'
            ? 'wizard'
            : currentRoute === 'projetos'
            ? 'preview'
            : currentRoute === 'pagamentos'
            ? 'paywall'
            : 'geral'
        }
        onNavigateToAjuda={() => onNavigate('ajuda')}
      />
    </div>
  );
};

export default AppLayout;
