/**
 * @file src/components/onboarding/BemVindoPerfilPage.tsx
 * Página /bem-vindo/perfil:
 * - Confirmação do tipo de utilizador através de 3 cartões interativos:
 *   1. Dono de Obra / Particular
 *   2. Engenheiro / Arquitecto / Empreiteiro
 *   3. Empresa de Construção / Imobiliária
 */

import React, { useState } from 'react';
import {
  User,
  HardHat,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/src/types/domain';

interface BemVindoPerfilPageProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export const BemVindoPerfilPage: React.FC<BemVindoPerfilPageProps> = ({
  currentRole,
  onSelectRole,
  onBack,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    if (currentRole === 'empresa' || currentRole === 'empresa_plus') return 'empresa';
    if (currentRole === 'profissional') return 'profissional';
    return 'particular';
  });

  const cards = [
    {
      id: 'particular' as UserRole,
      title: 'Dono de Obra / Particular',
      badge: 'Construção Própria',
      description: 'Ideal para quem vai construir a sua casa ou moradia e quer evitar sobrecustos e desvios de materiais.',
      icon: User,
      bullets: [
        'Orçamento pago por projecto avulso',
        'Controlo simples de compras e armaduras',
        'Dossier completo em PDF profissional com validação QR',
      ],
      color: 'blue',
    },
    {
      id: 'profissional' as UserRole,
      title: 'Engenheiro / Empreiteiro',
      badge: 'Orçamentação Profissional',
      description: 'Para peritos, fiscais e construtores civis independentes que precisam de mapas de medições rápidos.',
      icon: HardHat,
      bullets: [
        '5 orçamentos mensais com CPU analítico',
        'Personalização com logotipo e assinatura',
        'Ajuste fino de margens e BDI',
      ],
      color: 'amber',
    },
    {
      id: 'empresa' as UserRole,
      title: 'Empresa / Imobiliária',
      badge: 'Equipa & Multi-Obras',
      description: 'Para construtoras, gabinetes de projectos e promotores imobiliários com gestão colaborativa.',
      icon: Building2,
      bullets: [
        'Múltiplos utilizadores e permissões de equipa',
        'Até 15 ou 30 orçamentos/mês',
        'Faturação pro-forma com retenção AGT',
      ],
      color: 'emerald',
    },
  ];

  const handleContinue = () => {
    onSelectRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Passo 2 de 3 &bull; Personalização de Perfil
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Como planeia utilizar o Kizongelu?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Adaptamos a experiência, fórmulas de BDI e relatórios ao seu perfil técnico.
            </p>
          </div>

          <button
            onClick={onBack}
            className="self-start sm:self-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* 3 Cartões de Seleção */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card) => {
            const isSelected = selectedRole === card.id;
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedRole(card.id)}
                className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left space-y-4 ${
                  isSelected
                    ? 'border-[#0F3D5C] bg-[#EFF6FF]/60 shadow-lg shadow-blue-900/5 ring-2 ring-[#0F3D5C]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[#0F3D5C]">
                    <CheckCircle2 className="w-5 h-5 fill-current text-white bg-[#0F3D5C] rounded-full" />
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isSelected
                          ? 'bg-[#0F3D5C] text-white shadow-md'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                  {card.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-600">
                      <span className="text-emerald-600 font-bold shrink-0 mt-0.5">&bull;</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Conclusão */}
        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] active:bg-slate-950 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Prosseguir</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
