/**
 * @file src/components/admin/AdminCertificacaoPage.tsx
 * Painel Administrativo de Responsabilidade Técnica do Motor (/admin/motor/certificacao) — Fase 17.
 * Configura o selo de engenharia, credenciais profissionais e termo de responsabilidade no PDF profissional.
 */

import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Save,
  CheckCircle2,
  FileCheck2,
  Lock,
  Calendar,
  Building,
  UserCheck,
  Eye,
  Info,
  QrCode,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AdminDataService,
  EngineCertificationConfig,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { CURRENT_ENGINE_VERSION } from '@/lib/calculation-engine/explain';

export const AdminCertificacaoPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [config, setConfig] = useState<EngineCertificationConfig>(() =>
    AdminDataService.getCertificationConfig()
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    try {
      AdminDataService.saveCertificationConfig(config, currentUser.nome, currentUser.email);
      success(
        'Responsabilidade Técnica Actualizada!',
        'As credenciais do engenheiro e o selo profissional foram guardados com sucesso para todos os PDFs.'
      );
    } catch {
      toastError('Erro ao Guardar', 'Não foi possível gravar os dados de responsabilidade técnica.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Topo com Título e Ação Salvar */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Responsabilidade Técnica do Motor</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              Motor {CURRENT_ENGINE_VERSION}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Parametrização da cédula profissional do engenheiro responsável e termo de responsabilidade no PDF profissional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{isPreviewOpen ? 'Ocultar Pré-visualização' : 'Pré-visualizar Selo'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'A Gravar...' : 'Guardar Alterações'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Formulário de Configuração */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Toggle Master de Inclusão no PDF */}
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Incluir Termo de Responsabilidade Técnica nos PDFs de Orçamento</span>
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Quando activo, a capa e a folha final de todos os orçamentos emitidos incluirão o selo profissional, o nome do engenheiro orçamentista e o número de cédula sob responsabilidade técnica.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={config.includeInPdf}
                  onChange={(e) => setConfig({ ...config, includeInPdf: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Card: Dados do Engenheiro e Ordem */}
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md space-y-4">
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-700 text-white font-bold text-sm">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>Dados do Engenheiro Orçamentista Responsável</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nome Completo do Engenheiro
                </label>
                <input
                  type="text"
                  value={config.engineerName}
                  onChange={(e) => setConfig({ ...config, engineerName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Eng. Arnaldo Silva"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Cédula Profissional
                </label>
                <input
                  type="text"
                  value={config.cedulaOEA}
                  onChange={(e) => setConfig({ ...config, cedulaOEA: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: N.º 4128/AO"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Especialidade / Título Profissional
                </label>
                <input
                  type="text"
                  value={config.specialty}
                  onChange={(e) => setConfig({ ...config, specialty: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Engenharia Civil & Estruturas de Betão Armado"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Organismo Emissor
                </label>
                <input
                  type="text"
                  value={config.organization}
                  onChange={(e) => setConfig({ ...config, organization: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Ordem dos Engenheiros de Angola"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Data de Emissão do Registo
                </label>
                <input
                  type="date"
                  value={config.issuedAt}
                  onChange={(e) => setConfig({ ...config, issuedAt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Data de Validade
                </label>
                <input
                  type="date"
                  value={config.expiresAt}
                  onChange={(e) => setConfig({ ...config, expiresAt: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 text-xs">
              <label className="block text-slate-300 font-semibold mb-1">
                Termo de Responsabilidade Técnica & Normas Aplicáveis
              </label>
              <textarea
                rows={3}
                value={config.notes}
                onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
                placeholder="Disposições normativas e responsabilidade..."
              />
            </div>
          </div>
        </div>

        {/* Coluna 3: Pré-visualização do Selo */}
        <div className="space-y-4">
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-md space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Pré-visualização do Selo no Documento
            </span>

            {/* Simulação do Selo Oficial */}
            <div className="p-5 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-amber-400 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0F3D5C] text-amber-400 flex items-center justify-center font-black text-xs">
                    ENG
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-[#0F3D5C] uppercase block">
                      República de Angola
                    </span>
                    <strong className="text-xs text-slate-900 block leading-tight">
                      Responsabilidade Técnica
                    </strong>
                  </div>
                </div>

                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  VÁLIDO
                </span>
              </div>

              <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-500">Engenheiro Responsável:</div>
                <div className="font-extrabold text-slate-900 text-sm">{config.engineerName}</div>
                <div className="font-mono text-xs text-amber-700 font-bold">{config.cedulaOEA}</div>
                <div className="text-[10px] text-slate-500">{config.specialty}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Emissor:</span>
                  <strong className="text-slate-800">{config.organization}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Validade:</span>
                  <strong className="text-slate-800">{config.expiresAt}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Motor:</span>
                  <strong className="text-slate-800">{CURRENT_ENGINE_VERSION}</strong>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-400 break-all border-t border-slate-100 pt-2">
                {config.digitalSignatureHash}
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                Este selo é incorporado na secção de assinatura e no rodapé do relatório oficial em PDF, sob responsabilidade do engenheiro orçamentista para validação técnica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCertificacaoPage;
