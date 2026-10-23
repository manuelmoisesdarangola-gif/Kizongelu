/**
 * @file src/components/public/FaqPage.tsx
 * Página pública de Perguntas Frequentes (FAQ) da Kizongelu.
 * Disponível com ou sem autenticação, sem redirecionamentos automáticos.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
  categoria?: string;
}

interface FaqPageProps {
  onNavigate?: (path: string) => void;
  onStartWizard?: () => void;
}

// WhatsApp Icon Component
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const FAQ_LIST: FaqItem[] = [
  {
    id: 'calculo',
    pergunta: 'Como funciona o cálculo?',
    resposta:
      'A Kizongelu usa fórmulas determinísticas de engenharia civil combinadas com uma base de preços locais actualizada. A IA ajuda a interpretar, mas nunca inventa valores.',
    categoria: 'METODOLOGIA',
  },
  {
    id: 'precos',
    pergunta: 'Os preços são actualizados?',
    resposta:
      'Sim. A base de preços é revista periodicamente com dados de fornecedores formais e informais das províncias cobertas. Cada preço tem data e fonte visíveis.',
    categoria: 'PREÇOS',
  },
  {
    id: 'orcamento-completo',
    pergunta: 'O que está incluído no orçamento completo?',
    resposta:
      'Mapa de quantidades, lista de materiais, mão de obra, equipamentos, transporte, orçamento por fases, PDF profissional com QR de verificação.',
    categoria: 'ORÇAMENTO',
  },
  {
    id: 'partilha',
    pergunta: 'Posso partilhar o orçamento?',
    resposta:
      'Sim. Pode gerar links seguros, enviar por WhatsApp ou email, e controlar quem abre e quando.',
    categoria: 'PARTILHA',
  },
  {
    id: 'pagamento',
    pergunta: 'Como funciona o pagamento?',
    resposta:
      'O preview da estimativa é gratuito. Os pacotes começam em 12.999 Kz (1 orçamento) e vão até 49.999 Kz (12 orçamentos). Os orçamentos não expiram.',
    categoria: 'PAGAMENTO',
  },
  {
    id: 'registo',
    pergunta: 'Preciso de registo para começar?',
    resposta:
      'Não. Pode criar uma estimativa inicial sem registo. O registo é apenas necessário para guardar, desbloquear ou partilhar o orçamento completo.',
    categoria: 'CONTA',
  },
  {
    id: 'provincias',
    pergunta: 'Em quantas províncias está disponível?',
    resposta:
      'A Kizongelu cobre actualmente as 21 províncias de Angola, com preços locais e coeficientes de transporte calibrados para cada região.',
    categoria: 'COBERTURA',
  },
  {
    id: 'suporte',
    pergunta: 'Como contacto o suporte?',
    resposta:
      'Pode falar connosco pelo WhatsApp ou enviar email para suporte@kizongelu.ao. Respondemos em poucas horas úteis.',
    categoria: 'SUPORTE',
  },
  {
    id: 'reembolso',
    pergunta: 'Posso pedir reembolso?',
    resposta:
      'Analisamos caso a caso em até 7 dias após a compra. Consulte a nossa Política de Reembolsos para mais detalhes.',
    categoria: 'PAGAMENTO',
  },
];

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate, onStartWizard }) => {
  // Guarda quais itens estão abertos no accordion
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    calculo: true, // Primeiro item aberto por defeito
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  // WhatsApp de suporte da Kizongelu
  const whatsappUrl = 'https://wa.me/244923000000?text=' + encodeURIComponent('Olá! Tenho uma dúvida sobre a Kizongelu e gostava de falar com um técnico.');

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Cabeçalho */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-[#F59E0B]" />
          <span>Esclarecimento & Suporte</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F3D5C] tracking-tight leading-tight">
          Perguntas Frequentes
        </h1>

        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
          Respostas às dúvidas mais comuns sobre a Kizongelu
        </p>
      </div>

      {/* Accordion de Perguntas */}
      <div className="space-y-3.5 mb-14">
        {FAQ_LIST.map((faq, index) => {
          const isOpen = !!openIds[faq.id];
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden ${
                isOpen
                  ? 'border-[#0F3D5C]/30 shadow-md ring-1 ring-[#0F3D5C]/10'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.id)}
                className="w-full px-5 sm:px-6 py-4.5 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 text-[#0F3D5C] text-xs font-bold flex items-center justify-center border border-slate-200">
                    {index + 1}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                    {faq.pergunta}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#0F3D5C] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  <p>{faq.resposta}</p>
                  {faq.categoria && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                        {faq.categoria}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Caixa de Ação: WhatsApp & Dúvidas Técnicas */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0F3D5C] to-[#0A293E] text-white p-7 sm:p-10 shadow-xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Engenharia & Apoio Direto</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ainda tem dúvidas? Falar com um técnico
            </h3>
            <p className="text-sm text-slate-300 max-w-lg">
              A nossa equipa de engenheiros e orçamentistas em Talatona está pronta para esclarecer questões sobre preços, províncias e relatórios.
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 cursor-pointer"
          >
            <WhatsAppIcon className="w-5 h-5 shrink-0" />
            <span>Falar com um técnico</span>
          </a>
        </div>
      </div>

      {/* Rodapé da Página: Link para o Centro de Ajuda Completo */}
      <div className="text-center pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-slate-600">
        <span>Precisa de guias detalhados, manuais ou tutoriais?</span>
        <button
          type="button"
          onClick={() => handleNavigate('/ajuda')}
          className="inline-flex items-center gap-1.5 font-bold text-[#0F3D5C] hover:text-[#F59E0B] transition-colors cursor-pointer underline underline-offset-4"
        >
          <BookOpen className="w-4 h-4 text-[#F59E0B]" />
          <span>Centro de ajuda completo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default FaqPage;
