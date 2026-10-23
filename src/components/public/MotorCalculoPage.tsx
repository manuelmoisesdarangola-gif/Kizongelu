/**
 * @file src/components/public/MotorCalculoPage.tsx
 * Página Pública de Transparência do Motor de Cálculo (/motor-calculo) — Fase 17.
 * Explica o funcionamento determinístico, fórmulas do Bloco AP, exemplo prático e o que NÃO fazemos.
 */

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Sparkles,
  FileCheck2,
  FileSpreadsheet,
} from 'lucide-react';
import { CURRENT_ENGINE_VERSION, CURRENT_FORMULAS_VERSION } from '@/lib/calculation-engine/explain';

interface MotorCalculoPageProps {
  onStartWizard?: () => void;
  onNavigate?: (path: string) => void;
}

export const MotorCalculoPage: React.FC<MotorCalculoPageProps> = ({
  onStartWizard,
  onNavigate,
}) => {
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  const faqs = [
    {
      id: 'faq-1',
      question: 'Por que é que o Kizongelu não utiliza IA generativa para gerar quantitativos?',
      answer: 'Modelos de linguagem como GPT e Claude são probabilísticos e propensos a "alucinações" que podem subdimensionar pilares ou inflacionar sacos de cimento em 40%. Na engenharia civil, a segurança de vidas e investimentos exige cálculo determinístico: para a mesma área e tipologia, o resultado matemático tem de ser sempre o mesmo.',
    },
    {
      id: 'faq-2',
      question: 'Como são aferidas as quebras e o desperdício no estaleiro?',
      answer: 'O motor adota coeficientes normativos calibrados para a realidade de Angola: 5% a 8% em blocos de betão (devido a corte e descarga manual), 7% em varões de aço (despontas e dobras) e 5% em cimento de argamassa de assentamento.',
    },
    {
      id: 'faq-3',
      question: 'Os preços incluem o BDI e os impostos de Angola?',
      answer: 'Sim. O motor calcula o Custo Direto da Construção e aplica o Benefício e Despesas Indiretas (BDI padrão de 21,5%), além de discriminar o IVA (14% regime geral) e a retenção na fonte da AGT (6,5%) conforme a lei fiscal angolana.',
    },
    {
      id: 'faq-4',
      question: 'Posso apresentar este orçamento a clientes e parceiros de obra?',
      answer: 'Sim. Os orçamentos gerados em PDF profissional incluem código QR para validação pública e mapa discriminado de medições estruturado por fases da construção.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
      {/* 1. Hero do Motor de Cálculo */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-bold">
          <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Motor de Cálculo {CURRENT_ENGINE_VERSION} &bull; {CURRENT_FORMULAS_VERSION}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Como Calculamos Cada Bloco, Saco e Varão
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Sem caixas pretas nem adivinhações. Conheça as fórmulas matemáticas, as boas práticas de engenharia civil e a base de cotações provinciais que sustentam cada estimativa em Kwanzas (Kz).
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartWizard}
            className="px-6 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Experimentar Motor no Assistente</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/precos-angola')}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Ver Tabela de Preços em Angola
            </button>
          )}
        </div>
      </div>

      {/* 2. Como Calculamos (Secções do Bloco AP) */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F3D5C]">
            A Decomposição Estrutural em 5 Capítulos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Cada elemento de construção segue uma matriz determinística rigorosa do Bloco AP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Alvenaria */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#F59E0B] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-base">Alvenaria & Paredes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Área de paredes calculada por pé-direito de 2.80m multiplicada pelo perímetro útil. Aplica 12.5 blocos/m² (bloco de 15 ou 20) com 5% de quebra e argamassa dosada a 350 kg/m³.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              Qtd = (ÁreaParede / 0.08 m²) × 1.05
            </div>
          </div>

          {/* 2. Estrutura */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-base">Betão Armado & Pilares</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Volume cúbico de pilares (20x20 cm) e vigas de travamento com betão C20/25 (350 kg cimento/m³, 0.8 m³ brita, 0.4 m³ areia) e taxa de armadura A400 de 95 kg/m³.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              Aço = VolBetão × 95 kg/m³ × 1.07
            </div>
          </div>

          {/* 3. Fundações */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-base">Fundações & Sapatas</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dimensionamento em sapatas isoladas ou contínuas com base na tensão admissível do solo (padrão 150 kPa), betão de limpeza e recobrimento anti-corrosão de 5 cm.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              Sapatas = N_Pilares × 0.8×0.8×0.4m
            </div>
          </div>

          {/* 4. Cobertura */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-base">Cobertura & Estrutura</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chapa IBR canelada termolacada calibre 28 com inclinação mínima de 12%, asnas de ferro galvanizado e madres com sobreposição técnica de 15 cm.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              ÁreaTelhado = ÁreaBruta × 1.15
            </div>
          </div>

          {/* 5. Acabamentos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              05
            </div>
            <h3 className="font-bold text-slate-900 text-base">Acabamentos & Cerâmica</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pavimentos cerâmicos PEI IV, rebocos interiores e exteriores a duas demãos e pintura acrílica lavável resistente ao clima tropical angolano.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              Cerâmica = ÁreaPiso × 1.10 (corte)
            </div>
          </div>

          {/* 6. Mão de Obra */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-500/10 text-slate-700 flex items-center justify-center font-bold">
              06
            </div>
            <h3 className="font-bold text-slate-900 text-base">Mão de Obra & BDI</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rácio de pedreiros e serventes conforme a produtividade média provincial e BDI de 21,5% para despesas administrativas e margem da construtora.
            </p>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[10px] text-[#0F3D5C]">
              Total = CustoDireto × (1 + 0.215 BDI)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Exemplo Prático Passo-a-Passo: Moradia T3 120m² em Luanda */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        <div className="space-y-2 border-b border-slate-100 pb-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Caso de Estudo Real
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Exemplo Prático: Moradia T3 com 120 m² em Luanda (Viana)
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o cálculo exato dos principais materiais de estrutura e alvenaria:
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-900 font-bold block">1. Blocos de Cimento (Alvenarias):</strong>
              <p className="text-slate-600 text-[11px]">
                Área de paredes estimada = 120 m² × 2.8 = 336 m² &bull; (336 ÷ 0.08 m²) × 1.05
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-[#0F3D5C] font-mono">4.410 Blocos</span>
              <span className="block text-[10px] text-slate-500">@ 320 Kz = 1.411.200 Kz</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-900 font-bold block">2. Cimento Portland 42.5R (Betão & Assentamento):</strong>
              <p className="text-slate-600 text-[11px]">
                Betão estrutural (18 m³ × 7 sacos) + Argamassas e rebocos (140 sacos)
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-[#0F3D5C] font-mono">266 Sacos de 50 kg</span>
              <span className="block text-[10px] text-slate-500">@ 4.850 Kz = 1.290.100 Kz</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-900 font-bold block">3. Varões de Aço A400 (Sapatas, Vigas e Pilares):</strong>
              <p className="text-slate-600 text-[11px]">
                Taxa de armadura = 18 m³ betão × 95 kg/m³ × 1.07 de corte
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-[#0F3D5C] font-mono">1.830 kg de Aço</span>
              <span className="block text-[10px] text-slate-500">@ 980 Kz = 1.793.400 Kz</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-900 font-bold block">4. Inertes (Areia Lavada & Brita 1 e 2):</strong>
              <p className="text-slate-600 text-[11px]">
                Areia de rio (16 m³) + Brita granítica (15 m³) para betão e assentamento
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-base font-black text-[#0F3D5C] font-mono">31 m³ Inertes</span>
              <span className="block text-[10px] text-slate-500">Total Inertes = 365.000 Kz</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Fontes de Preços por Província (Rede de Entrepostos Oficiais) */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-card-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3D5C] bg-[#0F3D5C]/10 px-2 py-0.5 rounded-full">
              Rede de Monitorização Territorial
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Fontes de Preços por Província (Angola)
            </h2>
            <p className="text-xs text-slate-500">
              Cotações aferidas semanalmente junto de fabricantes industriais, entrepostos e pedreiras licenciadas.
            </p>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/precos-angola')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Ver Cotações Detalhadas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">1. Luanda (Base 100)</strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">1.00x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Fábricas nacionais de cimento, entrepostos comerciais de Viana, areais do Rio Kwanza e pedreiras licenciadas da região.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">2. Benguela / Lobito</strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">0.94x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Fábricas cimenteiras da região, pedreiras graníticas locais e entrepostos comerciais de materiais.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">3. Huíla (Lubango)</strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">0.98x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Pedreiras graníticas da Chibia, areais locais e ligação ferroviária ao Porto do Namibe.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">4. Huambo</strong>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">0.96x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Entrepostos industriais da Caála e São Pedro, com frete subsidiado via Caminho de Ferro de Benguela (CFB).
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">5. Cuanza Sul (Sumbe)</strong>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">1.04x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Armazéns de Porto Amboim e Sumbe abastecidos via Estrada Nacional 100 a partir de Luanda/Lobito.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">6. Malanje</strong>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">1.08x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Frete rodoviário de 380 km para cimento e ferro; exploração local de areia e brita fluvial.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">7. Namibe</strong>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">1.02x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Entrepostos de Moçâmedes com importação portuária direta e proximidade à província da Huíla.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900 font-bold">8. Uíge</strong>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded">1.10x</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Custos logísticos rodoviários a partir de Luanda (320 km) e armazéns sediados na cidade do Uíge.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Link para PDF de Exemplo Oficial */}
      <div className="bg-gradient-to-r from-[#0F3D5C] via-[#0A293E] to-slate-900 text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Documento Técnico Modelo</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Descarregue um Exemplo Real de Caderno de Encargos
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Consulte a estrutura completa emitida pelo Kizongelu: capa profissional com o selo <strong>"Motor de cálculo v3.2"</strong>, código QR de validação, 6 capítulos discriminados, cronograma em 10 fases e quadro de fecho fiscal (IVA 14% e Retenção AGT).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="/sample-orcamento-kizongelu.pdf"
            download="Orcamento_Modelo_T3_Kizongelu_Angola.pdf"
            onClick={(e) => {
              e.preventDefault();
              window.open('/verificar/amostra-demonstracao-v3', '_blank');
            }}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Ver Exemplo de Orçamento PDF</span>
          </a>
        </div>
      </div>

      {/* 6. O Que NÃO Fazemos (Compromisso Ético & Técnico) */}
      <div className="bg-rose-50/50 border border-rose-200 p-6 sm:p-10 rounded-3xl space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
            Limites Claros & Honestidade Técnica
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-rose-950">
            O Que o Kizongelu NÃO Faz
          </h2>
          <p className="text-xs text-rose-900/80 leading-relaxed">
            Acreditamos que a credibilidade na construção se constrói com rigor e transparência sobre o que fazemos e o que nunca faremos:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>NÃO Usamos IA Generativa em Quantitativos</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Nunca usamos LLMs para inventar quantidades de ferro ou cimento. As fórmulas são 100% determinísticas e auditáveis por qualquer engenheiro.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>NÃO Substituímos o Engenheiro da Obra</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              O orçamento é uma peça técnica estimativa. Não dispensa a direção técnica presencial de um profissional credenciado pela Ordem dos Engenheiros de Angola (OEA).
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>NÃO Vendemos Dados dos Seus Projectos</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Os seus cadernos de encargos e orçamentos são confidenciais ao abrigo da Lei 22/11 de Angola. Nunca são partilhados com fornecedores terceiros.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-rose-200/80 space-y-2">
            <div className="flex items-center space-x-2 text-rose-600 font-bold">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>NÃO Usamos Preços Fictícios ou Desatualizados</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              As cotações são recolhidas diretamente em entrepostos de Luanda, Benguela, Huíla e Huambo, com identificação clara da data de aferição.
            </p>
          </div>
        </div>
      </div>

      {/* 5. FAQ do Motor de Cálculo */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-[#0F3D5C] text-center">
          Perguntas Frequentes sobre as Fórmulas
        </h2>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card-subtle"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 cursor-pointer hover:bg-slate-50"
              >
                <span>{faq.question}</span>
                {openFaq === faq.id ? (
                  <ChevronUp className="w-4 h-4 text-[#0F3D5C] shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                )}
              </button>
              {openFaq === faq.id && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MotorCalculoPage;
