/**
 * @file src/layouts/AdminLayout.tsx
 * LAYOUT 4 — ADMINISTRAÇÃO (role admin)
 * 
 * Rotas: /admin, /admin/pagamentos, /admin/precos, /admin/formulas,
 * /admin/auditoria, /admin/utilizadores, /admin/assinaturas, /admin/definicoes
 * 
 * DESKTOP:
 * - Sidebar escura (#0F172A) fixa à esquerda (260px).
 *   - Topo: logo + badge "ADMIN" (pequeno, cinza claro, uppercase).
 *   - Navegação vertical com ícones:
 *     - Dashboard
 *     - Pagamentos (com badge de pendentes em laranja)
 *     - Preços
 *     - Fórmulas
 *     - Auditoria
 *     - Utilizadores
 *     - Assinaturas
 *     - Definições
 *   - Item activo: fundo ligeiramente mais claro, texto branco, barra vertical laranja à esquerda.
 *   - Fundo da sidebar: avatar + nome do admin + botão ghost "Voltar à aplicação".
 * - Área de conteúdo:
 *   - Header escuro translúcido (64px) com título + breadcrumb + search global + notificações + avatar.
 *   - Conteúdo: padding 32px, largura máxima 1440px (admin usa mais espaço).
 *   - Tabelas com muito espaço, cabeçalhos fixos, hover suave nas linhas.
 * 
 * MOBILE:
 * - Sidebar colapsa em drawer.
 * - Bottom nav admin (5 itens): Dashboard · Pagamentos · Preços · Auditoria · Mais.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  Calculator,
  ShieldCheck,
  Users,
  Crown,
  Settings,
  ArrowLeft,
  Search,
  Bell,
  Menu,
  X,
  HardHat,
  ChevronRight,
  Lock,
  FolderGit2,
  FileSpreadsheet,
  Sliders,
  Award,
  FileCheck,
  Boxes,
} from 'lucide-react';
import { useAuth } from '../auth/auth-context';

export type AdminNavSection =
  | 'dashboard'
  | 'utilizadores'
  | 'projectos'
  | 'orcamentos'
  | 'pagamentos'
  | 'assinaturas'
  | 'precos'
  | 'materiais'
  | 'formulas'
  | 'formulas-versoes'
  | 'motor-simulador'
  | 'motor-certificacao'
  | 'auditoria'
  | 'checklist-producao'
  | 'notificacoes'
  | 'definicoes';

interface AdminLayoutProps {
  currentSection: AdminNavSection;
  pageTitle: string;
  breadcrumbs?: { label: string; section?: AdminNavSection }[];
  pendingPaymentsCount?: number;
  onNavigate: (section: AdminNavSection) => void;
  onBackToApp: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  pageTitle,
  breadcrumbs,
  pendingPaymentsCount = 2,
  onNavigate,
  onBackToApp,
  children,
}) => {
  const { currentUser, usersList, setCurrentUserById } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Guard de Acesso Administrativo para utilizadores não-admin
  if (!isAdmin) {
    const adminUser = usersList.find((u) => u.role === 'admin');

    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 font-['Inter',sans-serif]">
        <div className="bg-slate-800/90 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">
              Área Restrita (RBAC)
            </span>
            <h2 className="text-xl font-black text-white">Acesso Reservado a Administradores</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              O seu perfil atual ({currentUser.nome} &bull; {currentUser.role}) não tem privilégios para a gestão de preços e validação de transferências bancárias.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            {adminUser && (
              <button
                onClick={() => setCurrentUserById(adminUser.id)}
                className="w-full min-h-[44px] py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>Alternar para {adminUser.nome} ({adminUser.email})</span>
              </button>
            )}
            <button
              onClick={onBackToApp}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Voltar à Aplicação
            </button>
          </div>
        </div>
      </div>
    );
  }

  interface NavItem {
    key: AdminNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  interface NavGroup {
    title?: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Operações',
      items: [
        { key: 'utilizadores', label: 'Utilizadores', icon: Users },
        { key: 'projectos', label: 'Projectos', icon: FolderGit2 },
        { key: 'orcamentos', label: 'Orçamentos', icon: FileSpreadsheet },
        { key: 'pagamentos', label: 'Pagamentos', icon: CreditCard, badge: pendingPaymentsCount },
        { key: 'assinaturas', label: 'Pacotes', icon: Crown },
      ],
    },
    {
      title: 'Motor & Engenharia',
      items: [
        { key: 'precos', label: 'Preços (BPU)', icon: Layers },
        { key: 'materiais', label: 'Materiais', icon: Boxes },
        { key: 'formulas', label: 'Fórmulas', icon: Calculator },
        { key: 'motor-simulador', label: 'Simulador Motor', icon: Sliders },
      ],
    },
    {
      title: 'Sistema & Auditoria',
      items: [
        { key: 'auditoria', label: 'Auditoria', icon: ShieldCheck },
        { key: 'checklist-producao', label: 'Checklist Técnico', icon: FileCheck },
        { key: 'notificacoes', label: 'Notificações', icon: Bell },
        { key: 'definicoes', label: 'Definições', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-['Inter',sans-serif] flex flex-col lg:flex-row selection:bg-amber-400 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR DESKTOP FIXA (260px, FUNDO ESCURO #0F172A)                     */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#0F172A] border-r border-slate-800 shrink-0 sticky top-0 h-screen justify-between z-30">
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Topo: Logo + badge "ADMIN" (pequeno, cinza claro, uppercase) */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Kizongelu
                </span>
                <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-700">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          {/* Navegação Vertical com Grupos Lógicos */}
          <nav className="p-3 space-y-4 flex-1 overflow-y-auto">
            {navGroups.map((group, gIdx) => (
              <div key={group.title || `group-${gIdx}`} className="space-y-1">
                {group.title && (
                  <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </div>
                )}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentSection === item.key;

                  return (
                    <button
                      key={item.key}
                      onClick={() => onNavigate(item.key as AdminNavSection)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                        isActive
                          ? 'bg-slate-800 text-white border-l-[3px] border-[#F59E0B] pl-3'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-[#F59E0B] text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Fundo da Sidebar: Avatar + Nome + Botão Ghost "Voltar à aplicação" */}
        <div className="p-4 border-t border-slate-800 bg-[#091124] space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {currentUser.nome.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser.nome}</div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                Administrador
              </div>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 border border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Voltar à aplicação</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. ÁREA DE CONTEÚDO ADMIN (HEADER ESCURO TRANSLÚCIDO 64px)                 */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        {/* Header Escuro Translúcido (64px) */}
        <header className="sticky top-0 z-20 bg-[#1C2541]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 h-16 flex items-center justify-between">
          {/* Esquerda: Breadcrumb + Título */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400">
                {(breadcrumbs || [
                  { label: 'Administração' },
                  { label: currentSection === 'dashboard' ? 'Dashboard' : pageTitle },
                ]).map((crumb, idx, arr) => (
                  <React.Fragment key={crumb.label}>
                    {idx > 0 && <span>/</span>}
                    {crumb.section ? (
                      <button
                        onClick={() => onNavigate(crumb.section!)}
                        className="hover:text-amber-400 cursor-pointer"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={idx === arr.length - 1 ? 'text-slate-200 font-medium' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Direita: Search Global + Notificações + Avatar */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  currentSection === 'precos'
                    ? 'Pesquisar material, código ou categoria...'
                    : currentSection === 'pagamentos'
                    ? 'Pesquisar comprovativo, utilizador...'
                    : currentSection === 'utilizadores'
                    ? 'Pesquisar utilizador por nome ou email...'
                    : currentSection === 'projectos' || currentSection === 'orcamentos'
                    ? 'Pesquisar obra, cliente ou referência...'
                    : 'Pesquisar no painel administrativo...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 w-56 transition-all focus:w-72"
              />
            </div>

            <div className="relative">
              <button
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer relative"
                title="Notificações Admin"
              >
                <Bell className="w-5 h-5" />
                {pendingPaymentsCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#F59E0B] rounded-full ring-2 ring-[#1C2541]" />
                )}
              </button>
            </div>

            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {currentUser.nome.charAt(0)}
            </div>
          </div>
        </header>

        {/* Conteúdo: padding 32px, max 1440px */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE DRAWER ADMIN (< 1024px)                                         */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-[#0F172A] text-white h-full shadow-2xl flex flex-col p-5 z-10 animate-in slide-in-from-left duration-200 border-r border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="font-extrabold text-base">Painel Admin</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4 space-y-4 flex-1 overflow-y-auto text-sm">
              {navGroups.map((group, gIdx) => (
                <div key={group.title || `mob-group-${gIdx}`} className="space-y-1">
                  {group.title && (
                    <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {group.title}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const isActive = currentSection === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setMobileDrawerOpen(false);
                          onNavigate(item.key as AdminNavSection);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-slate-800 text-white border-l-[3px] border-[#F59E0B] pl-2.5'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="bg-[#F59E0B] text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onBackToApp();
                }}
                className="w-full min-h-[44px] bg-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Voltar à aplicação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM NAV ADMIN (5 ITENS: Dashboard · Pagamentos · Preços ·     */}
      {/* Auditoria · Mais)                                                         */}
      {/* ========================================================================= */}
      <nav
        aria-label="Navegação móvel de administração"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0F172A] border-t border-slate-800 z-40 shadow-xl px-2 h-16 pb-[env(safe-area-inset-bottom)] flex items-center justify-around select-none"
      >
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[10px] ${
            currentSection === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('pagamentos')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[10px] relative ${
            currentSection === 'pagamentos' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <CreditCard className="w-5 h-5 mb-0.5" />
          <span>Pagamentos</span>
          {pendingPaymentsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => onNavigate('precos')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[10px] ${
            currentSection === 'precos' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>Preços</span>
        </button>

        <button
          onClick={() => onNavigate('auditoria')}
          className={`flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[10px] ${
            currentSection === 'auditoria' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span>Auditoria</span>
        </button>

        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-h-[48px] min-w-[48px] text-[10px] text-slate-400"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
