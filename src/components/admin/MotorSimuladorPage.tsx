/**
 * @file src/components/admin/MotorSimuladorPage.tsx
 * Simulador de Fórmulas e Teste A/B de Versões do Motor (/admin/motor/simulador) — Fase 17.
 * Permite ao engenheiro testar alterações paramétricas antes de promover a produção.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Layers,
  Save,
  Rocket,
  Scale,
} from 'lucide-react';
import { CURRENT_ENGINE_VERSION } from '@/lib/calculation-engine/explain';
import { formatCurrencyKz } from '@/lib/format/currency';
import { useToast } from '@/src/context/ToastContext';

export const MotorSimuladorPage: React.FC = () => {
  const { success, warning, info } = useToast();

  // Versões
  const [currentVersion] = useState(CURRENT_ENGINE_VERSION);
  const [draftVersion, setDraftVersion] = useState('v3.3-rc1');

  // Parâmetros editáveis da versão rascunho
  const [draftCoefficients, setDraftCoefficients] = useState({
    masonryWasteRate: 0.05, // 5%
    concreteCementDosage: 350, // kg/m³
    steelRatioKgM3: 95, // kg/m³
    bdiRate: 0.215, // 21.5%
    wallHeightFactor: 2.8,
  });

  const [activePreset, setActivePreset] = useState<'t3_kilamba' | 't4_talatona' | 'armazem_viana'>('t3_kilamba');
  const [isPublishing, setIsPublishing] = useState(false);

  // Obra de referência para teste: Moradia T3 120m²
  const baseArea = activePreset === 't3_kilamba' ? 120 : activePreset === 't4_talatona' ? 240 : 450;
  const baseConcreteVol = Math.round(baseArea * 0.15); // 18 m³ para 120m²
  const baseWallArea = Math.round(baseArea * 2.8); // 336 m²

  // Cálculo v_actual (v3.2)
  const actualBlocos = Math.ceil((baseWallArea / 0.08) * 1.05); // 5%
  const actualCimentoSacos = Math.ceil((baseConcreteVol * 350) / 50 + 140); // 266 sacos
  const actualAcoKg = Math.ceil(baseConcreteVol * 95 * 1.07); // 1.830 kg
  const actualCustoTotal = Math.round(
    (actualBlocos * 320 + actualCimentoSacos * 4850 + actualAcoKg * 980 + 365000 + 1200000) * 1.215
  );

  // Cálculo v_rascunho (v3.3 experimental)
  const draftBlocos = Math.ceil((baseWallArea / 0.08) * (1 + draftCoefficients.masonryWasteRate));
  const draftCimentoSacos = Math.ceil(
    (baseConcreteVol * draftCoefficients.concreteCementDosage) / 50 + 140
  );
  const draftAcoKg = Math.ceil(baseConcreteVol * draftCoefficients.steelRatioKgM3 * 1.07);
  const draftCustoTotal = Math.round(
    (draftBlocos * 320 + draftCimentoSacos * 4850 + draftAcoKg * 980 + 365000 + 1200000) *
      (1 + draftCoefficients.bdiRate)
  );

  const diffValor = draftCustoTotal - actualCustoTotal;
  const diffPercent = ((diffValor / actualCustoTotal) * 100).toFixed(2);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      success(
        `Versão ${draftVersion} promovida para PRODUÇÃO!`,
        'As novas regras determinísticas já estão ativas para novos orçamentos emitidos.'
      );
    }, 1000);
  };

  const handleReset = () => {
    setDraftCoefficients({
      masonryWasteRate: 0.05,
      concreteCementDosage: 350,
      steelRatioKgM3: 95,
      bdiRate: 0.215,
      wallHeightFactor: 2.8,
    });
    info('Parâmetros restaurados para os valores da versão de produção v3.2.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Laboratório de Engenharia
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#F59E0B]" />
            <span>Simulador de Fórmulas & Impacto de Versões</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Teste e compare em tempo real a variação de quantitativos entre a versão em produção (<strong>{currentVersion}</strong>) e a versão rascunho (<strong>{draftVersion}</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Valores v3.2</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center space-x-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'A publicar...' : `Publicar ${draftVersion} em Produção`}</span>
          </button>
        </div>
      </div>

      {/* Seletor de Modelo de Obra para Teste */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-400">Obra de Teste (Benchmark):</span>
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActivePreset('t3_kilamba')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activePreset === 't3_kilamba' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Moradia T3 (120 m²)
            </button>
            <button
              onClick={() => setActivePreset('t4_talatona')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activePreset === 't4_talatona' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Vivenda V4 (240 m²)
            </button>
            <button
              onClick={() => setActivePreset('armazem_viana')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                activePreset === 'armazem_viana' ? 'bg-[#0F3D5C] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Armazém (450 m²)
            </button>
          </div>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          Localização: Luanda (Viana) &bull; Betão C20/25
        </span>
      </div>

      {/* Cartões Comparativos: v_actual vs v_rascunho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lado Esquerdo: v_actual (v3.2 Produção) */}
        <div className="p-5 sm:p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <strong className="text-sm font-bold text-white">Versão Atual ({currentVersion})</strong>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Em Produção
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Blocos de Cimento (15x20x40):</span>
              <span className="font-mono font-bold text-white">{actualBlocos.toLocaleString()} un</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Cimento Portland (50kg):</span>
              <span className="font-mono font-bold text-white">{actualCimentoSacos.toLocaleString()} sacos</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Aço Nervurado A400:</span>
              <span className="font-mono font-bold text-white">{actualAcoKg.toLocaleString()} kg</span>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-bold">Custo Total da Empreitada:</span>
              <span className="font-mono font-black text-amber-400 text-sm">
                {formatCurrencyKz(actualCustoTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Lado Direito: v_rascunho (v3.3 Experimental) */}
        <div className="p-5 sm:p-6 bg-slate-900 rounded-3xl border-2 border-amber-500/40 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <strong className="text-sm font-bold text-amber-400">Versão Rascunho ({draftVersion})</strong>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                Number(diffPercent) >= 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              Variação: {Number(diffPercent) >= 0 ? `+${diffPercent}%` : `${diffPercent}%`}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Blocos de Cimento (15x20x40):</span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">{draftBlocos.toLocaleString()} un</span>
                {draftBlocos !== actualBlocos && (
                  <span className="text-[10px] text-amber-400 block font-mono">
                    ({draftBlocos > actualBlocos ? `+${draftBlocos - actualBlocos}` : draftBlocos - actualBlocos})
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Cimento Portland (50kg):</span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">{draftCimentoSacos.toLocaleString()} sacos</span>
                {draftCimentoSacos !== actualCimentoSacos && (
                  <span className="text-[10px] text-amber-400 block font-mono">
                    ({draftCimentoSacos > actualCimentoSacos ? `+${draftCimentoSacos - actualCimentoSacos}` : draftCimentoSacos - actualCimentoSacos})
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Aço Nervurado A400:</span>
              <div className="text-right">
                <span className="font-mono font-bold text-white">{draftAcoKg.toLocaleString()} kg</span>
                {draftAcoKg !== actualAcoKg && (
                  <span className="text-[10px] text-amber-400 block font-mono">
                    ({draftAcoKg > actualAcoKg ? `+${draftAcoKg - actualAcoKg}` : draftAcoKg - actualAcoKg})
                  </span>
                )}
              </div>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <span className="text-slate-300 font-bold">Custo Total Simulado:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {formatCurrencyKz(draftCustoTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sliders de Ajuste dos Coeficientes Experimentais */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-5">
        <h3 className="font-bold text-white text-sm">
          Ajustar Coeficientes Paramétricos da Versão Rascunho:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* 1. Quebra de Blocos */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Quebra de Alvenaria:</span>
              <strong className="text-white font-mono">{(draftCoefficients.masonryWasteRate * 100).toFixed(1)}%</strong>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.12}
              step={0.005}
              value={draftCoefficients.masonryWasteRate}
              onChange={(e) =>
                setDraftCoefficients({ ...draftCoefficients, masonryWasteRate: Number(e.target.value) })
              }
              className="w-full accent-[#F59E0B]"
            />
            <span className="text-[10px] text-slate-500">Padrão técnico: 5.0%</span>
          </div>

          {/* 2. Dosagem de Cimento */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Dosagem Betão C20/25:</span>
              <strong className="text-white font-mono">{draftCoefficients.concreteCementDosage} kg/m³</strong>
            </div>
            <input
              type="range"
              min={300}
              max={420}
              step={10}
              value={draftCoefficients.concreteCementDosage}
              onChange={(e) =>
                setDraftCoefficients({ ...draftCoefficients, concreteCementDosage: Number(e.target.value) })
              }
              className="w-full accent-[#F59E0B]"
            />
            <span className="text-[10px] text-slate-500">Padrão técnico: 350 kg/m³</span>
          </div>

          {/* 3. Taxa de BDI */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Taxa de BDI Central:</span>
              <strong className="text-white font-mono">{(draftCoefficients.bdiRate * 100).toFixed(1)}%</strong>
            </div>
            <input
              type="range"
              min={0.15}
              max={0.30}
              step={0.005}
              value={draftCoefficients.bdiRate}
              onChange={(e) =>
                setDraftCoefficients({ ...draftCoefficients, bdiRate: Number(e.target.value) })
              }
              className="w-full accent-[#F59E0B]"
            />
            <span className="text-[10px] text-slate-500">Padrão Contratos Públicos: 21.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotorSimuladorPage;
