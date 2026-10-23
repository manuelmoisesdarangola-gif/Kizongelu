/**
 * @file src/components/onboarding/AjudaPage.tsx
 * Página /ajuda (Fase 14):
 * - FAQ com 15 perguntas e respostas detalhadas sobre engenharia, pagamentos e regulamentação técnica em Angola.
 * - Campo de pesquisa em tempo real.
 * - Botões de contacto direto: WhatsApp oficial e Email de suporte técnico.
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  HardHat,
  Calculator,
  ShieldCheck,
  CreditCard,
  FileText,
  Phone,
  Sparkles,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'calculo' | 'pagamento' | 'normas' | 'planos';
  question: string;
  answer: string;
}

export const AjudaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'calculo' | 'pagamento' | 'normas' | 'planos'>('todos');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const faqs: FaqItem[] = [
    {
      id: 'faq-1',
      category: 'calculo',
      question: 'Como é que o Kizongelu calcula as quantidades de cimento, areia e brita?',
      answer: 'O nosso motor utiliza matrizes paramétricas baseadas em traços de betão estrutural (C20/25 e C25/30) e argamassas alinhadas com as boas práticas de engenharia civil em Angola. Decompomos cada metro cúbico de fundações, pilares e vigas em sacos de 50 kg de cimento Portland, metros cúbicos de areia lavada e brita 1 e 2, adicionando a devida margem técnica para quebras e perdas em obra.',
    },
    {
      id: 'faq-2',
      category: 'normas',
      question: 'Posso apresentar estes orçamentos a clientes, fiscais e parceiros de obra?',
      answer: 'Sim. Os cadernos técnicos gerados pela plataforma incluem mapa de medições discriminado, composição analítica de quantidades, cronograma físico-financeiro com tranches de execução e código QR de verificação pública de autenticidade, proporcionando total clareza e transparência técnica aos seus interlocutores.',
    },
    {
      id: 'faq-3',
      category: 'pagamento',
      question: 'Como funciona o pagamento por Multicaixa Express?',
      answer: 'Ao solicitar o desbloqueio do projeto, o sistema gera a referência e número de telefone (+244 923 000 111). Efetue a transferência ou pagamento de serviço na aplicação Multicaixa Express ou ATM e anexe o comprovativo fotográfico (JPG/PNG/PDF). A nossa equipa financeira valida o crédito no prazo médio de 15 a 30 minutos.',
    },
    {
      id: 'faq-4',
      category: 'calculo',
      question: 'Como são calculados os preços de materiais fora de Luanda (ex.: Huambo, Benguela, Cabinda)?',
      answer: 'Cada uma das 21 províncias possui coeficientes logísticos e de mão de obra calibrados. Por exemplo, para províncias do interior sem fábrica de cimento local, o sistema aplica uma majoração de frete rodoviário por tonelada/km. Para Cabinda, é considerado o frete marítimo de cabotagem.',
    },
    {
      id: 'faq-5',
      category: 'planos',
      question: 'Qual é a diferença entre o pacote Particular e o pacote Profissional?',
      answer: 'O pacote Particular (12.999 Kz) inclui 1 orçamento completo com PDF e QR Code e acesso permanente. O pacote Profissional (15.999 Kz) inclui 3 orçamentos completos, fichas analíticas detalhadas de CPU e suporte por WhatsApp em horário laboral. Os créditos não expiram.',
    },
    {
      id: 'faq-6',
      category: 'normas',
      question: 'O que significa o BDI aplicado nas composições de preços?',
      answer: 'BDI (Benefícios e Despesas Indiretas) representa a margem do empreiteiro que cobre despesas com a sede, seguros, administração da obra, imprevistos e lucro operacional. No Kizongelu, o utilizador pode manter o BDI padrão calibrado para o mercado angolano (22% a 25%) ou ajustá-lo na versão profissional.',
    },
    {
      id: 'faq-7',
      category: 'calculo',
      question: 'O que posso fazer se a minha obra for uma ampliação ou reabilitação e não uma construção nova?',
      answer: 'No Passo 1 do Wizard de Orçamentação, seleccione a opção "Reabilitação" ou "Ampliação". O motor adaptará os capítulos, permitindo omitir escavações e fundações pesadas e focando nas alvenarias novas, reforços estruturais e acabamentos.',
    },
    {
      id: 'faq-8',
      category: 'pagamento',
      question: 'Posso pagar por transferência bancária por IBAN em vez de Multicaixa Express?',
      answer: 'Sim, dispomos de coordenadas bancárias com IBAN (AO06 0040 0000 4892 1042 1014 9), em nome de Kizongelu. Após transferir por homebanking ou balcão, basta submeter o comprovativo.',
    },
    {
      id: 'faq-9',
      category: 'planos',
      question: 'O que acontece quando os créditos do meu pacote de orçamentos terminarem?',
      answer: 'Pode continuar a criar e guardar rascunhos ilimitados. Quando desejar desbloquear novos orçamentos com PDF oficial e QR Code, basta adquirir um novo pacote através do painel. Os créditos nunca expiram.',
    },
    {
      id: 'faq-10',
      category: 'normas',
      question: 'Como funciona a verificação por QR Code do PDF?',
      answer: 'Cada caderno técnico descarregado possui um QR Code único com código de verificação. Qualquer fiscal, parceiro ou cliente pode apontar a câmara do telemóvel para o documento e verificar instantaneamente se o orçamento foi emitido pelo Kizongelu e se os dados correspondem ao original.',
    },
    {
      id: 'faq-11',
      category: 'calculo',
      question: 'As composições de mão de obra incluem pedreiros, serventes e carpinteiros de cofragem?',
      answer: 'Sim, a decomposição de homens-hora inclui as categorias profissionais adequadas a cada etapa: trolhas/pedreiros, serventes, armadores de ferro, carpinteiros de toscos, eletricistas e canalizadores, com taxas horárias médias de mercado praticadas em Angola.',
    },
    {
      id: 'faq-12',
      category: 'planos',
      question: 'As faturas emitidas incluem retenção na fonte da AGT?',
      answer: 'Sim, para os pacotes Empresa e Empresa Plus emitimos faturas comerciais em conformidade com o Código Geral Tributário de Angola, contemplando a retenção na fonte de prestação de serviços (6.5%) para pessoas coletivas.',
    },
    {
      id: 'faq-13',
      category: 'calculo',
      question: 'Por quanto tempo é válida uma cotação gerada no Kizongelu?',
      answer: 'Devido à flutuação cambial e variação dos custos de materiais importados em Angola, os preços de referência têm validade recomendada de 30 dias. A plataforma avisa por notificação quando um orçamento se aproxima da data limite de revisão.',
    },
    {
      id: 'faq-14',
      category: 'pagamento',
      question: 'O que fazer se o meu comprovativo de pagamento for rejeitado?',
      answer: 'Se o comprovativo estiver ilegível ou o valor for divergente, a tesouraria regista o motivo e notifica-o imediatamente por email e WhatsApp. Basta aceder à secção "Pagamentos" no seu painel e submeter o ficheiro corrigido.',
    },
    {
      id: 'faq-15',
      category: 'normas',
      question: 'Posso exportar o mapa de quantidades para Excel para editar preços próprios?',
      answer: 'Sim, todos os projectos concluídos disponibilizam a exportação em formato folha de cálculo (.xlsx), estruturada por capítulos e artigos com fórmulas preservadas.',
    },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = selectedCategory === 'todos' || f.category === selectedCategory;
    const matchesSearch =
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Topo / Banner de Ajuda */}
      <div className="bg-gradient-to-r from-[#0F3D5C] to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden space-y-4">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Centro de Ajuda & Suporte Técnico Kizongelu</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Como podemos ajudar com o seu orçamento?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Tire as suas dúvidas sobre metodologias de cálculo de materiais em Angola, medições de obra e pagamentos Multicaixa.
        </p>

        {/* Campo de Pesquisa em Tempo Real */}
        <div className="relative max-w-xl pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por cimento, Multicaixa, fórmulas, províncias..."
            className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* Canais de Suporte Direto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://wa.me/244923000111?text=Olá,%20preciso%20de%20ajuda%20técnica%20com%20um%20orçamento%20no%20Kizongelu"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between hover:bg-emerald-100/70 transition-all shadow-xs group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-900 transition-colors">
                Suporte Via WhatsApp
              </h4>
              <p className="text-xs text-slate-500">
                Atendimento por engenheiros de custos &bull; +244 923 000 111
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200">
            Falar agora &rarr;
          </span>
        </a>

        <a
          href="mailto:suporte@kizongelu.ao"
          className="p-5 rounded-3xl bg-blue-50/80 border border-blue-200 flex items-center justify-between hover:bg-blue-100/70 transition-all shadow-xs group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#0F3D5C] text-white flex items-center justify-center font-bold shadow-md shadow-blue-900/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0F3D5C] transition-colors">
                Email de Apoio Técnico
              </h4>
              <p className="text-xs text-slate-500">
                Resposta garantida em 24h &bull; suporte@kizongelu.ao
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#0F3D5C] bg-white px-3 py-1.5 rounded-xl border border-blue-200">
            Enviar email &rarr;
          </span>
        </a>
      </div>

      {/* Filtros por Categoria de FAQ */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'todos', label: 'Todas as Perguntas (15)' },
          { id: 'calculo', label: 'Cálculo & Materiais' },
          { id: 'pagamento', label: 'Pagamentos & Multicaixa' },
          { id: 'normas', label: 'Engenharia & Regulamentos' },
          { id: 'planos', label: 'Pacotes & Facturação' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === tab.id
                ? 'bg-[#0F3D5C] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Acordeão com 15 Perguntas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Search className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs">Não encontrámos resultados para a sua pesquisa.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;

            return (
              <div key={faq.id} className="transition-colors hover:bg-slate-50/50">
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <span className="p-1 rounded-lg text-slate-400 bg-slate-100 shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed animate-in fade-in duration-150">
                    <p className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
