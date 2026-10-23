/**
 * @file src/components/admin/AdminEngineVersions.tsx
 * Gestão do Histórico de Versões do Motor Determinístico (Fase 10 - Tarefa 6).
 * 
 * - Tabela de versões do motor (versão, status, data, responsável, changelog)
 * - Botão "Criar nova versão" (duplica ativa criando rascunho)
 * - Ativação de versão com confirmação dupla (arquiva a versão anterior ativa)
 * - Registo de auditoria imutável com before/after
 */

import React, { useState } from 'react';
import {
  AdminDataService,
  EngineVersion,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import {
  History,
  CheckCircle2,
  Archive,
  FileCode2,
  Plus,
  ArrowLeft,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AdminEngineVersionsProps {
  onBackToFormulas: () => void;
}

export const AdminEngineVersions: React.FC<AdminEngineVersionsProps> = ({
  onBackToFormulas,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [versions, setVersions] = useState<EngineVersion[]>(() =>
    AdminDataService.getEngineVersions()
  );

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState('v2.5 (Abril 2026)');
  const [newVersionDesc, setNewVersionDesc] = useState(
    'Ajustes nos coeficientes de armadura e incorporação de ensaios de betão com inertes de Luanda e Kwanza Sul.'
  );

  const [versionToActivate, setVersionToActivate] = useState<EngineVersion | null>(null);
  const [doubleConfirmText, setDoubleConfirmText] = useState('');

  const activeVersion = versions.find((v) => v.status === 'ATIVA');

  const handleCreateVersion = () => {
    if (!newVersionNum.trim()) return;

    const created = AdminDataService.createNewVersion({
      versao: newVersionNum.trim(),
      descricao: newVersionDesc.trim(),
      responsavel: currentUser.nome,
      adminEmail: currentUser.email,
    });

    setVersions(AdminDataService.getEngineVersions());
    setIsCreateModalOpen(false);
    success('Versão Criada', `A versão "${created.versao}" foi criada como rascunho a partir da versão ativa.`);
  };

  const handleConfirmActivation = () => {
    if (!versionToActivate) return;
    if (doubleConfirmText !== 'ACTIVAR') {
      toastError('Confirmação Inválida', 'Digite "ACTIVAR" exactamente para autorizar a mudança em produção.');
      return;
    }

    AdminDataService.activateVersion(versionToActivate.id, currentUser.nome, currentUser.email);
    setVersions(AdminDataService.getEngineVersions());
    setVersionToActivate(null);
    setDoubleConfirmText('');
    success(
      'Versão Ativada com Sucesso!',
      `A versão ${versionToActivate.versao} é agora a versão oficial de cálculo do Kizongelu. A versão anterior foi arquivada.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Topo com Voltar e Botão de Criar Versão */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToFormulas}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar às Fórmulas de Engenharia</span>
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Versões do Motor Determinístico
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Versão Ativa: {activeVersion?.versao || 'v2.4'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controlo de versão semântico e registo histórico das fórmulas de cálculo estrutural de Angola.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Versão</span>
        </button>
      </div>

      {/* Tabela de Versões */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-6 font-bold">Versão / Lançamento</th>
                <th className="py-3.5 px-6 font-bold">Responsável</th>
                <th className="py-3.5 px-6 font-bold">Descrição / Changelog</th>
                <th className="py-3.5 px-4 font-bold text-center">Parâmetros</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-6 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {versions.map((v) => (
                <tr
                  key={v.id}
                  className={`hover:bg-slate-750/50 transition-colors ${
                    v.status === 'ATIVA' ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm flex items-center space-x-2">
                      <span>{v.versao}</span>
                      {v.status === 'ATIVA' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{v.dataLancamento}</div>
                  </td>

                  <td className="py-4 px-6 text-slate-200 font-medium">{v.responsavel}</td>

                  <td className="py-4 px-6 max-w-md">
                    <p className="text-slate-300 line-clamp-2">{v.descricao}</p>
                    <span className="text-[10px] font-mono text-slate-400">Hash: {v.hashSha256.substring(0, 14)}...</span>
                  </td>

                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-300">
                    {v.parametrosCount} itens
                  </td>

                  <td className="py-4 px-4 text-center">
                    {v.status === 'ATIVA' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ATIVA</span>
                      </span>
                    )}
                    {v.status === 'ARQUIVADA' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-700/60 text-slate-400 border border-slate-700">
                        <Archive className="w-3 h-3" />
                        <span>ARQUIVADA</span>
                      </span>
                    )}
                    {v.status === 'RASCUNHO' && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        <FileCode2 className="w-3 h-3" />
                        <span>RASCUNHO</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    {v.status !== 'ATIVA' ? (
                      <button
                        onClick={() => {
                          setVersionToActivate(v);
                          setDoubleConfirmText('');
                        }}
                        className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-xs font-bold rounded-xl transition-all border border-amber-500/40 cursor-pointer"
                      >
                        Ativar Versão
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold italic">Em Produção</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CRIAR NOVA VERSÃO DO MOTOR                                       */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Copy className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Criar Nova Versão do Motor</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Esta ação cria uma nova versão em <strong>RASCUNHO</strong>, duplicando todos os parâmetros da versão ativa ({activeVersion?.versao}).
              A nova versão pode ser ajustada e testada antes de ser ativada em produção.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Identificador de Versão</label>
              <input
                type="text"
                value={newVersionNum}
                onChange={(e) => setNewVersionNum(e.target.value)}
                placeholder="Ex: v2.5 (Abril 2026)"
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Notas de Versão (Changelog)</label>
              <textarea
                rows={3}
                value={newVersionDesc}
                onChange={(e) => setNewVersionDesc(e.target.value)}
                placeholder="Descreva as alterações técnicas e novas referências técnicas aplicáveis..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateVersion}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Duplicar e Criar Rascunho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRMAÇÃO DUPLA DE ATIVAÇÃO DE VERSÃO                          */}
      {/* ========================================================================= */}
      {versionToActivate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black text-white">Confirmação Dupla de Ativação</h3>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-200 space-y-2">
              <p>
                Está prestes a ativar a versão <strong>{versionToActivate.versao}</strong> como motor principal de engenharia do Kizongelu.
              </p>
              <p className="text-slate-300">
                A versão atualmente ativa (<strong>{activeVersion?.versao}</strong>) será automaticamente arquivada.
                Todos os novos cálculos usarão imediatamente as novas fórmulas.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Digite <span className="font-mono text-amber-400">ACTIVAR</span> para confirmar a transição:
              </label>
              <input
                type="text"
                value={doubleConfirmText}
                onChange={(e) => setDoubleConfirmText(e.target.value.toUpperCase())}
                placeholder="ACTIVAR"
                className="w-full p-3 font-mono text-center tracking-widest text-sm rounded-xl border border-slate-700 bg-slate-900 text-amber-400 font-black focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setVersionToActivate(null)}
                className="px-4 py-2 bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmActivation}
                disabled={doubleConfirmText !== 'ACTIVAR'}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Activar em Produção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEngineVersions;
