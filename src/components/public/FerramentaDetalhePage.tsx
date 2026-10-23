/**
 * @file src/components/public/FerramentaDetalhePage.tsx
 * Calculadoras Interativas Gratuitas de Construção Civil (/ferramentas/:slug) — Fase 15.
 *
 * As 4 Calculadoras obrigatórias:
 * 1. Calculadora de Blocos (/ferramentas/calculadora-de-blocos)
 * 2. Calculadora de Betão (/ferramentas/calculadora-de-betao)
 * 3. Calculadora de Cerâmica (/ferramentas/calculadora-de-ceramica)
 * 4. Calculadora de Muro (/ferramentas/calculadora-de-muro)
 *
 * Cada uma com:
 * - UI simples e intuitiva calibrada para Angola (Kz)
 * - Fórmulas de engenharia explicadas com transparência
 * - Botão "Criar orçamento completo" com transição fluida para o Wizard
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calculator,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  Info,
  DollarSign,
  Grid,
  Hammer,
} from 'lucide-react';
import { updateDocumentSeo } from '@/lib/seo/meta';
import { trackEvent } from '@/lib/analytics/tracker';

interface FerramentaDetalhePageProps {
  slug: string;
  onNavigateTools: () => void;
  onStartWizard: () => void;
}

export const FerramentaDetalhePage: React.FC<FerramentaDetalhePageProps> = ({
  slug,
  onNavigateTools,
  onStartWizard,
}) => {
  // Normalização do slug
  const normalizedSlug = slug.toLowerCase();

  // 1. Estados da Calculadora de Blocos
  const [blocoComp, setBlocoComp] = useState<number>(15);
  const [blocoAlt, setBlocoAlt] = useState<number>(2.8);
  const [tipoBloco, setTipoBloco] = useState<'bloco15' | 'bloco20' | 'bloco10'>('bloco15');
  const [margemQuebraBloco, setMargemQuebraBloco] = useState<number>(8); // 8%

  // 2. Estados da Calculadora de Betão
  const [betaoComp, setBetaoComp] = useState<number>(8);
  const [betaoLarg, setBetaoLarg] = useState<number>(4);
  const [betaoEspessura, setBetaoEspessura] = useState<number>(0.15); // metros (15cm)
  const [classeBetao, setClasseBetao] = useState<'C16/20' | 'C20/25' | 'C25/30'>('C20/25');

  // 3. Estados da Calculadora de Cerâmica
  const [ceramicaComp, setCeramicaComp] = useState<number>(6);
  const [ceramicaLarg, setCeramicaLarg] = useState<number>(5);
  const [tamanhoPeca, setTamanhoPeca] = useState<'60x60' | '45x45' | '30x60' | '80x80'>('60x60');
  const [margemCorte, setMargemCorte] = useState<number>(10); // 10%

  // 4. Estados da Calculadora de Muro
  const [muroPerimetro, setMuroPerimetro] = useState<number>(100); // 20x30m
  const [muroAltura, setMuroAltura] = useState<number>(2.4);
  const [espacamentoPilares, setEspacamentoPilares] = useState<number>(2.5); // metros

  // Determinação do tipo ativo
  let toolType: 'blocos' | 'betao' | 'ceramica' | 'muro' = 'blocos';
  if (normalizedSlug.includes('betao') || normalizedSlug.includes('cimento')) {
    toolType = 'betao';
  } else if (normalizedSlug.includes('ceramica') || normalizedSlug.includes('azulejo') || normalizedSlug.includes('piso')) {
    toolType = 'ceramica';
  } else if (normalizedSlug.includes('muro') || normalizedSlug.includes('vedacao')) {
    toolType = 'muro';
  }

  useEffect(() => {
    const titles: Record<string, string> = {
      blocos: 'Calculadora de Blocos de Alvenaria | Kizongelu Angola',
      betao: 'Calculadora de Betão e Cimento (m³) | Kizongelu Angola',
      ceramica: 'Calculadora de Cerâmica, Piso e Cimento Cola | Kizongelu Angola',
      muro: 'Calculadora de Muro de Vedação (Kwanzas) | Kizongelu Angola',
    };
    const descs: Record<string, string> = {
      blocos: 'Calcule a quantidade exata de blocos de 10, 15 ou 20 com quebras normativas e argamassa de assentamento.',
      betao: 'Calcule sacos de cimento de 50 kg, inertes (areia e brita) e água para qualquer volume de betão em Angola.',
      ceramica: 'Calcule caixas de piso, cimento cola e betume com percentual de corte e rodapés para obras.',
      muro: 'Estime o custo total de muros perimetrais com sapatas, pilares, coroamento e blocos de cimento.',
    };

    updateDocumentSeo({
      title: titles[toolType],
      description: descs[toolType],
      canonicalUrl: `https://kizongelu.ao/ferramentas/${slug}`,
    });
  }, [toolType, slug]);

  const handleCreateFullBudget = () => {
    trackEvent('cta_click', {
      tool: toolType,
      target: 'wizard_start',
    });
    onStartWizard();
  };

  const formatKz = (val: number) => {
    return Math.round(val).toLocaleString('pt-PT') + ' Kz';
  };

  // --- 1. CÁLCULO DE BLOCOS ---
  const areaParedeM2 = blocoComp * blocoAlt;
  const blocosPorM2 = tipoBloco === 'bloco15' ? 12.5 : tipoBloco === 'bloco20' ? 12.5 : 12.5;
  const blocosUteis = Math.ceil(areaParedeM2 * blocosPorM2);
  const totalBlocosComQuebra = Math.ceil(blocosUteis * (1 + margemQuebraBloco / 100));
  const precoUnitarioBloco = tipoBloco === 'bloco20' ? 290 : tipoBloco === 'bloco10' ? 190 : 240;
  const custoBlocosKz = totalBlocosComQuebra * precoUnitarioBloco;
  // Argamassa: ~1 saco de cimento para cada 35 a 40 blocos de 15
  const sacosArgamassaBlocos = Math.ceil(totalBlocosComQuebra / 38);
  const areiaArgamassaM3 = (sacosArgamassaBlocos * 0.12).toFixed(2);
  const custoTotalBlocosEst = custoBlocosKz + sacosArgamassaBlocos * 6800 + Number(areiaArgamassaM3) * 9500;

  // --- 2. CÁLCULO DE BETÃO ---
  const volumeBetaoM3 = betaoComp * betaoLarg * betaoEspessura;
  // Consumo de cimento por classe
  const kgCimentoPorM3 = classeBetao === 'C25/30' ? 380 : classeBetao === 'C20/25' ? 350 : 300;
  const sacosCimentoBetao = Math.ceil((volumeBetaoM3 * kgCimentoPorM3) / 50);
  const areiaBetaoM3 = (volumeBetaoM3 * 0.48).toFixed(2);
  const britaBetaoM3 = (volumeBetaoM3 * 0.85).toFixed(2);
  const aguaLitros = Math.round(volumeBetaoM3 * 180);
  const custoBetaoEst = sacosCimentoBetao * 6800 + Number(areiaBetaoM3) * 9500 + Number(britaBetaoM3) * 14000;

  // --- 3. CÁLCULO DE CERÂMICA ---
  const areaCeramicaM2 = ceramicaComp * ceramicaLarg;
  const areaTotalComCortes = areaCeramicaM2 * (1 + margemCorte / 100);
  // Área por caixa média (ex: 60x60 = 1.44m²/cx)
  const m2PorCaixa = tamanhoPeca === '60x60' ? 1.44 : tamanhoPeca === '80x80' ? 1.92 : tamanhoPeca === '45x45' ? 1.62 : 1.44;
  const caixasNecessarias = Math.ceil(areaTotalComCortes / m2PorCaixa);
  // Cimento cola: ~5 kg por m² (1 saco de 25 kg para cada 5 m²)
  const sacosCola25kg = Math.ceil(areaTotalComCortes / 5);
  // Betume para juntas: ~0.35 kg por m²
  const betumeKg = Math.ceil(areaTotalComCortes * 0.35);
  const precoM2PisoEstimado = 7500; // Kz/m² padrão médio
  const custoCeramicaEst = areaTotalComCortes * precoM2PisoEstimado + sacosCola25kg * 3200 + betumeKg * 950;

  // --- 4. CÁLCULO DE MURO ---
  const areaMuroM2 = muroPerimetro * muroAltura;
  const numPilares = Math.ceil(muroPerimetro / espacamentoPilares) + 1;
  const blocosMuro = Math.ceil(areaMuroM2 * 12.5 * 1.08); // 8% quebras
  // Betão para sapatas dos pilares e viga de coroamento
  // Viga fundação (20x30cm) + Coroamento (15x20cm) + Sapatas (60x60x40cm)
  const volFundacaoCorrida = muroPerimetro * 0.20 * 0.30;
  const volCoroamento = muroPerimetro * 0.15 * 0.20;
  const volSapatas = numPilares * (0.60 * 0.60 * 0.35);
  const volumeTotalBetaoMuro = volFundacaoCorrida + volCoroamento + volSapatas;
  const sacosCimentoMuro = Math.ceil(volumeTotalBetaoMuro * 7) + Math.ceil(blocosMuro / 38);
  const varaoAcoKgMuro = Math.round(muroPerimetro * 3.8); // 4 varões Ø10 + estribos Ø6
  const custoMuroEst =
    blocosMuro * 240 +
    sacosCimentoMuro * 6800 +
    varaoAcoKgMuro * 1850 +
    volumeTotalBetaoMuro * 15000 + // inertes e água
    muroPerimetro * 7500; // mão de obra de abertura e alvenaria

  return (
    <div className="py-8 sm:py-14 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Botão Voltar */}
      <button
        onClick={onNavigateTools}
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#0F3D5C] hover:text-[#F59E0B] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar a todas as calculadoras</span>
      </button>

      {/* Tabs Rápidas de Navegação entre as 4 Ferramentas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'blocos', label: 'Blocos de Alvenaria', slugTarget: 'calculadora-de-blocos' },
          { id: 'betao', label: 'Betão & Cimento', slugTarget: 'calculadora-de-betao' },
          { id: 'ceramica', label: 'Cerâmica & Piso', slugTarget: 'calculadora-de-ceramica' },
          { id: 'muro', label: 'Muro Perimetral', slugTarget: 'calculadora-de-muro' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => onNavigateTools()}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
              toolType === t.id
                ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cabeçalho da Ferramenta Ativa */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Ferramenta Gratuita &bull; Normas de Engenharia
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {toolType === 'blocos' && 'Calculadora de Blocos de Alvenaria'}
          {toolType === 'betao' && 'Calculadora de Betão e Inertes (m³)'}
          {toolType === 'ceramica' && 'Calculadora de Cerâmica e Cimento Cola'}
          {toolType === 'muro' && 'Calculadora Completa de Muro de Vedação'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Valores calibrados para o mercado angolano em Kwanzas com tolerâncias técnicas de obra.
        </p>
      </div>

      {/* Card da Calculadora */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* ============================================================== */}
        {/* CASO 1: CALCULADORA DE BLOCOS                                  */}
        {/* ============================================================== */}
        {toolType === 'blocos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Dimensões da Parede / Alvenaria
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={blocoComp}
                    onChange={(e) => setBlocoComp(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={blocoAlt}
                    onChange={(e) => setBlocoAlt(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Bloco</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bloco10', label: 'Bloco 10 (Divisórias)' },
                    { id: 'bloco15', label: 'Bloco 15 (Padrão)' },
                    { id: 'bloco20', label: 'Bloco 20 (Estrutural)' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setTipoBloco(b.id as any)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        tipoBloco === b.id
                          ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Margem de Quebras / Cortes:</span>
                  <span className="text-[#0F3D5C]">{margemQuebraBloco}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  value={margemQuebraBloco}
                  onChange={(e) => setMargemQuebraBloco(Number(e.target.value))}
                  className="w-full accent-[#0F3D5C]"
                />
              </div>
            </div>

            {/* Resultado dos Blocos */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Resultado do Cálculo
                </span>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Área líquida da parede:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {areaParedeM2.toFixed(1)} m²
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                    12.5 blocos / m²
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Total de Blocos:</span>
                    <span className="text-lg font-black text-[#0F3D5C] font-mono">
                      {totalBlocosComQuebra} un
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ({blocosUteis} úteis + {totalBlocosComQuebra - blocosUteis} quebras)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Cimento p/ Assentamento:</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {sacosArgamassaBlocos} sacos
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      + {areiaArgamassaM3} m³ areia média
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">Custo Total Estimado:</span>
                  <span className="text-xl font-black font-mono text-[#0F3D5C]">
                    {formatKz(custoTotalBlocosEst)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateFullBudget}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Criar orçamento completo desta obra</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 2: CALCULADORA DE BETÃO                                   */}
        {/* ============================================================== */}
        {toolType === 'betao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Geometria do Elemento de Betão
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comp. (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={betaoComp}
                    onChange={(e) => setBetaoComp(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={betaoLarg}
                    onChange={(e) => setBetaoLarg(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Espessura (m)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={betaoEspessura}
                    onChange={(e) => setBetaoEspessura(Number(e.target.value) || 0.1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Classe de Resistência</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['C16/20', 'C20/25', 'C25/30'] as const).map((cl) => (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => setClasseBetao(cl)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        classeBetao === cl
                          ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  C20/25 é a classe normativa padrão para lajes, sapatas e vigas em Angola.
                </p>
              </div>
            </div>

            {/* Resultado do Betão */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Composição do Traço
                </span>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Volume Total de Betão:</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {volumeBetaoM3.toFixed(2)} m³
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                    Traço 1:2:3
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Cimento (50 kg):</span>
                    <span className="text-lg font-black text-[#0F3D5C] font-mono">
                      {sacosCimentoBetao} sacos
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      ~{(sacosCimentoBetao * 50).toLocaleString('pt-PT')} kg de cimento
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Inertes (Areia & Brita):</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {areiaBetaoM3} m³ areia
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 font-mono block">
                      {britaBetaoM3} m³ brita
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">Custo dos Materiais:</span>
                  <span className="text-xl font-black font-mono text-[#0F3D5C]">
                    {formatKz(custoBetaoEst)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateFullBudget}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Criar orçamento completo com armaduras</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 3: CALCULADORA DE CERÂMICA                                */}
        {/* ============================================================== */}
        {toolType === 'ceramica' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Área de Aplicação & Peça
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Comprimento (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ceramicaComp}
                    onChange={(e) => setCeramicaComp(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Largura (m)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ceramicaLarg}
                    onChange={(e) => setCeramicaLarg(Number(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Formato da Peça</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['60x60', '45x45', '30x60', '80x80'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTamanhoPeca(fmt)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        tamanhoPeca === fmt
                          ? 'bg-[#0F3D5C] text-white border-[#0F3D5C] font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Margem para Cortes e Rodapés:</span>
                  <span className="text-[#0F3D5C]">{margemCorte}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={margemCorte}
                  onChange={(e) => setMargemCorte(Number(e.target.value))}
                  className="w-full accent-[#0F3D5C]"
                />
              </div>
            </div>

            {/* Resultado Cerâmica */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Material Necessário
                </span>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-500 block">Área com Cortes:</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {areaTotalComCortes.toFixed(1)} m²
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                    {caixasNecessarias} caixas
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Cimento Cola (25 kg):</span>
                    <span className="text-lg font-black text-[#0F3D5C] font-mono">
                      {sacosCola25kg} sacos
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">5 kg / m²</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Betume de Juntas:</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {betumeKg} kg
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Juntas de 2 a 3 mm</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">Estimativa Total:</span>
                  <span className="text-xl font-black font-mono text-[#0F3D5C]">
                    {formatKz(custoCeramicaEst)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateFullBudget}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Criar orçamento completo com assentamento</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 4: CALCULADORA DE MURO                                    */}
        {/* ============================================================== */}
        {toolType === 'muro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Dimensões do Muro Perimetral
              </h3>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Perímetro Total do Terreno:</span>
                  <span className="text-[#0F3D5C] font-mono">{muroPerimetro} metros lineares</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={muroPerimetro}
                  onChange={(e) => setMuroPerimetro(Number(e.target.value))}
                  className="w-full accent-[#0F3D5C]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Lote 15x20 (70m)</span>
                  <span>Lote 20x30 (100m)</span>
                  <span>Lote 30x40 (140m)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Altura (m)</label>
                  <input
                    type="number"
                    step="0.2"
                    min="1.8"
                    max="3.5"
                    value={muroAltura}
                    onChange={(e) => setMuroAltura(Number(e.target.value) || 2)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Espaçamento Pilares</label>
                  <select
                    value={espacamentoPilares}
                    onChange={(e) => setEspacamentoPilares(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  >
                    <option value={2.5}>A cada 2.5 metros (Recomendado)</option>
                    <option value={3.0}>A cada 3.0 metros</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resultado Muro */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Materiais da Estrutura & Alvenaria
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Blocos de 15:</span>
                    <span className="text-lg font-black text-[#0F3D5C] font-mono">
                      {blocosMuro.toLocaleString('pt-PT')} un
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Total Cimento (50 kg):</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {sacosCimentoMuro} sacos
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Varão de Aço:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {varaoAcoKgMuro} kg
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Pilaretes Estruturais:</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {numPilares} pilares
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-700">Investimento Total Chave-na-Mão:</span>
                  <span className="text-xl font-black font-mono text-[#0F3D5C]">
                    {formatKz(custoMuroEst)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreateFullBudget}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Criar orçamento completo com mapa de quantidades</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explicação da Fórmula & Garantia Técnica */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-[#0F3D5C] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block">Nota sobre o Rigor dos Cálculos:</span>
          <p>
            Estas calculadoras utilizam coeficientes técnicos calibrados para obras em Angola segundo boas práticas de engenharia civil. Para projectos formais, consulte o motor analítico completo do Kizongelu com composição de preços unitários (CPU).
          </p>
        </div>
      </div>
    </div>
  );
};
