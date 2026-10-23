/**
 * @file app/(protected)/painel/page.tsx
 * Página protegida do Painel de Controlo da Kizongelu .
 * Exibe saudação "Bom dia, [Nome]", botão de terminar sessão e aviso de construção.
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardHat, LogOut, Construction, ShieldCheck, Clock, Layers } from 'lucide-react';

interface PainelPageProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout?: () => void;
  onNavigateBudgets?: () => void;
}

export default function PainelPage({
  user = {
    id: 'user-demo-1',
    name: 'António Silva',
    email: 'antonio.silva@empresa.co.ao',
    role: 'PARTICULAR',
  },
  onLogout,
  onNavigateBudgets,
}: PainelPageProps) {
  // Determina saudação com base na hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 19) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter',sans-serif]">
      {/* Barra de Topo do Painel */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center">
              <HardHat className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <span className="font-extrabold text-[#0F3D5C] text-base leading-none block">
                Kizongelu
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mt-0.5">
                Painel do Utilizador
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800">{user.name}</span>
              <span className="text-[11px] text-slate-500">{user.email}</span>
            </div>
            <Badge variant="default">{user.role}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-xs flex items-center space-x-1.5 text-slate-700 hover:text-red-600 hover:border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Terminar sessão</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Painel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Card de Boas-Vindas */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-card-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sessão Autenticada e Protegida por RBAC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D5C] tracking-tight">
              {getGreeting()}, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Acesso validado com permissão <span className="font-semibold text-slate-700">[{user.role}]</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateBudgets && (
              <Button
                variant="cta"
                onClick={onNavigateBudgets}
                className="font-bold text-slate-900 flex-1 sm:flex-initial"
              >
                <Layers className="w-4 h-4 mr-2" />
                Aceder ao Motor de Orçamentos
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onLogout}
              className="flex-1 sm:flex-initial"
            >
              <LogOut className="w-4 h-4 mr-1.5 text-slate-500" />
              Terminar sessão
            </Button>
          </div>
        </div>

        {/* Mensagem Obrigatória: Dashboard em construção */}
        <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
              <Construction className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg text-slate-800">Dashboard em construção.</CardTitle>
            <CardDescription className="text-xs max-w-md mx-auto">
              As métricas consolidadas, histórico de obras e gráficos da serão disponibilizados aqui após a conclusão da Base de Preços .
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2 pb-6">
            <div className="inline-flex items-center space-x-2 text-[11px] text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-[#0F3D5C]" />
              <span>Sessão ativa com validade de 30 dias (renovação de sessão segura)</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
