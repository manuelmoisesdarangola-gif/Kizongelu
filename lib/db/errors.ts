/**
 * @file lib/db/errors.ts
 * Utilitários de tratamento e normalização de erros do Prisma Client.
 * Mapeia códigos de erro comuns do PostgreSQL/Prisma para mensagens claras em PT-PT.
 */

export interface DatabaseErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

export interface PrismaKnownErrorLike {
  name: string;
  code: string;
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * Type guard para erros conhecidos de requisição do Prisma (PXXXX).
 */
export function isPrismaKnownError(error: unknown): error is PrismaKnownErrorLike {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    ((error as Record<string, unknown>).code as string).startsWith('P')
  );
}

/**
 * Type guard para erros de validação de schema/campos no Prisma.
 */
export function isPrismaValidationError(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as Record<string, unknown>).name === 'PrismaClientValidationError'
  );
}

/**
 * Type guard para erros de inicialização ou indisponibilidade de conexão.
 */
export function isPrismaInitError(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as Record<string, unknown>).name === 'PrismaClientInitializationError'
  );
}

/**
 * Normaliza qualquer exceção originada no Prisma para uma resposta estruturada HTTP/API.
 */
export function handlePrismaError(error: unknown): DatabaseErrorResponse {
  if (isPrismaKnownError(error)) {
    const target = Array.isArray(error.meta?.target)
      ? (error.meta.target as string[]).join(', ')
      : typeof error.meta?.target === 'string'
      ? error.meta.target
      : undefined;

    switch (error.code) {
      case 'P2002': {
        const fieldMsg = target ? ` (campo: ${target})` : '';
        return {
          status: 409,
          code: 'UNIQUE_CONSTRAINT_VIOLATION',
          message: `Já existe um registo com estes dados únicos no sistema${fieldMsg}.`,
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
      }
      case 'P2025': {
        return {
          status: 404,
          code: 'RECORD_NOT_FOUND',
          message: 'O registo solicitado não foi encontrado ou foi eliminado da base de dados.',
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
      }
      case 'P2003': {
        return {
          status: 400,
          code: 'FOREIGN_KEY_VIOLATION',
          message: 'Operação inválida: depende de outro registo que não existe ou está relacionado.',
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
      }
      case 'P2014': {
        return {
          status: 400,
          code: 'RELATION_VIOLATION',
          message: 'A alteração causaria inconsistência na relação entre entidades.',
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
      }
      case 'P1000':
      case 'P1001': {
        return {
          status: 503,
          code: 'DATABASE_UNREACHABLE',
          message: 'Não foi possível estabelecer ligação ao servidor PostgreSQL. Verifique a rede ou DATABASE_URL.',
          details: null,
        };
      }
      case 'P1002':
      case 'P1008': {
        return {
          status: 504,
          code: 'DATABASE_TIMEOUT',
          message: 'A operação na base de dados excedeu o tempo limite permitido.',
          details: null,
        };
      }
      case 'P2021': {
        return {
          status: 500,
          code: 'TABLE_DOES_NOT_EXIST',
          message: 'A tabela requisitada ainda não existe na base de dados (execute prisma migrate).',
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
      }
      default:
        return {
          status: 500,
          code: error.code || 'DATABASE_ERROR',
          message: `Erro na base de dados (${error.code}): ${error.message || 'Falha na operação.'}`,
          details: error.meta ? (error.meta as Record<string, unknown>) : null,
        };
    }
  }

  if (isPrismaValidationError(error)) {
    return {
      status: 400,
      code: 'SCHEMA_VALIDATION_ERROR',
      message: 'Dados enviados incompatíveis com o esquema da base de dados.',
      details: { originalMessage: (error as Error).message },
    };
  }

  if (isPrismaInitError(error)) {
    return {
      status: 503,
      code: 'DATABASE_INITIALIZATION_ERROR',
      message: 'Falha ao inicializar o motor Prisma. Verifique as credenciais DATABASE_URL.',
      details: { originalMessage: (error as Error).message },
    };
  }

  if (typeof error === 'object' && error !== null && (error as Record<string, unknown>).name === 'PrismaClientRustPanicError') {
    return {
      status: 500,
      code: 'DATABASE_ENGINE_CRASH',
      message: 'O motor interno do Prisma encerrou inesperadamente.',
      details: null,
    };
  }

  if (typeof error === 'object' && error !== null && (error as Record<string, unknown>).name === 'PrismaClientUnknownRequestError') {
    return {
      status: 500,
      code: 'UNKNOWN_DATABASE_ERROR',
      message: 'Ocorreu um erro não identificado na base de dados.',
      details: null,
    };
  }

  // Fallback para outros tipos de erro
  return {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? error.message : 'Erro interno do servidor.',
    details: null,
  };
}

/**
 * Retorna uma mensagem amigável para exibição em Toasts ou alertas da UI.
 */
export function formatPrismaErrorMessage(error: unknown): string {
  const handled = handlePrismaError(error);
  return handled.message;
}
