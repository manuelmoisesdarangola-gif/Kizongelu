/**
 * @file app/(auth)/criar-conta/page.tsx
 * Página de registo em 2 Passos:
 * Passo 1: Dados básicos (Nome, Email, Telefone +244, Palavra-passe com requisitos)
 * Passo 2: Tipo de utilizador (Particular, Profissional, Dono de Empresa)
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Toast } from '@/components/ui/toast';
import { registerUser } from '@/lib/actions/auth';
import { USER_ROLES_PUBLIC, type UserRolePublic } from '@/lib/validators/auth';
import { HardHat, User, Mail, Phone, Lock, CheckCircle, ArrowRight, ArrowLeft, Shield, Building2, Briefcase } from 'lucide-react';

interface CriarContaPageProps {
  onSuccess?: (token: string, email: string) => void;
  onNavigateLogin?: () => void;
}

export default function CriarContaPage({
  onSuccess,
  onNavigateLogin,
}: CriarContaPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+244 ');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRolePublic>('PARTICULAR');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'error' } | null>(null);

  // Validação rápida do Passo 1 antes de avançar para o Passo 2
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('O nome deve ter pelo menos 3 caracteres.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor introduza um endereço de email válido.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Introduza um número de telemóvel válido de Angola (+244 9XX XXX XXX).');
      return;
    }
    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('A palavra-passe deve conter pelo menos uma letra maiúscula.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('A palavra-passe deve conter pelo menos um número.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await registerUser({
        name,
        email,
        phone,
        password,
        role,
      });

      if (!res.success) {
        setError(res.error || 'Erro ao criar conta.');
        setToast({ title: 'Erro de Registo', desc: res.error || 'Falha ao registar', type: 'error' });
        return;
      }

      setCreatedToken(res.data?.token || 'mock_token');
      setToast({
        title: 'Registo Concluído',
        desc: 'Verifique a sua caixa de correio para confirmar a conta.',
        type: 'success',
      });

      if (onSuccess && res.data?.token) {
        onSuccess(res.data.token, res.data.email);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar registo.';
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
          Criar Conta na Kizongelu
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Registo simplificado em 2 passos para orçamentação e mapas de obras
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="border-[#E2E8F0] shadow-card-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0F3D5C] uppercase tracking-wider">
                Passo {step} de 2: {step === 1 ? 'Dados Pessoais' : 'Perfil de Acesso'}
              </span>
              <Badge variant={step === 1 ? 'default' : 'cta'}>
                {step === 1 ? '50%' : '100%'}
              </Badge>
            </div>
            <Progress value={step === 1 ? 50 : 100} />
          </CardHeader>

          <CardContent>
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                <span className="font-semibold block">Erro no preenchimento:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Sucesso pós-registo */}
            {createdToken ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Conta Criada com Sucesso!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Enviámos um link de ativação para <strong>{email}</strong>. Para ambiente de teste, pode clicar diretamente no botão abaixo para ativar a sua conta:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left">
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1">Token de confirmação de email gerado:</span>
                  <code className="text-xs font-mono text-[#0F3D5C] break-all block">{createdToken}</code>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="cta"
                    className="flex-1 font-bold text-slate-900"
                    onClick={() => {
                      if (onSuccess) onSuccess(createdToken, email);
                    }}
                  >
                    Simular Ativação de Email
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onNavigateLogin}
                  >
                    Ir para Início de Sessão
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* PASSO 1: DADOS BÁSICOS */}
                {step === 1 && (
                  <form onSubmit={handleNextStep} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Nome Completo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </div>
                        <Input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ex: João Manuel"
                          className="pl-9 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Email Profissional ou Pessoal
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
                          placeholder="antonio.silva@empresa.co.ao"
                          className="pl-9 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Número de Telefone (+244 Angola)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <Input
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+244 9XX XXX XXX"
                          className="pl-9 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Palavra-passe
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
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Requisitos: Pelo menos 8 caracteres, 1 letra maiúscula e 1 dígito numérico.
                      </span>
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      className="w-full justify-center mt-2"
                    >
                      Avançar para Passo 2 (Tipo de Conta)
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </form>
                )}

                {/* PASSO 2: TIPO DE UTILIZADOR */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 mb-1">
                        Como pretende utilizar a Kizongelu?
                      </h4>
                      <p className="text-xs text-slate-500">
                        O seu perfil adapta os limites de orçamentos e as funcionalidades do painel.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Opção Particular */}
                      <div
                        onClick={() => setRole('PARTICULAR')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          role === 'PARTICULAR'
                            ? 'border-[#0F3D5C] bg-blue-50/40 ring-1 ring-[#0F3D5C]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-lg bg-blue-100/70 text-[#0F3D5C]">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">Dono de Obra / Particular</span>
                              <span className="text-[11px] text-slate-600 block">
                                Para quem quer construir a sua moradia e saber exatamente o custo dos materiais.
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline">12.999 Kz · 1 orçamento</Badge>
                        </div>
                      </div>

                      {/* Opção Profissional */}
                      <div
                        onClick={() => setRole('PROFESSIONAL')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          role === 'PROFESSIONAL'
                            ? 'border-[#0F3D5C] bg-blue-50/40 ring-1 ring-[#0F3D5C]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-lg bg-amber-100/70 text-[#D97706]">
                              <Briefcase className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">Engenheiro / Arquitecto / Técnico</span>
                              <span className="text-[11px] text-slate-600 block">
                                Orçamentos frequentes com exportação em PDF e Excel para apresentar a clientes.
                              </span>
                            </div>
                          </div>
                          <Badge variant="cta">15.999 Kz · 3 orçamentos</Badge>
                        </div>
                      </div>

                      {/* Opção Dono de Empresa */}
                      <div
                        onClick={() => setRole('COMPANY_OWNER')}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          role === 'COMPANY_OWNER'
                            ? 'border-[#0F3D5C] bg-blue-50/40 ring-1 ring-[#0F3D5C]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2.5">
                            <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">Construtora / Empreiteira</span>
                              <span className="text-[11px] text-slate-600 block">
                                Gestão multi-utilizador, controlo de NIF e orçamentos com marca própria.
                              </span>
                            </div>
                          </div>
                          <Badge variant="default">29.999 Kz · 6 orçamentos</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Voltar ao Passo 1
                      </Button>
                      <Button
                        type="button"
                        variant="cta"
                        onClick={handleFinalSubmit}
                        className="flex-1 font-bold text-slate-900"
                        disabled={loading}
                      >
                        {loading ? 'A criar conta...' : 'Concluir Registo'}
                        <CheckCircle className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>

          {!createdToken && (
            <CardFooter className="pt-2 border-t border-slate-100 flex items-center justify-center">
              <p className="text-xs text-slate-600">
                Já tem conta registada?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="font-bold text-[#0F3D5C] hover:underline cursor-pointer"
                >
                  Entrar
                </button>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
