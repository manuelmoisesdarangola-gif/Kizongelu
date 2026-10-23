/**
 * @file app/(app)/projeto/[projectId]/preview/processing-screen.tsx
 * Ecrã de processamento inicial com 5 verificações animadas antes da exibição do preview.
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ProcessingScreenProps {
  onComplete: () => void;
}

const STEPS = [
  { id: 1, label: 'Dados analisados e validados' },
  { id: 2, label: 'Quantidades métricas calculadas' },
  { id: 3, label: 'Tabela de preços provinciais aplicada' },
  { id: 4, label: 'Custos organizados por capítulos estruturais' },
  { id: 5, label: 'Relatório e mapa de quantidades a preparar' },
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ onComplete }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    // Sequência animada dos 5 passos (total ~2.5 segundos)
    const timers = [
      setTimeout(() => setCompletedSteps([1]), 400),
      setTimeout(() => setCompletedSteps([1, 2]), 900),
      setTimeout(() => setCompletedSteps([1, 2, 3]), 1400),
      setTimeout(() => setCompletedSteps([1, 2, 3, 4]), 1900),
      setTimeout(() => {
        setCompletedSteps([1, 2, 3, 4, 5]);
        setTimeout(() => onComplete(), 700);
      }, 2400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          A gerar estimativa de engenharia...
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-8">
          A cruzar especificações do projeto com os coeficientes da tabela de preços para Angola.
        </p>

        <div className="space-y-3.5 text-left">
          {STEPS.map((step) => {
            const isDone = completedSteps.includes(step.id);
            const isCurrent = !isDone && (completedSteps.length + 1 === step.id);

            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950 font-semibold'
                    : isCurrent
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-semibold'
                    : 'bg-slate-50/60 border-slate-100 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex-shrink-0" />
                )}
                <span className="text-xs sm:text-sm">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
