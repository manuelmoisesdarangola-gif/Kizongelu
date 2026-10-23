/**
 * @file lib/auth/rbac.ts
 * Helpers de Controlo de Acessos Baseado em Funções (RBAC) e Verificação de Propriedade.
 */

import { UserRole } from '@prisma/client';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  emailVerified?: Date | string | null;
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string = 'Autenticação necessária para aceder a este recurso.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string = 'Acesso não autorizado: o seu perfil não tem permissões para este recurso.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Exige que um utilizador esteja autenticado. Lança UnauthorizedError (401) se ausente.
 */
export function requireUser(currentUser?: AuthSessionUser | null): AuthSessionUser {
  if (!currentUser || !currentUser.id) {
    throw new UnauthorizedError();
  }
  return currentUser;
}

/**
 * Exige que o utilizador autenticado possua uma das funções (roles) autorizadas.
 * Se o role for ADMIN, tem acesso universal por omissão.
 * Lança ForbiddenError (403) se não autorizado.
 */
export function requireRole(
  allowedRoles: UserRole[],
  currentUser?: AuthSessionUser | null
): AuthSessionUser {
  const user = requireUser(currentUser);

  // Administrador tem permissão irrestrita
  if (user.role === UserRole.ADMIN) {
    return user;
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      `Acesso restrito a perfis [${allowedRoles.join(', ')}]. O seu perfil atual é [${user.role}].`
    );
  }

  return user;
}

/**
 * Valida se o utilizador autenticado é o proprietário do recurso ou se é Administrador.
 * Lança ForbiddenError (403) se violado.
 */
export function requireOwnership(
  resourceOwnerId: string,
  currentUser?: AuthSessionUser | null
): AuthSessionUser {
  const user = requireUser(currentUser);

  if (user.role === UserRole.ADMIN) {
    return user;
  }

  if (user.id !== resourceOwnerId) {
    throw new ForbiddenError('Não tem autorização para visualizar ou modificar este recurso.');
  }

  return user;
}
