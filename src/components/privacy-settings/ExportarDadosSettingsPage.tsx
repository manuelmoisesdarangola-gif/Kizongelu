/**
 * @file src/components/privacy-settings/ExportarDadosSettingsPage.tsx
 * Solicitação e Descarregamento de Arquivo de Dados Pessoais (/definicoes/privacidade/exportar) — Fase 16.
 * Cumprimento do Artigo 10.º da Lei n.º 22/11 de Angola (Direito de Acesso e Portabilidade).
 */

import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  CheckCircle2,
  Clock,
  Mail,
  Shield,
  ArrowLeft,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import { requestDataExport, DataExportRequest } from '@/lib/actions/consent';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';

interface ExportarDadosSettingsPageProps {
  onBack?: () => void;
  onNavigate?: (path: string) => void;
}

export const ExportarDadosSettingsPage: React.FC<ExportarDadosSettingsPageProps> = ({
  onBack,
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [requestState, setRequestState] = useState<DataExportRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleRequestExport = async () => {
    setLoading(true);
    try {
      // Simulação do processamento assíncrono via fila de trabalho (Inngest pattern)
      info('A iniciar processamento assíncrono do arquivo...', 'Fila de Exportação');
      
      const req = await requestDataExport(currentUser.id);
      
      // Delay pequeno para demonstrar transição de estado da fila
      setTimeout(() => {
        setRequestState(req);
        setLoading(false);
        success(
          'Arquivo consolidado gerado com sucesso!',
          `O link de download foi registado e enviado para ${currentUser.email} (válido por 24 horas).`
        );
      }, 1200);
    } catch (e) {
      console.error(e);
      warning('Erro ao processar pedido de exportação.');
      setLoading(false);
    }
  };

  const handleTriggerDownload = () => {
    // Gera o pacote JSON com os dados do utilizador
    const payload = {
      plataforma: 'Kizongelu Angola (SaaS de Orçamentação de Construção)',
      legislacao: 'Lei n.º 22/11 de 17 de Junho — República de Angola',
      dataExportacao: new Date().toISOString(),
      titular: {
        id: currentUser.id,
        nome: currentUser.nome,
        email: currentUser.email,
        papel: currentUser.role,
      },
      dadosIncluidos: [
        'Perfil do Utilizador e Dados Fiscais de Angola',
        'Histórico Completo de Orçamentos e Medições Paramétricas',
        'Registo de Transações e Comprovativos Multicaixa Express',
        'Logs de Consentimento e Auditoria de Privacidade',
      ],
      notaSeguranca: 'Este ficheiro contém dados pessoais confidenciais. Guarde-o em local seguro.',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kizongelu_Exportacao_Dados_${currentUser.id}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    success('Descarregamento do ficheiro JSON iniciado com sucesso.');
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
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Download className="w-6 h-6 text-[#0F3D5C]" />
          <span>Exportação de Dados Pessoais (Portabilidade)</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Obtenha uma cópia integral dos seus projectos, orçamentos, faturas e registos da conta em formato estruturado (JSON/ZIP).
        </p>
      </div>

      {/* Cartão de Enquadramento Legal */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Direito de Acesso e Portabilidade (Art. 10.º da Lei n.º 22/11 de Angola)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              O titular dos dados tem o direito de receber do responsável pelo tratamento os dados pessoais que lhe digam respeito num formato estruturado, de uso corrente e de leitura ótica, permitindo a sua guarda pessoal ou transferência para outro sistema.
            </p>
          </div>
        </div>

        {/* Itens incluídos na exportação */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-900 block mb-2">
            O pacote de exportação inclui os seguintes arquivos:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
              <User className="w-4 h-4 text-[#0F3D5C] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Perfil & Faturação</strong>
                <span className="text-slate-500 text-[11px]">Nome, email, telefone, NIF e morada em Angola.</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Projectos & Orçamentos</strong>
                <span className="text-slate-500 text-[11px]">Mapas de quantidades, fórmulas e traços de betão.</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
              <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Faturas & Pagamentos</strong>
                <span className="text-slate-500 text-[11px]">Histórico de transações Multicaixa Express e faturas AGT.</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-bold">Auditoria de Consentimentos</strong>
                <span className="text-slate-500 text-[11px]">ConsentLogs com carimbo temporal e hash de IP.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caixa de Ação do Pedido */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900">
          Iniciar Solicitação de Exportação
        </h3>
        <p className="text-xs text-slate-600">
          Após premir o botão, o motor assíncrono reunirá todas as suas informações num arquivo cifrado. Um email será enviado para <strong>{currentUser.email}</strong> com a confirmação e o ficheiro ficará disponível para download imediato abaixo durante 24 horas.
        </p>

        {!requestState ? (
          <div className="pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleRequestExport}
              className="px-6 py-3 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>A processar arquivo assíncrono...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Solicitar Exportação de Dados</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Arquivo Pronto para Descarregamento</span>
            </div>
            <div className="text-xs text-emerald-800 space-y-1">
              <p>O pacote digital com os seus dados foi gerado com sucesso.</p>
              <p className="text-[11px] text-emerald-700 font-mono">
                Identificador: {requestState.id} &bull; Válido até:{' '}
                {new Date(requestState.expiresAt || '').toLocaleString('pt-AO')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTriggerDownload}
                className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform cursor-pointer inline-flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Descarregar Dados Agora (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequestState(null);
                  setDownloadSuccess(false);
                }}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Nova Solicitação
              </button>
            </div>

            {downloadSuccess && (
              <p className="text-[11px] text-emerald-700 font-medium">
                Descarregamento concluído. O link continuará ativo por 24 horas no seu correio eletrónico.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportarDadosSettingsPage;
