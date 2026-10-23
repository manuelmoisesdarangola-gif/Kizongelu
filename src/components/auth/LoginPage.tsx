/**
 * @file src/components/auth/LoginPage.tsx
 * Ecrã de Entrada / Login integrado com o Layout 2 (Autenticação).
 */

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { ArrowRight, Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onNavigateRecover: () => void;
  onNavigateHome: () => void;
  onNavigateTermos?: () => void;
  onNavigatePrivacidade?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateRegister,
  onNavigateRecover,
  onNavigateHome,
  onNavigateTermos,
  onNavigatePrivacidade,
}) => {
  const { usersList, setCurrentUserById, login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    setTimeout(() => {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      const successLogin = login(trimmedEmail, trimmedPassword);

      if (successLogin) {
        const cleanPhone = trimmedEmail.replace(/\s+/g, '');
        const user = usersList.find(
          (u) =>
            u.id.toLowerCase() === trimmedEmail.toLowerCase() ||
            u.email.toLowerCase() === trimmedEmail.toLowerCase() ||
            u.telefone.replace(/\s+/g, '') === cleanPhone
        );
        success('Bem-vindo de volta!', `Sessão iniciada como ${user?.nome || 'Utilizador'}`);
        setLoading(false);
        onSuccess();
      } else {
        const errorMsg = 'Email ou palavra-passe incorrectos. Verifique os dados inseridos (password de teste: 123456).';
        setFormError(errorMsg);
        error(errorMsg, 'Erro de Autenticação');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle="Aceda aos seus orçamentos e mapas de quantidades detalhados."
      onNavigateHome={onNavigateHome}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in duration-200">
            <Lock className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Campo Email com Label Visível e 56px de altura */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Email ou Telefone (+244)
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="o.seu.email@exemplo.ao"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Campo Palavra-passe */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Palavra-passe
            </label>
            <button
              type="button"
              onClick={onNavigateRecover}
              className="text-xs font-semibold text-[#0F3D5C] hover:underline cursor-pointer"
            >
              Esqueceu-se?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
              className="w-full h-14 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Checkbox Manter sessão activa */}
        <div className="flex items-center space-x-2 pt-1 pb-1">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-[#0F3D5C] focus:ring-[#0F3D5C] cursor-pointer accent-[#0F3D5C]"
          />
          <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
            Manter sessão activa neste dispositivo
          </label>
        </div>

        {/* Bloco de Credenciais de Demonstração / Teste */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Contas Pré-Cadastradas (Senha: 123456)</span>
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-md">
              Modo Teste
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@kizongelu.ao');
                setPassword('123456');
              }}
              className="py-1.5 px-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs transition-colors cursor-pointer shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] truncate">Admin Kizongelu</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">admin@kizongelu.ao · Acesso Total</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('carlos.neto@engenharia.ao');
                setPassword('123456');
              }}
              className="py-1.5 px-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs transition-colors cursor-pointer shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] truncate">Carlos Neto (Empresa+)</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">carlos.neto@engenharia.ao · 12 créd.</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('teresa.vandunem@construtora.ao');
                setPassword('123456');
              }}
              className="py-1.5 px-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs transition-colors cursor-pointer shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] truncate">Dra. Teresa (Empresa)</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">teresa.vandunem@construtora.ao · 6 créd.</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('arnaldo.silva@engenharia.ao');
                setPassword('123456');
              }}
              className="py-1.5 px-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs transition-colors cursor-pointer shadow-xs"
            >
              <div className="font-bold text-slate-900 text-[11px] truncate">Eng. Arnaldo Silva</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">arnaldo.silva@engenharia.ao · 3 créd.</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('manuel.kiala@exemplo.ao');
                setPassword('123456');
              }}
              className="py-1.5 px-2.5 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs transition-colors cursor-pointer shadow-xs sm:col-span-2"
            >
              <div className="font-bold text-slate-900 text-[11px] truncate">Manuel Kiala (Particular)</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">manuel.kiala@exemplo.ao · 1 créd.</div>
            </button>
          </div>
        </div>

        {/* CTA Laranja Full-width (56px) - Entrar → com Spinner */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>A verificar...</span>
            </>
          ) : (
            <>
              <span>Entrar</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>

        {/* Termos e Privacidade */}
        <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-1">
          Ao entrar, aceita os{' '}
          <button
            type="button"
            onClick={() => {
              if (onNavigateTermos) onNavigateTermos();
              else window.location.href = '/termos';
            }}
            className="text-[#0F3D5C] font-semibold underline hover:text-[#D97706] cursor-pointer"
          >
            Termos de Utilização
          </button>{' '}
          e a{' '}
          <button
            type="button"
            onClick={() => {
              if (onNavigatePrivacidade) onNavigatePrivacidade();
              else window.location.href = '/privacidade';
            }}
            className="text-[#0F3D5C] font-semibold underline hover:text-[#D97706] cursor-pointer"
          >
            Política de Privacidade
          </button>
          .
        </p>

        {/* Link para Criar Conta */}
        <div className="pt-3 text-center">
          <span className="text-xs text-slate-500">Ainda não tem conta? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-xs font-bold text-[#0F3D5C] hover:underline cursor-pointer"
          >
            Criar conta
          </button>
        </div>

        {/* Trust signal discreto */}
        <div className="pt-2 text-center">
          <span className="text-[11px] text-slate-400 font-medium">
            🔒 Ligação encriptada.
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
