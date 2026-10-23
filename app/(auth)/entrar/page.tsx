/**
 * @file app/(auth)/entrar/page.tsx
 * Página de início de sessão (Email + Palavra-passe + Link 'Esqueceu a palavra-passe?').
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Toast } from '@/components/ui/toast';
import { loginUser } from '@/lib/actions/auth';
import { HardHat, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

interface EntrarPageProps {
  onSuccess?: (user: { id: string; name: string; email: string; role: string }) => void;
  onNavigateRegister?: () => void;
  onNavigateRecovery?: () => void;
}

export default function EntrarPage({
  onSuccess,
  onNavigateRegister,
  onNavigateRecovery,
}: EntrarPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitNotice, setRateLimitNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRateLimitNotice(null);
    setLoading(true);

    try {
      const res = await loginUser({ email, password });

      if (!res.success) {
        setError(res.error || 'Credenciais inválidas.');
        if (res.rateLimit?.blocked) {
          setRateLimitNotice(`Conta temporariamente bloqueada por 15 minutos devido a 5 tentativas falhadas.`);
        } else if (res.rateLimit && res.rateLimit.remaining < 5) {
          setRateLimitNotice(`Tentativas restantes antes de bloqueio temporário: ${res.rateLimit.remaining}`);
        }
        setToastMessage({
          title: 'Erro de Autenticação',
          desc: res.error || 'Credenciais inválidas',
          type: 'error',
        });
        return;
      }

      setToastMessage({
        title: 'Sessão Iniciada',
        desc: `Bem-vindo, ${res.data?.name}!`,
        type: 'success',
      });

      if (onSuccess && res.data) {
        onSuccess(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao autenticar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter',sans-serif]">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 max-w-sm">
          <Toast
            type={toastMessage.type}
            title={toastMessage.title}
            message={toastMessage.desc}
            onClose={() => setToastMessage(null)}
          />
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0F3D5C] text-white shadow-lg shadow-[#0F3D5C]/15 mb-3">
          <HardHat className="w-8 h-8 text-[#F59E0B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
          Entrar na Kizongelu
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Aceda aos seus orçamentos e mapas de quantidades de obras em Angola
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#E2E8F0] shadow-card-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0F3D5C]">Início de Sessão Seguro</CardTitle>
            <CardDescription className="text-xs">
              Sessão protegida por cookies httpOnly com validade de 30 dias.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Erro ao entrar:</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {rateLimitNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{rateLimitNotice}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email
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
                    placeholder="o.seu.email@exemplo.ao"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateRecovery}
                    className="text-xs font-medium text-[#0F3D5C] hover:text-[#1A547C] hover:underline cursor-pointer"
                  >
                    Esqueceu a palavra-passe?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              {/* Checkbox Manter sessão activa */}
              <div className="flex items-center space-x-2 pt-1 pb-1">
                <input
                  type="checkbox"
                  id="rememberMeEntrar"
                  defaultChecked
                  className="w-4 h-4 rounded border-slate-300 text-[#0F3D5C] focus:ring-[#0F3D5C] cursor-pointer accent-[#0F3D5C]"
                />
                <label htmlFor="rememberMeEntrar" className="text-xs text-slate-600 cursor-pointer select-none">
                  Manter sessão activa neste dispositivo
                </label>
              </div>

              <Button
                type="submit"
                variant="cta"
                className="w-full justify-center font-bold text-slate-900"
                disabled={loading}
              >
                {loading ? 'A verificar...' : 'Entrar'}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              {/* Termos e Privacidade */}
              <p className="text-[11px] text-slate-500 text-center leading-relaxed pt-1">
                Ao entrar, aceita os{' '}
                <a
                  href="/termos"
                  className="text-[#0F3D5C] font-semibold underline hover:text-[#D97706]"
                >
                  Termos de Utilização
                </a>{' '}
                e a{' '}
                <a
                  href="/privacidade"
                  className="text-[#0F3D5C] font-semibold underline hover:text-[#D97706]"
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </form>
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
            <p className="text-xs text-slate-600">
              Ainda não tem conta?{' '}
              <button
                type="button"
                onClick={onNavigateRegister}
                className="font-bold text-[#0F3D5C] hover:underline cursor-pointer"
              >
                Criar conta
              </button>
            </p>

            <span className="text-[11px] text-slate-400 font-medium">
              🔒 Ligação encriptada.
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
