/**
 * @file src/lib/services/admin-data.ts
 * Gestão de dados, estado persistente e auditoria do Painel Administrativo.
 * Suporta:
 * - KPIs e métricas executivas de Angola
 * - Gestão de fórmulas determinísticas e histórico de versões
 * - Gestão de utilizadores e assinaturas empresariais
 * - Definições globais do sistema e dados bancários (transferência bancária / EMIS)
 * - Auditoria com antes/depois (diff) e integridade
 */

export interface FormulaParameter {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string;
  valor: number;
  unidade: string;
  ultimaAlteracao: string;
  autor: string;
  norma: string;
}

export interface FormulaCategory {
  id: string;
  nome: string;
  descricao: string;
  normaReferencia: string;
  parametros: FormulaParameter[];
}

export interface EngineVersion {
  id: string;
  versao: string;
  status: 'ATIVA' | 'ARQUIVADA' | 'RASCUNHO';
  dataLancamento: string;
  responsavel: string;
  descricao: string;
  parametrosCount: number;
  hashSha256: string;
}

export interface AdminUserRecord {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  tipo:
    | 'particular'
    | 'profissional'
    | 'empresa'
    | 'empresa_plus'
    | 'admin'
    | 'company_owner'
    | 'company_admin'
    | 'company_member'
    | 'COMPANY_OWNER'
    | 'COMPANY_ADMIN'
    | 'COMPANY_MEMBER';
  empresa?: string;
  provincia: string;
  registoData: string;
  ultimoAcesso: string;
  estado: 'ATIVO' | 'SUSPENSO' | 'INATIVO';
  orçamentosCount: number;
  totalGastoKz: number;
}

export interface AdminSubscriptionRecord {
  id: string;
  userId: string;
  utilizadorNome: string;
  empresa: string;
  plano: 'particular' | 'profissional' | 'empresa' | 'empresa_plus' | 'admin';
  estado:
    | 'ATIVA'
    | 'ACTIVO'
    | 'PENDENTE'
    | 'EXPIRADA'
    | 'CANCELADA'
    | 'PENDING_PAYMENT'
    | 'ESGOTADO'
    | 'Activo'
    | 'Pendente'
    | 'Em Análise'
    | 'Esgotado'
    | 'Cancelado';
  renovacaoData: string;
  valorMensalKz: number;
  metodoPagamento: 'MULTICAIXA_EXPRESS' | 'TRANSFERENCIA_BANCARIA' | string;
  orçamentosRestantes: number;
  orçamentosUsados?: number;
  totalOrçamentos?: number;
}

export interface EngineCertificationConfig {
  engineerName: string;
  cedulaOEA: string;
  specialty: string;
  organization: string;
  includeInPdf: boolean;
  issuedAt: string;
  expiresAt: string;
  digitalSignatureHash: string;
  notes: string;
}

export const INITIAL_CERTIFICATION_CONFIG: EngineCertificationConfig = {
  engineerName: 'Eng. Arnaldo Silva',
  cedulaOEA: 'OEA N.º 4128/AO',
  specialty: 'Engenharia Civil & Estruturas de Betão Armado',
  organization: 'Ordem dos Engenheiros de Angola (OEA)',
  includeInPdf: true,
  issuedAt: '2026-01-10',
  expiresAt: '2027-01-10',
  digitalSignatureHash: 'SHA256:8f4c2e1b9a7d3f5e0c6b8a2d4e6f8c0b2e4a6c8e0d2f4b6a8c0e2d4f6a8b0c2e',
  notes: 'Conformidade técnica determinística de acordo com as boas práticas de engenharia civil, regulamentos técnicos aplicáveis e Lei dos Contratos Públicos n.º 41/20 de Angola.',
};

export interface AdminSettingsConfig {
  bancoPrincipal: string;
  ibanPrincipal: string;
  titularConta: string;
  nifEmpresa: string;
  bancoSecundario: string;
  ibanSecundario: string;
  codigoEntidadeEmis: string;
  whatsappSuporte: string;
  emailSuporte: string;
  emailFinanceiro: string;
  publicarPrecosPublicamente: boolean;
  moedaPadrao: string;
  taxaIvaPadrao: number;
  bdiPadrao: number;
}

export interface AdminAuditDetail {
  id: string;
  timestamp: string;
  evento: string;
  adminNome: string;
  adminEmail: string;
  gravidade: 'INFO' | 'AVISO' | 'CRITICO';
  descricao: string;
  ip: string;
  userAgent: string;
  hashSha256: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

// =========================================================================
// VALORES INICIAIS BASEADOS NA ENGENHARIA DE ANGOLA (LNEC / REGULAMENTOS TÉCNICOS APLICÁVEIS)
// =========================================================================

export const INITIAL_FORMULA_CATEGORIES: FormulaCategory[] = [
  {
    id: 'alvenaria',
    nome: 'Alvenaria de Elevação',
    descricao: 'Consumos de blocos de betão, argamassas e juntas para o mercado angolano.',
    normaReferencia: 'NP EN 771-3',
    parametros: [
      {
        id: 'alv_bloco_15_qtd',
        categoriaId: 'alvenaria',
        nome: 'Consumo Bloco 15x20x40 por m²',
        descricao: 'Quantidade padrão de blocos por metro quadrado de parede simples.',
        valor: 12.5,
        unidade: 'un/m²',
        ultimaAlteracao: '15/03/2026',
        autor: 'Admin Kizongelu',
        norma: 'NP EN 771-3',
      },
      {
        id: 'alv_bloco_perda',
        categoriaId: 'alvenaria',
        nome: 'Índice de Quebra Normativo (Blocos)',
        descricao: 'Margem técnica para manuseamento, corte e transporte em obra.',
        valor: 5.0,
        unidade: '%',
        ultimaAlteracao: '10/02/2026',
        autor: 'Admin Kizongelu',
        norma: 'Prática Construtiva Angola',
      },
      {
        id: 'alv_argamassa_vol',
        categoriaId: 'alvenaria',
        nome: 'Volume de Argamassa por m²',
        descricao: 'Argamassa traço 1:4 para assentamento de juntas de 1.5cm.',
        valor: 0.022,
        unidade: 'm³/m²',
        ultimaAlteracao: '20/01/2026',
        autor: 'Admin Kizongelu',
        norma: 'Boas Práticas de Engenharia',
      },
    ],
  },
  {
    id: 'betao_armado',
    nome: 'Betão Armado Estrutural (C25/30)',
    descricao: 'Coeficientes para sapatas, pilares, vigas e lajes com cimento 42.5R.',
    normaReferencia: 'Regulamentos Técnicos Aplicáveis / NP EN 206-1',
    parametros: [
      {
        id: 'bet_cimento_c25',
        categoriaId: 'betao_armado',
        nome: 'Dosagem Cimento C25/30',
        descricao: 'Quilos de cimento Portland 42.5R por metro cúbico de betão estrutural.',
        valor: 350.0,
        unidade: 'kg/m³',
        ultimaAlteracao: '01/03/2026',
        autor: 'Eng. Arnaldo Silva',
        norma: 'Regulamentos Técnicos Aplicáveis Art. 18º',
      },
      {
        id: 'bet_aco_medio',
        categoriaId: 'betao_armado',
        nome: 'Taxa de Armadura Média (A500NR)',
        descricao: 'Consumo ponderado de varão nervurado por metro cúbico de elemento.',
        valor: 95.0,
        unidade: 'kg/m³',
        ultimaAlteracao: '18/02/2026',
        autor: 'Eng. Arnaldo Silva',
        norma: 'Regulamentos Técnicos Aplicáveis Anexo II',
      },
      {
        id: 'bet_cofragem_reuso',
        categoriaId: 'betao_armado',
        nome: 'Fator de Reutilização de Cofragem',
        descricao: 'Número médio de aproveitamentos da madeira e contraplacado marítimo.',
        valor: 3.5,
        unidade: 'ciclos',
        ultimaAlteracao: '14/01/2026',
        autor: 'Admin Kizongelu',
        norma: 'Eficiência de Material',
      },
    ],
  },
  {
    id: 'pavimentos',
    nome: 'Pavimentos e Revestimentos',
    descricao: 'Consumos para betonilhas, cerâmica, reboco e regularização de solos.',
    normaReferencia: 'NP EN 12004',
    parametros: [
      {
        id: 'pav_betonilha_espessura',
        categoriaId: 'pavimentos',
        nome: 'Espessura Média de Betonilha',
        descricao: 'Camada de regularização para assentamento de acabamentos.',
        valor: 4.0,
        unidade: 'cm',
        ultimaAlteracao: '01/02/2026',
        autor: 'Eng. Arnaldo Silva',
        norma: 'NP EN 13813',
      },
      {
        id: 'pav_cimento_cola',
        categoriaId: 'pavimentos',
        nome: 'Rendimento Cimento-Cola C2TE',
        descricao: 'Consumo por m² em dupla colagem para cerâmica e porcelanato.',
        valor: 5.5,
        unidade: 'kg/m²',
        ultimaAlteracao: '25/01/2026',
        autor: 'Eng. Arnaldo Silva',
        norma: 'NP EN 12004',
      },
    ],
  },
  {
    id: 'coberturas',
    nome: 'Estruturas de Cobertura',
    descricao: 'Estrutura de madeira ou metálica leve e chapas IBR / telha cerâmica.',
    normaReferencia: 'Eurocódigo 5 / Regulamento Geral',
    parametros: [
      {
        id: 'cob_chapa_ibr_sobreposicao',
        categoriaId: 'coberturas',
        nome: 'Fator de Sobreposição Chapa IBR',
        descricao: 'Margem para sobreposição longitudinal e transversal de chapa 0.5mm.',
        valor: 15.0,
        unidade: '%',
        ultimaAlteracao: '12/02/2026',
        autor: 'Eng. Teresa Van-Dúnem',
        norma: 'Manual de Aplicação IBR',
      },
      {
        id: 'cob_madeira_vigamento',
        categoriaId: 'coberturas',
        nome: 'Consumo Médio Madeira Pinho por m²',
        descricao: 'Vigamento e ripas para sustentação da cobertura inclinada.',
        valor: 0.028,
        unidade: 'm³/m²',
        ultimaAlteracao: '10/01/2026',
        autor: 'Eng. Teresa Van-Dúnem',
        norma: 'EC5 Angola',
      },
    ],
  },
  {
    id: 'mao_de_obra_bdi',
    nome: 'Mão de Obra e BDI Angola',
    descricao: 'Rendimentos em homem-hora (hh) e margem de BDI (Benefícios e Despesas Indiretas).',
    normaReferencia: 'Boas Práticas Técnicas',
    parametros: [
      {
        id: 'mo_pedreiro_alvenaria',
        categoriaId: 'mao_de_obra_bdi',
        nome: 'Rendimento Pedreiro Alvenaria',
        descricao: 'Horas gastas por oficial pedreiro para assentar 1 m² de alvenaria.',
        valor: 0.85,
        unidade: 'hh/m²',
        ultimaAlteracao: '10/03/2026',
        autor: 'Equipa Técnica Kizongelu',
        norma: 'Tabela OEA',
      },
      {
        id: 'mo_servente_proporcao',
        categoriaId: 'mao_de_obra_bdi',
        nome: 'Proporção Servente / Pedreiro',
        descricao: 'Tempo de apoio logístico e amassamento por homem-hora de pedreiro.',
        valor: 0.70,
        unidade: 'hh/hh',
        ultimaAlteracao: '10/03/2026',
        autor: 'Equipa Técnica Kizongelu',
        norma: 'Tabela OEA',
      },
      {
        id: 'bdi_taxa_padrao',
        categoriaId: 'mao_de_obra_bdi',
        nome: 'BDI Geral Recomendado para Angola',
        descricao: 'Taxa para custos administrativos, seguros, inflação e margem líquida.',
        valor: 25.0,
        unidade: '%',
        ultimaAlteracao: '28/02/2026',
        autor: 'Conselho de Engenharia',
        norma: 'Prática de Mercado Luanda',
      },
    ],
  },
];

export const INITIAL_ENGINE_VERSIONS: EngineVersion[] = [
  {
    id: 'ver_2_4',
    versao: 'v2.4 (Edição 2026)',
    status: 'ATIVA',
    dataLancamento: '2026-03-01 08:00',
    responsavel: 'Admin Kizongelu (Chefe Técnico)',
    descricao: 'Actualização determinística com novos ensaios técnicos para agregados de Luanda e coeficientes de inflação do BNA.',
    parametrosCount: 14,
    hashSha256: 'e8f7a19c5b2049d18e77a1024bc6810a9f3b8c2d119045',
  },
  {
    id: 'ver_2_3',
    versao: 'v2.3 (Fev 2026)',
    status: 'ARQUIVADA',
    dataLancamento: '2026-02-01 10:30',
    responsavel: 'Eng. Arnaldo Silva',
    descricao: 'Ajuste de rendimentos de mão de obra para províncias costeiras (Benguela e Cuanza Sul).',
    parametrosCount: 14,
    hashSha256: '9a10b42c88f117d91e604721a7c55018f2d41a99014231',
  },
  {
    id: 'ver_2_2',
    versao: 'v2.2 (Jan 2026)',
    status: 'ARQUIVADA',
    dataLancamento: '2026-01-05 09:00',
    responsavel: 'Eng. Teresa Van-Dúnem',
    descricao: 'Versão inicial de calibração do motor determinístico em Luanda.',
    parametrosCount: 12,
    hashSha256: '44d9f82100e47b33a189025178f244199c10447a889102',
  },
];

export const INITIAL_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'user-admin-01',
    nome: 'Admin Kizongelu',
    email: 'admin@kizongelu.ao',
    telefone: '+244 922 000 111',
    tipo: 'admin',
    provincia: 'Luanda',
    registoData: '2026-01-01',
    ultimoAcesso: 'Hoje às 10:15',
    estado: 'ATIVO',
    orçamentosCount: 42,
    totalGastoKz: 0,
  },
  {
    id: 'usr_manuel_kiala',
    nome: 'Manuel Kiala',
    email: 'manuel.kiala@exemplo.ao',
    telefone: '+244 912 345 678',
    tipo: 'particular',
    provincia: 'Luanda',
    registoData: '2026-02-14',
    ultimoAcesso: 'Há 15 minutos',
    estado: 'ATIVO',
    orçamentosCount: 2,
    totalGastoKz: 54000,
  },
  {
    id: 'usr_arnaldo_silva',
    nome: 'Eng. Arnaldo Silva',
    email: 'arnaldo.silva@engenharia.ao',
    telefone: '+244 923 456 789',
    tipo: 'profissional',
    provincia: 'Benguela',
    registoData: '2026-01-20',
    ultimoAcesso: 'Há 2 horas',
    estado: 'ATIVO',
    orçamentosCount: 14,
    totalGastoKz: 180000,
  },
  {
    id: 'usr_carlos_neto',
    nome: 'Carlos Neto',
    email: 'carlos.neto@engenharia.ao',
    telefone: '+244 931 000 222',
    tipo: 'empresa_plus',
    empresa: 'Maianga Gestão Imobiliária',
    provincia: 'Luanda',
    registoData: '2026-01-08',
    ultimoAcesso: 'Hoje às 08:30',
    estado: 'ATIVO',
    orçamentosCount: 38,
    totalGastoKz: 855000,
  },
  {
    id: 'usr_teresa_vandunem',
    nome: 'Dra. Teresa Van-Dúnem',
    email: 'teresa.vandunem@construtora.ao',
    telefone: '+244 924 555 888',
    tipo: 'empresa',
    empresa: 'Imobiliária Chela Sul Lda',
    provincia: 'Huíla',
    registoData: '2026-02-01',
    ultimoAcesso: 'Ontem às 17:20',
    estado: 'ATIVO',
    orçamentosCount: 9,
    totalGastoKz: 285000,
  },
  {
    id: 'usr_antonio_kamba',
    nome: 'Dr. António Kamba',
    email: 'antonio.kamba@kambas.ao',
    telefone: '+244 923 555 666',
    tipo: 'company_owner',
    empresa: 'Construções Kambas Lda',
    provincia: 'Luanda',
    registoData: '2026-01-15',
    ultimoAcesso: 'Hoje às 11:05',
    estado: 'ATIVO',
    orçamentosCount: 18,
    totalGastoKz: 450000,
  },
  {
    id: 'usr_paulo_matamba',
    nome: 'Eng. Paulo Matamba',
    email: 'paulo.matamba@kambas.ao',
    telefone: '+244 919 777 444',
    tipo: 'company_member',
    empresa: 'Construções Kambas Lda',
    provincia: 'Luanda',
    registoData: '2026-02-05',
    ultimoAcesso: 'Ontem às 15:40',
    estado: 'ATIVO',
    orçamentosCount: 5,
    totalGastoKz: 0,
  },
  {
    id: 'usr_mateus_dala',
    nome: 'Mateus Dala',
    email: 'mateus.dala@gmail.com',
    telefone: '+244 945 111 333',
    tipo: 'particular',
    provincia: 'Cabinda',
    registoData: '2026-03-05',
    ultimoAcesso: 'Há 3 dias',
    estado: 'SUSPENSO',
    orçamentosCount: 1,
    totalGastoKz: 15000,
  },
  {
    id: 'usr_inativo_teste',
    nome: 'Afonso Bernardo',
    email: 'afonso.bernardo@antigo.ao',
    telefone: '+244 911 222 333',
    tipo: 'particular',
    provincia: 'Huambo',
    registoData: '2025-11-10',
    ultimoAcesso: 'Há 5 meses',
    estado: 'INATIVO',
    orçamentosCount: 0,
    totalGastoKz: 0,
  },
];

export const INITIAL_ADMIN_SUBSCRIPTIONS: AdminSubscriptionRecord[] = [
  {
    id: 'sub_001',
    userId: 'usr_carlos_neto',
    utilizadorNome: 'Carlos Neto',
    empresa: 'Maianga Gestão Imobiliária',
    plano: 'empresa_plus',
    estado: 'Activo',
    renovacaoData: '15 Out 2026',
    valorMensalKz: 49999,
    metodoPagamento: 'TRANSFERENCIA_BANCARIA',
    orçamentosUsados: 0,
    orçamentosRestantes: 12,
    totalOrçamentos: 12,
  },
  {
    id: 'sub_002',
    userId: 'usr_teresa_vandunem',
    utilizadorNome: 'Dra. Teresa Van-Dúnem',
    empresa: 'Imobiliária Chela Sul Lda',
    plano: 'empresa',
    estado: 'Activo',
    renovacaoData: '20 Abr 2026',
    valorMensalKz: 29999,
    metodoPagamento: 'MULTICAIXA_EXPRESS',
    orçamentosUsados: 0,
    orçamentosRestantes: 6,
    totalOrçamentos: 6,
  },
  {
    id: 'sub_003',
    userId: 'usr_arnaldo_silva',
    utilizadorNome: 'Eng. Arnaldo Silva',
    empresa: 'AS Engenharia & Fiscalização',
    plano: 'profissional',
    estado: 'Activo',
    renovacaoData: '05 Abr 2026',
    valorMensalKz: 15999,
    metodoPagamento: 'MULTICAIXA_EXPRESS',
    orçamentosUsados: 0,
    orçamentosRestantes: 3,
    totalOrçamentos: 3,
  },
  {
    id: 'sub_004',
    userId: 'usr_manuel_kiala',
    utilizadorNome: 'Manuel Kiala',
    empresa: 'Particular (Avulso)',
    plano: 'particular',
    estado: 'Activo',
    renovacaoData: 'Vitalício',
    valorMensalKz: 12999,
    metodoPagamento: 'MULTICAIXA_EXPRESS',
    orçamentosUsados: 0,
    orçamentosRestantes: 1,
    totalOrçamentos: 1,
  },
  {
    id: 'sub_admin',
    userId: 'user-admin-01',
    utilizadorNome: 'Admin Kizongelu',
    empresa: 'Kizongelu Gestão do Sistema',
    plano: 'admin',
    estado: 'Activo',
    renovacaoData: 'Vitalício',
    valorMensalKz: 0,
    metodoPagamento: 'INTERNO',
    orçamentosUsados: 42,
    orçamentosRestantes: 999999,
    totalOrçamentos: 999999,
  },
  {
    id: 'sub_005',
    userId: 'usr_mateus_dala',
    utilizadorNome: 'Eng. Mateus Dala',
    empresa: 'Construções Bengo Lda',
    plano: 'empresa',
    estado: 'PENDING_PAYMENT',
    renovacaoData: 'Hoje, 14:22',
    valorMensalKz: 29999,
    metodoPagamento: 'TRANSFERENCIA_BANCARIA',
    orçamentosUsados: 0,
    orçamentosRestantes: 6,
    totalOrçamentos: 6,
  },
];

export const INITIAL_ADMIN_SETTINGS: AdminSettingsConfig = {
  bancoPrincipal: 'Banco Comercial (Angola)',
  ibanPrincipal: 'AO06 0040 0000 4892 1042 1014 9',
  titularConta: 'Kizongelu',
  nifEmpresa: '',
  bancoSecundario: 'Banco de Apoio Comercial',
  ibanSecundario: 'AO06 0006 0000 1289 4501 1012 3',
  codigoEntidadeEmis: '00412',
  whatsappSuporte: '+244 923 000 000',
  emailSuporte: 'suporte@kizongelu.ao',
  emailFinanceiro: 'financeiro@kizongelu.ao',
  publicarPrecosPublicamente: true,
  moedaPadrao: 'Kwanza Angolano (Kz - AOA)',
  taxaIvaPadrao: 14.0,
  bdiPadrao: 25.0,
};

export const INITIAL_AUDIT_LOGS: AdminAuditDetail[] = [
  {
    id: 'aud_100',
    timestamp: '2026-09-24 14:10:05',
    evento: 'PAYMENT_APPROVED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'INFO',
    descricao: 'Aprovação de pagamento de 27.000 Kz para Moradia T3 no Kilamba (Ref: KZ-2026-4401).',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: 'a1b2c3d4e5f67890123456789abcdef01234',
    before: { status: 'PENDING_APPROVAL', valorKz: 27000 },
    after: { status: 'APPROVED', valorKz: 27000, pdfReady: true },
  },
  {
    id: 'aud_99',
    timestamp: '2026-09-24 13:20:15',
    evento: 'PAYMENT_APPROVED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'INFO',
    descricao: 'Aprovação de pagamento de 27.000 Kz para Vivenda T4 no Talatona (Ref: KZ-2026-4389).',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: 'f1e2d3c4b5a67890123456789fedcba01234',
    before: { status: 'PENDING_APPROVAL', valorKz: 27000 },
    after: { status: 'APPROVED', valorKz: 27000, pdfReady: true },
  },
  {
    id: 'aud_101',
    timestamp: '2026-09-24 12:15:30',
    evento: 'PAYMENT_APPROVED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'INFO',
    descricao: 'Aprovação financeira de 29.999 Kz (Ref: KZ-2026-5512) para Talatona 120m (Empresa).',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: 'b4a8e234c91038e9281a0e71940b5f102941',
    before: { status: 'PENDING_APPROVAL', projectLocked: true },
    after: { status: 'APPROVED', projectLocked: false, pdfReady: true },
  },
  {
    id: 'aud_102',
    timestamp: '2026-09-24 11:40:12',
    evento: 'PRICE_UPDATED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'AVISO',
    descricao: 'Actualização do preço de Cimento Portland CEM II 42.5R de 4.600 Kz para 4.850 Kz em Luanda.',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: 'c901a884f10248e7192a01948bc501e48201',
    before: { codigo: 'MAT-CIM-01', precoUnitarioKz: 4600, província: 'Luanda' },
    after: { codigo: 'MAT-CIM-01', precoUnitarioKz: 4850, província: 'Luanda' },
  },
  {
    id: 'aud_103',
    timestamp: '2026-09-24 10:20:00',
    evento: 'ENGINE_VERSION_ACTIVATED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'CRITICO',
    descricao: 'Activação oficial da versão v2.4 (Edição 2026) do motor determinístico de engenharia.',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: '992a0b4e810237e8194a02938fc601e83910',
    before: { versaoAtiva: 'v2.3 (Fev 2026)' },
    after: { versaoAtiva: 'v2.4 (Edição 2026)', data: '2026-03-01' },
  },
  {
    id: 'aud_104',
    timestamp: '2026-09-24 09:12:45',
    evento: 'USER_ROLE_CHANGED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'AVISO',
    descricao: 'Promoção de conta de Carlos Neto de "Empresa" para "Empresa Plus" (12 orçamentos).',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: '3819a0bc481029e8192a03948bc601e89102',
    before: { userId: 'usr_carlos_neto', role: 'empresa', orcamentos: 6 },
    after: { userId: 'usr_carlos_neto', role: 'empresa_plus', orcamentos: 12 },
  },
  {
    id: 'aud_105',
    timestamp: '2026-09-24 08:30:00',
    evento: 'SETTINGS_UPDATED',
    adminNome: 'Admin Kizongelu',
    adminEmail: 'admin@kizongelu.ao',
    gravidade: 'INFO',
    descricao: 'Actualização do contacto de WhatsApp de suporte para +244 923 000 000.',
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    hashSha256: '1049a8bc481029e8192a01948bc601e77102',
    before: { whatsappSuporte: '+244 923 000 111' },
    after: { whatsappSuporte: '+244 923 000 000' },
  },
];

// =========================================================================
// GESTÃO PERSISTENTE NO LOCALSTORAGE (SINGLETON REATIVO)
// =========================================================================

export class AdminDataService {
  private static inMemoryFallback = new Map<string, any>();

  private static getStorage<T>(key: string, defaultVal: T): T {
    if (typeof window === 'undefined' || !window.localStorage) {
      if (this.inMemoryFallback.has(key)) {
        return this.inMemoryFallback.get(key) as T;
      }
      return defaultVal;
    }
    try {
      const stored = window.localStorage.getItem(`Kizongelu_admin_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private static setStorage<T>(key: string, val: T): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      this.inMemoryFallback.set(key, val);
      return;
    }
    try {
      window.localStorage.setItem(`Kizongelu_admin_${key}`, JSON.stringify(val));
    } catch (e) {
      console.warn('Erro ao guardar no localStorage:', e);
    }
  }

  // AUDITORIA
  static getAuditLogs(): AdminAuditDetail[] {
    const list = this.getStorage<AdminAuditDetail[]>('audit_logs', INITIAL_AUDIT_LOGS);
    return list.map((log) => ({
      ...log,
      adminNome: (log.adminNome || '')
        .replace(/Manuel Moisés/gi, 'Admin Kizongelu')
        .replace(/Administrador Kizongelu/gi, 'Admin Kizongelu'),
      adminEmail: (log.adminEmail || '').replace(/manuelmoises\.darangola@gmail\.com/gi, 'admin@kizongelu.ao'),
      descricao: (log.descricao || '')
        .replace(/Cimento Caxito 42\.5R/g, 'Cimento Portland CEM II 42.5R')
        .replace(/Cimento Caxito/g, 'Cimento Portland CEM II')
        .replace(/motor determinístico LNEC\.?/gi, 'motor determinístico.')
        .replace(/Atualização/g, 'Actualização')
        .replace(/Ativação/g, 'Activação')
        .replace(/de ['"]?empresa['"]? para ['"]?empresa_plus['"]? \((?:30|12) orçamentos\)/gi, 'de "Empresa" para "Empresa Plus" (12 orçamentos)')
        .replace(/\(30 orçamentos\)/gi, '(12 orçamentos)'),
    }));
  }

  static recordAudit(entry: Omit<AdminAuditDetail, 'id' | 'timestamp' | 'hashSha256'>): AdminAuditDetail {
    const logs = this.getAuditLogs();
    const newEntry: AdminAuditDetail = {
      ...entry,
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      hashSha256: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    };
    logs.unshift(newEntry);
    this.setStorage('audit_logs', logs.slice(0, 150));
    return newEntry;
  }

  // FÓRMULAS
  static getFormulaCategories(): FormulaCategory[] {
    const list = this.getStorage<FormulaCategory[]>('formula_categories', INITIAL_FORMULA_CATEGORIES);
    return list.map((cat) => ({
      ...cat,
      normaReferencia: cat.normaReferencia
        .replace('LNEC E-196 / NP EN 771-3', 'NP EN 771-3')
        .replace('NP EN 12004 / LNEC', 'NP EN 12004')
        .replace('Tabela de Boas Práticas de Engenharia', 'Boas Práticas Técnicas')
        .replace(/\/?\s*LNEC/gi, '')
        .trim(),
      parametros: cat.parametros.map((p) => {
        let norma = p.norma;
        if (p.id === 'bet_cofragem_reuso' && norma === 'Cálculo de BDI') {
          norma = 'Eficiência de Material';
        }
        let ultimaAlteracao = p.ultimaAlteracao;
        if (ultimaAlteracao && ultimaAlteracao.includes('-')) {
          const parts = ultimaAlteracao.split('-');
          if (parts.length === 3 && parts[0].length === 4) {
            ultimaAlteracao = `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
        }
        return {
          ...p,
          norma,
          ultimaAlteracao,
          autor: p.autor.replace(/Eng\.\s*Manuel Moisés/gi, 'Admin Kizongelu'),
        };
      }),
    }));
  }

  static saveFormulaCategories(categories: FormulaCategory[], adminName: string, adminEmail: string): void {
    const prev = this.getFormulaCategories();
    this.setStorage('formula_categories', categories);

    this.recordAudit({
      evento: 'FORMULA_PARAMETERS_UPDATED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Actualização de parâmetros determinísticos nas fórmulas de engenharia.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { totalCategorias: prev.length },
      after: { totalCategorias: categories.length, data: new Date().toISOString() },
    });
  }

  // VERSÕES DO MOTOR
  static getEngineVersions(): EngineVersion[] {
    return this.getStorage<EngineVersion[]>('engine_versions', INITIAL_ENGINE_VERSIONS);
  }

  static createNewVersion(params: {
    versao: string;
    descricao: string;
    responsavel: string;
    adminEmail: string;
  }): EngineVersion {
    const versions = this.getEngineVersions();
    const newVer: EngineVersion = {
      id: `ver_${Date.now()}`,
      versao: params.versao,
      status: 'RASCUNHO',
      dataLancamento: new Date().toISOString().replace('T', ' ').substring(0, 16),
      responsavel: params.responsavel,
      descricao: params.descricao,
      parametrosCount: 14,
      hashSha256: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    };
    versions.unshift(newVer);
    this.setStorage('engine_versions', versions);

    this.recordAudit({
      evento: 'ENGINE_VERSION_CREATED',
      adminNome: params.responsavel,
      adminEmail: params.adminEmail,
      gravidade: 'INFO',
      descricao: `Criação da versão rascunho ${params.versao} do motor determinístico.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      after: { novaVersao: params.versao, status: 'RASCUNHO' },
    });

    return newVer;
  }

  static activateVersion(versionId: string, adminName: string, adminEmail: string): void {
    const versions = this.getEngineVersions();
    const target = versions.find((v) => v.id === versionId);
    if (!target) return;

    const prevActive = versions.find((v) => v.status === 'ATIVA');

    const updated = versions.map((v) => {
      if (v.id === versionId) return { ...v, status: 'ATIVA' as const };
      if (v.status === 'ATIVA') return { ...v, status: 'ARQUIVADA' as const };
      return v;
    });

    this.setStorage('engine_versions', updated);

    this.recordAudit({
      evento: 'ENGINE_VERSION_ACTIVATED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'CRITICO',
      descricao: `Activação da versão ${target.versao} do motor determinístico (Versão anterior ${prevActive?.versao || 'N/A'} arquivada).`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { versaoAtiva: prevActive?.versao },
      after: { versaoAtiva: target.versao },
    });
  }

  // UTILIZADORES
  static getUsers(): AdminUserRecord[] {
    const list = this.getStorage<AdminUserRecord[]>('users', INITIAL_ADMIN_USERS);
    const sanitized = list
      .filter((u, _, arr) => {
        // If there's already an admin@kizongelu.ao, remove any duplicate personal admin account
        if (u.email === 'manuelmoises.darangola@gmail.com') {
          return !arr.some((other) => other.email === 'admin@kizongelu.ao');
        }
        return true;
      })
      .map((u) => {
        const updated = { ...u };
        if (updated.id === 'usr_sebastiao_mendes') {
          updated.id = 'usr_manuel_kiala';
          updated.nome = 'Manuel Kiala';
          updated.email = 'manuel.kiala@exemplo.ao';
        }
        if (updated.email === 'manuelmoises.darangola@gmail.com') {
          updated.email = 'admin@kizongelu.ao';
        }
        if (updated.id === 'usr_carlos_neto' && !updated.empresa) {
          updated.empresa = 'Maianga Gestão Imobiliária';
        }
        if (updated.id === 'usr_teresa_vandunem' && !updated.empresa) {
          updated.empresa = 'Imobiliária Chela Sul Lda';
        }
        return updated;
      });

    // Ensure company_owner and company_member from INITIAL_ADMIN_USERS are available
    INITIAL_ADMIN_USERS.forEach((initUser) => {
      if (!sanitized.some((u) => u.id === initUser.id)) {
        sanitized.push(initUser);
      }
    });

    return sanitized;
  }

  static updateUserRole(
    userId: string,
    newRole: AdminUserRecord['tipo'],
    motivo: string,
    adminName: string,
    adminEmail: string
  ): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const oldRole = user.tipo;
    const updated = users.map((u) => (u.id === userId ? { ...u, tipo: newRole } : u));
    this.setStorage('users', updated);

    this.recordAudit({
      evento: 'USER_ROLE_CHANGED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Alteração de papel do utilizador ${user.nome} de "${oldRole}" para "${newRole}". Motivo: ${motivo}`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { userId, role: oldRole },
      after: { userId, role: newRole, motivo },
    });
  }

  static toggleUserStatus(userId: string, adminName: string, adminEmail: string): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const newStatus: AdminUserRecord['estado'] = user.estado === 'ATIVO' ? 'SUSPENSO' : 'ATIVO';
    const updated = users.map((u) => (u.id === userId ? { ...u, estado: newStatus } : u));
    this.setStorage('users', updated);

    this.recordAudit({
      evento: newStatus === 'SUSPENSO' ? 'USER_DEACTIVATED' : 'USER_ACTIVATED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: newStatus === 'SUSPENSO' ? 'AVISO' : 'INFO',
      descricao: `Estado da conta de ${user.nome} alterado para ${newStatus}.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { userId, estado: user.estado },
      after: { userId, estado: newStatus },
    });
  }

  // ASSINATURAS / PACOTES
  static getSubscriptions(): AdminSubscriptionRecord[] {
    const list = this.getStorage<AdminSubscriptionRecord[]>('subscriptions', INITIAL_ADMIN_SUBSCRIPTIONS);
    const officialPrices: Record<string, number> = {
      empresa_plus: 49999,
      empresa: 29999,
      profissional: 15999,
      particular: 12999,
    };
    const officialTotals: Record<string, number> = {
      empresa_plus: 12,
      empresa: 6,
      profissional: 3,
      particular: 1,
    };

    const mapped = list.map((item) => {
      const updatedItem = { ...item };
      if (updatedItem.userId === 'usr_sebastiao_mendes') {
        updatedItem.utilizadorNome = 'Eng. João Baptista';
        updatedItem.userId = 'usr_joao_baptista';
      }
      if (updatedItem.plano && officialPrices[updatedItem.plano]) {
        updatedItem.valorMensalKz = officialPrices[updatedItem.plano];
      }

      // Normalização dos valores específicos dos 4 perfis oficiais
      if (updatedItem.id === 'sub_001') {
        updatedItem.empresa = 'Maianga Gestão Imobiliária';
        updatedItem.utilizadorNome = 'Carlos Neto';
        updatedItem.userId = 'usr_carlos_neto';
        updatedItem.plano = 'empresa_plus';
        updatedItem.orçamentosUsados = 0;
        updatedItem.totalOrçamentos = 12;
        updatedItem.orçamentosRestantes = 12;
        updatedItem.renovacaoData = 'Vitalício';
      } else if (updatedItem.id === 'sub_002') {
        updatedItem.empresa = 'Imobiliária Chela Sul Lda';
        updatedItem.utilizadorNome = 'Dra. Teresa Van-Dúnem';
        updatedItem.userId = 'usr_teresa_vandunem';
        updatedItem.plano = 'empresa';
        updatedItem.orçamentosUsados = 0;
        updatedItem.totalOrçamentos = 6;
        updatedItem.orçamentosRestantes = 6;
        updatedItem.renovacaoData = 'Vitalício';
      } else if (updatedItem.id === 'sub_003') {
        updatedItem.empresa = 'AS Engenharia & Fiscalização';
        updatedItem.utilizadorNome = 'Eng. Arnaldo Silva';
        updatedItem.userId = 'usr_arnaldo_silva';
        updatedItem.plano = 'profissional';
        updatedItem.orçamentosUsados = 0;
        updatedItem.totalOrçamentos = 3;
        updatedItem.orçamentosRestantes = 3;
        updatedItem.renovacaoData = 'Vitalício';
      } else if (updatedItem.id === 'sub_004') {
        updatedItem.empresa = 'Particular (Avulso)';
        updatedItem.utilizadorNome = 'Manuel Kiala';
        updatedItem.userId = 'usr_manuel_kiala';
        updatedItem.plano = 'particular';
        updatedItem.orçamentosUsados = 0;
        updatedItem.totalOrçamentos = 1;
        updatedItem.orçamentosRestantes = 1;
        updatedItem.renovacaoData = 'Vitalício';
      } else if (updatedItem.id === 'sub_005' || updatedItem.empresa.includes('Luanda Sul') || updatedItem.empresa.includes('Bengo')) {
        updatedItem.id = 'sub_005';
        updatedItem.userId = 'usr_mateus_dala';
        updatedItem.utilizadorNome = 'Eng. Mateus Dala';
        updatedItem.empresa = 'Construções Bengo Lda';
        updatedItem.plano = 'empresa';
        if (updatedItem.estado !== 'Activo') {
          updatedItem.estado = 'PENDING_PAYMENT';
        }
        updatedItem.renovacaoData = 'Hoje, 14:22';
        updatedItem.valorMensalKz = 29999;
        updatedItem.metodoPagamento = 'TRANSFERENCIA_BANCARIA';
        updatedItem.orçamentosUsados = 0;
        updatedItem.totalOrçamentos = 6;
        updatedItem.orçamentosRestantes = 6;
      }

      if (updatedItem.totalOrçamentos === undefined && updatedItem.plano) {
        updatedItem.totalOrçamentos = officialTotals[updatedItem.plano] || 1;
      }

      return updatedItem;
    });

    if (!mapped.some((s) => s.id === 'sub_005' || s.empresa === 'Construções Bengo Lda')) {
      mapped.push({
        id: 'sub_005',
        userId: 'usr_mateus_dala',
        utilizadorNome: 'Eng. Mateus Dala',
        empresa: 'Construções Bengo Lda',
        plano: 'empresa',
        estado: 'PENDING_PAYMENT',
        renovacaoData: 'Hoje, 14:22',
        valorMensalKz: 29999,
        metodoPagamento: 'TRANSFERENCIA_BANCARIA',
        orçamentosUsados: 0,
        orçamentosRestantes: 6,
        totalOrçamentos: 6,
      });
    }

    return mapped;
  }

  static approveSubscription(subId: string, adminName: string, adminEmail: string): void {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return;

    const updated = subs.map((s) =>
      s.id === subId ? { ...s, estado: 'Activo' as const } : s
    );
    this.setStorage('subscriptions', updated);

    this.recordAudit({
      evento: 'SUBSCRIPTION_APPROVED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'INFO',
      descricao: `Aprovado pacote e comprovativo de transferência bancária da empresa ${sub.empresa}.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { subId, estado: sub.estado },
      after: { subId, estado: 'Activo' },
    });
  }

  static rejectSubscription(subId: string, motivo: string, adminName: string, adminEmail: string): void {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return;

    const updated = subs.map((s) =>
      s.id === subId ? { ...s, estado: 'Cancelado' as const } : s
    );
    this.setStorage('subscriptions', updated);

    this.recordAudit({
      evento: 'SUBSCRIPTION_REJECTED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Rejeitado comprovativo de pagamento da empresa ${sub.empresa}. Motivo: ${motivo}`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { subId, estado: sub.estado },
      after: { subId, estado: 'Cancelado', motivo },
    });
  }

  static updateSubscriptionPlan(
    subId: string,
    newPlan: AdminSubscriptionRecord['plano'],
    motivo: string,
    adminName: string,
    adminEmail: string
  ): void {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return;

    const oldPlan = sub.plano;
    const planPrices: Record<AdminSubscriptionRecord['plano'], number> = {
      particular: 12999,
      profissional: 15999,
      empresa: 29999,
      empresa_plus: 49999,
      admin: 0,
    };
    const planBudgets: Record<AdminSubscriptionRecord['plano'], number> = {
      particular: 1,
      profissional: 3,
      empresa: 6,
      empresa_plus: 12,
      admin: 999999,
    };

    const updated = subs.map((s) =>
      s.id === subId
        ? {
            ...s,
            plano: newPlan,
            valorMensalKz: planPrices[newPlan],
            totalOrçamentos: planBudgets[newPlan],
            orçamentosRestantes: planBudgets[newPlan],
            orçamentosUsados: 0,
          }
        : s
    );
    this.setStorage('subscriptions', updated);

    this.recordAudit({
      evento: 'SUBSCRIPTION_PLAN_MODIFIED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Plano da empresa ${sub.empresa} alterado de "${oldPlan}" para "${newPlan}". Motivo: ${motivo}`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { subId, plano: oldPlan, valorKz: sub.valorMensalKz },
      after: { subId, plano: newPlan, valorKz: planPrices[newPlan], motivo },
    });
  }

  static extendSubscription(subId: string, days: number, adminName: string, adminEmail: string): void {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return;

    const prevDate = sub.renovacaoData;
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    const newDateStr = newDate.toISOString().substring(0, 10);

    const updated = subs.map((s) => (s.id === subId ? { ...s, renovacaoData: newDateStr, estado: 'ATIVA' as const } : s));
    this.setStorage('subscriptions', updated);

    this.recordAudit({
      evento: 'SUBSCRIPTION_EXTENDED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'INFO',
      descricao: `Extensão do período de subscrição de ${sub.empresa} em +${days} dias (Nova renovação: ${newDateStr}).`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { subId, renovacao: prevDate },
      after: { subId, renovacao: newDateStr, diasAdicionados: days },
    });
  }

  static addCredits(subId: string, credits: number, motivo: string, adminName: string, adminEmail: string): void {
    const subs = this.getSubscriptions();
    const sub = subs.find((s) => s.id === subId);
    if (!sub) return;

    const prevCredits = sub.orçamentosRestantes ?? 0;
    const newCredits = prevCredits + credits;

    const updated = subs.map((s) => (s.id === subId ? { ...s, orçamentosRestantes: newCredits, estado: 'ATIVA' as const } : s));
    this.setStorage('subscriptions', updated);

    this.recordAudit({
      evento: 'SUBSCRIPTION_EXTENDED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'INFO',
      descricao: `Adicionados +${credits} créditos de orçamento à empresa ${sub.empresa} (Total agora: ${newCredits}). Motivo: ${motivo}`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { subId, orçamentosRestantes: prevCredits },
      after: { subId, orçamentosRestantes: newCredits, creditosAdicionados: credits, motivo },
    });
  }

  // CERTIFICAÇÃO DO MOTOR (FASE 17)
  static getCertificationConfig(): EngineCertificationConfig {
    return this.getStorage<EngineCertificationConfig>('engine_certification', INITIAL_CERTIFICATION_CONFIG);
  }

  static saveCertificationConfig(newConfig: EngineCertificationConfig, adminName: string, adminEmail: string): void {
    const prev = this.getCertificationConfig();
    this.setStorage('engine_certification', newConfig);

    this.recordAudit({
      evento: 'ENGINE_CERTIFICATION_UPDATED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Actualização dos dados do selo de certificação técnica do engenheiro (${newConfig.engineerName} - ${newConfig.cedulaOEA}).`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { engineerName: prev.engineerName, includeInPdf: prev.includeInPdf },
      after: { engineerName: newConfig.engineerName, includeInPdf: newConfig.includeInPdf },
    });
  }

  // DEFINIÇÕES
  static getSettings(): AdminSettingsConfig {
    return this.getStorage<AdminSettingsConfig>('settings', INITIAL_ADMIN_SETTINGS);
  }

  static saveSettings(newSettings: AdminSettingsConfig, adminName: string, adminEmail: string): void {
    const prev = this.getSettings();
    this.setStorage('settings', newSettings);

    this.recordAudit({
      evento: 'SYSTEM_SETTINGS_UPDATED',
      adminNome: adminName,
      adminEmail: adminEmail,
      gravidade: 'AVISO',
      descricao: `Actualização das definições globais do sistema e coordenadas bancárias.`,
      ip: '105.172.45.12 (Luanda)',
      userAgent: 'Chrome 128.0 / MacOS',
      before: { iban: prev.ibanPrincipal, whatsapp: prev.whatsappSuporte },
      after: { iban: newSettings.ibanPrincipal, whatsapp: newSettings.whatsappSuporte },
    });
  }
}
