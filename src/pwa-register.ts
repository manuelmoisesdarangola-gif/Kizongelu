/**
 * @file src/pwa-register.ts
 * Registo de Service Worker para Kizongelu PWA.
 */

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Kizongelu PWA] Service Worker registado com escopo:', reg.scope);

          // Verificar atualizações periodicamente
          reg.addEventListener('updatefound', () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[Kizongelu PWA] Nova versão disponível em cache!');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[Kizongelu PWA] Falha ao registar Service Worker:', error);
        });
    });
  }
}
