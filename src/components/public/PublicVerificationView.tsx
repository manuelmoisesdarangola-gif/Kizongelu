/**
 * @file src/components/public/PublicVerificationView.tsx
 * Ecrã de Validação de QR Code / Token para exibição no Layout 1 (Público).
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Building2,
  MapPin,
  Calendar,
  Cpu,
  Key,
  FileCheck,
  Lock,
} from 'lucide-react';
import { verifyShareToken, VerificationResult } from '../../../lib/actions/share';
import { generateOrcamentoPdfBlob } from '../../../lib/pdf/generate-orcamento';
import { formatCurrencyKz } from '../../../lib/format/currency';

interface PublicVerificationViewProps {
  initialToken?: string;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  initialToken = '',
}) => {
  const [inputToken, setInputToken] = useState(initialToken);
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  React.useEffect(() => {
    if (initialToken) {
      setInputToken(initialToken);
      handleVerify(initialToken);
    }
  }, [initialToken]);

  const handleVerify = async (tokenToTest?: string, codeToTest?: string) => {
    const token = (tokenToTest !== undefined ? tokenToTest : inputToken).trim();
    const code = (codeToTest !== undefined ? codeToTest : accessCode).trim();

    if (!token) return;

    setLoading(true);
    try {
      const res = await verifyShareToken(token, code || undefined, {
        ip: '105.172.45.12',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'BrowserClient',
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCopy = async () => {
    if (!result?.budget?.projectId) return;
    setDownloading(true);
    try {
      const { blob } = await generateOrcamentoPdfBlob(result.budget.projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Verificacao_Kizongelu_${result.budget.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao descarregar cópia:', err);
    } finally {
      setDownloading(false);
    }
  };

  const isAuthentic = result?.status === 'AUTHENTIC';

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          VERIFICAÇÃO ANTI-FRAUDE
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Verificação de Orçamentos
        </h1>
        <p className="text-base text-slate-600">
          Insira o código do orçamento ou token impresso no QR Code do PDF para confirmar a autenticidade do documento.
        </p>
      </div>

      {/* Caixa de Pesquisa */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              placeholder="Cole aqui o código do orçamento ou token do QR"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            />
          </div>

          <button
            onClick={() => handleVerify()}
            disabled={loading || !inputToken.trim()}
            className="h-14 px-8 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-black text-sm rounded-2xl shadow-md transition-transform active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 shrink-0"
          >
            <span>{loading ? 'A validar...' : 'Verificar Autenticidade'}</span>
          </button>
        </div>
      </div>

      {/* Resultado da Verificação */}
      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {isAuthentic && result.budget ? (
            <div>
              <div className="bg-emerald-600 text-white p-6 sm:p-8 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    DOCUMENTO AUTÊNTICO
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black">{result.budget.title}</h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 text-xs text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Código do Orçamento</span>
                    <span className="text-base font-black text-[#0F3D5C] block font-mono">
                      {result.budget.id}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Tipologia</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {result.budget.type || result.budget.title}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Localização</span>
                    <span className="text-sm font-bold text-slate-900 block flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#F59E0B]" />
                      <span>{result.budget.municipality}, {result.budget.province}</span>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Área Bruta</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5">
                      {result.budget.areaM2} m²
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Data de Emissão</span>
                    <span className="text-sm font-bold text-slate-900 block mt-0.5 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {result.budget.issuedAt ? new Date(result.budget.issuedAt).toLocaleDateString('pt-PT') : '2026'}
                      </span>
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Validade Técnica</span>
                    <span className="text-sm font-bold text-emerald-700 block mt-0.5">
                      Válido (90 dias)
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Para protecção de dados comerciais, os montantes financeiros só são visíveis ao titular do documento através do painel autenticado.
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 text-slate-500 text-xs">
                    <Cpu className="w-4 h-4 text-slate-400" />
                    <span>Fórmulas de engenharia civil alinhadas com boas práticas em Angola.</span>
                  </div>

                  <button
                    onClick={handleDownloadCopy}
                    disabled={downloading}
                    className="w-full sm:w-auto px-5 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{downloading ? 'A gerar PDF...' : 'Descarregar PDF de Verificação'}</span>
                  </button>
                </div>

                {/* Disclaimers Legais e de Autenticidade (Fase 16) */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-[11px] text-slate-600 leading-relaxed">
                  <div className="flex items-center space-x-2 text-slate-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Aviso Legal & Declaração de Autenticidade Documental:</span>
                  </div>
                  <p>
                    A validação por código QR atesta a correspondência exacta entre este resumo e o código único gerado pelo sistema no momento da emissão.
                  </p>
                  <p>
                    A adulteração dolosa de quantitativos ou valores orçamentados para apresentação a terceiros constitui crime nos termos da legislação angolana aplicável.
                  </p>
                  <p className="text-slate-500">
                    Este documento constitui estimativa paramétrica de engenharia de custos e não dispensa o projecto de estabilidade e a direção técnica de um engenheiro civil inscrito na Ordem dos Engenheiros de Angola (OEA).
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="text-lg font-black text-slate-900">Documento Não Encontrado ou Inválido</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {result.message || 'O código inserido não corresponde a nenhum orçamento emitido oficialmente.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicVerificationView;
