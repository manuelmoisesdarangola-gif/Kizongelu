/**
 * @file src/components/privacy-settings/ConsentimentosSettingsPage.tsx
 * Página de Gestão de Consentimentos Granulares (/definicoes/privacidade/consentimentos) — Fase 16.
 * Em conformidade com a Lei n.º 22/11 de Angola (Direito de Revogação do Consentimento).
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
  Lock,
  BarChart3,
  MessageSquare,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  getUserConsents,
  logConsentDecision,
  getConsentLogs,
  revokeConsentType,
  ConsentLog,
  ConsentType,
  UserConsentsState,
} from '@/lib/actions/consent';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';

interface ConsentimentosSettingsPageProps {
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export const ConsentimentosSettingsPage: React.FC<ConsentimentosSettingsPageProps> = ({
  onBack,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [consents, setConsents] = useState<UserConsentsState>(() => getUserConsents());
  const [logs, setLogs] = useState<ConsentLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [currentUser.id]);

  const loadLogs = async () => {
    const userLogs = await getConsentLogs(currentUser.id);
    setLogs(userLogs);
  };

  const handleToggle = async (type: ConsentType, currentValue: boolean) => {
    if (type === 'essential') {
      info('Cookies e dados essenciais são estritamente necessários ao funcionamento da plataforma.');
      return;
    }

    setLoading(true);
    try {
      const updated = await logConsentDecision(
        { [type]: !currentValue },
        currentUser.id
      );
      setConsents(updated);
      await loadLogs();
      if (!currentValue) {
        success(`Consentimento concedido para "${type}".`);
      } else {
        warning(`Consentimento retirado para "${type}".`);
      }
    } catch (e) {
      console.error(e);
      warning('Erro ao atualizar consentimento.');
    } finally {
      setLoading(false);
    }
  };

  const formatLogDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const categories = [
    {
      type: 'essential' as ConsentType,
      title: 'Cookies & Tratamento Estritamente Necessário',
      desc: 'Autenticação segura, proteção antifraude CSRF e integridade de sessões. Não podem ser desativados nos termos do Artigo 7.º da Lei 22/11.',
      icon: Lock,
      color: 'text-slate-800 bg-slate-100',
      active: true,
      locked: true,
    },
    {
      type: 'analytics' as ConsentType,
      title: 'Métricas Analíticas & Desempenho (Google Analytics 4)',
      desc: 'Métricas anónimas para calibrar a adesão de preços por província (Luanda, Benguela, Huambo) com endereço IP anonimizado.',
      icon: BarChart3,
      color: 'text-blue-700 bg-blue-50',
      active: consents.analytics,
      locked: false,
    },
    {
      type: 'functional' as ConsentType,
      title: 'Preferências Funcionais & Cache Regional',
      desc: 'Memorização automática da província de cálculo habitual e rascunhos de orçamentos para evitar perda de dados por quebras de rede.',
      icon: Sparkles,
      color: 'text-amber-700 bg-amber-50',
      active: consents.functional,
      locked: false,
    },
    {
      type: 'marketing' as ConsentType,
      title: 'Comunicações de Mercado & Alertas de Preços',
      desc: 'Notificações semanais por WhatsApp ou email com o índice de variação de preços de cimento e ferro em armazéns de Angola.',
      icon: MessageSquare,
      color: 'text-emerald-700 bg-emerald-50',
      active: consents.marketing,
      locked: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#0F3D5C]" />
            <span>Gestão Granular de Consentimentos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Controle como os seus dados são tratados com base na <strong>Lei n.º 22/11 de Angola</strong>. Pode revogar permissões a qualquer instante.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conformidade APD Ativa</span>
          </span>
        </div>
      </div>

      {/* Tabela de Consentimentos Atuais */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Categorias de Permissão
          </h2>
          <p className="text-xs text-slate-500">
            Alterne individualmente cada autorização para adaptar a sua experiência na plataforma.
          </p>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.type}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div className="flex items-start space-x-3.5 flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900">{cat.title}</strong>
                      {cat.locked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-xl">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                  <span className={`text-xs font-bold ${cat.active ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {cat.active ? 'Autorizado' : 'Recusado'}
                  </span>
                  <button
                    type="button"
                    disabled={cat.locked || loading}
                    onClick={() => handleToggle(cat.type, cat.active)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      cat.locked ? 'opacity-60 cursor-not-allowed bg-slate-300' : cat.active ? 'bg-[#0F3D5C]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        cat.active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            A retirada do consentimento produz efeitos imediatos e não prejudica a licitude do tratamento efetuado anteriormente com base no consentimento prévio (Art. 13.º da Lei 22/11).
          </span>
        </div>
      </div>

      {/* Registo de Auditoria de Consentimentos (ConsentLog) */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F3D5C]" />
              <span>Registo de Auditoria de Consentimentos (ConsentLog)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Histórico rastreável com carimbo temporal e hash criptográfico de IP para conformidade legal.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {logs.length} Registos
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Nenhum registo de consentimento registado nesta sessão.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">Data & Hora</th>
                  <th className="px-3 py-2.5">Categoria</th>
                  <th className="px-3 py-2.5">Decisão</th>
                  <th className="px-3 py-2.5">Hash IP Anonimizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 font-mono text-slate-600">
                      {formatLogDate(log.timestamp)}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-slate-900 uppercase text-[11px]">
                      {log.type}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.granted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {log.granted ? 'Concedido' : 'Revogado'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-500 text-[11px]">
                      {log.ipHash}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentimentosSettingsPage;
