import React from 'react';
import { PublicLandingPage } from '@/src/components/public/PublicLandingPage';

export default function PublicHomePage() {
  return (
    <PublicLandingPage
      onEnterApp={() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }}
      onStartWizard={(options) => {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams({ action: 'new-budget' });
          if (options?.tipo) params.set('tipo', options.tipo);
          if (options?.subtipo) params.set('subtipo', options.subtipo);
          if (options?.step) params.set('step', String(options.step));
          try {
            if (options?.tipo) sessionStorage.setItem('kizongelu_preset_type', options.tipo);
            if (options?.subtipo) sessionStorage.setItem('kizongelu_preset_subtype', options.subtipo);
            if (options?.step) sessionStorage.setItem('kizongelu_preset_step', String(options.step));
          } catch {}
          window.location.href = `/?${params.toString()}`;
        }
      }}
    />
  );
}
