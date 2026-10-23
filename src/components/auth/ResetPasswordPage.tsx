/**
 * @file src/components/auth/ResetPasswordPage.tsx
 * Ecrã de Redefinição de Palavra-passe (/redefinir/:token).
 */

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useToast } from '../../context/ToastContext';
import { Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface ResetPasswordPageProps {
  token: string;
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token,
  onSuccess,
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { success, error: toastError } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toastError('Palavra-passe curta', 'A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      toastError('Palavras-passe não coincidem', 'Certifique-se de que ambas as palavras-passe são iguais.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsCompleted(true);
      success('Palavra-passe alterada!', 'A sua nova palavra-passe foi guardada com sucesso.');
    }, 500);
  };

  return (
    <AuthLayout
      title="Redefinir palavra-passe"
      subtitle="Defina uma nova palavra-passe segura para a sua conta."
      onNavigateHome={onNavigateHome}
    >
      {isCompleted ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Acesso redefinido com sucesso!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              A sua palavra-passe foi atualizada. Já pode entrar na plataforma e aceder a todos os seus orçamentos.
            </p>
          </div>
          <button
            onClick={onNavigateLogin}
            className="w-full h-14 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <span>Ir para o Ecrã de Entrada</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center space-x-2.5 text-xs text-[#0F3D5C]">
            <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>
              Token de validação ativo: <code className="font-mono font-bold text-slate-800">{token || 'token_valido'}</code>
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nova Palavra-passe
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="No mínimo 6 caracteres"
                className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Confirmar Nova Palavra-passe
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a palavra-passe"
                className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2 mt-4"
          >
            <span>{loading ? 'A guardar...' : 'Guardar Nova Palavra-passe'}</span>
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs text-slate-500 hover:text-[#0F3D5C] font-semibold"
            >
              Lembrou-se da palavra-passe? Voltar ao Login
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
