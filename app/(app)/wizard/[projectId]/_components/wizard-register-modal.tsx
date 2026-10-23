/**
 * @file app/(app)/wizard/[projectId]/_components/wizard-register-modal.tsx
 * Modal de Conversão e Registo no Fim do Wizard (Opção A: zero fricção inicial).
 * 
 * Permite ao utilizador anónimo criar conta ou entrar com conta existente
 * imediatamente após a Etapa 7, associando o orçamento criado à sua conta
 * e avançando sem interrupção para o Preview / Paywall.
 */

import React, { useState } from 'react';
import { useAuth, UserRole } from '../../../../../src/auth/auth-context';
import { assignProjectToUser } from '../../../../../lib/actions/wizard';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  X,
  ShieldCheck,
  Building2,
  HardHat,
  Loader2,
} from 'lucide-react';

interface WizardRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  projectId: string;
}

export const WizardRegisterModal: React.FC<WizardRegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}) => {
  const { registerUser, login, usersList } = useAuth();
  const { data } = useWizardStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('particular');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Resumo amigável dos dados inseridos no Wizard
  const tipoObraLabel =
    data.step1?.type === 'NOVA'
      ? 'Construção Nova'
      : data.step1?.type === 'REABILITACAO'
      ? 'Reabilitação'
      : data.step1?.type === 'AMPLIACAO'
      ? 'Ampliação'
      : 'Obra Residencial';

  const localizacaoLabel = `${data.step2?.municipality || 'Talatona'}, ${data.step2?.province || 'Luanda'}`;
  const areaLabel = data.step3?.areaUnknown
    ? `~${(data.step3?.length || 15) * (data.step3?.width || 10)} m²`
    : `${data.step3?.area || 150} m²`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!nome.trim()) {
          setErrorMsg('Por favor introduza o seu nome completo.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMsg('Por favor introduza um email válido.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 4) {
          setErrorMsg('A palavra-passe deve ter pelo menos 4 caracteres.');
          setIsSubmitting(false);
          return;
        }

        // 1.3 Verificação de Email Duplicado: detecta conta existente e sugere login
        const existingAccount = usersList.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (existingAccount) {
          setErrorMsg(
            'Já existe uma conta associada a este email. Alternámos para o modo "Já tenho conta" para introduzir a sua palavra-passe e associar este orçamento.'
          );
          setMode('login');
          setIsSubmitting(false);
          return;
        }

        // Regista o novo utilizador no contexto activo
        const newUser = registerUser({
          nome: nome.trim(),
          email: email.trim(),
          role,
          telefone: telefone.trim(),
        });

        // Vincula o projeto temporário ao novo utilizador e sincroniza com o dashboard
        await assignProjectToUser(projectId, newUser.id);
      } else {
        // Modo Login
        if (!email.trim()) {
          setErrorMsg('Por favor introduza o seu email.');
          setIsSubmitting(false);
          return;
        }

        // Tenta encontrar o utilizador ou autenticar
        const matched = usersList.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase()
        );
        if (!matched) {
          setErrorMsg('Não encontramos nenhuma conta com este email. Verifique o endereço ou mude para a aba "Nova Conta Grátis".');
          setIsSubmitting(false);
          return;
        }

        const targetUserId = matched.id;
        login(targetUserId);

        // Vincula o projeto ao utilizador autenticado e sincroniza com o dashboard
        await assignProjectToUser(projectId, targetUserId);
      }

      // Conclui o cálculo e avança para o preview / paywall
      await onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer z-10"
          title="Fechar e voltar ao orçamento"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Modal */}
        <div className="p-5 sm:p-7 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 shrink-0">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Cálculo Pré-Validado</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {mode === 'register' ? 'Criar conta para ver o orçamento' : 'Entrar para ver o orçamento'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {mode === 'register'
              ? 'Guarde o cálculo da sua obra, aceda ao mapa de quantidades e desbloqueie o relatório técnico oficial.'
              : 'Inicie sessão na sua conta Kizongelu para associar e abrir este orçamento.'}
          </p>

          {/* Mini-Card Resumo do Orçamento Configurado */}
          <div className="mt-3.5 p-3 rounded-xl bg-slate-100/80 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate mr-2">
              <HardHat className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="truncate">
                <span className="font-bold text-slate-900 block truncate">{tipoObraLabel}</span>
                <span className="text-slate-500 block truncate">{localizacaoLabel}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-extrabold text-[#0F3D5C] block">{areaLabel}</span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end space-x-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
                7 Etapas Prontas
              </span>
            </div>
          </div>
        </div>

        {/* Alternador de Modo (Abas) */}
        <div className="px-5 sm:px-7 pt-3 pb-1 border-b border-slate-100 flex space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Nova Conta Grátis
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`pb-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Já tenho conta
          </button>
        </div>

        {/* Conteúdo com scroll seguro */}
        <div className="p-5 sm:p-7 pt-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Tipo de Perfil */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Perfil
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('particular')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        role === 'particular'
                          ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Proprietário Particular
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Construir moradia
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('profissional')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        role === 'profissional'
                          ? 'border-[#0F3D5C] bg-[#EFF6FF] text-[#0F3D5C]'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Técnico / Engenheiro
                      <span className="block text-[10px] font-normal text-slate-500 mt-0.5">
                        Orçamentos e fiscalização
                      </span>
                    </button>
                  </div>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Manuel Silva"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C] text-slate-900"
                    />
                  </div>
                </div>

                {/* Telemóvel / WhatsApp (Opcional) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Telemóvel / WhatsApp <span className="text-[10px] text-slate-400 font-normal">(opcional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="923 000 000"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C] text-slate-900"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="o.seu.email@exemplo.ao"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C] text-slate-900"
                />
              </div>
            </div>

            {/* Palavra-passe */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Palavra-passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C] text-slate-900"
                />
              </div>
            </div>

            {/* Botão de Submissão 56px */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[52px] sm:min-h-[56px] px-6 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-sm sm:text-base rounded-xl transition-all shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A preparar orçamento...</span>
                  </>
                ) : mode === 'register' ? (
                  <>
                    <span>Criar Conta e Ver Orçamento</span>
                    <ArrowRight className="w-5 h-5 text-slate-950" />
                  </>
                ) : (
                  <>
                    <span>Entrar e Ver Orçamento</span>
                    <ArrowRight className="w-5 h-5 text-slate-950" />
                  </>
                )}
              </button>
            </div>

            {/* Termos e Trust signal */}
            <div className="pt-2 text-center space-y-1.5">
              <p className="text-[11px] text-slate-500">
                Ao continuar, aceita os{' '}
                <a href="/termos" target="_blank" rel="noopener noreferrer" className="text-[#0F3D5C] underline font-medium">
                  Termos de Utilização
                </a>{' '}
                e a{' '}
                <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="text-[#0F3D5C] underline font-medium">
                  Política de Privacidade
                </a>.
              </p>
              <p className="text-[10px] text-slate-400 flex items-center justify-center space-x-1">
                <span>🔒 Ligação encriptada. Os seus dados são confidenciais.</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
