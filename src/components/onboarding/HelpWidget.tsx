/**
 * @file src/components/onboarding/HelpWidget.tsx
 * Widget de Ajuda Contextual (Fase 14):
 * - Botão flutuante "?" no canto inferior direito nos ecrãs-chave.
 * - Abre painel deslizante lateral com artigos e dicas sugeridas por ecrã:
 *   - painel: dicas de rascunhos e saldos
 *   - wizard: calibração de província e medições
 *   - preview: como interpretar o mapa de quantidades e exportar
 *   - paywall: pagamento por Multicaixa Express e aprovação
 * - Links diretos para WhatsApp e FAQ completa.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface HelpArticle {
  title: string;
  summary: string;
}

interface HelpWidgetProps {
  currentScreen?: 'painel' | 'wizard' | 'preview' | 'paywall' | 'geral';
  onNavigateToAjuda: () => void;
}

export const HelpWidget: React.FC<HelpWidgetProps> = ({
  currentScreen = 'geral',
  onNavigateToAjuda,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const screenArticles: Record<string, HelpArticle[]> = {
    painel: [
      {
        title: 'Como iniciar um novo orçamento determinístico?',
        summary: 'Clique no botão "+ Novo orçamento" e seleccione a província onde a obra será erguida para calibrar o frete.',
      },
      {
        title: 'Como funcionam os créditos de pacotes de orçamentos?',
        summary: 'Pode desbloquear projectos até ao limite de créditos do seu pacote, sem qualquer data de expiração.',
      },
    ],
    wizard: [
      {
        title: 'Como escolher a estrutura correta (Betão vs Alvenaria)?',
        summary: 'Para pisos múltiplos em Angola, as boas práticas de engenharia preconizam pilares e vigas de betão armado com armadura A400/500.',
      },
      {
        title: 'Como é calculada a área bruta de construção?',
        summary: 'Some a área coberta de todos os pisos mais 50% da área de varandas e alpendres.',
      },
    ],
    preview: [
      {
        title: 'Por que apenas os 3 primeiros capítulos estão visíveis?',
        summary: 'Permite-lhe validar gratuitamente o estaleiro, fundações e betões antes de desbloquear o caderno integral.',
      },
      {
        title: 'Como exportar o mapa de quantidades para Excel?',
        summary: 'Após aprovação da tesouraria, o botão de download em formato .xlsx fica disponível de imediato.',
      },
    ],
    paywall: [
      {
        title: 'Quanto tempo demora a aprovação Multicaixa Express?',
        summary: 'Em média 15 a 30 minutos após o upload da captura de ecrã ou comprovativo do terminal.',
      },
      {
        title: 'Posso pagar por transferência bancária (IBAN)?',
        summary: 'Sim, as nossas coordenadas bancárias com IBAN encontram-se listadas na página de pagamento.',
      },
    ],
    geral: [
      {
        title: 'Dúvidas sobre o cálculo determinístico de engenharia',
        summary: 'Consulte as nossas normas de engenharia e composições analíticas de preços.',
      },
    ],
  };

  const articles = screenArticles[currentScreen] || screenArticles.geral;

  return (
    <>
      {/* Botão Flutuante "?" no Canto Inferior Direito */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#0F3D5C] hover:bg-[#0A2A3F] active:scale-95 text-white shadow-xl shadow-slate-900/20 flex items-center justify-center font-black transition-all cursor-pointer border-2 border-amber-400 group"
          title="Precisa de ajuda com este ecrã?"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-amber-400" />
          ) : (
            <HelpCircle className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>

      {/* Painel Deslizante de Ajuda Contextual */}
      {isOpen && (
        <div className="fixed bottom-36 lg:bottom-20 right-4 sm:right-6 z-40 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                ?
              </span>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Ajuda Rápida &bull; {currentScreen}
              </h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Artigos Sugeridos para o Ecrã */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase">
              Tópicos Recomendados:
            </span>
            {articles.map((art, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-left">
                <h5 className="text-xs font-bold text-[#0F3D5C] leading-snug">
                  {art.title}
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {art.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Links e Ações Rápidas */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToAjuda();
              }}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0F3D5C]" />
                Ver FAQ Completa (15 perguntas)
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="https://wa.me/244923000111?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Kizongelu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-between border border-emerald-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                Falar com Engenheiro no WhatsApp
              </span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};
