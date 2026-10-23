/**
 * @file app/(auth)/redefinir/[token]/page.tsx
 * Página de redefinição de palavra-passe com token validado (30 minutos).
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { resetPassword } from '@/lib/actions/auth';
import { HardHat, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface RedefinirPageProps {
  token: string;
  onNavigateLogin?: () => void;
}

export default function RedefinirPasswordPage({
  token,
  onNavigateLogin,
}: RedefinirPageProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('A palavra-passe deve conter pelo menos uma letra maiúscula.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('A palavra-passe deve conter pelo menos um dígito numérico.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        token,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.error || 'Token inválido ou expirado.');
        setToast({ title: 'Erro de Redefinição', desc: res.error || 'Falha ao redefinir', type: 'error' });
        return;
      }

      setSuccess(true);
      setToast({
        title: 'Sucesso',
        desc: 'Palavra-passe atualizada com sucesso!',
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao redefinir.';
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
          Definir Nova Palavra-passe
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Crie uma nova credencial segura para aceder à Kizongelu
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#E2E8F0] shadow-card-subtle">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-[#0F3D5C]">Segurança da Conta</CardTitle>
            <CardDescription className="text-xs">
              Token de validação ativo: <span className="font-mono text-[#0F3D5C]">{token ? `${token.substring(0, 16)}...` : 'Nenhum'}</span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Palavra-passe Redefinida!</h4>
                <p className="text-xs text-slate-600">
                  A sua palavra-passe foi atualizada com encriptação bcrypt (custo 12). Pode agora iniciar sessão com a nova chave.
                </p>
                <Button
                  variant="cta"
                  className="w-full font-bold text-slate-900"
                  onClick={onNavigateLogin}
                >
                  Ir para Início de Sessão
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres (A-Z e 0-9)"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Confirmar Nova Palavra-passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <Input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a palavra-passe"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="cta"
                  className="w-full justify-center font-bold text-slate-900"
                  disabled={loading}
                >
                  {loading ? 'A gravar nova palavra-passe...' : 'Gravar Nova Palavra-passe'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-xs font-semibold text-[#0F3D5C] hover:underline cursor-pointer"
            >
              Cancelar e voltar ao login
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
