/**
 * @file components/ui/ai-badge.tsx
 * Badges e componentes de feedback visual para a Camada de IA:
 * - Badge discreto "Assistido por IA"
 * - Aviso amarelo "Necessita de confirmação" em caso de incerteza
 * - Tag "Sugerido pela IA — confirmar"
 */

import React from 'react';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AiBadgeProps {
  needsConfirmation?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const AiBadge: React.FC<AiBadgeProps> = ({
  needsConfirmation = false,
  className = '',
  size = 'sm',
}) => {
  if (needsConfirmation) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-300 text-xs shadow-2xs ${className}`}
        title="Este conteúdo foi gerado por IA com incerteza e requer validação humana."
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>Necessita de confirmação</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] ${className}`}
      title="Gerado com suporte de inteligência artificial especializada em engenharia civil."
    >
      <Sparkles className="w-3 h-3 text-indigo-500" />
      <span>Assistido por IA</span>
    </span>
  );
};

export const AiSuggestedTag: React.FC<{ onConfirm?: () => void; isConfirmed?: boolean; className?: string }> = ({
  onConfirm,
  isConfirmed = false,
  className = '',
}) => {
  if (isConfirmed) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px]">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Confirmado pelo utilizador</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold bg-amber-50 text-amber-800 border border-amber-300 text-[11px] animate-pulse">
        <Sparkles className="w-3 h-3 text-amber-600" />
        <span>Sugerido pela IA — confirmar</span>
      </span>
      {onConfirm && (
        <button
          type="button"
          onClick={onConfirm}
          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
        >
          Confirmar sugestão
        </button>
      )}
    </div>
  );
};
