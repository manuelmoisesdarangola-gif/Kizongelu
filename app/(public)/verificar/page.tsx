/**
 * @file app/(public)/verificar/page.tsx
 * Portal Público de Verificação Manual de Autenticidade de Orçamentos Kizongelu.
 * Permite a bancos, clientes, fiscais e construtores verificar a validade jurídica e técnica
 * de qualquer orçamento gerado pela plataforma inserindo o ID do documento ou Token do QR.
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Building2,
  MapPin,
  Calendar,
  Cpu,
  Key,
  ExternalLink,
  ArrowRight,
  FileCheck,
  Lock,
} from 'lucide-react';
import { verifyShareToken, VerificationResult, revokeShareLink } from '../../../lib/actions/share';
import { generateOrcamentoPdfBlob } from '../../../lib/pdf/generate-orcamento';

export default function ManualVerificationPage() {
  const [inputToken, setInputToken] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [downloading, setDownloading] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#0A293E] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Topo Institucional */}
      <header className="border-b border-slate-800 bg-[#061B29]/80 backdrop-blur-md sticky top-0 z-10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-sm">
              OC
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                Kizongelu
              </span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase block">
                Portal Público de Verificação
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Verificação Criptográfica de Angola</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-2 text-amber-300 text-xs font-bold mb-3">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>Validação de Autenticidade Documental</span>
            <span className="text-white/30" aria-hidden="true">&bull;</span>
            <span className="text-slate-300 font-normal">Boas práticas de engenharia civil</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Verificar Orçamento Kizongelu
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Insira o código do orçamento (ex: <code className="text-amber-400 font-mono">KZ-2025-XXXX</code>) ou o token UUID constante no rodapé do documento impresso.
          </p>
        </div>

        {/* Caixa de Entrada e Pesquisa */}
        <div className="bg-[#0D3652] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                ID do Orçamento ou Token de Verificação
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Cole aqui o código do orçamento ou token do QR"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#061B29] border border-slate-700 rounded-2xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Código de Segurança opcional */}
            {(result?.status === 'CODE_REQUIRED' || result?.status === 'INVALID_CODE' || accessCode) && (
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5" />
                  <span>Código de Segurança (6 Dígitos)</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="ex: 123456"
                  className="w-full px-4 py-3 bg-[#061B29] border border-amber-500/50 rounded-2xl text-amber-300 placeholder-slate-600 text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !inputToken.trim()}
              className="w-full min-h-[48px] py-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-slate-950 font-black text-sm rounded-2xl transition-all shadow-lg cursor-pointer flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>A consultar base de autenticidade...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar Autenticidade do Documento</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resultado da Verificação */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Caso 1: AUTÊNTICO / ORIGINAL */}
            {result.status === 'AUTHENTIC' && result.budget && (
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-emerald-500 space-y-6">
                {/* Badge Verde de Sucesso */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DOCUMENTO AUTÊNTICO</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Certificado pela Kizongelu
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">ID Oficial</span>
                    <span className="text-base font-black font-mono text-slate-900 block">
                      {result.budget.id}
                    </span>
                  </div>
                </div>

                {/* Grelha de Dados Técnicos Autênticos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">PROJECTO & TIPO</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {result.budget.title}
                    </span>
                    <span className="text-slate-500 block mt-0.5">{result.budget.type}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">LOCALIZAÇÃO</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {result.budget.province}
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      {result.budget.municipality || 'Sede Municipal'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">DATA DE EMISSÃO</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {new Date(result.budget.issuedAt).toLocaleDateString('pt-PT')}
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      Válido por 90 dias
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">ÁREA & DIVISÕES</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {result.budget.areaM2} m² ({result.budget.floors} Piso)
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      {result.budget.bedrooms} Quartos &bull; {result.budget.bathrooms} WCs
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">SISTEMA DE CÁLCULO</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      {result.budget.engineVersion}
                    </span>
                    <span className="text-emerald-700 font-bold block mt-0.5">
                      Confiança: {result.budget.confidenceScore}% (Alta)
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-slate-400 block mb-1">VALIDADE TÉCNICA</span>
                    <span className="font-extrabold text-emerald-700 block text-sm">
                      Documento Válido (90 dias)
                    </span>
                    <span className="text-slate-500 block mt-0.5">
                      Parâmetros em vigor
                    </span>
                  </div>
                </div>

                {/* Nota de Protecção de Dados Comerciais */}
                <div className="p-4 bg-slate-100/90 rounded-2xl border border-slate-200 text-slate-600 text-xs flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Para protecção de dados comerciais, os montantes financeiros só são visíveis ao titular do documento através do painel autenticado.
                  </span>
                </div>

                {/* Botões de Ação */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-700 block">Estado do Documento: Original & Vigente</span>
                    <span>A verificação pública confere com o registo de cálculo original.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadCopy}
                    disabled={downloading}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>{downloading ? 'A gerar documento...' : 'Descarregar Cópia de Verificação (PDF)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Caso 2: CÓDIGO REQUERIDO OU INVÁLIDO */}
            {(result.status === 'CODE_REQUIRED' || result.status === 'INVALID_CODE') && (
              <div className="bg-amber-500/10 border-2 border-amber-500 rounded-3xl p-6 text-amber-200 space-y-3">
                <div className="flex items-center space-x-3">
                  <Key className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-base text-amber-300">
                      {result.status === 'CODE_REQUIRED'
                        ? 'Código de Segurança Obrigatório'
                        : 'Código de Segurança Incorreto'}
                    </h4>
                    <p className="text-xs text-amber-200 mt-0.5">
                      {result.message} Introduza o código de 6 dígitos facultado pelo emissor do orçamento no campo acima e clique novamente em Verificar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Caso 3: REVOGADO */}
            {result.status === 'REVOKED' && (
              <div className="bg-red-500/10 border-2 border-red-500 rounded-3xl p-6 sm:p-8 text-white space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-black text-xs">
                      <span>DOCUMENTO REVOGADO</span>
                    </div>
                    <h3 className="text-lg font-black text-red-200 mt-1">
                      Sem Validade Jurídica ou Técnica
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Este orçamento foi formalmente revogado pelo seu autor ou pela administração do Kizongelu. Não deve ser utilizado para efeitos de financiamento bancário, contratação de empreiteiros ou medições em obra.
                </p>
              </div>
            )}

            {/* Caso 4: EXPIRADO */}
            {result.status === 'EXPIRED' && (
              <div className="bg-amber-500/10 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-white space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs">
                      <span>PRAZO DE VALIDADE EXPIRADO</span>
                    </div>
                    <h3 className="text-lg font-black text-amber-200 mt-1">
                      Prazo de 90 Dias Ultrapassado
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  O link de validação deste orçamento expirou. Devido à volatilidade de preços dos materiais em Angola, os orçamentos devem ser recalculados após 90 dias para garantir fidelidade orçamental.
                </p>
              </div>
            )}

            {/* Caso 5: NÃO ENCONTRADO */}
            {result.status === 'NOT_FOUND' && (
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-extrabold text-base text-white">
                  Documento Não Encontrado
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {result.message} Verifique se digitou o identificador corretamente ou aponte a câmara do telemóvel para o código QR presente no documento.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rodapé Oficial */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Kizongelu &bull; Plataforma de Orçamentação e Engenharia &bull; República de Angola</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Registo de acessos auditado com código único de verificação de acordo com as normas de proteção de dados.
        </p>
      </footer>
    </div>
  );
}
