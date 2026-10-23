/**
 * @file src/auth/auth-context.tsx
 * Contexto de Autenticação e Gestão de Sessão com RBAC e isolamento de utilizadores.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/domain';
export type { UserRole };
import { PLANOS_CONFIG } from './rbac';

export function getDefaultCredits(role?: string | null): number {
  if (!role) return 0;
  const r = role.toLowerCase().trim();
  if (r === 'admin') return 999999;
  if (r === 'empresa_plus') return 12;
  if (r === 'empresa' || r === 'company_owner' || r === 'company_admin') return 6;
  if (r === 'profissional') return 3;
  if (r === 'particular') return 0;
  return 0;
}

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-admin-01',
    nome: 'Admin Kizongelu',
    email: 'admin@kizongelu.ao',
    telefone: '+244 922 000 111',
    role: 'admin',
    plano: 'Administrador do Sistema',
    orçamentosDisponiveis: 999999,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_carlos_neto',
    nome: 'Carlos Neto',
    email: 'carlos.neto@engenharia.ao',
    telefone: '+244 931 000 222',
    role: 'empresa_plus',
    plano: 'Empresa Plus',
    orçamentosDisponiveis: 12,
    orçamentosRealizados: 0,
    empresaNome: 'Maianga Gestão Imobiliária',
    nif: '5412098450',
  },
  {
    id: 'usr_arnaldo_silva',
    nome: 'Eng. Arnaldo Silva',
    email: 'arnaldo.silva@engenharia.ao',
    telefone: '+244 923 456 789',
    role: 'profissional',
    plano: 'Profissional',
    orçamentosDisponiveis: 3,
    orçamentosRealizados: 0,
    empresaNome: 'AS Engenharia & Fiscalização',
  },
  {
    id: 'user-prof-01',
    nome: 'Eng. Arnaldo Silva (Benguela)',
    email: 'arnaldo.engenharia@benguela.ao',
    telefone: '+244 912 888 123',
    role: 'profissional',
    plano: 'Profissional',
    orçamentosDisponiveis: 3,
    orçamentosRealizados: 0,
    empresaNome: 'AS Engenharia & Fiscalização',
  },
  {
    id: 'usr_teresa_vandunem',
    nome: 'Dra. Teresa Van-Dúnem',
    email: 'teresa.vandunem@construtora.ao',
    telefone: '+244 924 555 888',
    role: 'empresa',
    plano: 'Empresa',
    orçamentosDisponiveis: 6,
    orçamentosRealizados: 0,
    empresaNome: 'Imobiliária Chela Sul Lda',
    nif: '5412098450',
  },
  {
    id: 'user-empresa-01',
    nome: 'Dra. Teresa Van-Dúnem (Chela Sul)',
    email: 'diretoria@chelasul.co.ao',
    telefone: '+244 934 111 222',
    role: 'empresa',
    plano: 'Empresa',
    orçamentosDisponiveis: 6,
    orçamentosRealizados: 0,
    empresaNome: 'Imobiliária Chela Sul Lda.',
    nif: '5412098450',
  },
  {
    id: 'usr_antonio_kamba',
    nome: 'Dr. António Kamba',
    email: 'antonio.kamba@kambas.ao',
    telefone: '+244 923 555 666',
    role: 'empresa',
    plano: 'Empresa (Construções Kambas)',
    orçamentosDisponiveis: 18,
    orçamentosRealizados: 0,
    empresaNome: 'Construções Kambas Lda',
    nif: '5001298450',
  },
  {
    id: 'usr_empresa_seed',
    nome: 'Dr. António Kamba (Seed)',
    email: 'empresa@kizongelu.ao',
    telefone: '+244 923 555 666',
    role: 'empresa',
    plano: 'Empresa (Construções Kambas)',
    orçamentosDisponiveis: 10,
    orçamentosRealizados: 0,
    empresaNome: 'Construções Kambas Lda',
    nif: '5001298450',
  },
  {
    id: 'usr_paulo_matamba',
    nome: 'Eng. Paulo Matamba',
    email: 'paulo.matamba@kambas.ao',
    telefone: '+244 919 777 444',
    role: 'empresa',
    plano: 'Empresa (Membro da Equipa)',
    orçamentosDisponiveis: 5,
    orçamentosRealizados: 0,
    empresaNome: 'Construções Kambas Lda',
  },
  {
    id: 'user-particular-01',
    nome: 'Manuel Kiala',
    email: 'manuel.kiala@exemplo.ao',
    telefone: '+244 912 345 678',
    role: 'particular',
    plano: 'Particular',
    orçamentosDisponiveis: 1,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_manuel_kiala',
    nome: 'Manuel Kiala',
    email: 'manuel.kiala@exemplo.ao',
    telefone: '+244 912 345 678',
    role: 'particular',
    plano: 'Particular',
    orçamentosDisponiveis: 0,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_particular_seed',
    nome: 'João Manuel (Particular)',
    email: 'particular@kizongelu.ao',
    telefone: '+244 923 111 222',
    role: 'particular',
    plano: 'Particular',
    orçamentosDisponiveis: 1,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_prof_seed',
    nome: 'Eng. Mateus Silva (Profissional)',
    email: 'engenheiro@kizongelu.ao',
    telefone: '+244 923 333 444',
    role: 'profissional',
    plano: 'Profissional',
    orçamentosDisponiveis: 3,
    orçamentosRealizados: 0,
  },
  {
    id: 'user-plus-01',
    nome: 'Eng. Domingos Kiala',
    email: 'orcamentos@infraangola.ao',
    telefone: '+244 945 999 000',
    role: 'empresa_plus',
    plano: 'Empresa Plus',
    orçamentosDisponiveis: 12,
    orçamentosRealizados: 0,
    empresaNome: 'Consórcio InfraAngola S.A.',
    nif: '5001293841',
  },
  {
    id: 'usr_mateus_dala',
    nome: 'Mateus Dala',
    email: 'mateus.dala@gmail.com',
    telefone: '+244 945 111 333',
    role: 'particular',
    plano: 'Particular',
    orçamentosDisponiveis: 1,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_inativo_teste',
    nome: 'Afonso Bernardo',
    email: 'afonso.bernardo@antigo.ao',
    telefone: '+244 911 222 333',
    role: 'particular',
    plano: 'Particular',
    orçamentosDisponiveis: 0,
    orçamentosRealizados: 0,
  },
  {
    id: 'usr_joao_baptista',
    nome: 'Eng. João Baptista',
    email: 'joao.baptista@exemplo.ao',
    telefone: '+244 923 777 888',
    role: 'profissional',
    plano: 'Profissional',
    orçamentosDisponiveis: 5,
    orçamentosRealizados: 3,
  },
  {
    id: 'usr_chipepo_eng',
    nome: 'Eng. Domingos Chipepo',
    email: 'chipepo.eng@gmail.com',
    telefone: '+244 925 444 333',
    role: 'profissional',
    plano: 'Profissional',
    orçamentosDisponiveis: 4,
    orçamentosRealizados: 2,
  },
];

interface AuthContextType {
  currentUser: UserProfile;
  user?: UserProfile & { name: string };
  isAuthenticated: boolean;
  login: (userIdOrEmail?: string, password?: string) => boolean;
  logout: () => void;
  setCurrentUserById: (userId: string) => void;
  registerUser: (data: { nome: string; email: string; role?: UserRole; telefone?: string }) => UserProfile;
  usersList: UserProfile[];
  consumirOrcamento: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_AUTH_USER = 'Kizongelu_active_user_id_v1';
const STORAGE_KEY_AUTH_STATUS = 'Kizongelu_is_authenticated_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_STATUS);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return true; // Padrão: utilizador de demonstração ativo
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (stored && MOCK_USERS.some((u) => u.id === stored)) {
        return stored;
      }
    }
    return MOCK_USERS[0].id;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, currentUserId);
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTH_STATUS, String(isAuthenticated));
      if (isAuthenticated && currentUser) {
        document.cookie = `Kizongelu-session=sess_${currentUser.id}; path=/; SameSite=Lax`;
        document.cookie = `Kizongelu-user-role=${currentUser.role === 'admin' ? 'ADMIN' : currentUser.role.toUpperCase()}; path=/; SameSite=Lax`;
      } else {
        document.cookie = 'Kizongelu-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'Kizongelu-user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
    }
  }, [isAuthenticated, currentUser]);

  const setCurrentUserById = (userId: string) => {
    const term = userId.trim().toLowerCase();
    const cleanPhone = term.replace(/\s+/g, '');
    const existing = users.find(
      (u) =>
        u.id.toLowerCase() === term ||
        u.email.toLowerCase() === term ||
        u.telefone.replace(/\s+/g, '') === cleanPhone
    );
    if (existing) {
      setCurrentUserId(existing.id);
      setIsAuthenticated(true);
      return;
    }
    const role: UserRole = 'particular';
    const newUser: UserProfile = {
      id: userId,
      nome: userId.replace('usr_', '').replace('_', ' '),
      email: `${userId}@kizongelu.ao`,
      telefone: '+244 923 000 000',
      role,
      plano: 'Particular',
      orçamentosDisponiveis: getDefaultCredits(role),
      orçamentosRealizados: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
  };

  const login = (userIdOrEmail?: string, password?: string): boolean => {
    if (!userIdOrEmail) {
      setIsAuthenticated(true);
      return true;
    }

    const term = userIdOrEmail.trim().toLowerCase();
    const cleanPhone = term.replace(/\s+/g, '');

    const user = users.find(
      (u) =>
        u.id.toLowerCase() === term ||
        u.email.toLowerCase() === term ||
        u.telefone.replace(/\s+/g, '') === cleanPhone
    );

    if (!user) {
      return false;
    }

    // Validação de password (Mock):
    // Aceita a senha padrão '123456' para todos os utilizadores,
    // bem como as senhas das seeds ('Admin2026!' e 'Kizongelu2026!').
    if (password !== undefined && password !== '') {
      const trimmedPass = password.trim();
      const isAllowed =
        trimmedPass === '123456' ||
        trimmedPass === 'Admin2026!' ||
        trimmedPass === 'Kizongelu2026!';

      if (!isAllowed) {
        return false;
      }
    }

    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const registerUser = (data: { nome: string; email: string; role?: UserRole; telefone?: string }): UserProfile => {
    const role: UserRole = data.role || 'particular';
    const initialCredits = getDefaultCredits(role);
    const planName =
      role === 'admin'
        ? 'Administrador do Sistema'
        : role === 'empresa_plus'
        ? 'Empresa Plus'
        : role === 'empresa'
        ? 'Empresa'
        : role === 'profissional'
        ? 'Profissional'
        : 'Particular';

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '+244 923 000 000',
      role,
      plano: planName,
      orçamentosDisponiveis: initialCredits,
      orçamentosRealizados: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    return newUser;
  };

  const consumirOrcamento = () => {
    if (currentUser.role === 'admin') return;

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUser.id && user.orçamentosDisponiveis > 0) {
          return {
            ...user,
            orçamentosDisponiveis: user.orçamentosDisponiveis - 1,
            orçamentosRealizados: user.orçamentosRealizados + 1,
          };
        }
        return user;
      })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: { ...currentUser, name: currentUser.nome },
        isAuthenticated,
        login,
        logout,
        setCurrentUserById,
        registerUser,
        usersList: users,
        consumirOrcamento,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
