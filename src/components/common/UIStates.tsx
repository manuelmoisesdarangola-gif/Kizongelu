/**
 * @file src/components/common/UIStates.tsx
 * Sistema Padronizado de Estados de UI do Kizongelu:
 * 1. LOADING (Skeleton com Shimmer Suave Laranja em loop de 1.6s, formato idêntico ao final)
 * 2. EMPTY (Ilustração minimalista de linha fina azul-cinza + Título + Subtítulo + CTA Laranja)
 * 3. ERROR (Círculo vermelho 10% opacidade + Mensagem neutra + CTA obrigatório de recuperação)
 * 4. SEMANTIC STATUS (Badges e ícones semânticos verde / amarelo / vermelho)
 */

import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  FolderOpen,
  Receipt,
  Bell,
  FileText,
} from 'lucide-react';

/* ========================================================================= */
/* 1. SKELETON LOADERS (Com Shimmer Suave Laranja 1.6s)                      */
/* ========================================================================= */

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return <div className={`skeleton-shimmer-orange rounded-lg ${className}`} />;
};

/** Skeleton para Tabelas de Projetos, Documentos e Pagamentos */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; cols?: number }> = ({
  rows = 4,
  columns,
  cols,
}) => {
  const actualCols = columns ?? cols ?? 5;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card-subtle">
      {/* Header da Tabela */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Linhas */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48 sm:w-64" />
              <Skeleton className="h-3 w-32 sm:w-40" />
            </div>
            <div className="hidden sm:block">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="hidden md:block">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-xl" />
              <Skeleton className="h-8 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Skeleton para Grelhas de Cards (Projetos / Estatísticas) */
export const CardGridSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: cards }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-card-subtle"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Skeleton className="h-8 w-20 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Skeleton para Lista de Cards / Linhas de Pagamentos */
export const CardSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card-subtle"
        >
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48 sm:w-64" />
            <Skeleton className="h-3 w-36 sm:w-56" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

/** Skeleton para KPIs Numéricos */
export const KpiGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 shadow-card-subtle"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      ))}
    </div>
  );
};

/* ========================================================================= */
/* 2. EMPTY STATE (Ilustração minimalista linha fina azul-cinza + CTA)       */
/* ========================================================================= */

interface EmptyStateProps {
  type?: 'projects' | 'payments' | 'notifications' | 'documents' | 'generic' | 'search';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  onCta?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  subtitle,
  ctaText,
  ctaLabel,
  onCtaClick,
  onCta,
  className = '',
}) => {
  const actualCtaText = ctaText || ctaLabel;
  const actualOnCta = onCtaClick || onCta;
  // Predefinições semânticas de empty state
  let defaultTitle = 'Nenhum registo encontrado';
  let defaultSubtitle = 'Ainda não existem elementos disponíveis nesta categoria.';
  let defaultCta = actualCtaText;
  let renderIcon = (
    <svg
      className="w-12 h-12 text-[#0F3D5C]/60 stroke-1"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
    >
      <rect x="8" y="10" width="32" height="28" rx="4" strokeWidth="1.5" />
      <path d="M8 18H40" strokeWidth="1.5" />
      <path d="M16 26H32" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 32H24" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  if (type === 'projects') {
    defaultTitle = title || 'Ainda não tem orçamentos';
    defaultSubtitle =
      subtitle || 'Crie o seu primeiro orçamento para estimar materiais, custos e mão de obra com precisão.';
    defaultCta = ctaText || '+ Criar primeiro';
    renderIcon = (
      <svg
        className="w-14 h-14 text-[#0F3D5C]/60 stroke-1"
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M6 14C6 11.7909 7.79086 10 10 10H20.5858C21.6466 10 22.664 10.4214 23.4142 11.1716L27.8284 15.5858C28.5786 16.336 29.596 16.7574 30.6569 16.7574H46C48.2091 16.7574 50 18.5482 50 20.7574V42C50 44.2091 48.2091 46 46 46H10C7.79086 46 6 44.2091 6 42V14Z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M28 27V37" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M23 32H33" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  } else if (type === 'payments') {
    defaultTitle = title || 'Sem pagamentos registados';
    defaultSubtitle =
      subtitle || 'Assim que gerar ou desbloquear orçamentos, o histórico de recibos e faturas aparecerá aqui.';
    defaultCta = ctaText || 'Criar orçamento';
    renderIcon = (
      <svg
        className="w-14 h-14 text-[#0F3D5C]/60 stroke-1"
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
      >
        <rect x="8" y="12" width="40" height="32" rx="4" strokeWidth="1.5" />
        <line x1="8" y1="22" x2="48" y2="22" strokeWidth="1.5" />
        <circle cx="16" cy="32" r="2.5" strokeWidth="1.5" />
        <line x1="24" y1="32" x2="38" y2="32" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  } else if (type === 'notifications') {
    defaultTitle = title || 'Tudo em ordem';
    defaultSubtitle =
      subtitle || 'Não existem notificações pendentes no momento. As atualizações da obra aparecerão aqui.';
    defaultCta = undefined; // Sem CTA para notificações limpas
    renderIcon = (
      <svg
        className="w-14 h-14 text-[#0F3D5C]/60 stroke-1"
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M28 10C21.3726 10 16 15.3726 16 22V28L12 36H44L40 28V22C40 15.3726 34.6274 10 28 10Z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M24 40C24 42.2091 25.7909 44 28 44C30.2091 44 32 42.2091 32 40" strokeWidth="1.5" />
        <circle cx="28" cy="22" r="3" strokeWidth="1.5" />
      </svg>
    );
  } else if (type === 'documents') {
    defaultTitle = title || 'Sem documentos emitidos';
    defaultSubtitle =
      subtitle || 'Os orçamentos e mapas de quantidades gerados em PDF profissional estarão disponíveis aqui.';
    defaultCta = ctaText || 'Novo Orçamento';
    renderIcon = (
      <svg
        className="w-14 h-14 text-[#0F3D5C]/60 stroke-1"
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M14 10H32L42 20V46H14V10Z"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M32 10V20H42" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="20" y1="28" x2="36" y2="28" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="34" x2="36" y2="34" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  } else if (type === 'search') {
    defaultTitle = title || 'Nenhum resultado encontrado';
    defaultSubtitle =
      subtitle || 'Não foram encontrados resultados que correspondam à sua pesquisa. Tente ajustar os filtros.';
    defaultCta = ctaText || 'Limpar Pesquisa';
    renderIcon = (
      <svg
        className="w-14 h-14 text-[#0F3D5C]/60 stroke-1"
        viewBox="0 0 56 56"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="24" cy="24" r="14" strokeWidth="1.5" />
        <line x1="34" y1="34" x2="48" y2="48" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="24" x2="28" y2="24" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  const finalTitle = title || defaultTitle;
  const finalSubtitle = subtitle || defaultSubtitle;
  const finalCta = (ctaText !== undefined || ctaLabel !== undefined) ? actualCtaText : defaultCta;

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-card-subtle space-y-4 my-6 ${className}`}
    >
      <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-200">
        {renderIcon}
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {finalTitle}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {finalSubtitle}
        </p>
      </div>

      {finalCta && actualOnCta && (
        <div className="pt-2">
          <button
            onClick={actualOnCta}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all duration-100 cursor-pointer"
          >
            <span>{finalCta}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ========================================================================= */
/* 3. ERROR STATE (Círculo vermelho 10% opacidade + CTA de recuperação)     */
/* ========================================================================= */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Não foi possível carregar os dados',
  message = 'Ocorreu uma instabilidade na ligação ao servidor. Por favor, tente novamente.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-3xl border border-rose-100 p-8 sm:p-10 text-center max-w-md mx-auto shadow-card-subtle space-y-4 my-6 ${className}`}
    >
      {/* Ícone dentro de círculo vermelho suave (10% opacidade) */}
      <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
        <AlertCircle className="w-7 h-7 stroke-[2]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Tentar novamente</span>
        </button>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* 4. SEMANTIC STATUS BADGES (Verde / Amarelo / Vermelho)                   */
/* ========================================================================= */

export type SemanticStatusType =
  | 'APPROVED'
  | 'UNLOCKED'
  | 'VERIFIED'
  | 'EMITTED'
  | 'PENDING'
  | 'ESTIMATED'
  | 'DRAFT'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'EXPIRED';

interface StatusBadgeProps {
  status?: SemanticStatusType | string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | string;
  label?: string;
}

export const SemanticStatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, label }) => {
  let mappedStatus = status;
  if (!mappedStatus && variant) {
    if (variant === 'success') mappedStatus = 'APPROVED';
    else if (variant === 'warning') mappedStatus = 'PENDING';
    else if (variant === 'danger') mappedStatus = 'REJECTED';
    else mappedStatus = variant;
  }
  const norm = (mappedStatus || '').toUpperCase();

  // Verde: Aprovado, Concluído, Verificado, Emitido
  if (['APPROVED', 'UNLOCKED', 'VERIFIED', 'EMITTED', 'CONCLUIDO'].includes(norm)) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>{label || (norm === 'UNLOCKED' ? 'Concluído' : norm === 'APPROVED' ? 'Aprovado' : 'Verificado')}</span>
      </span>
    );
  }

  // Amarelo: Pendente, Estimado, Rascunho, Aguarda Pagamento
  if (['PENDING', 'ESTIMATED', 'DRAFT', 'EM_PROCESSAMENTO', 'RASCUNHO'].includes(norm)) {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
        <span>{label || (norm === 'PENDING' ? 'Pendente' : norm === 'ESTIMATED' ? 'Estimado' : 'Rascunho')}</span>
      </span>
    );
  }

  // Vermelho: Rejeitado, Arquivado, Cancelado, Expirado
  return (
    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
      <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
      <span>{label || (norm === 'REJECTED' ? 'Rejeitado' : 'Arquivado')}</span>
    </span>
  );
};
