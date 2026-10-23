/**
 * @file lib/pdf/generate-invoice.ts
 * Geração de Fatura Comercial Oficial para Aquisição de Pacotes de Orçamentos Pré-Pagos com retenção na fonte AGT e QR Code.
 */

import { SubscriptionInvoice } from '../actions/subscriptions';
import { generateVerificationQr } from './qrcode';

export interface InvoiceCustomerInfo {
  nome: string;
  nif?: string;
  empresaNome?: string;
  endereco?: string;
  email: string;
}

export interface InvoicePdfData {
  invoiceNumber: string;
  qrCodeDataUrl: string;
  dataEmissao: string;
  subtotalKz: number;
  retencaoKz: number; // 6.5% para prestação de serviços se pessoa coletiva
  totalKz: number;
  itemName: string;
  itemDescription: string;
  quantidade: string;
}

export async function generateInvoicePdfData(
  invoice: SubscriptionInvoice,
  customer: InvoiceCustomerInfo
): Promise<InvoicePdfData> {
  const qrUrl = `https://kizongelu.ao/verificar-fatura?doc=${invoice.number}&id=${invoice.id}`;
  const qrRes = await generateVerificationQr(qrUrl);
  const qrCodeDataUrl = qrRes.dataUrl;

  const isEmpresa = Boolean(customer.nif || customer.empresaNome);
  const subtotalKz = invoice.amountKz;
  const retencaoKz = isEmpresa ? Math.round(subtotalKz * 0.065) : 0;
  const totalKz = subtotalKz - retencaoKz;

  const itemName = invoice.planName?.toLowerCase().includes('pacote')
    ? invoice.planName
    : `Pacote ${invoice.planName}`;

  return {
    invoiceNumber: invoice.number,
    qrCodeDataUrl,
    dataEmissao: new Date(invoice.createdAt).toLocaleDateString('pt-PT'),
    subtotalKz,
    retencaoKz,
    totalKz,
    itemName,
    itemDescription: 'Créditos pré-pagos de orçamentos determinísticos em Kwanzas com motor LNEC (sem data de expiração).',
    quantidade: '1 pacote',
  };
}
