/**
 * @file src/components/auth/RegisterPage.tsx
 * Ecrã de Registo / Criar Conta integrado com o Layout 2 (Autenticação).
 */

import React, { useState } from 'react';
import { AuthLayout } from '../../layouts/AuthLayout';
import { useAuth, UserRole } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { ArrowRight, User, Mail, Phone, Lock, Building } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { registerUser } = useAuth();
  const { success } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [role, setRole] = useState<UserRole>('particular');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Cria novo utilizador com os créditos e plano correspondentes via getDefaultCredits(role)
      registerUser({
        nome,
        email,
        telefone,
        role,
      });
      success('Conta criada com sucesso!', `Bem-vindo ao Kizongelu, ${nome}.`);
      setLoading(false);
      onSuccess();
    }, 400);
  };

  return (
    <AuthLayout
      title="Criar conta no Kizongelu"
      subtitle="Junte-se a proprietários, engenheiros e empreiteiros em Angola."
      onNavigateHome={onNavigateHome}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Utilizador */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Tipo de Perfil
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setRole('particular')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                role === 'particular'
                  ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              Particular
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                0 créditos (aquisição pontual)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('profissional')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                role === 'profissional'
                  ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              Profissional
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                3 créditos incluídos
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('empresa')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                role === 'empresa'
                  ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              Empresa
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                6 créditos incluídos
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole('empresa_plus')}
              className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                role === 'empresa_plus'
                  ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                  : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              Empresa Plus
              <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                12 créditos incluídos
              </span>
            </button>
          </div>
        </div>

        {/* Nome Completo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Nome Completo
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João Manuel"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Endereço de Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: seu.nome@gmail.com"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
            />
          </div>
        </div>

        {/* Telefone Angola */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Telefone / WhatsApp (Angola)
          </label>
          <div className="relative">
            <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+244 9XX XXX XXX"
              className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:bg-white"
            />
          </div>
        </div>

        {/* CTA Laranja 56px */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-base rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer mt-4"
        >
          <span>{loading ? 'A criar conta...' : 'Criar conta →'}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="pt-4 text-center">
          <span className="text-xs text-slate-500">Já tem uma conta? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-xs font-bold text-[#0F3D5C] hover:underline cursor-pointer"
          >
            Entrar
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
