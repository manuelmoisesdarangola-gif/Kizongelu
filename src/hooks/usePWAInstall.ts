/**
 * @file src/hooks/usePWAInstall.ts
 * Hook de instalação PWA e contagem de visitas (Fase 18).
 * Suporta evento beforeinstallprompt, iOS Safari e deteção de modo standalone.
 */

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [visitCount, setVisitCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    const current = parseInt(localStorage.getItem('kizongelu_visit_count') || '0', 10);
    return isNaN(current) ? 1 : current;
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('kizongelu_pwa_banner_dismissed') === 'true';
  });

  useEffect(() => {
    // 1. Incrementar contador de visitas
    try {
      const stored = parseInt(localStorage.getItem('kizongelu_visit_count') || '0', 10);
      const newCount = (isNaN(stored) ? 0 : stored) + 1;
      localStorage.setItem('kizongelu_visit_count', newCount.toString());
      setVisitCount(newCount);
    } catch {
      // Ignorar erros em navegação privada
    }

    // 2. Verificar se já corre em modo standalone (PWA instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsInstalled(isStandalone);

    // 3. Detetar iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    // 4. Capturar evento beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.error('Erro ao invocar prompt PWA:', err);
    }
    return false;
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('kizongelu_pwa_banner_dismissed', 'true');
    } catch {}
  }, []);

  // Mostra banner se:
  // - Não estiver instalado
  // - Tiver pelo menos 2 visitas
  // - Não tiver sido dispensado na sessão atual
  const shouldShowBanner = !isInstalled && !isDismissed && visitCount >= 2;

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    visitCount,
    shouldShowBanner,
    install,
    dismissBanner,
  };
}
