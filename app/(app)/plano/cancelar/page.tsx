import React, { useEffect } from 'react';

export interface CancelarRedirectProps {
  onBack?: () => void;
  onCancelled?: () => void;
}

export default function CancelarRedirect({ onBack, onCancelled }: CancelarRedirectProps = {}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState({}, '', '/plano');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.replace('/plano');
      }
    }
    if (onCancelled) onCancelled();
    else if (onBack) onBack();
  }, [onBack, onCancelled]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-sm text-slate-500">A redireccionar para os pacotes…</p>
    </div>
  );
}

// Compatibilidade transitória com importações nomeadas
export { CancelarRedirect as CancelarPlanoPage };
