/**
 * @file src/components/privacy-settings/ApagarContaSettingsPage.tsx
 * Processo de Eliminação Faseada da Conta (/definicoes/privacidade/apagar) — Fase 16.
 * Cumprimento do Artigo 12.º da Lei n.º 22/11 de Angola (Direito ao Esquecimento).
 */

import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  requestAccountDeletion,
  cancelAccountDeletion,
  AccountDeletionRequest,
} from '@/lib/actions/consent';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';

interface ApagarContaSettingsPageProps {
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export const ApagarContaSettingsPage: React.FC<ApagarContaSettingsPageProps> = ({
  onBack,
  onNavigate,
}) => {
  const { currentUser, logout } = useAuth();
  const { success, warning, error: toastError } = useToast();

  const [confirmText, setConfirmText] = useState('');
  const [activeRequest, setActiveRequest] = useState<AccountDeletionRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmText.trim().toUpperCase() === 'APAGAR';

  const handleStartDeletion = async () => {
    if (!isConfirmed) {
      toastError('Confirmação inválida', 'Deve digitar exatamente "APAGAR" em maiúsculas.');
      return;
    }

    setLoading(true);
    try {
      const req = await requestAccountDeletion(currentUser.id);
      setActiveRequest(req);
      success(
        'Pedido de encerramento registado!',
        'Dispõe de um período de arrependimento de 7 dias para reverter esta decisão.'
      );
    } catch (e) {
      console.error(e);
      warning('Erro ao processar pedido de eliminação.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      const ok = await cancelAccountDeletion(currentUser.id);
      if (ok) {
        setActiveRequest(null);
        setConfirmText('');
        success('Pedido de eliminação cancelado com sucesso!', 'A sua conta permanece ativa e sem alterações.');
      }
    } catch (e) {
      console.error(e);
      warning('Erro ao cancelar pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div>
        {onBack && (
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar às Definições Gerais</span>
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-rose-600" />
          <span>Eliminação Definitiva de Conta & Esquecimento</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Encerre formalmente a sua conta de utilizador nos termos do <strong>Artigo 12.º da Lei n.º 22/11 de Angola</strong>.
        </p>
      </div>

      {/* Caixa de Explicação do Processo Faseado (7, 30 e 90 dias) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-card-subtle space-y-5">
        <div className="flex items-start space-x-3.5 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Processo de Eliminação em 3 Fases Seguras
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para evitar perdas acidentais de orçamentos e assegurar o cumprimento das obrigações fiscais da República de Angola, o encerramento obedece a um cronograma faseado:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fase 1: 7 Dias */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                Fase 1
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <strong className="text-xs font-bold text-amber-950 block">
              7 Dias &bull; Período de Arrependimento
            </strong>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              A conta fica suspensa para edições, mas pode reverter e cancelar o pedido a qualquer instante com um clique.
            </p>
          </div>

          {/* Fase 2: 30 Dias */}
          <div className="p-4 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 bg-orange-200/60 px-2 py-0.5 rounded-full">
                Fase 2
              </span>
              <Trash2 className="w-4 h-4 text-orange-600" />
            </div>
            <strong className="text-xs font-bold text-orange-950 block">
              30 Dias &bull; Dados Pessoais
            </strong>
            <p className="text-[11px] text-orange-900/80 leading-relaxed">
              Eliminação permanente de credenciais, palavras-passe, números de telefone, endereços de email e histórico de acessos.
            </p>
          </div>

          {/* Fase 3: 90 Dias */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded-full">
                Fase 3
              </span>
              <FileText className="w-4 h-4 text-rose-600" />
            </div>
            <strong className="text-xs font-bold text-rose-950 block">
              90 Dias &bull; Dados de Obra
            </strong>
            <p className="text-[11px] text-rose-900/80 leading-relaxed">
              Expurgação de mapas de quantidades e rascunhos. <em>Excetuam-se faturas e registos fiscais exigidos pela AGT por 10 anos.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Caixa de Confirmação Interativa */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        {!activeRequest ? (
          <>
            <h3 className="text-sm font-extrabold text-slate-900">
              Confirmação de Vontade Expressa
            </h3>
            <p className="text-xs text-slate-600">
              Esta ação iniciará o processo de desativação da sua conta <strong>{currentUser.email}</strong>. Para confirmar que deseja avançar, por favor digite a palavra <strong className="text-rose-600 font-mono">APAGAR</strong> no campo abaixo:
            </p>

            <div className="space-y-3 max-w-md pt-1">
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder='Escreva "APAGAR" aqui'
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
              />

              <button
                type="button"
                disabled={!isConfirmed || loading}
                onClick={handleStartDeletion}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmar Encerramento de Conta</span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Conta em Período de Arrependimento Ativo (7 Dias)</span>
            </div>

            <div className="text-xs text-amber-900 space-y-1">
              <p>
                O pedido de eliminação foi registado em {new Date(activeRequest.requestedAt).toLocaleString('pt-AO')}.
              </p>
              <p className="font-semibold">
                Pode cancelar este encerramento e recuperar a totalidade dos seus orçamentos até{' '}
                {new Date(activeRequest.coolingOffUntil).toLocaleString('pt-AO')}.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={handleCancelDeletion}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Cancelar Encerramento & Manter Conta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  if (onNavigate) onNavigate('/entrar');
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Terminar Sessão Imediatamente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApagarContaSettingsPage;
