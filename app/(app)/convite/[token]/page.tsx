/**
 * @file app/(app)/convite/[token]/page.tsx
 * Página de Aceitação de Convite de Equipa (/convite/:token) — Fase 13.
 *
 * Funcionalidades:
 * - Validação em tempo real do token de convite.
 * - Apresentação do nome da empresa e função atribuída.
 * - Verificação de validade de 7 dias e estado de aceitação.
 * - Botão "Aceitar Convite e Entrar na Equipa".
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import {
  getInvitationByToken,
  acceptInvitation,
  InvitationRecord,
} from '@/lib/actions/subscriptions';

interface ConvitePageProps {
  token: string;
  onAccepted: () => void;
  onNavigateHome: () => void;
}

export const ConvitePage: React.FC<ConvitePageProps> = ({
  token,
  onAccepted,
  onNavigateHome,
}) => {
  const { currentUser } = useAuth();
  const { success, warning } = useToast();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getInvitationByToken(token)
      .then((inv) => {
        if (!inv) {
          setError('Convite não encontrado ou token inválido.');
        } else if (inv.acceptedAt) {
          setError('Este convite já foi aceite anteriormente.');
        } else if (new Date(inv.expiresAt) < new Date()) {
          setError('Este convite expirou (validade de 7 dias excedida).');
        } else {
          setInvitation(inv);
        }
      })
      .catch((e) => setError(e?.message || 'Falha ao validar convite.'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const res = await acceptInvitation(token, {
        id: currentUser.id,
        nome: currentUser.nome,
        email: currentUser.email,
      });
      success('Convite Aceite!', res.message);
      onAccepted();
    } catch (err: any) {
      warning(err.message || 'Erro ao aceitar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-xs text-slate-500">
        A validar convite de equipa...
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black text-slate-900">Convite Inválido</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={onNavigateHome}
            className="w-full py-2.5 px-4 bg-[#0F3D5C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        {/* Ícone */}
        <div className="w-14 h-14 rounded-3xl bg-[#0F3D5C] text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-slate-900/10">
          <Building2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
            Convite para Equipa Técnica
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Junte-se à equipa de {invitation.companyName}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Foi convidado para colaborar como{' '}
            <strong className="text-slate-800">
              {invitation.role === 'COMPANY_ADMIN'
                ? 'Administrador da Organização'
                : 'Orçamentista / Técnico'}
            </strong>{' '}
            no Kizongelu.
          </p>
        </div>

        {/* Card Resumo do Convite */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Email convidado:</span>
            <span className="font-bold text-slate-900">{invitation.email}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Convidado por:</span>
            <span className="font-bold text-slate-900">{invitation.companyName}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Validade do convite:</span>
            <span className="font-mono text-emerald-700">
              {new Date(invitation.expiresAt).toLocaleDateString('pt-PT')}
            </span>
          </div>
        </div>

        {/* Botão de Aceitação */}
        <div className="pt-2 space-y-3">
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>{isSubmitting ? 'A confirmar...' : 'Aceitar Convite e Entrar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateHome}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Recusar ou entrar com outra conta
          </button>
        </div>
      </div>
    </div>
  );
};
