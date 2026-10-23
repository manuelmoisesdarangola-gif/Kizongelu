/**
 * @file src/components/auth/ConfirmEmailPage.tsx
 * Ecrã de Confirmação de Email (/confirmar-email/:token).
 */

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface ConfirmEmailPageProps {
  token: string;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ConfirmEmailPage: React.FC<ConfirmEmailPageProps> = ({
  token,
  onNavigateLogin,
  onNavigateHome,
}) => {
  return (
    <AuthLayout
      title="Confirmação de conta"
      subtitle="A sua conta no Kizongelu foi verificada com sucesso."
      onNavigateHome={onNavigateHome}
    >
      <div className="text-center space-y-6 py-4">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Email Confirmado</span>
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">Endereço de email autenticado!</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            O seu token de verificação <code className="font-mono font-bold text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{token || 'valido'}</code> foi processado. Pode agora entrar e criar orçamentos com cotações de Angola em Kwanzas.
          </p>
        </div>

        <button
          onClick={onNavigateLogin}
          className="w-full h-14 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <span>Entrar na Minha Conta</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[11px] text-slate-400">
          Suporte técnico e ativação corporativa: +244 923 000 000 &bull; Luanda, Angola
        </p>
      </div>
    </AuthLayout>
  );
};
