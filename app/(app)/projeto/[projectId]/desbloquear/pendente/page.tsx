/**
 * @file app/(app)/projeto/[projectId]/desbloquear/pendente/page.tsx
 * Página de pendência prolongada (>24h em análise) com banner de aviso e contacto prioritário.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, ArrowLeft, RefreshCw, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getPaymentStatus, PaymentStatusResponse } from '../../../../../../lib/actions/payment';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function PendentePage({ params }: PageProps) {
  const projectId = params?.projectId || 'proj_sample_01';
  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPaymentStatus(projectId).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [projectId]);

  const handleSendWhatsApp = () => {
    const ref = data?.payment?.reference || 'N/A';
    const text = encodeURIComponent(
      `Olá Kizongelu, o meu comprovativo para o projeto ${projectId} (Ref: ${ref}) está pendente de análise há mais de 24 horas. Podem verificar a prioridade de desbloqueio? Obrigado.`
    );
    window.open(`https://wa.me/244923000111?text=${text}`, '_blank');
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-['Inter',sans-serif]">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a
              href={`/projeto/${projectId}/desbloquear/estado`}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Voltar ao estado"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Acompanhamento de Pendência
              </span>
              <h1 className="text-lg font-bold text-slate-900 mt-0.5">Comprovativo em Análise Prolongada</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner Amarelo de Alerta */}
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-xs">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="text-base font-bold text-amber-950">
                O seu comprovativo está em análise há mais de 24h
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed">
                Normalmente o processo de validação de crédito e conciliação bancária é concluído em poucas horas úteis.
                Se a transferência foi efetuada através de compensação interbancária ou durante o fim-de-semana,
                o crédito pode demorar até 24 a 48 horas úteis a ser refletido no extrato.
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Falar com o Gestor de Conta no WhatsApp</span>
                </button>

                <a
                  href={`/projeto/${projectId}/desbloquear/estado`}
                  className="px-4 py-2.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-900 font-bold text-xs transition-colors"
                >
                  Ver Linha do Tempo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Pedido */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Detalhes do Comprovativo Registado
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Referência:</span>
              <span className="font-mono font-bold text-slate-900">{data.payment?.reference || 'KZ-2025-XXXX'}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Tempo em análise:</span>
              <span className="font-bold text-amber-700">{data.hoursPending} horas decorridas</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Montante:</span>
              <span className="font-bold text-slate-900">12.999 Kz</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Canal de Validação:</span>
              <span className="font-medium text-slate-900">Tesouraria Kizongelu Lda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
