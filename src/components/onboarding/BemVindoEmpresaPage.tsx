/**
 * @file src/components/onboarding/BemVindoEmpresaPage.tsx
 * Página /bem-vindo/empresa:
 * - 3 passos sequenciais:
 *   1. Nome e NIF da empresa
 *   2. Convidar equipa técnica
 *   3. Escolha do pacote empresarial (Empresa vs Empresa Plus)
 */

import React, { useState } from 'react';
import {
  Building2,
  Users,
  Crown,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/src/context/ToastContext';

interface BemVindoEmpresaPageProps {
  onComplete: (empresaData: { nome: string; nif: string; emails: string[]; plano: string }) => void;
  onBack: () => void;
}

export const BemVindoEmpresaPage: React.FC<BemVindoEmpresaPageProps> = ({
  onComplete,
  onBack,
}) => {
  const { success, warning } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Passo 1: Dados da Empresa
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaNif, setEmpresaNif] = useState('');

  // Passo 2: Convidar Equipa
  const [inviteEmail, setInviteEmail] = useState('');
  const [teamEmails, setTeamEmails] = useState<string[]>([]);

  // Passo 3: Escolha do Plano
  const [selectedPlan, setSelectedPlan] = useState<'empresa' | 'empresa_plus'>('empresa');

  const handleAddEmail = () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      warning('Introduza um endereço de email válido.');
      return;
    }
    if (teamEmails.includes(inviteEmail)) {
      warning('Este email já se encontra na lista.');
      return;
    }
    setTeamEmails([...teamEmails, inviteEmail]);
    setInviteEmail('');
  };

  const handleRemoveEmail = (target: string) => {
    setTeamEmails(teamEmails.filter((e) => e !== target));
  };

  const handleNextStep1 = () => {
    if (!empresaNome.trim()) {
      warning('Por favor indique o nome comercial da sua empresa.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setStep(3);
  };

  const handleFinish = () => {
    onComplete({
      nome: empresaNome,
      nif: empresaNif,
      emails: teamEmails,
      plano: selectedPlan,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
              Configuração Empresarial &bull; Passo {step} de 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {step === 1 && 'Identificação da Empresa'}
              {step === 2 && 'Convidar Equipa Técnica'}
              {step === 3 && 'Seleção de Pacote & Limite de Orçamentos'}
            </h2>
          </div>

          <button
            onClick={() => {
              if (step > 1) setStep((prev) => (prev - 1) as any);
              else onBack();
            }}
            className="self-start sm:self-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* PASSO 1: DADOS DA EMPRESA */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome da Empresa / Gabinete de Engenharia *
              </label>
              <input
                type="text"
                value={empresaNome}
                onChange={(e) => setEmpresaNome(e.target.value)}
                placeholder="Ex.: Imobiliária Kilamba Sul Lda."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NIF (Número de Identificação Fiscal em Angola)
              </label>
              <input
                type="text"
                value={empresaNif}
                onChange={(e) => setEmpresaNif(e.target.value)}
                placeholder="Ex.: 5412098450"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Utilizado para emissão automática de faturas pró-forma com retenção de fonte.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextStep1}
                className="px-6 py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white text-xs sm:text-sm font-extrabold rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Próximo: Equipa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 2: CONVIDAR EQUIPA */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Adicione os endereços de correio dos arquitectos, orçamentistas ou fiscais que terão acesso ao painel da sua empresa.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                  placeholder="colega@suaempresa.ao"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEmail}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {teamEmails.length > 0 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  Convites a emitir ({teamEmails.length}):
                </span>
                <div className="divide-y divide-slate-100 bg-slate-50 rounded-2xl border border-slate-200 p-2">
                  {teamEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between p-2 text-xs">
                      <span className="font-semibold text-slate-800">{email}</span>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Ainda não adicionou membros. Pode avançar e convidar mais tarde nas Definições de Equipa.
              </div>
            )}

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={handleNextStep2}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Convidar mais tarde &rarr;
              </button>

              <button
                onClick={handleNextStep2}
                className="px-6 py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white text-xs sm:text-sm font-extrabold rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Próximo: Escolher Pacote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: PACOTE */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setSelectedPlan('empresa')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                  selectedPlan === 'empresa'
                    ? 'border-[#0F3D5C] bg-[#EFF6FF]/60 shadow-md ring-2 ring-[#0F3D5C]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">Empresa</span>
                  <span className="text-xs font-bold text-[#0F3D5C]">29.999 Kz</span>
                </div>
                <p className="text-xs text-slate-600">
                  Ideal para pequenas construtoras, empreiteiros e gabinetes técnicos.
                </p>
                <div className="text-[11px] text-emerald-700 font-semibold space-y-1">
                  <div>&bull; 6 orçamentos completos</div>
                  <div>&bull; Até 2 utilizadores</div>
                  <div>&bull; Exportação em Excel e PDF com logótipo</div>
                </div>
              </div>

              <div
                onClick={() => setSelectedPlan('empresa_plus')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
                  selectedPlan === 'empresa_plus'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>Empresa Plus</span>
                  </span>
                  <span className="text-xs font-bold text-amber-700">49.999 Kz</span>
                </div>
                <p className="text-xs text-slate-600">
                  Para médias e grandes construtoras com múltiplos projectos em simultâneo.
                </p>
                <div className="text-[11px] text-amber-900 font-semibold space-y-1">
                  <div>&bull; 12 orçamentos completos</div>
                  <div>&bull; Até 5 utilizadores</div>
                  <div>&bull; Gestor com engenheiro dedicado</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleFinish}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Concluir e Aceder ao Painel</span>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
