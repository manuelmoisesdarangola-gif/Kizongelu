import React, { useEffect } from 'react';

export interface PlanosRedirectPageProps {
  onNavigatePlano?: () => void;
  onPlanSelected?: (planId?: string) => void;
}

export default function PlanosRedirectPage({ onNavigatePlano }: PlanosRedirectPageProps = {}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({}, '', '/plano');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.replace('/plano');
      }
    }
    if (onNavigatePlano) {
      onNavigatePlano();
    }
  }, [onNavigatePlano]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-sm text-slate-500">A redireccionar para os pacotes…</p>
    </div>
  );
}

// Compatibilidade transitória com importações nomeadas
export { PlanosRedirectPage as PlanosPage };
