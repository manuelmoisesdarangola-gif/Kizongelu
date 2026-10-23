/**
 * @file lib/data/blog.ts
 * Repositório de Artigos Técnicos e Guias Práticos de Construção em Angola (Fase 15).
 */

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  category: 'Materiais e Mercado' | 'Fundações e Estrutura' | 'Custos e Orçamentação' | 'Acabamentos' | 'Legislação e Boas Práticas';
  featured?: boolean;
  coverImage?: string;
  sections: {
    heading: string;
    content: string[];
    dica?: string;
    atencao?: string;
    exemplo?: {
      titulo: string;
      descricao: string;
      dados?: Record<string, string | number>;
    };
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  relatedSlugs: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'saco-cimento-luanda-2026',
    title: 'Quanto custa o saco de cimento em Luanda em 2026',
    excerpt: 'Uma análise das cotações actuais do cimento Portland 42.5R e 32.5 nos principais fornecedores de Luanda.',
    date: '25 de Setembro de 2026',
    readTime: '6 min de leitura',
    author: {
      name: 'Gabinete Técnico Kizongelu',
      role: 'Engenharia de Custos e Orçamentação',
    },
    category: 'Materiais e Mercado',
    featured: true,
    sections: [
      {
        heading: '1. O Cenário dos Armazéns em Luanda',
        content: [
          'Em 2026, os preços do cimento ensacado de 50 kg continuam a oscilar entre os pólos de distribuição do Kikolo, Viana (estrada de Catete), Palanca e Benfica. A diferença entre marcas correntes ronda os 300 a 700 Kz por saco, variando em função dos custos de frete rodoviário e lotes de distribuição.',
          'Para uma fundação direta por sapatas isoladas numa moradia unifamiliar de 150 m², o cimento representa em média entre 18% a 24% do custo total da superestrutura de betão armado.'
        ],
        table: {
          headers: ['Zona de Compra', 'Cimento 42.5R (50kg)', 'Cimento 32.5 (50kg)', 'Frete Médio Carrinha'],
          rows: [
            ['Kikolo / Cacuaco', '6.650 Kz', '6.200 Kz', '18.000 Kz'],
            ['Viana / Est. Catete', '6.800 Kz', '6.350 Kz', '22.000 Kz'],
            ['Palanca / Golfe', '6.950 Kz', '6.500 Kz', '15.000 Kz'],
            ['Talatona / Benfica', '7.200 Kz', '6.700 Kz', '25.000 Kz'],
          ]
        },
        dica: 'Compre em lotes a partir de 100 sacos diretamente junto de revendedores grossistas em Viana para negociar descontos de até 400 Kz por unidade.'
      },
      {
        heading: '2. Dimensionamento e Traço de Betão Armado',
        content: [
          'Muitos mestres de obra em Angola utilizam traços empíricos por "latas de leite nido" ou "pás", o que resulta em desperdício severo ou betões porosos sujeitos a fissuração prematura.',
          'A proporção técnica recomendada para sapatas e vigas de fundação é de 1 saco de cimento de 50 kg para 2 carrinhos de areia média lavada e 3 carrinhos de brita nº 1 (traço 1:2:3 volumétrico).'
        ],
        atencao: 'Nunca adicione água em excesso para tornar o betão mais fluido. Cada litro de água além do necessário reduz a resistência mecânica em até 15% e provoca fissuras por retração plástica.',
        exemplo: {
          titulo: 'Exemplo de Cálculo para Sapata 1.20 x 1.20 x 0.40 m',
          descricao: 'Volume por sapata: 0.576 m³. Para 14 sapatas de uma vivenda T3:',
          dados: {
            'Volume Total de Betão': '8.06 m³',
            'Sacos de Cimento (C25/30)': '58 sacos de 50 kg',
            'Areia Média Lavada': '3.8 m³',
            'Brita 1 e 2': '6.9 m³',
            'Custo Estimado Cimento': '394.400 Kz'
          }
        }
      },
      {
        heading: '3. Como Proteger as Sacas em Obra',
        content: [
          'A humidade de Luanda, em particular perto da costa (Ilha, Samba, Benfica), pode endurecer o cimento ensacado em menos de duas semanas se armazenado em contacto direto com a terra batida.',
          'Exija sempre a colocação de estrados de madeira (paletes) elevados a pelo menos 15 cm do piso e cubra as pilhas com lona plástica preta impermeável.'
        ]
      }
    ],
    relatedSlugs: ['muro-vedacao-luanda-blocos', 'diferencas-custo-construcao-provincias']
  },

  {
    slug: 'muro-vedacao-luanda-blocos',
    title: 'Muro de vedação em Luanda: cálculo de blocos de 15, pilares e vigas de coroamento',
    excerpt: 'Guia prático para poupar na construção de muros perimetrais em terrenos 20x30 e 30x40 nos bairros de Luanda.',
    date: '15 de Setembro de 2026',
    readTime: '7 min de leitura',
    author: {
      name: 'Gabinete Técnico Kizongelu',
      role: 'Estruturas e Geotecnia',
    },
    category: 'Fundações e Estrutura',
    featured: false,
    sections: [
      {
        heading: '1. O Terreno Típico em Luanda e Dimensões do Muro',
        content: [
          'A dimensão clássica do lote residencial nos loteamentos de Talatona, Zango, Kilamba Kiaxi e Benfica é de 20 x 30 metros (perímetro de 100 metros lineares).',
          'Para garantir privacidade e segurança patrimonial, a altura padrão varia entre 2.20 m e 2.60 m acima do solo natural.'
        ],
        dica: 'Em loteamentos novos, confirme se os vizinhos já construíram algum dos lados do muro para deduzir essa metragem linear do seu orçamento total.'
      },
      {
        heading: '2. Quantidades de Blocos e Quebras Normativas',
        content: [
          'Um metro quadrado de alvenaria em bloco de cimento 15x20x40 cm necessita de 12.5 blocos. Devido ao transporte, manuseamento e cortes de amarração, deve prever-se uma margem de quebra técnica de 7% a 10%.'
        ],
        table: {
          headers: ['Dimensão Terreno', 'Perímetro (m)', 'Altura (m)', 'Blocos de 15 (com 8% margem)'],
          rows: [
            ['15 x 20 m', '70 m', '2.40 m', '2.268 blocos'],
            ['20 x 30 m', '100 m', '2.40 m', '3.240 blocos'],
            ['30 x 40 m', '140 m', '2.40 m', '4.536 blocos'],
          ]
        },
        atencao: 'Rejeite blocos que soltem pó ao esfregar com o dedo. Blocos de má cura consomem mais argamassa e partem-se com o peso da viga de coroamento.'
      },
      {
        heading: '3. Fundação Corrida vs. Sapata Isolada em Muros',
        content: [
          'Em solos arenosos ou firmes, uma viga de fundação corrida de 20x30 cm assente sobre camada de enrocamento (tout-venant) é suficiente. Já em solos negros expansivos de Talatona ou Benfica, são indispensáveis sapatas isoladas a cada 2.5 metros com pilaretes de amarração.'
        ],
        exemplo: {
          titulo: 'Orçamento Síntese para Terreno 20x30m (100m Lineares)',
          descricao: 'Altura média 2.40m, incluindo sapatas, pilares a cada 2.5m e viga de coroamento:',
          dados: {
            'Blocos 15x20x40': '3.240 unidades (~777.600 Kz)',
            'Cimento para Alvenaria e Betão': '85 sacos (~578.000 Kz)',
            'Varão de Aço (Ø10 e Ø6)': '420 kg (~777.000 Kz)',
            'Inertes (Areia e Brita)': '24 m³ (~260.000 Kz)',
            'Mão de Obra Total': '~750.000 Kz',
            'Investimento Estimado': '3.142.600 Kz'
          }
        }
      }
    ],
    relatedSlugs: ['saco-cimento-luanda-2026', 'como-apresentar-orcamento-financiamento']
  },

  {
    slug: 'diferencas-custo-construcao-provincias',
    title: 'Diferenças de custo de construção entre Luanda, Benguela e Huíla',
    excerpt: 'Como a distância aos portos, o frete de inertes e a oferta de mão de obra alteram o custo por metro quadrado (m²) em cada região de Angola.',
    date: '02 de Setembro de 2026',
    readTime: '5 min de leitura',
    author: {
      name: 'Gabinete Técnico Kizongelu',
      role: 'Direcção de Obras e Planeamento',
    },
    category: 'Custos e Orçamentação',
    featured: false,
    sections: [
      {
        heading: '1. O Impacto da Logística no Custo Total',
        content: [
          'Em Angola, o custo do frete rodoviário pode representar até 25% do valor dos materiais pesados (cimento, varão e cerâmica) quando transportados para fora do eixo Luanda-Lobito.',
          'Enquanto em Luanda o metro quadrado médio de acabamento médio-padrão se fixa nos 215.000 Kz, na Huíla (Lubango) situa-se em torno de 218.000 Kz e em Cabinda alcança os 248.000 Kz devido à cabotagem marítima.'
        ],
        dica: 'Na Huíla e Huambo, dê preferência a pedreiras e olarias locais para inertes e alvenarias em vez de pagar fretes pesados de Luanda.'
      },
      {
        heading: '2. Comparativo Provincial de Preços 2026',
        content: [
          'Abaixo apresentamos as variações médias registadas na base de dados de preços do Kizongelu nos últimos 90 dias:'
        ],
        table: {
          headers: ['Província', 'Cimento 50kg', 'Brita m³', 'Varão Aço kg', 'Custo Médio m²'],
          rows: [
            ['Luanda', '6.800 Kz', '14.000 Kz', '1.850 Kz', '215.000 Kz'],
            ['Benguela', '6.950 Kz', '13.500 Kz', '1.920 Kz', '205.000 Kz'],
            ['Huambo', '7.250 Kz', '13.800 Kz', '1.980 Kz', '212.000 Kz'],
            ['Huíla (Lubango)', '7.400 Kz', '12.500 Kz', '2.050 Kz', '218.000 Kz'],
            ['Cabinda', '8.200 Kz', '16.500 Kz', '2.250 Kz', '248.000 Kz'],
          ]
        },
        exemplo: {
          titulo: 'Moradia T3 de 140 m² — Comparativo Direto',
          descricao: 'Construção da mesma moradia com idêntico padrão construtivo:',
          dados: {
            'Luanda': '30.100.000 Kz',
            'Benguela': '28.700.000 Kz (-4.6%)',
            'Huíla': '30.520.000 Kz (+1.4%)',
            'Cabinda': '34.720.000 Kz (+15.3%)'
          }
        }
      }
    ],
    relatedSlugs: ['saco-cimento-luanda-2026', 'como-apresentar-orcamento-financiamento']
  },

  {
    slug: 'como-apresentar-orcamento-financiamento',
    title: 'Como preparar o orçamento para processos de crédito',
    excerpt: 'Requisitos essenciais para apresentar um orçamento profissional a clientes, concursos ou processos de análise de crédito.',
    date: '20 de Agosto de 2026',
    readTime: '6 min de leitura',
    author: {
      name: 'Gabinete Técnico Kizongelu',
      role: 'Consultoria e Engenharia de Custos',
    },
    category: 'Legislação e Boas Práticas',
    featured: false,
    sections: [
      {
        heading: '1. O que os Avaliadores Analisam nos Projectos',
        content: [
          'Os departamentos de avaliação recusam orçamentos genéricos de "uma folha" sem decomposição de custos unitários.',
          'O avaliador técnico precisa de verificar exactamente quantos sacos de cimento, metros cúbicos de betão e quilogramas de aço serão aplicados em cada fase para calibrar os desembolsos parciais.'
        ],
        dica: 'Apresente sempre o orçamento gerado no Kizongelu com apresentação técnica e QR Code de verificação online.'
      },
      {
        heading: '2. Cronograma Financeiro por Fases',
        content: [
          'A libertação dos fundos em processos de financiamento habitacional ocorre habitualmente de forma faseada em 4 tranches:'
        ],
        table: {
          headers: ['Tranche', 'Etapa Concluída', '% Libertada', 'Documentos Exigidos'],
          rows: [
            ['1ª Tranche', 'Aprovação do Projecto', '25%', 'Caderno de Encargos Aprovado'],
            ['2ª Tranche', 'Fundações e Estrutura Térrea', '30%', 'Auto de Medição + Fiscal'],
            ['3ª Tranche', 'Alvenarias e Cobertura', '30%', 'Vistoria Técnica'],
            ['4ª Tranche', 'Acabamentos e Vistoria Final', '15%', 'Licença e Certificado'],
          ]
        },
        atencao: 'Se a obra avançar fora da ordem orçamentada, a tranche seguinte pode ficar retida até emissão de rectificação técnica.'
      }
    ],
    relatedSlugs: ['diferencas-custo-construcao-provincias', 'muro-vedacao-luanda-blocos']
  }
];

export function getArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(currentSlug: string): BlogArticle[] {
  const current = getArticleBySlug(currentSlug);
  if (!current) return BLOG_ARTICLES.slice(0, 3);
  return BLOG_ARTICLES.filter((a) => current.relatedSlugs.includes(a.slug) || a.category === current.category && a.slug !== currentSlug).slice(0, 3);
}

export const CATEGORIAS_BLOG = [
  'Todas',
  'Materiais e Mercado',
  'Fundações e Estrutura',
  'Custos e Orçamentação',
  'Acabamentos',
  'Legislação e Boas Práticas',
] as const;
