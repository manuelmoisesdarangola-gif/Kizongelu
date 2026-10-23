/**
 * @file lib/db/prisma-shim.ts
 * Browser-safe stub and types for Prisma Client in client-side Vite builds.
 */

export enum UserRole {
  PARTICULAR = 'PARTICULAR',
  PROFESSIONAL = 'PROFESSIONAL',
  COMPANY_OWNER = 'COMPANY_OWNER',
  COMPANY_MEMBER = 'COMPANY_MEMBER',
  ADMIN = 'ADMIN',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ESTIMATED = 'ESTIMATED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
}

export enum PackageStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  ACTIVE = 'ACTIVE',
  EXHAUSTED = 'EXHAUSTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum MaterialCategory {
  CIMENTO = 'CIMENTO',
  AREIA = 'AREIA',
  BRITA = 'BRITA',
  BLOCOS = 'BLOCOS',
  ACO = 'ACO',
  MADEIRA = 'MADEIRA',
  COBERTURA = 'COBERTURA',
  CERAMICA = 'CERAMICA',
  TINTA = 'TINTA',
  TUBOS = 'TUBOS',
  CABOS = 'CABOS',
  EQUIPAMENTOS = 'EQUIPAMENTOS',
  MAO_OBRA = 'MAO_OBRA',
  TRANSPORTE = 'TRANSPORTE',
  OUTROS = 'OUTROS',
}

export class PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
  constructor(message: string, { code, meta }: { code: string; meta?: Record<string, unknown> }) {
    super(message);
    this.name = 'PrismaClientKnownRequestError';
    this.code = code;
    this.meta = meta;
  }
}

export class PrismaClientValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientValidationError';
  }
}

export class PrismaClientInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientInitializationError';
  }
}

export class PrismaClientRustPanicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientRustPanicError';
  }
}

export class PrismaClientUnknownRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaClientUnknownRequestError';
  }
}

export const Prisma = {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
  PrismaClientInitializationError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
};

export class PrismaClient {
  user: any;
  company: any;
  project: any;
  auditLog: any;
  session: any;
  material: any;
  price: any;
  priceHistory: any;
  aiInteraction: any;

  constructor(_options?: any) {
    // Dynamic in-memory mock handler for browser executions
    const createModelHandler = (modelName: string) => {
      const store = new Map<string, any>();

      return {
        findUnique: async ({ where }: { where: any }) => {
          if (where.email) {
            for (const val of store.values()) {
              if (val.email?.toLowerCase() === where.email.toLowerCase()) return { ...val };
            }
          }
          if (where.code) {
            for (const val of store.values()) {
              if (val.code === where.code) return { ...val };
            }
          }
          if (where.id) return store.get(where.id) ? { ...store.get(where.id) } : null;
          return null;
        },
        findFirst: async ({ where }: { where: any }) => {
          if (!where) return Array.from(store.values())[0] || null;
          for (const val of store.values()) {
            let match = true;
            for (const k of Object.keys(where)) {
              if (val[k] !== where[k]) { match = false; break; }
            }
            if (match) return { ...val };
          }
          return null;
        },
        findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
          let items = Array.from(store.values());
          if (where) {
            items = items.filter(item => {
              for (const [k, v] of Object.entries(where)) {
                if (v !== undefined && item[k] !== v) return false;
              }
              return true;
            });
          }
          return items;
        },
        create: async ({ data }: { data: any }) => {
          const id = data.id || `${modelName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const record = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
          store.set(id, record);
          return { ...record };
        },
        update: async ({ where, data }: { where: any; data: any }) => {
          let targetId = where.id;
          if (!targetId && where.email) {
            for (const [k, v] of store.entries()) {
              if (v.email?.toLowerCase() === where.email.toLowerCase()) {
                targetId = k;
                break;
              }
            }
          }
          if (!targetId) return null;
          const existing = store.get(targetId) || {};
          const updated = { ...existing, ...data, updatedAt: new Date() };
          store.set(targetId, updated);
          return { ...updated };
        },
        delete: async ({ where }: { where: any }) => {
          store.delete(where.id);
          return { success: true };
        },
      };
    };

    this.user = createModelHandler('User');
    this.company = createModelHandler('Company');
    this.project = createModelHandler('Project');
    this.auditLog = createModelHandler('AuditLog');
    this.session = createModelHandler('Session');
    this.material = createModelHandler('Material');
    this.price = createModelHandler('Price');
    this.priceHistory = createModelHandler('PriceHistory');
    this.aiInteraction = createModelHandler('AiInteraction');

    // Pre-popula utilizador administrador padrão para testes
    this.user.create({
      data: {
        id: 'usr-admin-01',
        name: 'Admin Kizongelu',
        email: 'admin@kizongelu.ao',
        phone: '+244 923 000 001',
        // Hash bcrypt de 'Admin2026!'
        passwordHash: '$2b$10$Kp0wp9iwG3Clzbq3.7KVdONDdfB83/O9Oq927GgXKsKqvddRTx/32',
        role: UserRole.ADMIN,
      },
    });
  }

  async $connect() { return Promise.resolve(); }
  async $disconnect() { return Promise.resolve(); }
}

export default {
  PrismaClient,
  UserRole,
  ProjectStatus,
  SubscriptionPlan,
  SubscriptionStatus,
};
