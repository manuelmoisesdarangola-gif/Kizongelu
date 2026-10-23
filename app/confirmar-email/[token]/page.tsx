/**
 * @file app/confirmar-email/[token]/page.tsx
 * Página de ativação de conta através de token de email.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { confirmEmail } from '@/lib/actions/auth';
import { HardHat, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

interface ConfirmarEmailPageProps {
  token: string;
  onNavigateLogin?: () => void;
}

export default function ConfirmarEmailPage({
  token,
  onNavigateLogin,
}: ConfirmarEmailPageProps) {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleConfirm() {
      if (!token) {
        setErrorMessage('Token de ativação ausente.');
        setLoading(false);
        return;
      }

      const res = await confirmEmail(token);
      if (!isMounted) return;

      if (res.success) {
        setSuccess(true);
        setConfirmedEmail(res.data?.email || null);
      } else {
        setErrorMessage(res.error || 'Token inválido ou expirado.');
      }
      setLoading(false);
    }

    handleConfirm();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F3D5C] text-white shadow-lg shadow-[#0F3D5C]/15 mb-3">
          <HardHat className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Ativação de Conta
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Validação do endereço de email registado
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#E2E8F0] shadow-card-subtle">
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 space-y-3">
                <Loader2 className="w-8 h-8 text-[#0F3D5C] animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-medium">A validar o token de confirmação...</p>
              </div>
            ) : success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Conta Ativada com Sucesso!</h3>
                <p className="text-xs text-slate-600">
                  O endereço {confirmedEmail ? <strong>{confirmedEmail}</strong> : 'associado'} foi confirmado. Pode agora aceder à plataforma e orçar as suas obras.
                </p>
                <Button
                  variant="cta"
                  className="w-full font-bold text-slate-900"
                  onClick={onNavigateLogin}
                >
                  Entrar na Minha Conta
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Falha na Ativação</h3>
                <p className="text-xs text-red-600">{errorMessage}</p>
                <p className="text-[11px] text-slate-500">
                  O link pode ter expirado (validade de 24 horas) ou já ter sido utilizado anteriormente.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onNavigateLogin}
                >
                  Voltar ao Início de Sessão
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
