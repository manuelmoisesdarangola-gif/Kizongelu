/**
 * @file src/components/admin/AdminNotifications.tsx
 * Painel Administrativo de Notificações (/admin/notificacoes) — Fase 12.
 * 
 * Funcionalidades:
 * - Visão geral de eventos configurados por categoria (ACCOUNT, PAYMENT, PROJECT, SHARE, ONBOARDING, REENGAGEMENT).
 * - Monitorização de canais ativos (In-App, Email, Push, WhatsApp, SMS).
 * - Tabela de envios recentes com taxa de abertura e indicador de sucesso/falha.
 * - Testador em direto de eventos com payload personalizável.
 * - Editor de templates (stub com pré-visualização de React Email, Web Push e WhatsApp).
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  FileCode,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../auth/auth-context';
import {
  NotificationEvent,
  sendNotification,
  getNotificationDispatches,
  NotificationDispatchLog,
  renderNotificationTemplate,
} from '../../../lib/notifications';

export const AdminNotifications: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'events' | 'logs' | 'test' | 'templates'>('events');
  const [dispatches, setDispatches] = useState<NotificationDispatchLog[]>([]);
  const [selectedEventForPreview, setSelectedEventForPreview] = useState<NotificationEvent>('approved');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Campos para teste em direto
  const [testUserId, setTestUserId] = useState(currentUser.id);
  const [testProjectName, setTestProjectName] = useState('Edifício Benguela Center');
  const [testValor, setTestValor] = useState('240.000 Kz');

  useEffect(() => {
    setDispatches(getNotificationDispatches());
  }, []);

  const handleTriggerTest = async () => {
    setIsSendingTest(true);
    try {
      const res = await sendNotification(testUserId, selectedEventForPreview, {
        nome: currentUser.nome,
        email: currentUser.email,
        telefone: '+244923000000',
        projectName: testProjectName,
        valor: testValor,
        link: window.location.origin + '/projetos',
        motivo: 'Documentação validada pela equipa',
      });

      setDispatches(getNotificationDispatches());
      if (res.overallSuccess) {
        success(`Evento "${selectedEventForPreview}" disparado com sucesso!`, `${res.results.length} canais processados.`);
      } else {
        warning('Disparo concluído com alertas de fallback.');
      }
    } catch (e: any) {
      warning('Erro ao disparar evento de teste.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const previewTemplate = renderNotificationTemplate(selectedEventForPreview, {
    nome: currentUser.nome,
    projectName: testProjectName,
    valor: testValor,
    link: 'https://kizongelu.ao/painel',
  });

  const allEventsList: { event: NotificationEvent; category: string; description: string }[] = [
    { event: 'welcome', category: 'ACCOUNT', description: 'Boas-vindas e ativação imediata de conta' },
    { event: 'verify_email', category: 'ACCOUNT', description: 'Link seguro de confirmação de endereço' },
    { event: 'reset_password', category: 'ACCOUNT', description: 'Reposição de credenciais de acesso' },
    { event: 'password_changed', category: 'ACCOUNT', description: 'Aviso de segurança de senha alterada' },
    { event: 'new_device_login', category: 'ACCOUNT', description: 'Alerta de login em novo navegador/IP' },
    { event: 'proof_received', category: 'PAYMENT', description: 'Comprovativo Multicaixa em análise' },
    { event: 'approved', category: 'PAYMENT', description: 'Pagamento aprovado e obra concluída' },
    { event: 'rejected', category: 'PAYMENT', description: 'Recusa com motivo e pedido de reenvio' },
    { event: 'calculation_ready', category: 'PROJECT', description: 'Cálculo de quantidades pronto para visualização' },
    { event: 'unlocked', category: 'PROJECT', description: 'Concessão de acesso integral a todos os capítulos' },
    { event: 'expiring_soon', category: 'PROJECT', description: 'Preços unitários perto do limite de 30 dias' },
    { event: 'document_shared', category: 'SHARE', description: 'Geração de link público e QR Code' },
    { event: 'document_opened', category: 'SHARE', description: 'Consulta do projeto por terceiro auditada' },
    { event: 'day_1', category: 'ONBOARDING', description: 'Tutorial de coeficientes provinciais' },
    { event: 'day_7', category: 'ONBOARDING', description: 'Guia de submissão para crédito bancário' },
    { event: 'draft_24h', category: 'REENGAGEMENT', description: 'Lembrete de rascunho de obra incompleto' },
  ];

  return (
    <div className="space-y-6">
      {/* Topo do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <span>Gestor Central de Notificações Multicanal</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Supervisão de 5 canais ativos (In-App, Email, Web Push, WhatsApp, SMS) e regras de redundância.
          </p>
        </div>

        {/* Abas */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'events' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Matriz de Eventos
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Envios ({dispatches.length})
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'test' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Disparo em Direto
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'templates' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Editor de Templates
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIZ DE EVENTOS */}
      {activeTab === 'events' && (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Eventos Mapeados & Canais Disponíveis
            </h2>
            <div className="flex items-center space-x-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> In-App</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Email</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Web Push</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> WhatsApp</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> SMS</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Descrição de Negócio</th>
                  <th className="py-3 px-4 text-center">In-App</th>
                  <th className="py-3 px-4 text-center">Email</th>
                  <th className="py-3 px-4 text-center">Push</th>
                  <th className="py-3 px-4 text-center">WhatsApp</th>
                  <th className="py-3 px-4 text-center">SMS</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {allEventsList.map((item) => (
                  <tr key={item.event} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{item.event}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.description}</td>
                    <td className="py-3 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedEventForPreview(item.event);
                          setActiveTab('test');
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                      >
                        Testar &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE ENVIOS */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Registo de Despachos Recentes e Taxa de Abertura
            </h2>
            <span className="text-xs text-emerald-400 font-bold">Taxa Média de Sucesso: 98.4%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">ID Despacho</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Canais Disparados</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Taxa Abertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {dispatches.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{log.id}</td>
                    <td className="py-3 px-4 font-bold text-white">{log.event}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.timestamp).toLocaleString('pt-PT')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {log.channels.map((ch) => (
                          <span key={ch} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {log.successCount} OK / {log.failureCount} Erros
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {log.openRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISPARO EM DIRETO */}
      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Disparo */}
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400" />
              <span>Simulador de Disparo em Tempo Real</span>
            </h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Evento a Disparar:</label>
              <select
                value={selectedEventForPreview}
                onChange={(e) => setSelectedEventForPreview(e.target.value as NotificationEvent)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {allEventsList.map((e) => (
                  <option key={e.event} value={e.event}>
                    [{e.category}] {e.event} — {e.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Projecto:</label>
                <input
                  type="text"
                  value={testProjectName}
                  onChange={(e) => setTestProjectName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor Transação (Kz):</label>
                <input
                  type="text"
                  value={testValor}
                  onChange={(e) => setTestValor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400 space-y-1">
              <div><strong>Destinatário:</strong> {currentUser.nome} ({currentUser.email})</div>
              <div><strong>Canais Disparados:</strong> IN_APP + EMAIL + PUSH + WHATSAPP + SMS</div>
              <div><strong>Política:</strong> 3x Retry automático com canal de fallback</div>
            </div>

            <button
              onClick={handleTriggerTest}
              disabled={isSendingTest}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingTest ? 'A despachar pelos 5 canais...' : 'Disparar Notificação Imediata'}</span>
            </button>
          </div>

          {/* Pré-visualização Multicanal */}
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <span>Pré-Visualização do Conteúdo Formatado</span>
            </h2>

            {/* Email */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-blue-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Assunto do Email:
              </span>
              <div className="text-white font-semibold">{previewTemplate.emailSubject}</div>
            </div>

            {/* Web Push */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Web Push (Título máx 60, Corpo máx 120):
              </span>
              <div className="text-white font-bold">{previewTemplate.pushTitle}</div>
              <div className="text-slate-300">{previewTemplate.pushBody}</div>
            </div>

            {/* WhatsApp */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Business:
              </span>
              <div className="text-slate-200 whitespace-pre-line font-mono text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {previewTemplate.whatsappText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EDITOR DE TEMPLATES (STUB) */}
      {activeTab === 'templates' && (
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>Editor de Templates Dinâmicos (React Email / Push / WhatsApp)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Variáveis injetadas no momento do despacho: <code className="text-amber-400">{'{{nome}}'}</code>, <code className="text-amber-400">{'{{valor}}'}</code>, <code className="text-amber-400">{'{{data}}'}</code>, <code className="text-amber-400">{'{{link}}'}</code>.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Versão 1.2 — Ativo
            </span>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
            <div className="text-slate-500">// Template de Email React Email (components/emails/PaymentApprovedEmail.tsx)</div>
            <div className="text-emerald-400">&lt;EmailLayout title="Pagamento Confirmado" previewText={`Pagamento de ${'{valor}'}`}&gt;</div>
            <div className="pl-4 text-slate-200">&lt;p&gt;Olá {`{nome}`}, o seu pagamento de {`{valor}`} foi validado.&lt;/p&gt;</div>
            <div className="pl-4 text-amber-400">&lt;a href={`{link}`}&gt;Aceder ao Projecto&lt;/a&gt;</div>
            <div className="text-emerald-400">&lt;/EmailLayout&gt;</div>
          </div>

          <p className="text-[11px] text-slate-400">
            * O editor visual com drag-and-drop e suporte a campanhas de marketing estará disponível em actualizações posteriores.
          </p>
        </div>
      )}
    </div>
  );
};
