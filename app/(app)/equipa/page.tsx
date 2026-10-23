/**
 * @file app/(app)/equipa/page.tsx
 * Gestão de Equipa Técnica e Colaboradores (/equipa) — Fase 13.
 *
 * Funcionalidades:
 * - Tabela completa de membros ativos e convidados.
 * - Botão "+ Convidar utilizador".
 * - Modal de convite (email + role).
 * - Email de convite simulado com token de aceitação e link direto copiável (/convite/:token).
 * - Ações: Alterar role (Administrador, Orçamentista Sénior, Medidor de Obra, Técnico) e Remover membro.
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import {
  getTeamMembers,
  createInvitation,
  updateTeamMemberRole,
  removeTeamMember,
  TeamMemberRecord,
} from '@/lib/actions/subscriptions';

export const EquipaPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal de Convite
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'COMPANY_ADMIN' | 'COMPANY_MEMBER'>('COMPANY_MEMBER');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const companyId = currentUser.empresaNome ? `comp_${currentUser.id}` : 'comp_empresa_master';
  const companyName = currentUser.empresaNome || 'Gabinete de Engenharia';

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers(companyId);
      setMembers(data);
    } catch (e: any) {
      console.warn('Erro ao carregar equipa:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [currentUser]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      warning('Introduza um endereço de email válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createInvitation({
        companyId,
        companyName,
        email: inviteEmail,
        role: inviteRole,
      });

      setGeneratedInviteUrl(res.inviteUrl);
      success('Convite Gerado com Sucesso!', `O link de aceitação foi criado para ${inviteEmail}.`);
      await loadMembers();
    } catch (err: any) {
      warning(err.message || 'Falha ao gerar convite');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    info('Copiado!', 'Link de convite copiado para a área de transferência.');
  };

  const handleChangeRole = async (memberId: string, newRole: TeamMemberRecord['role']) => {
    await updateTeamMemberRole(memberId, newRole);
    success('Função atualizada com sucesso.');
    loadMembers();
  };

  const handleRemove = async (memberId: string, memberName: string) => {
    if (window.confirm(`Tem a certeza que deseja remover ${memberName} da equipa?`)) {
      await removeTeamMember(memberId);
      warning(`${memberName} foi removido da organização.`);
      loadMembers();
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo do Ecrã */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0F3D5C]" />
            <span>Gestão da Equipa Técnica</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Controlo de acessos, medições colaborativas e permissões de orçamentação para {companyName}.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedInviteUrl(null);
            setInviteEmail('');
            setIsInviteModalOpen(true);
          }}
          className="self-start sm:self-center px-5 py-2.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>+ Convidar utilizador</span>
        </button>
      </div>

      {/* Tabela de Membros */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Colaboradores Registados ({members.length})
            </span>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold">
            Pacote Empresa Activo
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">A carregar colaboradores...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-6">Membro</th>
                  <th className="py-3 px-6">Função Técnica</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6">Data de Entrada</th>
                  <th className="py-3 px-6 text-right">ACÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => {
                  const isMaster = m.role === 'Administrador da Organização';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {m.nome.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{m.nome}</span>
                            <span className="text-slate-400 text-[11px]">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {isMaster ? (
                          <span className="font-semibold text-slate-700">{m.role}</span>
                        ) : (
                          <select
                            value={m.role}
                            onChange={(e) => handleChangeRole(m.id, e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F3D5C]"
                          >
                            <option value="Orçamentista Sénior">Orçamentista Sénior</option>
                            <option value="Medidor de Obra">Medidor de Obra</option>
                            <option value="Técnico">Técnico</option>
                            <option value="Administrador da Organização">Administrador</option>
                          </select>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {m.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {new Date(m.joinedAt).toLocaleDateString('pt-PT')}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {!isMaster && (
                          <button
                            onClick={() => handleRemove(m.id, m.nome)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remover da equipa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Convidar Utilizador */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0F3D5C] text-amber-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Convidar Colaborador Técnico</h3>
                  <p className="text-xs text-slate-500">Envie convite de acesso para a equipa de {companyName}</p>
                </div>
              </div>

              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedInviteUrl ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900">
                  <div className="flex items-center space-x-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Convite emitido com sucesso!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    O link de convite é válido por <strong>7 dias</strong>. Partilhe diretamente com o seu colega:
                  </p>
                  <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-300">
                    <span className="font-mono text-[11px] truncate mr-2 text-slate-800">
                      {generatedInviteUrl}
                    </span>
                    <button
                      onClick={() => handleCopyLink(generatedInviteUrl)}
                      className="px-2.5 py-1 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white rounded-lg font-bold text-[10px] flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Endereço de Email Profissional *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="engenheiro@suaempresa.ao"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Função & Nível de Acesso *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
                  >
                    <option value="COMPANY_MEMBER">Colaborador / Orçamentista Técnico</option>
                    <option value="COMPANY_ADMIN">Administrador da Organização</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Os orçamentistas podem criar e editar cálculos. Os administradores gerem licenças e equipa.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-2"
                  >
                    <span>{isSubmitting ? 'A gerar...' : 'Enviar Convite'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
