/**
 * @file src/components/public/InviteAcceptPage.tsx
 * Página Pública de Aceitação de Convite para Equipa Técnica (/convite/:token).
 */

import React, { useState } from 'react';
import { Users, CheckCircle2, Shield, ArrowRight, Building, Lock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface InviteAcceptPageProps {
  token: string;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const InviteAcceptPage: React.FC<InviteAcceptPageProps> = ({
  token,
  onNavigateLogin,
  onNavigateHome,
}) => {
  const { success, warning } = useToast();
  const [accepted, setAccepted] = useState(false);
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');

  const handleAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || password.length < 6) {
      warning('Preencha o seu nome completo e uma palavra-passe com pelo menos 6 caracteres.');
      return;
    }
    setAccepted(true);
    success('Convite Aceite com Sucesso!', 'A sua conta técnica foi associada à organização.');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
            <Users className="w-6 h-6 text-[#0F3D5C]" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Convite para Equipa Técnica
          </h2>
          <p className="text-xs text-slate-500">
            Foi convidado para integrar a equipa de engenharia no <strong>Kizongelu</strong> com acesso multi-utilizador.
          </p>
        </div>

        {!accepted ? (
          <form onSubmit={handleAccept} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div><strong>Token de Convite:</strong> <code className="font-mono text-amber-700">{token.substring(0, 16)}...</code></div>
              <div><strong>Função:</strong> Orçamentista Técnico</div>
              <div><strong>Validade:</strong> 7 dias</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">O Seu Nome Completo:</label>
              <input
                type="text"
                required
                placeholder="Ex.: Eng. António Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Crie a sua Palavra-passe de Acesso:</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Aceitar Convite e Ativar Conta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 pt-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">A sua conta foi configurada!</h3>
            <p className="text-xs text-slate-500">
              Já pode iniciar sessão para aceder às obras e mapas de quantidades da sua organização.
            </p>
            <button
              onClick={onNavigateLogin}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Entrar no Painel Técnico
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
