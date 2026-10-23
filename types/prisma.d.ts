declare module '@prisma/client' {
  export enum UserRole {
    PARTICULAR = 'PARTICULAR',
    PROFESSIONAL = 'PROFESSIONAL',
    COMPANY_OWNER = 'COMPANY_OWNER',
    COMPANY_ADMIN = 'COMPANY_ADMIN',
    COMPANY_MEMBER = 'COMPANY_MEMBER',
    ADMIN = 'ADMIN',
  }

  export enum ProjectType {
    NOVA = 'NOVA',
    AMPLIACAO = 'AMPLIACAO',
    REMODELACAO = 'REMODELACAO',
    REABILITACAO = 'REABILITACAO',
    MURO = 'MURO',
    ANEXO = 'ANEXO',
    OUTRA = 'OUTRA',
  }

  export enum ProjectStatus {
    DRAFT = 'DRAFT',
    COMPLETED = 'COMPLETED',
    UNLOCKED = 'UNLOCKED',
    ARCHIVED = 'ARCHIVED',
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

  export enum PaymentStatus {
    PENDING = 'PENDING',
    PROOF_RECEIVED = 'PROOF_RECEIVED',
    IN_REVIEW = 'IN_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
  }

  export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    RENEWING = 'RENEWING',
    OVERDUE = 'OVERDUE',
    SUSPENDED = 'SUSPENDED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
  }

  export enum EngineVersionStatus {
    DRAFT = 'DRAFT',
    TESTED = 'TESTED',
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
  }

  export enum ConfidenceLevel {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW',
  }

  export enum NotificationChannel {
    IN_APP = 'IN_APP',
    EMAIL = 'EMAIL',
    PUSH = 'PUSH',
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
  }

  export class PrismaClient {
    constructor(options?: unknown);
    user: any;
    company: any;
    companyMember: any;
    project: any;
    projectInput: any;
    material: any;
    price: any;
    priceHistory: any;
    engineVersion: any;
    formula: any;
    coefficient: any;
    calculation: any;
    calculationItem: any;
    payment: any;
    subscription: any;
    plan: any;
    invoice: any;
    document: any;
    shareLink: any;
    shareAccess: any;
    notification: any;
    auditLog: any;
    session: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction<T = any>(arg: any, options?: any): Promise<T>;
  }
}
