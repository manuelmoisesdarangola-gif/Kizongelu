/**
 * @file lib/stores/wizard-store.ts
 * Store Zustand para gestão do estado reativo do Wizard de 7 etapas .
 * 
 * Funcionalidades:
 * - Gestão reativa dos dados de cada etapa (1 a 7)
 * - Auto-save com debounce de 1500ms persistindo em BD / LocalStorage
 * - Navegação segura com validação prévia Zod
 * - Cálculo do tempo restante estimado (~1 minuto por etapa restante)
 * - Retoma de rascunhos recentes
 */

import { create } from 'zustand';
import {
  FullWizardData,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  Step6Data,
  Step7Data,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from '../validators/wizard';
import {
  saveWizardStep,
  getProjectDraft,
  createProject,
  finalizeWizardCalculation,
  findRecentDraft,
  cleanupExpiredDrafts,
  WizardProjectState,
} from '../actions/wizard';

export interface WizardStoreState {
  projectId: string | null;
  currentStep: number;
  totalSteps: number;
  isSaving: boolean;
  lastSavedAt: string | null;
  isSubmitting: boolean;
  validationErrors: Record<string, string>;

  // Dados das 7 etapas
  data: FullWizardData;

  // Estado de retoma de rascunho
  pendingDraft: WizardProjectState | null;
  isResumeModalOpen: boolean;

  // Ações
  initProject: (projectId?: string) => Promise<string>;
  checkForDraft: () => Promise<void>;
  resumeDraft: () => void;
  dismissDraftAndCreateNew: () => Promise<string>;
  setStepData: <K extends keyof FullWizardData>(stepKey: K, stepData: Partial<FullWizardData[K]>) => void;
  updateStepData: <K extends keyof FullWizardData>(stepKey: K, stepData: Partial<FullWizardData[K]>) => void;
  goToStep: (stepNumber: number) => boolean;
  nextStep: () => boolean;
  handleNextStep: () => boolean;
  prevStep: () => void;
  validateCurrentStep: () => boolean;
  triggerAutoSave: () => void;
  completeWizard: () => Promise<{ previewUrl: string; calculation: any }>;
  reset: () => void;
}

const DEFAULT_WIZARD_DATA: FullWizardData = {
  step1: {
    type: '' as any,
    workType: '' as any,
    title: '',
  },
  step2: {
    province: '',
    municipality: '',
    address: '',
  },
  step3: {
    areaUnknown: false,
    area: 200,
    length: 20,
    width: 10,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: false,
    hasBalcony: false,
    hasAnnex: false,
  },
  step4: {
    foundation: 'sapata_corrida',
    structure: 'betao_armado',
    roof: 'chapa',
    finishLevel: 'medio',
  },
  step5: {
    flooring: 'ceramica_padrao',
    walls: 'tinta_plastica',
    electrical: 'intermedia',
    plumbing: 'intermedia',
    joinery: 'aluminio_standard',
  },
  step6: {
    targetBudget: '10M_20M',
  },
  step7: {
    documents: [],
    skipDocuments: false,
  },
};

// Variável para controle de debounce de 1500ms
let debounceTimer: any = null;

export const useWizardStore = create<WizardStoreState>((set, get) => ({
  projectId: null,
  currentStep: 1,
  totalSteps: 7,
  isSaving: false,
  lastSavedAt: null,
  isSubmitting: false,
  validationErrors: {},
  data: DEFAULT_WIZARD_DATA,
  pendingDraft: null,
  isResumeModalOpen: false,

  initProject: async (targetProjectId?: string) => {
    if (targetProjectId) {
      const existing = await getProjectDraft(targetProjectId);
      if (existing) {
        set({
          projectId: existing.id,
          currentStep: existing.currentStep || 1,
          data: {
            ...DEFAULT_WIZARD_DATA,
            ...(existing.data || {}),
          },
          lastSavedAt: existing.updatedAt,
        });
        return existing.id;
      }
    }

    // Cria novo projeto limpo
    const newProj = await createProject(DEFAULT_WIZARD_DATA, 'usr_guest', targetProjectId);
    set({
      projectId: newProj.id,
      currentStep: 1,
      data: DEFAULT_WIZARD_DATA,
      lastSavedAt: newProj.updatedAt,
      validationErrors: {},
    });
    return newProj.id;
  },

  checkForDraft: async () => {
    cleanupExpiredDrafts();
    const draft = await findRecentDraft();
    if (draft && draft.id !== get().projectId) {
      set({
        pendingDraft: draft,
        isResumeModalOpen: true,
      });
    }
  },

  resumeDraft: () => {
    const draft = get().pendingDraft;
    if (draft) {
      set({
        projectId: draft.id,
        currentStep: draft.currentStep || 1,
        data: {
          ...DEFAULT_WIZARD_DATA,
          ...(draft.data || {}),
        },
        isResumeModalOpen: false,
        pendingDraft: null,
      });
    }
  },

  dismissDraftAndCreateNew: async () => {
    set({ isResumeModalOpen: false, pendingDraft: null });
    const newProj = await createProject(DEFAULT_WIZARD_DATA);
    set({
      projectId: newProj.id,
      currentStep: 1,
      data: DEFAULT_WIZARD_DATA,
      lastSavedAt: newProj.updatedAt,
    });
    return newProj.id;
  },

  setStepData: (stepKey, stepData) => {
    set((state) => {
      const mergedStepData = {
        ...state.data[stepKey],
        ...stepData,
      };

      // Se for a Etapa 1, sincroniza 'type' e 'workType' de forma bidirecional
      if (stepKey === 'step1') {
        const raw = mergedStepData as any;
        if (raw.type && !raw.workType) raw.workType = raw.type;
        if (raw.workType && !raw.type) raw.type = raw.workType;
      }

      return {
        data: {
          ...state.data,
          [stepKey]: mergedStepData,
        },
        validationErrors: {},
      };
    });

    get().triggerAutoSave();
  },

  updateStepData: (stepKey, stepData) => {
    get().setStepData(stepKey, stepData);
  },

  triggerAutoSave: () => {
    const { projectId, currentStep, data } = get();
    if (!projectId) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    set({ isSaving: true });

    debounceTimer = setTimeout(async () => {
      const stepKey = `step${currentStep}` as keyof FullWizardData;
      const currentStepData = data[stepKey];
      try {
        const res = await saveWizardStep(projectId, currentStep, currentStepData);
        set({ isSaving: false, lastSavedAt: res.updatedAt });
      } catch (err) {
        console.error('Erro no auto-save do wizard:', err);
        set({ isSaving: false });
      }
    }, 1500); // 1.5s debounce exigido
  },

  validateCurrentStep: () => {
    const { currentStep, data } = get();
    let result: any;
    const errors: Record<string, string> = {};

    switch (currentStep) {
      case 1: {
        const step1Data = {
          ...data.step1,
          type: data.step1?.type || (data.step1 as any)?.workType,
          workType: (data.step1 as any)?.workType || data.step1?.type,
          title: data.step1?.title?.trim() || '',
        };
        result = step1Schema.safeParse(step1Data);
        if (result.success) {
          set((state) => ({
            data: {
              ...state.data,
              step1: result.data,
            },
          }));
        }
        break;
      }
      case 2: {
        const step2Data = {
          province: data.step2?.province?.trim() || '',
          municipality: data.step2?.municipality?.trim() || '',
          address: data.step2?.address?.trim() || '',
        };
        result = step2Schema.safeParse(step2Data);
        if (result.success) {
          set((state) => ({
            data: {
              ...state.data,
              step2: result.data,
            },
          }));
        }
        break;
      }
      case 3:
        result = step3Schema.safeParse(data.step3);
        break;
      case 4:
        result = step4Schema.safeParse(data.step4);
        break;
      case 5:
        result = step5Schema.safeParse(data.step5);
        break;
      case 6:
        result = step6Schema.safeParse(data.step6);
        break;
      case 7:
        result = step7Schema.safeParse(data.step7);
        break;
      default:
        return true;
    }

    if (!result.success) {
      result.error.issues.forEach((issue: any) => {
        const key = issue.path.join('.') || 'root';
        errors[key] = issue.message;
        errors[`step${currentStep}.${key}`] = issue.message;
      });
      console.warn(`[WizardStore] Erro de validação na Etapa ${currentStep}:`, errors);
      set({ validationErrors: errors });
      return false;
    }

    set({ validationErrors: {} });
    return true;
  },

  goToStep: (stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > get().totalSteps) return false;
    // Se avançar, valida o passo atual
    if (stepNumber > get().currentStep && !get().validateCurrentStep()) {
      return false;
    }

    set({ currentStep: stepNumber, validationErrors: {} });
    get().triggerAutoSave();
    return true;
  },

  handleNextStep: () => {
    return get().nextStep();
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get();
    if (!get().validateCurrentStep()) {
      return false;
    }

    if (currentStep < totalSteps) {
      set({ currentStep: currentStep + 1, validationErrors: {} });
      get().triggerAutoSave();
      return true;
    }

    return true;
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1, validationErrors: {} });
    }
  },

  completeWizard: async () => {
    const { projectId, data } = get();
    if (!projectId) throw new Error('Projeto não inicializado.');

    if (!get().validateCurrentStep()) {
      throw new Error('Por favor corrija os erros antes de concluir o cálculo.');
    }

    set({ isSubmitting: true });

    try {
      const result = await finalizeWizardCalculation(projectId, data);
      set({ isSubmitting: false });
      return result;
    } catch (err: any) {
      set({ isSubmitting: false });
      throw err;
    }
  },

  reset: () => {
    set({
      projectId: null,
      currentStep: 1,
      isSaving: false,
      lastSavedAt: null,
      isSubmitting: false,
      validationErrors: {},
      data: DEFAULT_WIZARD_DATA,
      pendingDraft: null,
      isResumeModalOpen: false,
    });
  },
}));
