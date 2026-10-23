/**
 * @file app/(app)/wizard/[projectId]/page.tsx
 * Orquestrador Principal do Wizard de 7 Etapas do Kizongelu.
 * 
 * Integra:
 * - Header com Progresso horizontal e tempo restante estimado (~X min)
 * - Indicadores das 7 Etapas (StepIndicator)
 * - Auto-save debounced (1500ms) com Zustand
 * - Validação Zod com schemas por etapa
 * - Modal de Retoma de Rascunho recente (últimos 30 dias)
 * - Execução final do motor calculate() e persistência
 */

import React, { useEffect, useState } from 'react';
import { useWizardStore } from '../../../../lib/stores/wizard-store';
import { useAuth } from '../../../../src/auth/auth-context';
import { WizardHeader } from './_components/wizard-header';
import { WizardFooter } from './_components/wizard-footer';
import { StepIndicator } from './_components/step-indicator';
import { DraftResumeModal } from './_components/draft-resume-modal';
import { WizardRegisterModal } from './_components/wizard-register-modal';

// Componentes das 7 Etapas
import Step1TipoObra from './etapa-1/page';
import Step2Localizacao from './etapa-2/page';
import Step3Caracteristicas from './etapa-3/page';
import Step4Construtivas from './etapa-4/page';
import Step5Instalacoes from './etapa-5/page';
import Step6Orcamento from './etapa-6/page';
import Step7Documentos from './etapa-7/page';

interface WizardOrchestratorPageProps {
  projectId?: string;
  initialStep?: number;
  onExit?: () => void;
  onCalculationFinished?: (result: any) => void;
}

export const WizardOrchestratorPage: React.FC<WizardOrchestratorPageProps> = ({
  projectId: propProjectId,
  initialStep,
  onExit,
  onCalculationFinished,
}) => {
  const { isAuthenticated } = useAuth();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const {
    projectId,
    currentStep,
    initProject,
    checkForDraft,
    completeWizard,
    isSubmitting,
  } = useWizardStore();

  useEffect(() => {
    initProject(propProjectId).then(() => {
      if (initialStep && initialStep >= 1 && initialStep <= 7) {
        useWizardStore.setState({ currentStep: initialStep });
      }
      if (typeof window !== 'undefined') {
        const presetType = sessionStorage.getItem('kizongelu_preset_type');
        const presetStep = sessionStorage.getItem('kizongelu_preset_step');
        const presetProvince = sessionStorage.getItem('kizongelu_preset_province');
        if (presetType) {
          const mapped = presetType.toUpperCase();
          useWizardStore.getState().setStepData('step1', { type: mapped as any });
          if (presetStep) {
            const stepNum = parseInt(presetStep, 10);
            if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 7) {
              useWizardStore.setState({ currentStep: stepNum });
            }
          }
          sessionStorage.removeItem('kizongelu_preset_type');
          sessionStorage.removeItem('kizongelu_preset_step');
        }
        if (presetProvince) {
          useWizardStore.getState().setStepData('step2', { province: presetProvince });
          sessionStorage.removeItem('kizongelu_preset_province');
        }
      }
    });
    checkForDraft();
  }, [propProjectId, initialStep]);

  // Sincroniza a rota do navegador com a etapa actual
  useEffect(() => {
    const activePid = projectId || propProjectId;
    if (activePid && currentStep) {
      const targetPath = `/wizard/${activePid}/etapa-${currentStep}`;
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        try {
          window.history.replaceState({}, '', targetPath);
        } catch (e) {}
      }
    }
  }, [projectId, propProjectId, currentStep]);

  const executeCompletion = async () => {
    try {
      const res = await completeWizard();
      if (onCalculationFinished) {
        onCalculationFinished(res);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar cálculo');
    }
  };

  const handleComplete = async () => {
    if (!isAuthenticated) {
      // Opção A: no fim da Etapa 7, pede registo/criação de conta antes de prosseguir para o paywall
      setIsRegisterModalOpen(true);
      return;
    }
    // Utilizador já autenticado avança directamente
    await executeCompletion();
  };

  const renderActiveStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1TipoObra />;
      case 2:
        return <Step2Localizacao />;
      case 3:
        return <Step3Caracteristicas />;
      case 4:
        return <Step4Construtivas />;
      case 5:
        return <Step5Instalacoes />;
      case 6:
        return <Step6Orcamento />;
      case 7:
        return <Step7Documentos onComplete={handleComplete} />;
      default:
        return <Step1TipoObra />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter',sans-serif]">
      {/* Modal de Retoma de Rascunho */}
      <DraftResumeModal />

      {/* Modal de Registo no fim do Wizard (Opção A) */}
      <WizardRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={executeCompletion}
        projectId={projectId || propProjectId || ''}
      />

      {/* Header com Auto-Save e Progresso */}
      <WizardHeader onSaveAndExit={onExit} />

      {/* Indicador Visual das 7 Etapas */}
      <div className="bg-white border-b border-slate-200 py-2 shadow-2xs">
        <StepIndicator />
      </div>

      {/* Conteúdo Central da Etapa Ativa */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {renderActiveStep()}
      </main>

      {/* Rodapé Fixo com Botões 56px Mobile-First */}
      <WizardFooter onComplete={handleComplete} />
    </div>
  );
};

export default WizardOrchestratorPage;
