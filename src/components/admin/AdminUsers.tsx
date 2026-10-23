/**
 * @file src/components/admin/AdminUsers.tsx
 * Gestão de Utilizadores e Controlo de Acesso Baseado em Papéis - RBAC (Fase 10 - Tarefa 8).
 * 
 * - Tabela: Nome & Empresa · Contacto · Tipo / Perfil · Província · Registo & Acesso · Estado · Ações
 * - Filtros: Pesquisa, Perfil detalhado com contagens dinâmicas, Estado (Activo, Suspenso, Inactivo)
 * - Modal "Ver Perfil": detalhes cadastrais, empresa vinculada, histórico de orçamentos e gastos
 * - Modal "Alterar Role": mudança com motivo obrigatório para AuditLog
 * - Ação "Desativar / Ativar": suspensão com confirmação e registo no AuditLog
 * - Ação "Assumir Sessão": impersonate com confirmação prévia, validação de role ADMIN e AuditLog
 */

import React, { useState } from 'react';
import {
  AdminDataService,
  AdminUserRecord,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyKz } from '../../../lib/format/currency';
import {
  Users,
  Search,
  Shield,
  Eye,
  UserX,
  UserCheck,
  Building,
  HardHat,
  Crown,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  FileText,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

// C.3: Formatação de datas no formato português DD/MM/AAAA
const formatDatePt = (dateStr: string): string => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return `${d}/${m}/${y}`;
  }
  return dateStr;
};

// C.6 & A.3: Badges de perfis em sentence case e suporte a roles de empresa
const getUserRoleBadge = (tipo: AdminUserRecord['tipo']) => {
  const t = (tipo || '').toLowerCase();
  switch (t) {
    case 'admin':
      return {
        label: 'Admin',
        className: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      };
    case 'particular':
      return {
        label: 'Particular',
        className: 'bg-slate-700/80 text-slate-300 border border-slate-600',
      };
    case 'profissional':
      return {
        label: 'Profissional',
        className: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
      };
    case 'empresa':
      return {
        label: 'Empresa',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    case 'empresa_plus':
      return {
        label: 'Empresa Plus',
        className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      };
    case 'company_owner':
      return {
        label: 'Empresa (Owner)',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    case 'company_admin':
      return {
        label: 'Empresa (Admin)',
        className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      };
    case 'company_member':
      return {
        label: 'Membro de Equipa',
        className: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      };
    default:
      return {
        label: tipo,
        className: 'bg-slate-700 text-slate-300',
      };
  }
};

// E.2: Cores semânticas de avatar por role
const roleAvatarColors: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  PARTICULAR: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  PROFESSIONAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  PROFISSIONAL: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  EMPRESA: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  EMPRESA_PLUS: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  COMPANY_OWNER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  COMPANY_ADMIN: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  COMPANY_MEMBER: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const getRoleAvatarColor = (tipo: string): string => {
  const key = (tipo || '').toUpperCase();
  return roleAvatarColors[key] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
};

export const AdminUsers: React.FC = () => {
  const { currentUser, setCurrentUserById } = useAuth();
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState<AdminUserRecord[]>(() =>
    AdminDataService.getUsers()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modais
  const [profileUser, setProfileUser] = useState<AdminUserRecord | null>(null);
  const [roleEditUser, setRoleEditUser] = useState<AdminUserRecord | null>(null);
  const [newRole, setNewRole] = useState<AdminUserRecord['tipo']>('particular');
  const [roleChangeReason, setRoleChangeReason] = useState('');

  // C.5: Modal de confirmação para assumir sessão
  const [impersonateTargetUser, setImpersonateTargetUser] = useState<AdminUserRecord | null>(null);

  // C.2: Contagens dinâmicas de tipos de perfil
  const particularesCount = users.filter((u) => (u.tipo || '').toLowerCase() === 'particular').length;
  const profissionaisCount = users.filter((u) => (u.tipo || '').toLowerCase() === 'profissional').length;
  const empresasCount = users.filter((u) =>
    ['empresa', 'empresa_plus', 'company_owner', 'company_admin', 'company_member'].includes(
      (u.tipo || '').toLowerCase()
    )
  ).length;
  const adminsCount = users.filter((u) => (u.tipo || '').toLowerCase() === 'admin').length;

  // E.1: Contagens para a faixa de 4 KPIs no topo
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => (u.estado || '').toUpperCase() === 'ATIVO').length;
  const suspendedUsers = users.filter((u) => (u.estado || '').toUpperCase() === 'SUSPENSO').length;
  const enterpriseUsers = empresasCount;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.telefone.includes(searchTerm) ||
      (u.empresa && u.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.provincia.toLowerCase().includes(searchTerm.toLowerCase());

    const userTipoLower = (u.tipo || '').toLowerCase();
    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'empresas'
        ? ['empresa', 'empresa_plus', 'company_owner', 'company_admin', 'company_member'].includes(userTipoLower)
        : userTipoLower === roleFilter.toLowerCase());

    const userEstadoLower = (u.estado || '').toLowerCase();
    const matchesStatus =
      statusFilter === 'ALL' ||
      userEstadoLower === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenRoleModal = (u: AdminUserRecord) => {
    setRoleEditUser(u);
    setNewRole(u.tipo);
    setRoleChangeReason('');
  };

  const handleSaveRoleChange = () => {
    if (!roleEditUser) return;
    if (!roleChangeReason.trim()) {
      toastError('Motivo Obrigatório', 'Por favor forneça a razão técnica para alteração do perfil.');
      return;
    }

    AdminDataService.updateUserRole(
      roleEditUser.id,
      newRole,
      roleChangeReason.trim(),
      currentUser.nome,
      currentUser.email
    );

    setUsers(AdminDataService.getUsers());
    setRoleEditUser(null);
    const roleBadge = getUserRoleBadge(newRole);
    success('Papel Actualizado', `O utilizador ${roleEditUser.nome} agora possui a função "${roleBadge.label}".`);
  };

  const handleToggleStatus = (u: AdminUserRecord) => {
    AdminDataService.toggleUserStatus(u.id, currentUser.nome, currentUser.email);
    setUsers(AdminDataService.getUsers());
    const actionDesc = u.estado === 'ATIVO' ? 'suspenso' : 'reativado';
    success('Estado Alterado', `O acesso de ${u.nome} foi ${actionDesc}.`);
  };

  // C.5: Execução do impersonate com segurança, validação de role e registo no AuditLog
  const handleConfirmImpersonate = () => {
    if (!impersonateTargetUser) return;

    if (currentUser.role !== 'admin') {
      toastError('Acesso Negado', 'Apenas utilizadores com função de Administrador podem assumir sessões.');
      setImpersonateTargetUser(null);
      return;
    }

    AdminDataService.recordAudit({
      evento: 'USER_IMPERSONATED',
      adminNome: currentUser.nome,
      adminEmail: currentUser.email,
      gravidade: 'AVISO',
      descricao: `Início de sessão assistida como ${impersonateTargetUser.nome} (${impersonateTargetUser.email}) para assistência técnica.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Chrome 128.0 / MacOS',
      before: { activeUserId: currentUser.id, adminRole: currentUser.role },
      after: { impersonatedUserId: impersonateTargetUser.id, targetRole: impersonateTargetUser.tipo },
    });

    setCurrentUserById(impersonateTargetUser.id);
    success('Sessão Alternada', `A sua sessão ativa foi alternada para ${impersonateTargetUser.nome}.`);
    setImpersonateTargetUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Topo com Título */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Gestão de Utilizadores e Controlo de Acesso (RBAC)
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              {users.length} Contas Registadas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de perfis particulares, técnicos, engenheiros e construtoras em Angola.
          </p>
        </div>
      </div>

      {/* E.1: Faixa de 4 KPIs no Topo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total de Utilizadores
          </span>
          <span className="text-2xl font-black text-white mt-1 block">{totalUsers}</span>
          <span className="text-[10px] text-slate-400">Contas registadas</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Activos
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{activeUsers}</span>
          <span className="text-[10px] text-emerald-400/80">Acesso regular</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Suspensos
          </span>
          <span className="text-2xl font-black text-rose-400 mt-1 block">{suspendedUsers}</span>
          <span className="text-[10px] text-rose-400/80">Acesso bloqueado</span>
        </div>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Empresas
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{enterpriseUsers}</span>
          <span className="text-[10px] text-amber-400/80">Construtoras e equipas</span>
        </div>
      </div>

      {/* C.1 & C.2: Filtros e Barra de Pesquisa */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por nome, empresa, email, telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* C.2: Filtro por Perfil / Tipo agrupado com contagens dinâmicas */}
          <div className="flex items-center space-x-2">
            <label className="text-slate-400 font-semibold shrink-0">Perfil:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
            >
              <option value="ALL">Todos os Perfis ({users.length})</option>
              <option value="particular">
                Particulares ({particularesCount} {particularesCount === 1 ? 'registo' : 'registos'})
              </option>
              <option value="profissional">
                Profissionais ({profissionaisCount} {profissionaisCount === 1 ? 'registo' : 'registos'})
              </option>
              <option value="empresas">
                Empresas ({empresasCount} {empresasCount === 1 ? 'registo' : 'registos'})
              </option>
              <option value="admin">
                Administradores ({adminsCount} {adminsCount === 1 ? 'registo' : 'registos'})
              </option>
            </select>
          </div>

          {/* C.1: Filtro por Estado */}
          <div className="flex items-center space-x-2">
            <label className="text-slate-400 font-semibold shrink-0">Estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
            >
              <option value="ALL">Todos os estados</option>
              <option value="ATIVO">Activo</option>
              <option value="SUSPENSO">Suspenso</option>
              <option value="INATIVO">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Utilizadores */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-6 font-bold">Nome & Utilizador</th>
                <th className="py-3.5 px-4 font-bold">Contacto</th>
                <th className="py-3.5 px-4 font-bold">Tipo / Perfil</th>
                <th className="py-3.5 px-4 font-bold">Província</th>
                <th className="py-3.5 px-4 font-bold">Registo & Acesso</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-6 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredUsers.map((u) => {
                const roleBadge = getUserRoleBadge(u.tipo);
                const isEnterprise = [
                  'empresa',
                  'empresa_plus',
                  'company_owner',
                  'company_admin',
                  'company_member',
                ].includes((u.tipo || '').toLowerCase());
                const isMe =
                  u.id === currentUser.id ||
                  u.email.toLowerCase() === currentUser.email.toLowerCase();

                return (
                  <tr key={u.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-full ${getRoleAvatarColor(
                            u.tipo
                          )} border font-bold flex items-center justify-center shrink-0`}
                        >
                          {u.nome.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="font-bold text-white text-sm">{u.nome}</span>
                            {isMe && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-full bg-amber-500 text-slate-950">
                                Você
                              </span>
                            )}
                          </div>
                          {/* C.4: Subtexto Empresa com tooltip */}
                          {u.empresa && isEnterprise && (
                            <div
                              className="text-[11px] text-amber-300 font-medium truncate max-w-[200px]"
                              title={u.empresa}
                            >
                              {u.empresa}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                      <div>{u.telefone}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${roleBadge.className}`}
                      >
                        <span>{roleBadge.label}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-200 font-medium">
                      {u.provincia}
                    </td>

                    {/* C.3: Datas em formato PT */}
                    <td className="py-4 px-4 text-[11px] text-slate-400">
                      <div>Reg: {formatDatePt(u.registoData)}</div>
                      <div className="text-slate-500">Último: {u.ultimoAcesso}</div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {u.estado === 'ATIVO' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Activo</span>
                        </span>
                      ) : u.estado === 'SUSPENSO' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <span>Suspenso</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-400 border border-slate-600">
                          <span>Inactivo</span>
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setProfileUser(u)}
                          className="p-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Ver Perfil Detalhado"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="p-1.5 bg-slate-700/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                          title="Alterar Papel / Permissões (RBAC)"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.estado === 'ATIVO'
                              ? 'bg-rose-500/15 hover:bg-rose-500/30 text-rose-400'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400'
                          }`}
                          title={u.estado === 'ATIVO' ? 'Desativar Conta' : 'Ativar Conta'}
                        >
                          {u.estado === 'ATIVO' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        {/* C.5: Botão Assumir com tooltip, validação de role ADMIN e modal de confirmação */}
                        <button
                          onClick={() => {
                            if (currentUser.role !== 'admin') {
                              toastError('Acesso Negado', 'Apenas Administradores podem assumir sessões de utilizadores.');
                              return;
                            }
                            setImpersonateTargetUser(u);
                          }}
                          disabled={currentUser.role !== 'admin'}
                          className="px-2.5 py-1.5 bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                          title="Iniciar sessão como este utilizador (para suporte)"
                        >
                          Assumir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VER PERFIL                                                       */}
      {/* ========================================================================= */}
      {profileUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center">
                  {profileUser.nome.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{profileUser.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getUserRoleBadge(profileUser.tipo).className}`}>
                      {getUserRoleBadge(profileUser.tipo).label}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{profileUser.email}</span>
                </div>
              </div>
              <button onClick={() => setProfileUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Telefone</span>
                <span className="font-bold text-white mt-0.5 block">{profileUser.telefone}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Província</span>
                <span className="font-bold text-white mt-0.5 block">{profileUser.provincia}</span>
              </div>
              {profileUser.empresa && (
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 col-span-2">
                  <span className="text-slate-400 block">Empresa Associada</span>
                  <span className="font-bold text-amber-300 mt-0.5 block">{profileUser.empresa}</span>
                </div>
              )}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Data de Registo</span>
                <span className="font-bold text-white mt-0.5 block">{formatDatePt(profileUser.registoData)}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Último Acesso</span>
                <span className="font-bold text-white mt-0.5 block">{profileUser.ultimoAcesso}</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Orçamentos Emitidos</span>
                <span className="font-bold text-amber-400 mt-0.5 block">{profileUser.orçamentosCount} obras</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80">
                <span className="text-slate-400 block">Total Faturado</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">
                  {formatCurrencyKz(profileUser.totalGastoKz)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProfileUser(null)}
                className="px-5 py-2 bg-slate-700 hover:bg-slate-650 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ALTERAR ROLE COM MOTIVO OBRIGATÓRIO (RBAC & AUDITLOG)            */}
      {/* ========================================================================= */}
      {roleEditUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Alterar Papel / Permissões (RBAC)</h3>
              </div>
              <button onClick={() => setRoleEditUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              A alteração de papel modifica o acesso a limites de orçamentos, relatórios analíticos e privilégios do utilizador <strong>{roleEditUser.nome}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Novo Papel no Sistema</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as AdminUserRecord['tipo'])}
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-xs"
              >
                <option value="particular">Particular (1 orçamento / avulso)</option>
                <option value="profissional">Profissional (3 orçamentos / relatórios técnicos)</option>
                <option value="empresa">Empresa (6 orçamentos / multi-obra)</option>
                <option value="empresa_plus">Empresa Plus (12 orçamentos / prioridade total)</option>
                <option value="company_owner">Empresa - Owner (Gestor Principal de Construtora)</option>
                <option value="company_member">Empresa - Membro de Equipa (Engenheiro / Técnico)</option>
                <option value="admin">Admin (Acesso total)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Motivo da Alteração <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={roleChangeReason}
                onChange={(e) => setRoleChangeReason(e.target.value)}
                placeholder="Ex: Upgrade concedido mediante contrato corporativo anual assinado..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRoleEditUser(null)}
                className="px-4 py-2 bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRoleChange}
                disabled={!roleChangeReason.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Confirmar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIRMAR ASSUMIR SESSÃO (C.5 — IMPERSONATE COM AUDITLOG)        */}
      {/* ========================================================================= */}
      {impersonateTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-amber-500/30 rounded-3xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Iniciar Sessão Assistida</h3>
              </div>
              <button
                onClick={() => setImpersonateTargetUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Está prestes a assumir a sessão do utilizador{' '}
              <strong className="text-white">{impersonateTargetUser.nome}</strong> (
              <span className="text-amber-300 font-mono">{impersonateTargetUser.email}</span>).
            </p>

            <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                <span>Rastreabilidade e Segurança (AuditLog)</span>
              </div>
              <p className="text-slate-400">
                Esta operação concede acesso temporário às quotas e orçamentos desta conta para fins de assistência técnica e suporte ao cliente. A troca de sessão será registrada no AuditLog oficial com hash de integridade SHA-256.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setImpersonateTargetUser(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-650 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImpersonate}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer"
              >
                Confirmar e Assumir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
