/**
 * @file src/components/auth/RecoverPasswordPage.tsx
 * Ecrã de Recuperação de Palavra-passe integrado com o Layout 2 (Autenticação).
 */

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { ArrowRight, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface RecoverPasswordPageProps {
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RecoverPasswordPage: React.FC<RecoverPasswordPageProps> = ({
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSent(true);
      setLoading(false);
      success('Link Enviado', 'Verifique a sua caixa de entrada para redefinir o acesso.');
    }, 400);
  };

  return (
    <AuthLayout
      title="Recuperar palavra-passe"
      subtitle="Insira o seu email para receber as instruções de recuperação."
      onNavigateHome={onNavigateHome}
    >
      {sent ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Email enviado com sucesso</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enviámos uma ligação de reposição para <strong>{email}</strong>. Siga as instruções para voltar a aceder aos seus orçamentos.
          </p>
          <button
            onClick={onNavigateLogin}
            className="w-full h-14 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Voltar ao ecrã de entrada</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email registado
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: seu.email@gmail.com"
                className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer mt-4"
          >
            <span>{loading ? 'A enviar...' : 'Enviar Link de Reposição'}</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0F3D5C] hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao ecrã de entrada</span>
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default RecoverPasswordPage;
