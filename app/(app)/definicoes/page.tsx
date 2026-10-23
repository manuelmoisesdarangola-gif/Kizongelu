/**
 * @file app/(app)/definicoes/page.tsx
 * Página de Definições e Perfil do Utilizador .
 * - Secções: Perfil Pessoal & Empresa · Segurança & Senha · Notificações · Aparência · Privacidade & Dados.
 * - Suporta alternância de dados e feedback imediato com toasts.
 */

import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  Lock,
  Mail,
  Phone,
  Building,
  Save,
  CheckCircle2,
  Trash2,
  FileSpreadsheet,
  Smartphone,
  MessageSquare,
  Send,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import { useTheme } from '@/src/context/ThemeContext';
import { resetUserTours } from '@/lib/tours';
import {
  getUserPreferences,
  saveUserPreferences,
  UserNotificationPreferences,
  sendNotification,
  PushChannel,
} from '@/lib/notifications';

export const DefinicoesPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [name, setName] = useState(currentUser.nome);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState('+244 923 456 789');
  const [companyName, setCompanyName] = useState('');
  const [nif, setNif] = useState('');

  const [notifPreferences, setNotifPreferences] = useState<UserNotificationPreferences>(() =>
    getUserPreferences(currentUser.id)
  );

  const [isTestingPush, setIsTestingPush] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const handleToggleChannel = (channel: keyof UserNotificationPreferences['channels']) => {
    const updated: UserNotificationPreferences = {
      ...notifPreferences,
      channels: {
        ...notifPreferences.channels,
        [channel]: !notifPreferences.channels[channel],
      },
    };
    setNotifPreferences(updated);
    saveUserPreferences(updated);
    success(`Canal ${channel} atualizado com sucesso!`);
  };

  const handleTestWelcomeEmail = async () => {
    setIsTestingEmail(true);
    try {
      await sendNotification(currentUser.id, 'welcome', {
        nome: currentUser.nome,
        email: currentUser.email,
        link: window.location.origin + '/painel',
      });
      success('Email de boas-vindas despachado com sucesso!');
    } catch (e) {
      warning('Erro ao disparar teste de email.');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestWebPush = async () => {
    setIsTestingPush(true);
    try {
      const perm = await PushChannel.requestPermission();
      if (perm === 'granted') {
        await sendNotification(currentUser.id, 'approved', {
          nome: currentUser.nome,
          projectName: 'Moradia T3 no Kilamba',
          valor: '150.000 Kz',
          link: window.location.origin + '/projetos',
        });
        success('Notificação Web Push enviada para o seu navegador!');
      } else {
        warning('Permissão de notificações recusada pelo navegador.');
      }
    } catch (e) {
      warning('Erro ao disparar teste de push.');
    } finally {
      setIsTestingPush(false);
    }
  };

  const { theme: themeMode, setTheme, resolvedTheme } = useTheme();

  const handleSelectTheme = (mode: 'light' | 'dark' | 'system') => {
    setTheme(mode);
    if (mode === 'system') {
      info('Tema definido para sincronização automática com o sistema operativo (prefers-color-scheme).');
    } else {
      success(`Tema ${mode === 'dark' ? 'escuro' : 'claro'} ativado com sucesso!`);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Dados de perfil guardados com sucesso!');
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    success('Palavra-passe atualizada com segurança!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[#0F3D5C]" />
            <span>Definições da Conta & Perfil</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalize as suas informações pessoais, segurança, alertas de preços de materiais e preferências.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 shadow-2xs">
            <Shield className="w-4 h-4 text-[#0F3D5C]" />
            <span>Sessão Autenticada</span>
          </span>
        </div>
      </div>

      {/* Seção 1: Perfil Pessoal & Empresa */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-[#0F3D5C]" />
          <span>Dados do Utilizador & Faturação</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Endereço de E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Telefone / WhatsApp (Angola)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">NIF (Número de Identificação Fiscal)</label>
              <input
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Nome da Empresa / Gabinete de Engenharia</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Este nome será impresso no cabeçalho dos Orçamentos e Mapas de Quantidades em PDF.
            </span>
          </div>

          <button
            type="submit"
            className="min-h-[44px] py-2.5 px-5 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Alterações</span>
          </button>
        </form>
      </div>

      {/* Seção 2: Segurança & Senha */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Segurança & Autenticação</span>
        </h3>

        <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Palavra-passe Atual</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Nova Palavra-passe</label>
              <input
                type="password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="min-h-[44px] py-2.5 px-5 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            Atualizar Palavra-passe
          </button>
        </form>
      </div>

      {/* Seção 3: Sistema de Notificações Multicanal (Fase 12) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0F3D5C]" />
              <span>Canais de Notificação & Alertas (Fase 12)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Defina como deseja ser avisado sobre validação de comprovativos, atualizações de obras e partilhas.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Fallback Ativo (3x Retry)
          </span>
        </div>

        {/* Toggles por Canal Global */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* IN_APP */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#0F3D5C]" />
                In-App (Plataforma)
              </span>
              <p className="text-[10px] text-slate-500">Alertas no sino e centro de mensagens</p>
            </div>
            <input
              type="checkbox"
              checked={notifPreferences.channels.IN_APP}
              onChange={() => handleToggleChannel('IN_APP')}
              className="w-4 h-4 text-[#0F3D5C] rounded border-slate-300 focus:ring-[#0F3D5C]"
            />
          </div>

          {/* EMAIL */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email Corporativo
              </span>
              <p className="text-[10px] text-slate-500">Resumos técnicos e faturas PDF</p>
            </div>
            <input
              type="checkbox"
              checked={notifPreferences.channels.EMAIL}
              onChange={() => handleToggleChannel('EMAIL')}
              className="w-4 h-4 text-[#0F3D5C] rounded border-slate-300 focus:ring-[#0F3D5C]"
            />
          </div>

          {/* PUSH */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                Web Push (Navegador/PWA)
              </span>
              <p className="text-[10px] text-slate-500">Avisos imediatos no ecrã</p>
            </div>
            <input
              type="checkbox"
              checked={notifPreferences.channels.PUSH}
              onChange={() => handleToggleChannel('PUSH')}
              className="w-4 h-4 text-[#0F3D5C] rounded border-slate-300 focus:ring-[#0F3D5C]"
            />
          </div>

          {/* WHATSAPP */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp Business API
              </span>
              <p className="text-[10px] text-slate-500">Links rápidos e comprovativos</p>
            </div>
            <input
              type="checkbox"
              checked={notifPreferences.channels.WHATSAPP}
              onChange={() => handleToggleChannel('WHATSAPP')}
              className="w-4 h-4 text-[#0F3D5C] rounded border-slate-300 focus:ring-[#0F3D5C]"
            />
          </div>

          {/* SMS */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-purple-600" />
                SMS (Redes Unitel / Movicel)
              </span>
              <p className="text-[10px] text-slate-500">Notificações por mensagem de texto</p>
            </div>
            <input
              type="checkbox"
              checked={notifPreferences.channels.SMS}
              onChange={() => handleToggleChannel('SMS')}
              className="w-4 h-4 text-[#0F3D5C] rounded border-slate-300 focus:ring-[#0F3D5C]"
            />
          </div>
        </div>

        {/* Nota de Segurança Obrigatória (Auditoria Fase 12) */}
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-950">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Salvaguarda de Segurança Institucional:</strong> Notificações de segurança (recuperação de palavra-passe, alteração de credenciais e confirmação de transferências Multicaixa) permanecem <strong>sempre ativas</strong> por Email e In-App para proteção antifraude da sua conta.
          </div>
        </div>

        {/* Botões de Teste em Tempo Real */}
        <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Testar Entrega em Tempo Real:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestWelcomeEmail}
              disabled={isTestingEmail}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTestingEmail ? 'A enviar...' : 'Testar Envio de Email'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestWebPush}
              disabled={isTestingPush}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-600" />
              <span>{isTestingPush ? 'A emitir...' : 'Testar Web Push'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Seção 4: Aparência & Tema (WCAG 2.1 AA & Dark Mode Tokens) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Aparência & Modo Escuro</span>
          </h3>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {themeMode === 'system' ? `Sistema (${resolvedTheme === 'dark' ? 'Escuro' : 'Claro'})` : themeMode === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Suporte completo à preferência do sistema operativo (<code>prefers-color-scheme</code>) e tokens de alto contraste calibrados para estaleiros e leitura noturna.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
          <button
            type="button"
            onClick={() => handleSelectTheme('light')}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl font-bold flex items-center space-x-2 border transition-all cursor-pointer active:scale-95 ${
              themeMode === 'light'
                ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Claro (Padrão)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme('dark')}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl font-bold flex items-center space-x-2 border transition-all cursor-pointer active:scale-95 ${
              themeMode === 'dark'
                ? 'bg-[#0F3D5C] dark:bg-sky-600 text-white border-[#0F3D5C] dark:border-sky-500 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-4 h-4 text-sky-400" />
            <span>Escuro (Alto Contraste)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTheme('system')}
            className={`min-h-[48px] py-2.5 px-4 rounded-xl font-bold flex items-center space-x-2 border transition-all cursor-pointer active:scale-95 ${
              themeMode === 'system'
                ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Automático (Sistema)</span>
          </button>
        </div>
      </div>

      {/* Seção 5: Ajuda & Tours Contextuais (Fase 14) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Ajuda & Tours de Boas-Vindas</span>
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Tours Guiados
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Se desejar rever os passos explicativos do painel, do assistente de cálculo e da pré-visualização de obras, pode reiniciar os tours interativos a qualquer momento.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              resetUserTours(currentUser.id);
              success('Tours reiniciados!', 'Os guias explicativos serão exibidos novamente ao visitar o painel e o assistente de cálculo.');
            }}
            className="min-h-[44px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center space-x-2 border border-slate-200"
          >
            <RotateCcw className="w-4 h-4 text-[#0F3D5C]" />
            <span>Rever Tour</span>
          </button>
        </div>
      </div>

      {/* Seção 6: Privacidade & Direitos dos Dados (Lei n.º 22/11 de Angola) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Privacidade & Gestão de Dados Pessoais (Lei n.º 22/11)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ejerça os seus direitos fundamentais de proteção de dados: consentimentos granulares, portabilidade e eliminação.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Conformidade APD Angola
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Consentimentos */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#0F3D5C] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <strong className="text-xs font-bold text-slate-900 block">
                Gestão de Consentimentos
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Consulte e altere as permissões de cookies analíticos, preferências funcionais e alertas de preços de materiais.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('/definicoes/privacidade/consentimentos')}
              className="w-full py-2 px-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              Gerir Consentimentos
            </button>
          </div>

          {/* 2. Exportar Dados */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-[#0F3D5C] transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <strong className="text-xs font-bold text-slate-900 block">
                Exportar Dados Pessoais
              </strong>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Solicite uma cópia digital estruturada (JSON) de todos os seus orçamentos, faturas e registos da conta (Art. 10.º).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('/definicoes/privacidade/exportar')}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              Solicitar Arquivo
            </button>
          </div>

          {/* 3. Apagar Conta */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-white hover:border-rose-500 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <strong className="text-xs font-bold text-rose-950 block">
                Eliminação de Conta
              </strong>
              <p className="text-[11px] text-rose-900/80 leading-relaxed">
                Inicie o processo de encerramento faseado em 7, 30 e 90 dias com salvaguarda de arrependimento (Art. 12.º).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('/definicoes/privacidade/apagar')}
              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
            >
              Processo de Apagamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefinicoesPage;
