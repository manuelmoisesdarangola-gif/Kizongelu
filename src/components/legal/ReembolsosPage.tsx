/**
 * @file src/components/legal/ReembolsosPage.tsx
 * Política de Reembolsos e Devoluções (/reembolsos) — Fase 16.
 * Enquadramento com a Lei n.º 15/03 (Defesa do Consumidor de Angola) e regulamentos BNA.
 */

import React from 'react';
import { LegalLayout, LegalSection } from './LegalLayout';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';

interface ReembolsosPageProps {
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const ReembolsosPage: React.FC<ReembolsosPageProps> = ({ onNavigateHome, onNavigate }) => {
  const sections: LegalSection[] = [
    {
      id: 'seccao-1',
      title: 'Âmbito e Enquadramento Legal da Política',
      content: (
        <>
          <p>
            A presente Política de Reembolso e Cancelamento regula todas as transações comerciais efetuadas na plataforma Kizongelu, em estrita conformidade com a <strong>Lei n.º 15/03, de 22 de Julho — Lei de Defesa do Consumidor da República de Angola</strong>, bem como com as diretrizes de pagamentos eletrónicos estabelecidas pelo Banco Nacional de Angola (BNA).
          </p>
          <p>
            Prezamos pela transparência absoluta e pela confiança depositada pelos nossos clientes, quer se trate de particulares a construir habitação própria, quer de empresas de construção e gabinetes de fiscalização.
          </p>
        </>
      ),
    },
    {
      id: 'seccao-2',
      title: 'Modalidade 1: Pagamento Avulso (Desbloqueio de Orçamento)',
      content: (
        <>
          <p>
            O desbloqueio pontual de um orçamento confere acesso imediato ao Mapa de Medições discriminado, Caderno de Encargos em PDF profissional, lista de compras e código QR para verificação pública.
          </p>
          <div className="space-y-3 my-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <strong className="text-slate-900 block">Garantia Técnica de Retificação Gratuita:</strong>
              <p className="text-slate-600">
                Se verificar qualquer anomalia de cálculo paramétrico nos quantitativos ou incompatibilidade de dados gerados, a nossa equipa de engenharia garante a revisão e reemissão corrigida do documento no prazo de 24 horas úteis, sem qualquer custo adicional.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <strong className="text-slate-900 block">Condições de Reembolso Integral:</strong>
              <p className="text-slate-600">
                É concedido reembolso integral do valor pago (em Kwanzas) se ocorrer duplicação inadvertida de pagamento por Multicaixa Express ou se o sistema técnico falhar na geração do PDF profissional e o problema não for solucionado no prazo contratual de 48 horas.
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-3',
      title: 'Modalidade 2: Pacotes de Orçamentos Pré-Pagos',
      content: (
        <>
          <p>
            Para os pacotes de orçamentos pré-pagos (Particular, Profissional, Empresa e Empresa Plus), aplicam-se as seguintes regras de reembolso e utilização:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              <strong>Período de Arrependimento de 7 Dias:</strong> O utilizador tem até 7 (sete) dias após a compra para solicitar o cancelamento e reembolso integral, desde que <em>nenhum crédito do pacote tenha sido consumido</em>, o comprovativo de pagamento esteja validado e o pedido seja submetido formalmente por escrito.
            </li>
            <li>
              <strong>Após Primeira Utilização:</strong> Após a ativação ou consumo do primeiro crédito de orçamento, não são emitidos reembolsos, totais ou parciais, considerando a disponibilização imediata do conteúdo intelectual e ferramentas técnicas de medição.
            </li>
            <li>
              <strong>Pacotes Sem Validade:</strong> Os pacotes adquiridos não possuem data de expiração temporal. Os créditos adquiridos permanecem disponíveis na conta do cliente por tempo indeterminado até ao seu consumo efetivo.
            </li>
            <li>
              <strong>Upgrade de Pacote:</strong> O cliente pode efetuar upgrade para um escalão superior a qualquer momento, aproveitando o valor pro-rata dos créditos ainda não consumidos.
            </li>
            <li>
              <strong>Não Reembolsabilidade de Créditos Remanescentes:</strong> Não são emitidos reembolsos proporcionais monetários para saldos de pacotes parcialmente utilizados.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-4',
      title: 'Procedimento Formal de Pedido de Reembolso',
      content: (
        <>
          <p>
            Para dar início a um processo de reembolso, o titular da conta deve submeter um pedido por escrito através do email oficial de faturação:
          </p>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs space-y-1">
            <span className="text-slate-900 font-bold block">Canal Oficial: reembolsos@kizongelu.ao</span>
            <span className="text-slate-600 block">Assunto: [REEMBOLSO] Número da Transação / Fatura AGT</span>
            <span className="text-slate-600 block">Elementos obrigatórios: Comprovativo Multicaixa / IBAN angolano + Motivo detalhado</span>
          </div>
        </>
      ),
    },
    {
      id: 'seccao-5',
      title: 'Prazos e Meios de Liquidação em Kwanzas (Kz)',
      content: (
        <>
          <p>
            Após validação e deferimento do pedido pela nossa equipa financeira:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>A notificação de confirmação é enviada em até <strong>3 dias úteis</strong>.</li>
            <li>A transferência bancária em Kwanzas (Kz) é executada via CIP / Sistema de Pagamentos de Angola para a mesma conta bancária ou cartão Multicaixa de origem no prazo máximo de <strong>5 a 10 dias úteis</strong>.</li>
            <li>É emitida a correspondente Nota de Crédito nos termos do Código do IVA e regras da AGT.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'seccao-6',
      title: 'Situações Excluídas de Reembolso',
      content: (
        <>
          <p>O direito ao reembolso não se aplica nos seguintes casos:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Orçamentos descarregados e já utilizados para submissão em processos de obra ou aprovação de financiamento.</li>
            <li>Contas suspensas por violação comprovada das regras de utilização aceitável ou tentativa de clonagem fraudulenta da plataforma.</li>
            <li>Alegações de variação de preços em armazéns decorrentes da inflação normal do mercado angolano, cuja verificação prévia é responsabilidade do comprador.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Política de Reembolso e Cancelamento"
      subtitle="Regras transparentes de devolução, prazos de liquidação em Kwanzas e garantias de conformidade com a Lei de Defesa do Consumidor em Angola."
      version="2.0"
      lastUpdated="29 de Setembro de 2026"
      documentType="Política Comercial e Financeira"
      canonicalUrl="https://kizongelu.ao/reembolsos"
      sections={sections}
      onNavigateHome={onNavigateHome}
      onNavigate={onNavigate}
    />
  );
};

export default ReembolsosPage;
