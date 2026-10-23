/**
 * @file src/components/legal/CookiePreferencesModal.tsx
 * Modal de Personalização Granular de Cookies e Consentimentos (Fase 16).
 * Em estrita conformidade com as diretrizes da Lei n.º 22/11 de Angola.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Check,
  Lock,
  BarChart3,
  Sliders,
  Send,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import {
  getUserConsents,
  logConsentDecision,
  ConsentType,
  UserConsentsState,
} from '@/lib/actions/consent';
import { initGA4 } from '@/lib/analytics/tracker';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (consents: UserConsentsState) => void;
  onNavigatePolicy?: () => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  onNavigatePolicy,
}) => {
  const current = getUserConsents();
  const [analytics, setAnalytics] = useState(current.analytics);
  const [functional, setFunctional] = useState(current.functional);
  const [marketing, setMarketing] = useState(current.marketing);

  if (!isOpen) return null;

  const handleSavePreferences = async () => {
    const updated = await logConsentDecision({
      essential: true,
      analytics,
      functional,
      marketing,
    });
    if (analytics) {
      initGA4();
    }
    onSaved(updated);
    onClose();
  };

  const handleAcceptAll = async () => {
    setAnalytics(true);
    setFunctional(true);
    setMarketing(true);
    const updated = await logConsentDecision({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
    initGA4();
    onSaved(updated);
    onClose();
  };

  const handleRejectAllNonEssential = async () => {
    setAnalytics(false);
    setFunctional(false);
    setMarketing(false);
    const updated = await logConsentDecision({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    });
    onSaved(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0F3D5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center font-bold border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                Centro de Preferências de Privacidade
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                Conformidade com a Lei n.º 22/11 de Angola &bull; Kizongelu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          <p className="text-slate-600 leading-relaxed">
            Respeitamos a sua privacidade. Escolha as categorias de cookies e dados que nos autoriza a processar durante a utilização do Kizongelu. Os cookies estritamente necessários não podem ser desativados pois garantem a integridade das sessões e o motor determinístico.
          </p>

          <div className="space-y-4">
            {/* Categoria 1: Essenciais */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Cookies Estritamente Necessários
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Sempre Ativos
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Essenciais para autenticação de utilizador, segurança CSRF, integridade de transações Multicaixa Express e gravação de rascunhos de orçamento no navegador.
              </p>
            </div>

            {/* Categoria 2: Analíticos */}
            <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Métricas & Análise (Google Analytics 4)
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F3D5C]"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permitem recolher estatísticas anónimas de navegação, tempos de resposta de cálculo e conversão de orçamentos para melhorar o software em Angola com IP anonimizado.
              </p>
            </div>

            {/* Categoria 3: Funcionais */}
            <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Preferências Funcionais & Provinciais
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={functional}
                    onChange={(e) => setFunctional(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F3D5C]"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Guardam a província de preferência (ex: Luanda, Benguela, Huíla), o tema visual, o tamanho padrão de blocos e o estado dos tutoriais guiados.
              </p>
            </div>

            {/* Categoria 4: Marketing */}
            <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="font-extrabold text-sm text-slate-900">
                    Comunicações de Mercado & Alertas de Preços
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F3D5C]"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Permite enviar resumos de oscilação de preços de cimento e ferro em Angola e condições exclusivas na aquisição de novos pacotes de orçamentos.
              </p>
            </div>
          </div>

          <div className="pt-2 text-slate-500 text-[11px]">
            Para consultar a tabela completa e detalhada de cookies com nome, fornecedor e tempos de retenção, consulte a nossa{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigatePolicy) onNavigatePolicy();
              }}
              className="font-bold text-[#0F3D5C] hover:underline cursor-pointer"
            >
              Política de Cookies (/cookies)
            </button>.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRejectAllNonEssential}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Só Essenciais
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer"
            >
              Aceitar Todos
            </button>
          </div>

          <button
            type="button"
            onClick={handleSavePreferences}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] active:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 text-amber-400" />
            <span>Guardar Minhas Preferências</span>
          </button>
        </div>
      </div>
    </div>
  );
};
