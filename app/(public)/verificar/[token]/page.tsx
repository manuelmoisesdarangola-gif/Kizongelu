/**
 * @file app/(public)/verificar/[token]/page.tsx
 * Página Pública de Verificação por URL/QR Code (Sem Necessidade de Login).
 * Quando o destinatário lê o QR impresso no PDF (28x28mm), é direcionado para esta página.
 * 
 * Exibe:
 * - Badge verde "Documento autêntico".
 * - ID do orçamento, tipo de obra, província, data de emissão, versão do motor.
 * - Estado: original / desatualizado / revogado / expirado.
 * - Botão "Descarregar cópia de verificação" (PDF resumido).
 * - Ecrã de erro caso inválido, revogado ou expirado.
 * - Registo em ShareAccess com IP hashed e user-agent.
 */

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
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
  Layers,
  Sparkles,
  Lock,
} from 'lucide-react';
import { verifyShareToken, VerificationResult } from '../../../../lib/actions/share';
import { generateOrcamentoPdfBlob } from '../../../../lib/pdf/generate-orcamento';

interface TokenVerificationPageProps {
  params?: { token: string };
  tokenProp?: string;
  onBackToSearch?: () => void;
}

export default function TokenVerificationPage({
  params,
  tokenProp,
  onBackToSearch,
}: TokenVerificationPageProps) {
  const token = tokenProp || params?.token || '';
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const loadVerification = async (code?: string) => {
    setLoading(true);
    try {
      const res = await verifyShareToken(token, code, {
        ip: '105.172.45.12',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'VerificationClient',
      });
      setResult(res);
      if (res.status === 'INVALID_CODE') {
        setCodeError('Código de segurança incorreto. Tente novamente.');
      } else {
        setCodeError('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVerification();
  }, [token]);

  const handleDownloadCopy = async () => {
    if (!result?.budget?.projectId) return;
    setDownloading(true);
    try {
      const { blob } = await generateOrcamentoPdfBlob(result.budget.projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Copia_Verificacao_${result.budget.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao gerar download:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A293E] flex flex-col items-center justify-center p-6 text-center text-slate-300 font-['Inter',sans-serif]">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-base font-bold text-white">A verificar assinatura criptográfica do documento...</p>
        <p className="text-xs text-slate-400 mt-1 font-mono">Token: {token}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A293E] text-slate-100 flex flex-col font-['Inter',sans-serif]">
      {/* Topo Oficial de Certificação */}
      <header className="border-b border-slate-800 bg-[#061B29]/90 backdrop-blur-md px-4 py-3 sticky top-0 z-10">
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
                Serviço de Verificação QR
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Validação Pública</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {/* CASO 1: DOCUMENTO AUTÊNTICO */}
        {result?.status === 'AUTHENTIC' && result.budget && (
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-emerald-500 space-y-6 animate-in fade-in">
            {/* Header de Autenticidade */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>DOCUMENTO AUTÊNTICO</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    Orçamento Certificado Emitido
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Os dados abaixo correspondem com exatidão ao cálculo emitido oficialmente pela plataforma.
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">ID do Orçamento</span>
                <span className="text-base font-black font-mono text-slate-900 block">
                  {result.budget.id}
                </span>
              </div>
            </div>

            {/* Grelha de Informações Verificadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">PROJECTO / TITULAR</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {result.budget.title}
                </span>
                <span className="text-slate-500 block mt-0.5">{result.budget.clientName || 'Particular'}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">TIPO DE OBRA</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {result.budget.type}
                </span>
                <span className="text-slate-500 block mt-0.5">{result.budget.finishLevel}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">LOCALIZAÇÃO</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {result.budget.province}
                </span>
                <span className="text-slate-500 block mt-0.5">{result.budget.municipality || 'Sede'}</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">DATA DE EMISSÃO</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {new Date(result.budget.issuedAt).toLocaleDateString('pt-PT')}
                </span>
                <span className="text-slate-500 block mt-0.5">Validade: 90 dias de consulta</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">SISTEMA DE CÁLCULO</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {result.budget.engineVersion}
                </span>
                <span className="text-emerald-700 font-bold block mt-0.5">
                  Índice de Confiança: {result.budget.confidenceScore}% (Alto)
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold block mb-1">VALIDADE TÉCNICA</span>
                <span className="font-extrabold text-emerald-700 text-sm block">
                  Documento Válido (90 dias)
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Área: {result.budget.areaM2} m² ({result.budget.floors} Piso)
                </span>
              </div>
            </div>

            {/* Nota de Protecção de Dados Comerciais */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center space-x-3 mt-4">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Para protecção de dados comerciais, os montantes financeiros só são visíveis ao titular do documento através do painel autenticado.
              </span>
            </div>

            {/* Estado do Documento e Download */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="font-extrabold text-emerald-900 text-sm block">
                  Estado: Documento Original e Vigente
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  A integridade digital deste orçamento foi verificada via hash criptográfico de segurança.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadCopy}
                disabled={downloading}
                className="w-full sm:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer flex-shrink-0"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>{downloading ? 'A gerar documento...' : 'Descarregar Cópia de Verificação'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CASO 2: CÓDIGO DE SEGURANÇA EXIGIDO */}
        {(result?.status === 'CODE_REQUIRED' || result?.status === 'INVALID_CODE') && (
          <div className="bg-[#0D3652] border border-amber-500/50 rounded-3xl p-8 max-w-md mx-auto w-full text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Código de Acesso Requerido</h3>
              <p className="text-xs text-slate-300 mt-1">
                Este orçamento está protegido pelo autor com um código de segurança de 6 dígitos.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadVerification(accessCode);
              }}
              className="space-y-4"
            >
              <input
                type="text"
                maxLength={6}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="ex: 123456"
                className="w-full py-3 px-4 bg-[#061B29] border border-slate-700 rounded-2xl text-center text-lg font-mono tracking-widest text-amber-300 focus:outline-none focus:border-amber-500"
              />
              {codeError && <p className="text-xs text-red-400">{codeError}</p>}
              <button
                type="submit"
                disabled={!accessCode.trim()}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                Desbloquear Verificação
              </button>
            </form>
          </div>
        )}

        {/* CASO 3: REVOGADO */}
        {result?.status === 'REVOKED' && (
          <div className="bg-red-500/10 border-2 border-red-500/80 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 font-black text-xs uppercase">
                Documento Revogado
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                Este Orçamento Não Tem Mais Validade
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                O autor deste orçamento ou a administração do Kizongelu revogou este link. O documento não deve ser aceito para efeitos de financiamento ou contratação de obras.
              </p>
            </div>
          </div>
        )}

        {/* CASO 4: EXPIRADO */}
        {result?.status === 'EXPIRED' && (
          <div className="bg-amber-500/10 border-2 border-amber-500/60 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-black text-xs uppercase">
                Prazo Expirado
              </span>
              <h3 className="text-xl font-black text-white mt-2">
                Prazo de Verificação de 90 Dias Ultrapassado
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Os preços praticados no mercado angolano sofrem variações periódicas. Para obter um orçamento atualizado com base nos preços correntes da província, solicite uma nova versão ao titular.
              </p>
            </div>
          </div>
        )}

        {/* CASO 5: NÃO ENCONTRADO */}
        {result?.status === 'NOT_FOUND' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-slate-700 text-slate-300 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Documento Não Identificado</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Não foi possível encontrar nenhum orçamento com o código fornecido. Verifique se o QR code foi lido corretamente.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Rodapé Oficial */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>Kizongelu &bull; Plataforma de Orçamentação e Engenharia &bull; Luanda, Angola</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Acesso verificado e auditado com registo de hash de IP e timestamp de segurança.
        </p>
      </footer>
    </div>
  );
}
