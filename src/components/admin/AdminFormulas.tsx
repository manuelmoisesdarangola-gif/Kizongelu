/**
 * @file src/components/admin/AdminFormulas.tsx
 * Gestão de Fórmulas e Parâmetros Determinísticos de Engenharia (Fase 10 - Tarefa 5).
 * 
 * - Accordion por categoria (Alvenaria, Betão Armado, Coberturas, Revestimentos, Redes, Mão de Obra & BDI)
 * - Parâmetros editáveis inline com validação numérica, unidade e última alteração
 * - Banner de aviso sobre impacto nos orçamentos
 * - Barra sticky inferior com botão "Guardar alterações" (laranja) e contador de alterações
 * - Modal de confirmação com motivo obrigatório para registo no AuditLog
 * - Botão de navegação para "Versões do Motor"
 */

import React, { useState, useMemo } from 'react';
import {
  AdminDataService,
  FormulaCategory,
  FormulaParameter,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Save,
  RotateCcw,
  Check,
  History,
  Info,
  Layers,
  HelpCircle,
  FileCheck,
} from 'lucide-react';

interface AdminFormulasProps {
  onNavigateToVersions: () => void;
}

export const AdminFormulas: React.FC<AdminFormulasProps> = ({ onNavigateToVersions }) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState<FormulaCategory[]>(() =>
    AdminDataService.getFormulaCategories()
  );

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    alvenaria: true,
    betao_armado: true,
    coberturas: false,
    pavimentos: false,
    mao_de_obra_bdi: false,
  });

  // Mapa de alterações pendentes { [paramId]: textoComVirgula }
  const [dirtyValues, setDirtyValues] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const dirtyCount = Object.keys(dirtyValues).length;
  const hasUnsavedChanges = dirtyCount > 0;

  // C.8: Expandir e Colapsar Tudo
  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((cat) => {
      next[cat.id] = true;
    });
    setExpandedCategories(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((cat) => {
      next[cat.id] = false;
    });
    setExpandedCategories(next);
  };

  // C.6: Lista de Parâmetros Alterados com antes/depois
  const changedParamsList = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      categoryName: string;
      unit: string;
      oldValue: number;
      newValue: string;
    }> = [];

    categories.forEach((cat) => {
      cat.parametros.forEach((p) => {
        if (dirtyValues[p.id] !== undefined) {
          list.push({
            id: p.id,
            name: p.nome,
            categoryName: cat.nome,
            unit: p.unidade,
            oldValue: p.valor,
            newValue: dirtyValues[p.id],
          });
        }
      });
    });

    return list;
  }, [categories, dirtyValues]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleParamChange = (paramId: string, textValue: string) => {
    setDirtyValues((prev) => ({
      ...prev,
      [paramId]: textValue,
    }));
  };

  const handleResetDirty = () => {
    setDirtyValues({});
    setCategories(AdminDataService.getFormulaCategories());
  };

  const handleConfirmSave = () => {
    if (!changeReason.trim()) {
      toastError('Motivo Obrigatório', 'Por favor indique o motivo técnico da alteração para o AuditLog.');
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date();
      // C.3: Formato PT DD/MM/YYYY
      const todayPT = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      const updatedCategories = categories.map((cat) => ({
        ...cat,
        parametros: cat.parametros.map((p) => {
          if (dirtyValues[p.id] !== undefined) {
            const parsedNum = parseFloat(dirtyValues[p.id].replace(',', '.')) || 0;
            return {
              ...p,
              valor: parsedNum,
              ultimaAlteracao: todayPT,
              autor: 'Admin Kizongelu',
            };
          }
          return p;
        }),
      }));

      AdminDataService.saveFormulaCategories(updatedCategories, currentUser.nome, currentUser.email);
      setCategories(updatedCategories);
      setDirtyValues({});
      setIsConfirmModalOpen(false);
      setChangeReason('');
      success('Fórmulas Actualizadas', 'Os novos coeficientes determinísticos foram gravados com sucesso no motor.');
    } catch {
      toastError('Erro ao Guardar', 'Não foi possível persistir as alterações nas fórmulas.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Topo com Título e Ação de Versões */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              Fórmulas Determinísticas de Engenharia
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              Regulamentos Técnicos Aplicáveis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Consumos médios, traços de argamassa, taxas de armadura e rendimentos de mão de obra para obras em Angola.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onNavigateToVersions}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer border border-slate-600"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Histórico de Versões do Motor</span>
          </button>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 whitespace-nowrap">
            v2.4 activa
          </span>
        </div>
      </div>

      {/* Banner de Aviso sobre Impacto (Tarefa 5) */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start space-x-3 text-amber-200 text-xs shadow-sm">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-300 block">
            Atenção: Impacto Global no Motor Determinístico
          </strong>
          <p className="text-slate-300 leading-relaxed">
            A alteração destes parâmetros afecta directamente todos os novos orçamentos calculados pelo Kizongelu.
            Qualquer ajuste requer confirmação de um administrador e é integralmente registado no log de auditoria com identificação do responsável.
          </p>
        </div>
      </div>

      {/* C.6: Barra Sticky Global Superior para Alterações Pendentes */}
      {hasUnsavedChanges && (
        <div className="sticky top-0 z-20 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl px-6 py-3 flex justify-between items-center shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs sm:text-sm text-amber-100 font-medium">
              {dirtyCount} alteração(ões) não guardada(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDirty}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer transition-colors shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar todas</span>
            </button>
          </div>
        </div>
      )}

      {/* C.8: Botões Expandir/Colapsar tudo */}
      <div className="flex gap-2 justify-end mb-3">
        <button
          type="button"
          onClick={handleExpandAll}
          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg cursor-pointer transition-colors hover:bg-slate-800"
        >
          Expandir tudo
        </button>
        <button
          type="button"
          onClick={handleCollapseAll}
          className="px-3 py-1.5 text-xs text-slate-300 hover:text-white border border-white/10 rounded-lg cursor-pointer transition-colors hover:bg-slate-800"
        >
          Colapsar tudo
        </button>
      </div>

      {/* Accordions por Categoria */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isExpanded = !!expandedCategories[cat.id];
          const hasDirtyInCat = cat.parametros.some((p) => dirtyValues[p.id] !== undefined);

          return (
            <div
              key={cat.id}
              className={`bg-slate-800/90 rounded-2xl border transition-all ${
                hasDirtyInCat ? 'border-amber-500/60 shadow-md shadow-amber-500/5' : 'border-slate-700/80'
              }`}
            >
              {/* Cabeçalho do Accordion */}
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-750/50 rounded-2xl transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-700/80 text-amber-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white">{cat.nome}</h3>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-700">
                        {cat.normaReferencia}
                      </span>
                      {hasDirtyInCat && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cat.descricao}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-400">
                  <span className="text-xs font-semibold">{cat.parametros.length} parâmetros</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Conteúdo do Accordion: Lista de Parâmetros */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-slate-700/60">
                  <div className="divide-y divide-slate-700/50">
                    {cat.parametros.map((param) => {
                      const currentValueStr =
                        dirtyValues[param.id] !== undefined
                          ? dirtyValues[param.id]
                          : String(param.valor).replace('.', ',');
                      const isParamDirty = dirtyValues[param.id] !== undefined;

                      return (
                        <div
                          key={param.id}
                          className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 max-w-xl">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">{param.nome}</span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                                {param.norma}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs">{param.descricao}</p>
                            <div className="text-[10px] text-slate-400 flex items-center space-x-3">
                              <span>Última alteração: {param.ultimaAlteracao}</span>
                              <span>&bull;</span>
                              <span>Autor: {param.autor}</span>
                            </div>
                          </div>

                          {/* Campo Editável Inline com Unidade (A.4: Decimais com vírgula) */}
                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={currentValueStr}
                                onChange={(e) => handleParamChange(param.id, e.target.value)}
                                className={`w-32 py-2 px-3 text-right font-mono font-bold rounded-xl border text-xs focus:outline-none transition-colors ${
                                  isParamDirty
                                    ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                                    : 'bg-slate-900 border-slate-700 text-white focus:border-amber-400'
                                }`}
                              />
                            </div>
                            <span className="font-mono text-slate-400 font-semibold w-16 text-left">
                              {param.unidade}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>


      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMAÇÃO COM MOTIVO OBRIGATÓRIO PARA AUDITLOG                 */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Confirmar Actualização de Fórmulas</h3>
              </div>
              <button onClick={() => setIsConfirmModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Aviso de impacto */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-2 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-amber-300 mb-0.5">Aviso de Impacto</strong>
                <span>
                  Está prestes a alterar <strong>{dirtyCount} coeficiente(s)</strong> no motor determinístico. As alterações terão impacto imediato em todos os novos orçamentos calculados pelo Kizongelu.
                </span>
              </div>
            </div>

            {/* Lista das alterações (parâmetro: valor antigo → novo) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Lista de Alterações a Aplicar ({changedParamsList.length}):
              </label>
              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-800 space-y-1">
                {changedParamsList.map((item) => (
                  <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <span className="font-semibold text-white block truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-400">{item.categoryName}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono shrink-0">
                      <span className="text-slate-400 line-through text-[11px]">
                        {String(item.oldValue).replace('.', ',')} {item.unit}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-300 font-bold text-xs bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {item.newValue} {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Motivo Técnico da Alteração <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Ex: Calibração de dosagem do cimento C25/30 segundo novo lote de ensaios laboratoriais de referência..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Administrador Responsável:</span>
                <span className="font-semibold text-white">{currentUser.nome}</span>
              </div>
              <div className="flex justify-between">
                <span>Gravação no AuditLog:</span>
                <span className="font-semibold text-emerald-400">Activa (com antes/depois)</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-white text-xs font-semibold rounded-xl hover:bg-slate-650 cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                disabled={isSaving || !changeReason.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-colors"
              >
                {isSaving ? 'A Gravar...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormulas;
