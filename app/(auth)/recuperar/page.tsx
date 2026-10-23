/**
 * @file app/(auth)/recuperar/page.tsx
 * Página de pedido de recuperação de palavra-passe (Introdução de email associado).
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { requestPasswordReset } from '@/lib/actions/auth';
import { HardHat, Mail, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface RecuperarPageProps {
  onNavigateLogin?: () => void;
  onNavigateResetWithToken?: (token: string) => void;
}

export default function RecuperarPage({
  onNavigateLogin,
  onNavigateResetWithToken,
}: RecuperarPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; token?: string } | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await requestPasswordReset({ email });
      if (!res.success) {
        setError(res.error || 'Erro ao processar o pedido.');
        setToast({ title: 'Erro', desc: res.error || 'Falha no pedido', type: 'error' });
        return;
      }

      setSuccessInfo({
        message: res.message || 'Instruções enviadas para o seu email.',
        token: res.data?.token,
      });

      setToast({
        title: 'Pedido Enviado',
        desc: 'Verifique o seu email com o token válido por 30 minutos.',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na recuperação.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.desc}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F3D5C] text-white shadow-lg shadow-[#0F3D5C]/15 mb-3">
          <HardHat className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Recuperar Palavra-passe
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Enviaremos um link de segurança válido por 30 minutos para o seu email
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#E2E8F0] shadow-card-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0F3D5C]">Redefinição Segura</CardTitle>
            <CardDescription className="text-xs">
              Introduza o email com que se registou na Kizongelu.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <span>{error}</span>
              </div>
            )}

            {successInfo ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Email de Recuperação Enviado</h4>
                  <p className="text-xs text-slate-600 mt-1">{successInfo.message}</p>
                </div>

                {successInfo.token && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Token gerado (válido por 30 minutos):
                    </span>
                    <code className="text-xs font-mono text-[#0F3D5C] break-all block">
                      {successInfo.token}
                    </code>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  {successInfo.token && onNavigateResetWithToken && (
                    <Button
                      variant="cta"
                      className="w-full font-bold text-slate-900"
                      onClick={() => onNavigateResetWithToken(successInfo.token!)}
                    >
                      Redefinir Agora com este Token
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={onNavigateLogin}
                  >
                    Voltar ao Início de Sessão
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Registado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@empresa.co.ao"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? 'A enviar pedido...' : 'Enviar Link de Recuperação'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-semibold text-[#0F3D5C] hover:underline flex items-center cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Lembrou-se da palavra-passe? Entrar
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
