/**
 * @file src/components/payment/PaymentUnlockPage.tsx
 * Página de Desbloqueio do Projeto com duas colunas (Benefícios à esquerda e Instruções de Pagamento + Upload à direita).
 */

import React, { useState } from 'react';
import {
  Check,
  Copy,
  CheckCheck,
  Building2,
  Smartphone,
  ShieldCheck,
  ArrowLeft,
  Coins,
  FileCheck2,
  Sparkles,
  Info,
} from 'lucide-react';
import { getPaymentInstructions, PaymentMethod } from '../../../lib/actions/payment';
import { PaymentProofUpload } from './PaymentProofUpload';

interface PaymentUnlockPageProps {
  projectId: string;
  projectTitle?: string;
  onBack?: () => void;
  onNavigateToStatus?: () => void;
}

export const PaymentUnlockPage: React.FC<PaymentUnlockPageProps> = ({
  projectId,
  projectTitle = 'Moradia Familiar T3',
  onBack,
  onNavigateToStatus,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('TRANSFERENCIA');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = getPaymentInstructions(projectId);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(bankDetails.textoCopiaTudo);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const handleCopySingle = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const benefits = [
    'Mapa de quantidades completo',
    'Preços unitários e fontes',
    'Lista de materiais',
    'Mão de obra e equipamentos',
    'Custos por capítulo',
    'Orçamento por fases',
    'PDF profissional com QR',
    'Histórico no painel',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Voltar ao preview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Desbloqueio de Orçamento
                </span>
                <span className="text-xs text-slate-400">ID: {projectId}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 mt-0.5">{projectTitle}</h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Processamento Seguro com Validação Financeira</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Layout em 2 Colunas (Desktop) / Empilhado (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= COLUNA ESQUERDA: BENEFÍCIOS ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Acesso Imediato Vitalício</span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                Desbloqueie o seu Orçamento Completo
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Obtenha o mapa de medições detalhado, as listas nominais de compras de materiais e o documento completo com verificação QR pronto para empreiteiros e clientes.
              </p>

              {/* Caixa de Preço */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block">
                    Preço Especial
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">12.999</span>
                    <span className="text-base font-bold text-slate-700">Kz</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Pagamento único
                </span>
              </div>

              {/* Lista com checks */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Tudo o que está incluído:
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center space-x-3 text-sm text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                      <span className="font-medium">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Destaque de Garantia */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-start space-x-3 text-xs text-slate-500">
                <FileCheck2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Documentação calculada segundo as normas construtivas de Angola e índices provinciais vigentes.
                </p>
              </div>
            </div>
          </div>

          {/* ================= COLUNA DIREITA: INSTRUÇÕES E UPLOAD ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card de Instruções de Pagamento */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Instruções de Pagamento</h2>
                  <p className="text-xs text-slate-500">Escolha o seu método preferido e copie as coordenadas bancárias</p>
                </div>

                {/* Dropdown de Método de Pagamento */}
                <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMethod('TRANSFERENCIA')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      method === 'TRANSFERENCIA'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Transferência Bancária</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('MULTICAIXA_EXPRESS')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      method === 'MULTICAIXA_EXPRESS'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Multicaixa Express</span>
                  </button>
                </div>
              </div>

              {/* Conteúdo do Método Selecionado */}
              <div className="py-5 space-y-3.5">
                {method === 'TRANSFERENCIA' ? (
                  <>
                    {/* IBAN */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          IBAN (Transferência bancária)
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 select-all">
                          {bankDetails.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(bankDetails.iban, 'iban')}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Copiar IBAN"
                      >
                        {copiedField === 'iban' ? (
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Titular e Informações */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 block">Titular da Conta</span>
                        <span className="text-sm font-semibold text-slate-900">{bankDetails.titular}</span>
                      </div>
                      {bankDetails.nif ? (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 block">NIF da Empresa</span>
                          <span className="text-sm font-mono font-semibold text-slate-900">{bankDetails.nif}</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[11px] font-semibold text-slate-500 block">Destino do Pagamento</span>
                          <span className="text-sm font-semibold text-slate-900">Desbloqueio de Obra</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Multicaixa Express */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          Telemóvel Multicaixa Express
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-900 select-all">
                          {bankDetails.mcxTelefone}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopySingle(bankDetails.mcxTelefone, 'mcx')}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                        title="Copiar número de telefone"
                      >
                        {copiedField === 'mcx' ? (
                          <CheckCheck className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 block">Destinatário no App Express</span>
                      <span className="text-sm font-semibold text-slate-900">{bankDetails.titular}</span>
                    </div>
                  </>
                )}

                {/* Referência e Montante */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-800 block">
                        Referência Obrigatória
                      </span>
                      <span className="text-sm font-mono font-black text-amber-950 select-all">
                        {bankDetails.referencia}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySingle(bankDetails.referencia, 'ref')}
                      className="p-2 text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                      title="Copiar Referência"
                    >
                      {copiedField === 'ref' ? (
                        <CheckCheck className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block">Valor a Pagar</span>
                    <span className="text-base font-black text-slate-900">
                      {bankDetails.valorPadraoKz.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                </div>

                {/* Botão "Copiar dados" (copia tudo de uma vez) */}
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-800 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xs"
                >
                  {copiedAll ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Todos os dados copiados para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copiar dados bancários completos</span>
                    </>
                  )}
                </button>

                {/* Nota informativa */}
                <div className="flex items-start space-x-2 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-800 text-xs">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    <strong>Nota:</strong> Indique sempre a referência <strong>{bankDetails.referencia}</strong> no descritivo da transferência e envie o comprovativo no formulário abaixo.
                  </span>
                </div>
              </div>

              {/* Seção 2: Upload de Comprovativo */}
              <div className="pt-6 border-t border-slate-100">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Envie o Comprovativo Bancário
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faça o upload do recibo emitido pelo Multicaixa Express, internet banking ou ATM.
                  </p>
                </div>

                <PaymentProofUpload
                  projectId={projectId}
                  paymentMethod={method}
                  onSuccess={(_paymentId) => {
                    if (onNavigateToStatus) {
                      onNavigateToStatus();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
