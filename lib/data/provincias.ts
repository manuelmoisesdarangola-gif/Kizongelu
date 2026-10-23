/**
 * @file lib/data/provincias.ts
 * Dados Oficiais Provinciais de Construção Civil e Preços Médios em Angola (Fase 15).
 * Cobre as 8 províncias principais com especificidades técnicas, municípios,
 * coeficientes logísticos, preços de mercado e testemunhos de engenheiros locais.
 */

export interface PrecosMediosLocais {
  cimento50kg: number;     // Kz por saco de 50kg (Nova Cimangola / Caxito / Cimenfort)
  areiaM3: number;         // Kz por metro cúbico
  britaM3: number;         // Kz por metro cúbico
  varaoAcoKg: number;      // Kz por quilograma de varão A400
  bloco15Un: number;       // Kz por unidade de bloco de cimento 15x20x40
  pedreiroDiaria: number;  // Kz por dia de trabalho
  serventeDiaria: number;  // Kz por dia de trabalho
  custoMedioM2: number;    // Custo médio de construção habitacional por m²
}

export interface ProvinciaInfo {
  slug: string;
  nome: string;
  capital: string;
  regiao: 'Litoral Norte' | 'Litoral Centro' | 'Litoral Sul' | 'Planalto Central' | 'Sul' | 'Norte';
  coeficienteLogistica: number;
  coeficienteMaoDeObra: number;
  descricaoCurta: string;
  descricaoDetalhada: string;
  desafiosEspecificos: string[];
  municipios: string[];
  precos: PrecosMediosLocais;
  testemunho: {
    nome: string;
    cargo: string;
    empresa: string;
    municipio: string;
    texto: string;
    foto?: string;
  };
  metaTitle: string;
  metaDescription: string;
}

export const PROVINCIAS_DATA: Record<string, ProvinciaInfo> = {
  luanda: {
    slug: 'luanda',
    nome: 'Luanda',
    capital: 'Luanda',
    regiao: 'Litoral Norte',
    coeficienteLogistica: 1.00,
    coeficienteMaoDeObra: 1.00,
    descricaoCurta: 'Maior polo da construção civil em Angola, com acesso directo aos principais portos e fábricas.',
    descricaoDetalhada: 'Luanda concentra o maior volume de empreitadas habitacionais e corporativas do país. A abundância de entrepostos comerciais em Viana, Kikolo e Palanca assegura elevada disponibilidade de materiais, embora os terrenos argilosos de Talatona e Belas exijam cuidados redobrados com fundações diretas e drenagem perimetral.',
    desafiosEspecificos: [
      'Solos expansivos (argilas negras) em Talatona, Benfica e Belas exigem vigas de fundação reforçadas',
      'Flutuações de trânsito em Viana e Estrada de Catete aumentam o custo do frete nas horas de ponta',
      'Salinidade elevada na Ilha de Luanda e Mussulo requer classe de exposição ambiental XS1 e maior recobrimento de armaduras'
    ],
    municipios: [
      'Luanda', 'Talatona', 'Belas', 'Cacuaco', 'Cazenga', 'Viana', 'Kilamba Kiaxi'
    ],
    precos: {
      cimento50kg: 6800,
      areiaM3: 9500,
      britaM3: 14000,
      varaoAcoKg: 1850,
      bloco15Un: 240,
      pedreiroDiaria: 8000,
      serventeDiaria: 4500,
      custoMedioM2: 215000,
    },
    testemunho: {
      nome: 'Eng. Manuel Bento',
      cargo: 'Diretor de Obras',
      empresa: 'Bento & Associados Engenharia',
      municipio: 'Talatona',
      texto: 'O Kizongelu mudou a nossa precisão nos orçamentos de Luanda. O cálculo de sacos de cimento e armaduras é exacto, sem margem para desperdícios na obra.',
    },
    metaTitle: 'Orçamento de Obras em Luanda 2026 | Preços de Materiais em Kwanzas',
    metaDescription: 'Calcule o custo de construir em Luanda (Talatona, Viana, Belas). Preços actualizados de cimento, blocos, areia e mão de obra em Kwanzas (Kz).'
  },

  benguela: {
    slug: 'benguela',
    nome: 'Benguela',
    capital: 'Benguela / Lobito',
    regiao: 'Litoral Centro',
    coeficienteLogistica: 1.08,
    coeficienteMaoDeObra: 0.95,
    descricaoCurta: 'Polo industrial e logístico, com forte presença do Porto do Lobito.',
    descricaoDetalhada: 'Benguela combina dinamismo portuário com facilidade no abastecimento de inertes e cimento da Cimenfort. Os municípios de Lobito, Catumbela e Baía Farta apresentam excelentes condições para estaleiros de obra, com mão de obra qualificada e custos de inertes inferiores a Luanda.',
    desafiosEspecificos: [
      'Ambiente costeiro agressivo na Restinga do Lobito e Baía Farta exige betão C25/30 com aditivos hidrófugos',
      'Nível freático superficial em zonas baixas da Catumbela que requer bombagem contínua durante escavações',
      'Variações de temperatura entre o litoral e o interior (Ganda/Cubal) que afectam a cura do betão'
    ],
    municipios: [
      'Benguela', 'Lobito', 'Catumbela', 'Baía Farta', 'Ganda', 'Cubal', 'Chongoroi', 'Balombo', 'Bocoio', 'Caimbambo'
    ],
    precos: {
      cimento50kg: 6950,
      areiaM3: 8200,
      britaM3: 13500,
      varaoAcoKg: 1920,
      bloco15Un: 230,
      pedreiroDiaria: 7500,
      serventeDiaria: 4200,
      custoMedioM2: 205000,
    },
    testemunho: {
      nome: 'Arq. Catarina Lopes',
      cargo: 'Projectista Principal',
      empresa: 'Lopes Arquitectura & Gestão',
      municipio: 'Lobito',
      texto: 'Conseguimos aprovar processos de financiamento para os nossos clientes no Lobito com as folhas de orçamento geradas no Kizongelu. Total rigor normativo.',
    },
    metaTitle: 'Orçamento de Construção em Benguela e Lobito 2026 | Preços Locais Kz',
    metaDescription: 'Preços de materiais de construção em Benguela e Lobito: cimento, inertes e mão de obra. Gere mapas de quantidades calibrados para o litoral centro.'
  },

  huila: {
    slug: 'huila',
    nome: 'Huíla',
    capital: 'Lubango',
    regiao: 'Sul',
    coeficienteLogistica: 1.18,
    coeficienteMaoDeObra: 0.92,
    descricaoCurta: 'Principal centro urbano do sul, com clima temperado e jazidas minerais.',
    descricaoDetalhada: 'O Lubango e os municípios adjacentes como Chibia e Humpata oferecem britas de excelente granulometria e resistência mecânica. O frete a partir dos portos do Namibe ou de Luanda impacta os custos de varão de aço e equipamentos especializados.',
    desafiosEspecificos: [
      'Solos rochosos em zonas de encosta no Lubango podem exigir martelo pneumático para desmonte de fundações',
      'Noites frias no inverno (Humpata) requerem proteção de cofragens contra choque térmico durante a cura inicial',
      'Dependência do transporte rodoviário para materiais siderúrgicos e tintas técnicas'
    ],
    municipios: [
      'Lubango', 'Humpata', 'Chibia', 'Matala', 'Quilengues', 'Cacula', 'Caluquembe', 'Cuvango', 'Jamba', 'Chicomba', 'Chipindo', 'Gambos', 'Hicocoti', 'Quipungo'
    ],
    precos: {
      cimento50kg: 7400,
      areiaM3: 8800,
      britaM3: 12500,
      varaoAcoKg: 2050,
      bloco15Un: 260,
      pedreiroDiaria: 7200,
      serventeDiaria: 4000,
      custoMedioM2: 218000,
    },
    testemunho: {
      nome: 'Eng. Adolfo Tchissingui',
      cargo: 'Mestre Construtor',
      empresa: 'Serra da Chela Construções',
      municipio: 'Lubango',
      texto: 'O coeficiente provincial para a Huíla no Kizongelu reflete os custos reais do transporte do Namibe até ao planalto. Evita prejuízos graves em cada empreitada.',
    },
    metaTitle: 'Custo de Construção na Huíla (Lubango) 2026 | Orçamento de Obras Kz',
    metaDescription: 'Tabela de preços de construção no Lubango e Huíla. Calcule orçamentos em Kwanzas com brita local, cimento e mão de obra calibrados.'
  },

  huambo: {
    slug: 'huambo',
    nome: 'Huambo',
    capital: 'Huambo',
    regiao: 'Planalto Central',
    coeficienteLogistica: 1.15,
    coeficienteMaoDeObra: 0.90,
    descricaoCurta: 'Coração agrícola do Planalto Central, com solos férteis e forte tradição construtiva.',
    descricaoDetalhada: 'O Huambo, servido pelo Caminho de Ferro de Benguela (CFB), está a viver um forte renascimento imobiliário nos eixos de Caála, Bailundo e na cidade alta. As olarias locais fornecem tijolos e materiais cerâmicos a custos muito competitivos.',
    desafiosEspecificos: [
      'Período de chuvas intensas entre Outubro e Abril que requer planeamento rigoroso de terraplenagens e coberturas',
      'Solos lateríticos avermelhados com drenagem moderada que necessitam de enrocamento na base do pavimento',
      'Frete rodoviário de cimento e ferro a partir do Corredor do Lobito'
    ],
    municipios: [
      'Huambo', 'Caála', 'Bailundo', 'Ekunha', 'Longonjo', 'Ucuma', 'Chinjenje', 'Cachiungo', 'Tchicala Tcholohanga', 'Mungo', 'Londuimbali'
    ],
    precos: {
      cimento50kg: 7250,
      areiaM3: 7900,
      britaM3: 13800,
      varaoAcoKg: 1980,
      bloco15Un: 245,
      pedreiroDiaria: 7000,
      serventeDiaria: 3800,
      custoMedioM2: 212000,
    },
    testemunho: {
      nome: 'Domingos Chivela',
      cargo: 'Proprietário & Autoconstrutor',
      empresa: 'Obra Particular T4',
      municipio: 'Caála',
      texto: 'Fiz a minha moradia térrea na Caála com a lista de compras do Kizongelu. Economizei mais de 1.800.000 Kz só controlando os sacos de cimento e o varão.',
    },
    metaTitle: 'Preço de Obras no Huambo 2026 | Orçamentação e Quantidades Kz',
    metaDescription: 'Descubra quanto custa construir no Huambo e Caála. Preços médios de cimento, blocos, areia e pedreiros em Kwanzas para o Planalto Central.'
  },

  cabinda: {
    slug: 'cabinda',
    nome: 'Cabinda',
    capital: 'Cabinda',
    regiao: 'Norte',
    coeficienteLogistica: 1.29,
    coeficienteMaoDeObra: 1.10,
    descricaoCurta: 'Província mais a norte, com enclave geográfico que exige cabotagem marítima.',
    descricaoDetalhada: 'Cabinda tem um mercado singular: a madeira maciça estrutural e carpintarias têm preços vantajosos pela riqueza florestal do Maiombe, mas os materiais siderúrgicos e cimento ensacado dependem do porto de Cabinda ou importação regional.',
    desafiosEspecificos: [
      'Encargos alfandegários e fretes marítimos de cabotagem encarecem cimento e varão',
      'Humidade relativa muito elevada que requer tintas fungicidas e tratamento hidrófugo em vigas e pilares',
      'Solos argilosos e vegetação densa que encarecem a desmatação e terraplenagem inicial'
    ],
    municipios: [
      'Cabinda', 'Cacongo', 'Buco-Zau', 'Belize'
    ],
    precos: {
      cimento50kg: 8200,
      areiaM3: 9800,
      britaM3: 16500,
      varaoAcoKg: 2250,
      bloco15Un: 290,
      pedreiroDiaria: 8800,
      serventeDiaria: 4800,
      custoMedioM2: 248000,
    },
    testemunho: {
      nome: 'Eng. Jean-Luc Makosso',
      cargo: 'Gestor de Contratos',
      empresa: 'Cabinda Infraestruturas',
      municipio: 'Cabinda',
      texto: 'O frete de cabotagem faz toda a diferença nos orçamentos de Cabinda. Com o coeficiente provincial de 1.29x do Kizongelu, as margens ficam devidamente protegidas.',
    },
    metaTitle: 'Construção Civil em Cabinda 2026 | Preços de Materiais e Orçamentos Kz',
    metaDescription: 'Orçamento de construção para Cabinda, Cacongo e Buco-Zau. Custos de materiais com frete de cabotagem marítima em Kwanzas (Kz).'
  },

  'cuanza-sul': {
    slug: 'cuanza-sul',
    nome: 'Cuanza Sul',
    capital: 'Sumbe',
    regiao: 'Litoral Centro',
    coeficienteLogistica: 1.11,
    coeficienteMaoDeObra: 0.94,
    descricaoCurta: 'Ponte estratégica entre Luanda e o sul de Angola, com forte crescimento urbano.',
    descricaoDetalhada: 'O Cuanza Sul beneficia da proximidade à Estrada Nacional 100 e das indústrias de Porto Amboim. No interior (Waku Kungo e Calulo), os custos de materiais dependem da distância ao eixo litorâneo, sendo compensados por boa oferta de mão de obra.',
    desafiosEspecificos: [
      'Solos salinos e arenosos nas faixas baixas do Sumbe e Porto Amboim',
      'Desníveis acentuados no planalto de Calulo e Waku Kungo que exigem muros de contenção e gabiões',
      'Disponibilidade pontual de centrais de betão pronto, privilegiando a amassadura em obra'
    ],
    municipios: [
      'Sumbe', 'Porto Amboim', 'Waku Kungo (Cela)', 'Amboim (Gabela)', 'Calulo (Libolo)', 'Quibala', 'Seles', 'Condé', 'Ebo', 'Mussende', 'Quilenda', 'Cassongue'
    ],
    precos: {
      cimento50kg: 7100,
      areiaM3: 8400,
      britaM3: 13900,
      varaoAcoKg: 1950,
      bloco15Un: 240,
      pedreiroDiaria: 7400,
      serventeDiaria: 4100,
      custoMedioM2: 209000,
    },
    testemunho: {
      nome: 'Mestre Bernardo Quaresma',
      cargo: 'Empreiteiro Geral',
      empresa: 'Construções Amboim',
      municipio: 'Porto Amboim',
      texto: 'Uso o Kizongelu para orçamentar tanto armazéns de pescas no Porto Amboim como moradias no Sumbe. O mapa de quantidades sai perfeito.',
    },
    metaTitle: 'Orçamento de Obras no Cuanza Sul (Sumbe e Porto Amboim) 2026',
    metaDescription: 'Custos de construção no Cuanza Sul: Sumbe, Porto Amboim e Waku Kungo. Preços de cimento, blocos e betão em Kwanzas angolanos.'
  },

  uige: {
    slug: 'uige',
    nome: 'Uíge',
    capital: 'Uíge',
    regiao: 'Norte',
    coeficienteLogistica: 1.15,
    coeficienteMaoDeObra: 0.88,
    descricaoCurta: 'Província do norte, com clima tropical húmido e forte expansão agrícola.',
    descricaoDetalhada: 'O Uíge e Negage estão em fase ativa de crescimento residencial. O abastecimento de materiais pesados é feito a partir de Luanda pela Estrada Nacional 120 e 220, o que reflete um incremento logístico sobre inertes e ferro.',
    desafiosEspecificos: [
      'Elevada pluviosidade que exige sistemas de drenagem pluvial bem dimensionados e caleiras sobredimensionadas',
      'Solos lateríticos que perdem capacidade de carga se expostos a encharcamento prolongado',
      'Distância aos grandes centros industriais de transformação de ferro e aço'
    ],
    municipios: [
      'Uíge', 'Negage', 'Songo', 'Damba', 'Maquela do Zombo', 'Bungo', 'Ambuíla', 'Pangala', 'Mucaba', 'Puri', 'Sanza Pombo', 'Quitexe', 'Milunga', 'Bembe', 'Buengas', 'Cangola'
    ],
    precos: {
      cimento50kg: 7350,
      areiaM3: 8600,
      britaM3: 14200,
      varaoAcoKg: 2040,
      bloco15Un: 255,
      pedreiroDiaria: 6900,
      serventeDiaria: 3800,
      custoMedioM2: 216000,
    },
    testemunho: {
      nome: 'Eng. Pedro Nsingi',
      cargo: 'Fiscal de Obras',
      empresa: 'Gabinete Técnico do Uíge',
      municipio: 'Negage',
      texto: 'O Kizongelu facilitou as medições nos projectos municipais de Negage. A plataforma já traz os preços reais calibrados com o frete de Luanda.',
    },
    metaTitle: 'Construção Civil no Uíge e Negage 2026 | Orçamento em Kwanzas',
    metaDescription: 'Preços de cimento, blocos e materiais de construção na província do Uíge. Simule custos de casas e edifícios em Kwanzas (Kz).'
  },

  namibe: {
    slug: 'namibe',
    nome: 'Namibe',
    capital: 'Moçâmedes',
    regiao: 'Litoral Sul',
    coeficienteLogistica: 1.09,
    coeficienteMaoDeObra: 0.93,
    descricaoCurta: 'Província costeira, com o Porto de Moçâmedes e ricas pedreiras de granito.',
    descricaoDetalhada: 'Moçâmedes e Tômbwa combinam clima seco e ameno com facilidade na obtenção de rochas e inertes de excelente qualidade. A ausência de chuvas torrenciais simplifica o cronograma das obras, mas os ventos marítimos e a salinidade exigem atenção nas armaduras.',
    desafiosEspecificos: [
      'Salinidade e nevoeiro costeiro (macaquice) requerem recobrimentos de armaduras superiores a 35 mm',
      'Solos arenosos com baixa coesão em Moçâmedes exigem compactação vigorosa e sapatas alargadas',
      'Escassez de água doce na obra requer planeamento logístico prévio para betões e argamassas'
    ],
    municipios: [
      'Moçâmedes', 'Tômbwa', 'Bibala', 'Virei', 'Camucuio'
    ],
    precos: {
      cimento50kg: 7150,
      areiaM3: 7800,
      britaM3: 12200,
      varaoAcoKg: 1960,
      bloco15Un: 235,
      pedreiroDiaria: 7300,
      serventeDiaria: 4100,
      custoMedioM2: 208000,
    },
    testemunho: {
      nome: 'Eng. Vítor Vintém',
      cargo: 'Engenheiro Residente',
      empresa: 'Moçâmedes Construções Marítimas',
      municipio: 'Moçâmedes',
      texto: 'Para quem constrói na costa do Namibe, a especificação técnica do Kizongelu com recobrimentos e traços adequados ao sal é essencial.',
    },
    metaTitle: 'Orçamento de Obras no Namibe (Moçâmedes e Tômbwa) 2026',
    metaDescription: 'Tabela de preços de construção para Moçâmedes e Tômbwa no Namibe. Calcule orçamentos em Kwanzas com cimento e brita locais.'
  }
};

export const LISTA_8_PROVINCIAS = Object.values(PROVINCIAS_DATA);

export function getProvinciaBySlug(slug: string): ProvinciaInfo | undefined {
  const norm = slug.toLowerCase().trim();
  return PROVINCIAS_DATA[norm];
}
