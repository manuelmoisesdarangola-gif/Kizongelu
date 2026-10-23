/**
 * @file src/components/pwa/PWAInstallBanner.tsx
 * Banner "Instalar no telemóvel" após 2 visitas (Fase 18).
 * Apresenta fluxo nativo no Android/Chrome e instruções passo-a-passo no iOS Safari.
 */

import React, { useState } from 'react';
import { Smartphone, Download, X, Share, PlusSquare, Check } from 'lucide-react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { shouldShowBanner, isIOS, isInstallable, install, dismissBanner } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!shouldShowBanner) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        // Fallback
        dismissBanner();
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Navegador que não suporta prompt programático direto
      alert('Para instalar a app, toque no menu do seu navegador (três pontos) e seleccione "Adicionar ao ecrã principal".');
      dismissBanner();
    }
  };

  return (
    <>
      <aside
        aria-label="Instalar aplicação Kizongelu"
        className="fixed top-3 inset-x-3 sm:top-4 sm:inset-x-auto sm:right-4 z-50 max-w-md bg-white border-2 border-[#0F3D5C] rounded-2xl p-3.5 sm:p-4 shadow-2xl animate-in slide-in-from-top duration-300"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F3D5C] text-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#0F3D5C] uppercase tracking-wider">
                App Kizongelu
              </span>
              <button
                onClick={dismissBanner}
                aria-label="Fechar aviso de instalação"
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-900 mt-0.5">
              Instalar no telemóvel para acesso rápido e offline
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Funciona sem gastar dados adicionais na Unitel ou Africell.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="min-h-[44px] px-3.5 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Instalar Agora</span>
              </button>

              <button
                onClick={dismissBanner}
                className="min-h-[44px] px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Mais tarde
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal / Sheet de Instruções para iOS Safari */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Instalar no iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </div>
                <div className="leading-snug">
                  Toque no botão <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-900"><Share className="w-3.5 h-3.5" /> Partilhar</strong> na barra inferior do Safari.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </div>
                <div className="leading-snug">
                  Deslize para baixo e escolha <strong className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-900"><PlusSquare className="w-3.5 h-3.5" /> Ecrã Principal</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </div>
                <div className="leading-snug">
                  Confirme tocando em <strong className="text-[#0F3D5C]">Adicionar</strong> no canto superior direito.
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                dismissBanner();
              }}
              className="mt-6 w-full min-h-[48px] bg-[#0F3D5C] hover:bg-[#1A547C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstalled, isInstallable, install, isIOS } = usePWAInstall();
  const [showIOS, setShowIOS] = useState(false);

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else if (isIOS) {
            setShowIOS(true);
          } else {
            alert('Aceda ao menu do seu browser e clique em "Adicionar ao ecrã principal".');
          }
        }}
        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors ${className}`}
        title="Instalar Kizongelu como App"
      >
        <Download className="w-3.5 h-3.5 text-[#0F3D5C]" />
        <span>Instalar App</span>
      </button>

      {showIOS && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-2xl text-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Como instalar no Safari</h4>
            <p className="text-slate-600">
              1. Toque em <strong>Partilhar</strong> na barra de ferramentas.<br />
              2. Escolha <strong>Adicionar ao Ecrã Principal</strong>.
            </p>
            <button
              onClick={() => setShowIOS(false)}
              className="w-full min-h-[44px] bg-[#0F3D5C] text-white font-bold rounded-xl"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
