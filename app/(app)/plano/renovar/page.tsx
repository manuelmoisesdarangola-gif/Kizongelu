import React, { useEffect } from 'react';

export interface RenovarRedirectProps {
  onBack?: () => void;
  onRenewed?: () => void;
}

export default function RenovarRedirect({ onBack, onRenewed }: RenovarRedirectProps = {}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({}, '', '/plano');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.replace('/plano');
      }
    }
    if (onRenewed) onRenewed();
    else if (onBack) onBack();
  }, [onBack, onRenewed]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-sm text-slate-500">A redireccionar para os pacotes…</p>
    </div>
  );
}

// Compatibilidade transitória com importações nomeadas
export { RenovarRedirect as RenovarPlanoPage };
