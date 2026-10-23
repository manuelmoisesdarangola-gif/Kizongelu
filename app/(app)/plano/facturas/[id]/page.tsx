/**
 * @file app/(app)/plano/facturas/[id]/page.tsx
 * Página de Detalhe e Download de Fatura Comercial Oficial (/plano/facturas/:id) — Fase 13.
 *
 * Funcionalidades:
 * - Visualização do cabeçalho fiscal (NIF, morada, data de emissão).
 * - Discriminação de artigos: pacote de orçamentos pré-pago, retenção na fonte AGT (6.5% se pessoa coletiva).
 * - QR Code de autenticação fiscal.
 * - Botão de impressão/exportação para PDF oficial.
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { getSubscription, SubscriptionInvoice } from '@/lib/actions/subscriptions';
import { generateInvoicePdfData, InvoicePdfData } from '@/lib/pdf/generate-invoice';

interface FaturaDetalhePageProps {
  invoiceId: string;
  onBack: () => void;
}

export const FaturaDetalhePage: React.FC<FaturaDetalhePageProps> = ({
  invoiceId,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const [invoice, setInvoice] = useState<SubscriptionInvoice | null>(null);
  const [invoicePdfData, setInvoicePdfData] = useState<InvoicePdfData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscription(currentUser.id, currentUser.role).then(async (res) => {
      const inv = res.invoices.find((i) => i.id === invoiceId) || res.invoices[0];
      setInvoice(inv);
      if (inv) {
        const data = await generateInvoicePdfData(inv, {
          nome: currentUser.nome,
          email: currentUser.email,
          empresaNome: currentUser.empresaNome,
          nif: currentUser.nif,
        });
        setInvoicePdfData(data);
      }
      setLoading(false);
    });
  }, [invoiceId, currentUser]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !invoice || !invoicePdfData) {
    return <div className="p-8 text-center text-xs text-slate-500">A carregar detalhes da fatura...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Botões de Ação Topo */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às faturas</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar PDF</span>
        </button>
      </div>

      {/* Folha de Fatura Oficial */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 space-y-8 text-slate-800 print:border-none print:shadow-none print:p-0">
        {/* Cabeçalho da Empresa Emissora */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="text-xl sm:text-2xl font-black text-[#0F3D5C] tracking-tight">
              Kizongelu
            </div>
            <p className="text-xs text-slate-500 mt-1">Plataforma de Engenharia & Orçamentação de Obras</p>
            <p className="text-[11px] text-slate-500">Luanda &bull; República de Angola</p>
            <p className="text-[11px] text-slate-500">NIF Comercial: 5418902341 &bull; info@kizongelu.ao</p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-black uppercase">
              Fatura Recibo &bull; Liquidada
            </span>
            <h2 className="text-base sm:text-lg font-black font-mono text-slate-900 pt-2">
              {invoice.number}
            </h2>
            <p className="text-xs text-slate-500">
              Data de Emissão: {invoicePdfData.dataEmissao}
            </p>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Faturado a:
            </span>
            <h4 className="font-extrabold text-sm text-slate-900">
              {currentUser.empresaNome || currentUser.nome}
            </h4>
            <p className="text-slate-600 mt-0.5">{currentUser.email}</p>
            {currentUser.telefone && <p className="text-slate-500">{currentUser.telefone}</p>}
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Dados Fiscais & Pagamento:
            </span>
            <p className="text-slate-700">
              NIF: <strong>{currentUser.nif || 'Consumidor Final'}</strong>
            </p>
            <p className="text-slate-700">
              Método: <strong>{invoice.method}</strong>
            </p>
            <p className="text-slate-700">
              Modalidade: <strong>Pacote de Orçamentos Pré-Pago</strong>
            </p>
            <p className="text-slate-700">
              Validade: <strong>Sem expiração (créditos permanentes)</strong>
            </p>
          </div>
        </div>

        {/* Tabela de Itens Faturados */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5">Descrição do Serviço</th>
                <th className="py-2.5 text-center">Qtd.</th>
                <th className="py-2.5 text-right">Preço Unit.</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3">
                  <span className="font-bold text-slate-900 block">{invoicePdfData.itemName}</span>
                  <span className="text-[11px] text-slate-500">
                    {invoicePdfData.itemDescription}
                  </span>
                </td>
                <td className="py-3 text-center font-bold text-slate-700">{invoicePdfData.quantidade}</td>
                <td className="py-3 text-right font-mono">
                  {invoicePdfData.subtotalKz.toLocaleString('pt-PT')} Kz
                </td>
                <td className="py-3 text-right font-mono font-bold text-slate-900">
                  {invoicePdfData.subtotalKz.toLocaleString('pt-PT')} Kz
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totais & Retenção AGT */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-4 border-t border-slate-200">
          {/* QR Code de Autenticação */}
          <div className="flex items-center space-x-4">
            {invoicePdfData.qrCodeDataUrl && (
              <img
                src={invoicePdfData.qrCodeDataUrl}
                alt="QR Code de Verificação"
                className="w-20 h-20 border border-slate-200 rounded-xl p-1 shadow-xs"
              />
            )}
            <div className="text-[10px] text-slate-500 space-y-0.5">
              <span className="font-bold text-slate-700 block">Selo de Autenticidade Fiscal</span>
              <p>Aponte a câmara para validar este documento nos servidores oficiais.</p>
              <span className="font-mono text-slate-400">{invoice.id}</span>
            </div>
          </div>

          {/* Sumário Financeiro */}
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Incidência (Subtotal):</span>
              <span className="font-mono font-bold">{invoicePdfData.subtotalKz.toLocaleString('pt-PT')} Kz</span>
            </div>
            {invoicePdfData.retencaoKz > 0 && (
              <div className="flex justify-between text-rose-700">
                <span>Retenção na Fonte AGT (6.5%):</span>
                <span className="font-mono font-bold">-{invoicePdfData.retencaoKz.toLocaleString('pt-PT')} Kz</span>
              </div>
            )}
            <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
              <span>Total Liquidado:</span>
              <span className="font-mono text-[#0F3D5C]">{invoicePdfData.totalKz.toLocaleString('pt-PT')} Kz</span>
            </div>
          </div>
        </div>

        {/* Rodapé Legal */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Processado por programa certificado nº 184/AGT/2024 &bull; Kizongelu</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </div>
  );
};
