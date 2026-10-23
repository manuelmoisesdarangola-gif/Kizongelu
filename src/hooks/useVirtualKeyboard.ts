/**
 * @file src/hooks/useVirtualKeyboard.ts
 * Hook para deteção de teclado virtual móvel em smartphones Android e iOS.
 * - Detecta mudanças no window.visualViewport ou resize do window.
 * - Quando o teclado abre: informa `isKeyboardOpen` para esconder bottom navs
 *   e exibe a barra flutuante de conclusão com botão "Concluir".
 */

import { useState, useEffect } from 'react';

export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // 1. Prioriza Visual Viewport API (padrão moderno Android Chrome)
    if (typeof window !== 'undefined' && window.visualViewport) {
      const visualViewport = window.visualViewport;
      const initialHeight = visualViewport.height;

      const handleResize = () => {
        // Redução substancial de altura (> 140px) indica teclado virtual aberto
        const diff = initialHeight - visualViewport.height;
        setIsKeyboardOpen(diff > 140);
      };

      visualViewport.addEventListener('resize', handleResize);
      return () => visualViewport.removeEventListener('resize', handleResize);
    }

    // 2. Fallback para window resize ou foco em inputs
    let initialWindowHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const handleWindowResize = () => {
      if (typeof window !== 'undefined') {
        const diff = initialWindowHeight - window.innerHeight;
        setIsKeyboardOpen(diff > 140);
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const dismissKeyboard = () => {
    if (typeof document !== 'undefined') {
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable'))) {
        activeEl.blur();
      }
    }
  };

  return { isKeyboardOpen, dismissKeyboard };
}
