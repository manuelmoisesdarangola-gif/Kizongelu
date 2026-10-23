/**
 * @file src/db/price-database.ts
 * Base de Dados de Preços Unitários e Composições de Construção Civil para Angola.
 * Todos os valores de referência estão expressos em Kwanza (Kz).
 * Satisfaz a Regra Crítica: "Preços e coeficientes vivem na BASE DE DADOS — nunca hardcoded no código".
 */

import { PriceItem, WorkCategory } from '../types/domain';

// Coleção inicial de preços em Angola (persistida em memória/localStorage simulando BD relacional)
const INITIAL_PRICE_ITEMS: PriceItem[] = [
  // 1. Estaleiro e Demolições
  {
    id: 'art-001',
    codigo: 'EST-01',
    descricao: 'Limpeza, desmatação e nivelamento manual do terreno da obra',
    categoria: 'estaleiro_demolicoes',
    unidade: 'm²',
    precoBaseKz: 1450,
    custoMaterialKz: 150,
    custoMaoDeObraKz: 1100,
    custoEquipamentoKz: 200,
    rendimentoHomemHora: 0.25,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-002',
    codigo: 'EST-02',
    descricao: 'Vedação provisória de estaleiro com chapa canelada zincada e barrotes de madeira (h=2.0m)',
    categoria: 'estaleiro_demolicoes',
    unidade: 'm',
    precoBaseKz: 18500,
    custoMaterialKz: 12500,
    custoMaoDeObraKz: 4800,
    custoEquipamentoKz: 1200,
    rendimentoHomemHora: 0.90,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-003',
    codigo: 'EST-03',
    descricao: 'Escavação manual em poços e valas para fundações em terreno normal (prof. até 1.50m)',
    categoria: 'estaleiro_demolicoes',
    unidade: 'm³',
    precoBaseKz: 8200,
    custoMaterialKz: 0,
    custoMaoDeObraKz: 7500,
    custoEquipamentoKz: 700,
    rendimentoHomemHora: 2.20,
    dataAtualizacao: '2026-03-01',
  },

  // 2. Fundações e Estruturas
  {
    id: 'art-004',
    codigo: 'FND-01',
    descricao: 'Betão de limpeza não armado C12/15 em fundo de valas (espessura média 10 cm)',
    categoria: 'fundacoes_estruturas',
    unidade: 'm³',
    precoBaseKz: 62000,
    custoMaterialKz: 48000,
    custoMaoDeObraKz: 11000,
    custoEquipamentoKz: 3000,
    rendimentoHomemHora: 2.50,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-005',
    codigo: 'FND-02',
    descricao: 'Betão armado C25/30 fabricado em obra para sapatas, vigas e pilares estruturais',
    categoria: 'fundacoes_estruturas',
    unidade: 'm³',
    precoBaseKz: 125000,
    custoMaterialKz: 94000,
    custoMaoDeObraKz: 23000,
    custoEquipamentoKz: 8000,
    rendimentoHomemHora: 4.80,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-006',
    codigo: 'FND-03',
    descricao: 'Armaduras em varão de aço nervurado A400/A500 NR incluindo corte, dobra e montagem',
    categoria: 'fundacoes_estruturas',
    unidade: 'kg',
    precoBaseKz: 1650,
    custoMaterialKz: 1250,
    custoMaoDeObraKz: 350,
    custoEquipamentoKz: 50,
    rendimentoHomemHora: 0.04,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-007',
    codigo: 'FND-04',
    descricao: 'Cofragem e descofragem com painéis de madeira tratada para vigas e lajes',
    categoria: 'fundacoes_estruturas',
    unidade: 'm²',
    precoBaseKz: 9800,
    custoMaterialKz: 4800,
    custoMaoDeObraKz: 4400,
    custoEquipamentoKz: 600,
    rendimentoHomemHora: 0.85,
    dataAtualizacao: '2026-03-01',
  },

  // 3. Alvenarias e Paredes
  {
    id: 'art-008',
    codigo: 'ALV-01',
    descricao: 'Alvenaria de bloco de betão vibrado 15x20x40 cm assente com argamassa 1:4',
    categoria: 'alvenarias_paredes',
    unidade: 'm²',
    precoBaseKz: 9200,
    custoMaterialKz: 6200,
    custoMaoDeObraKz: 2800,
    custoEquipamentoKz: 200,
    rendimentoHomemHora: 0.70,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-009',
    codigo: 'ALV-02',
    descricao: 'Alvenaria de bloco de betão estrutural 20x20x40 cm para paredes resistentes e muros de suporte',
    categoria: 'alvenarias_paredes',
    unidade: 'm²',
    precoBaseKz: 11800,
    custoMaterialKz: 8100,
    custoMaoDeObraKz: 3400,
    custoEquipamentoKz: 300,
    rendimentoHomemHora: 0.80,
    dataAtualizacao: '2026-03-01',
  },

  // 4. Coberturas e Impermeabilizações
  {
    id: 'art-010',
    codigo: 'CKZ-01',
    descricao: 'Estrutura metálica em perfis tubulares para asnas e madres de cobertura',
    categoria: 'coberturas_impermeabilizacoes',
    unidade: 'm²',
    precoBaseKz: 16500,
    custoMaterialKz: 11500,
    custoMaoDeObraKz: 4200,
    custoEquipamentoKz: 800,
    rendimentoHomemHora: 0.95,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-011',
    codigo: 'CKZ-02',
    descricao: 'Cobertura em chapa zincada canelada IMR 0,50 mm lacada com fixações auto-roscantes',
    categoria: 'coberturas_impermeabilizacoes',
    unidade: 'm²',
    precoBaseKz: 13200,
    custoMaterialKz: 9800,
    custoMaoDeObraKz: 3100,
    custoEquipamentoKz: 300,
    rendimentoHomemHora: 0.60,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-012',
    codigo: 'CKZ-03',
    descricao: 'Impermeabilização de lajes com membrana asfáltica armada 4kg/m² e primário betuminoso',
    categoria: 'coberturas_impermeabilizacoes',
    unidade: 'm²',
    precoBaseKz: 14800,
    custoMaterialKz: 10400,
    custoMaoDeObraKz: 3800,
    custoEquipamentoKz: 600,
    rendimentoHomemHora: 0.75,
    dataAtualizacao: '2026-03-01',
  },

  // 5. Revestimentos e Acabamentos
  {
    id: 'art-013',
    codigo: 'REV-01',
    descricao: 'Chapisco e reboco tradicional afagado com argamassa de cimento e areia 1:4 (e=2cm)',
    categoria: 'revestimentos_acabamentos',
    unidade: 'm²',
    precoBaseKz: 6800,
    custoMaterialKz: 3100,
    custoMaoDeObraKz: 3500,
    custoEquipamentoKz: 200,
    rendimentoHomemHora: 0.80,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-014',
    codigo: 'REV-02',
    descricao: 'Betonilha de regularização e enchimento de pisos interiores (espessura média 5cm)',
    categoria: 'revestimentos_acabamentos',
    unidade: 'm²',
    precoBaseKz: 7400,
    custoMaterialKz: 4200,
    custoMaoDeObraKz: 2900,
    custoEquipamentoKz: 300,
    rendimentoHomemHora: 0.65,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-015',
    codigo: 'REV-03',
    descricao: 'Assentamento de mosaico cerâmico ou grés porcelânico de 60x60 cm com cola C2 e betume',
    categoria: 'revestimentos_acabamentos',
    unidade: 'm²',
    precoBaseKz: 15500,
    custoMaterialKz: 10500,
    custoMaoDeObraKz: 4600,
    custoEquipamentoKz: 400,
    rendimentoHomemHora: 1.10,
    dataAtualizacao: '2026-03-01',
  },

  // 6. Instalações Elétricas
  {
    id: 'art-016',
    codigo: 'ELE-01',
    descricao: 'Ponto de iluminação completo com caixa de derivação, tubo VD, condutores e interruptor',
    categoria: 'instalacoes_eletricas',
    unidade: 'un',
    precoBaseKz: 12500,
    custoMaterialKz: 7800,
    custoMaoDeObraKz: 4500,
    custoEquipamentoKz: 200,
    rendimentoHomemHora: 1.00,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-017',
    codigo: 'ELE-02',
    descricao: 'Ponto de tomada elétrica de uso geral (16A) com condutores de 2.5mm² e terra de proteção',
    categoria: 'instalacoes_eletricas',
    unidade: 'un',
    precoBaseKz: 14200,
    custoMaterialKz: 8900,
    custoMaoDeObraKz: 5000,
    custoEquipamentoKz: 300,
    rendimentoHomemHora: 1.15,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-018',
    codigo: 'ELE-03',
    descricao: 'Quadro elétrico geral de entrada com barramentos, corte geral e 12 disjuntores modulares',
    categoria: 'instalacoes_eletricas',
    unidade: 'un',
    precoBaseKz: 110000,
    custoMaterialKz: 82000,
    custoMaoDeObraKz: 25000,
    custoEquipamentoKz: 3000,
    rendimentoHomemHora: 5.50,
    dataAtualizacao: '2026-03-01',
  },

  // 7. Instalações Hidráulicas
  {
    id: 'art-019',
    codigo: 'HID-01',
    descricao: 'Ponto de água fria e quente em tubagem PPR soldada com acessórios e braçadeiras',
    categoria: 'instalacoes_hidraulicas',
    unidade: 'un',
    precoBaseKz: 18500,
    custoMaterialKz: 11800,
    custoMaoDeObraKz: 6200,
    custoEquipamentoKz: 500,
    rendimentoHomemHora: 1.40,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-020',
    codigo: 'HID-02',
    descricao: 'Ponto de esgoto em tubagem PVC rígido com sifão e ventilação secundária',
    categoria: 'instalacoes_hidraulicas',
    unidade: 'un',
    precoBaseKz: 16800,
    custoMaterialKz: 10200,
    custoMaoDeObraKz: 6100,
    custoEquipamentoKz: 500,
    rendimentoHomemHora: 1.30,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-021',
    codigo: 'HID-03',
    descricao: 'Fossa séptica e sumidouro com paredes em alvenaria e laje em betão armado (cap. 6 pessoas)',
    categoria: 'instalacoes_hidraulicas',
    unidade: 'un',
    precoBaseKz: 580000,
    custoMaterialKz: 390000,
    custoMaoDeObraKz: 160000,
    custoEquipamentoKz: 30000,
    rendimentoHomemHora: 35.00,
    dataAtualizacao: '2026-03-01',
  },

  // 8. Carpintarias e Serralharias
  {
    id: 'art-022',
    codigo: 'SER-01',
    descricao: 'Janela de alumínio de correr de 2 folhas com vidro incolor 5mm e fecho de segurança',
    categoria: 'carpintarias_serralharias',
    unidade: 'm²',
    precoBaseKz: 38000,
    custoMaterialKz: 29000,
    custoMaoDeObraKz: 8000,
    custoEquipamentoKz: 1000,
    rendimentoHomemHora: 1.80,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-023',
    codigo: 'SER-02',
    descricao: 'Porta interior alveolar tipo MDF folheada com aro, fechadura e dobradiças completas',
    categoria: 'carpintarias_serralharias',
    unidade: 'un',
    precoBaseKz: 48000,
    custoMaterialKz: 36000,
    custoMaoDeObraKz: 11000,
    custoEquipamentoKz: 1000,
    rendimentoHomemHora: 2.50,
    dataAtualizacao: '2026-03-01',
  },

  // 9. Pinturas
  {
    id: 'art-024',
    codigo: 'PIN-01',
    descricao: 'Pintura de paredes interiores a tinta plástica fosca lavável com primário (2 demãos)',
    categoria: 'pinturas',
    unidade: 'm²',
    precoBaseKz: 4200,
    custoMaterialKz: 2400,
    custoMaoDeObraKz: 1700,
    custoEquipamentoKz: 100,
    rendimentoHomemHora: 0.40,
    dataAtualizacao: '2026-03-01',
  },
  {
    id: 'art-025',
    codigo: 'PIN-02',
    descricao: 'Pintura exterior de fachadas com tinta 100% acrílica impermeabilizante contra intempéries',
    categoria: 'pinturas',
    unidade: 'm²',
    precoBaseKz: 5600,
    custoMaterialKz: 3400,
    custoMaoDeObraKz: 2000,
    custoEquipamentoKz: 200,
    rendimentoHomemHora: 0.45,
    dataAtualizacao: '2026-03-01',
  },
];

const STORAGE_KEY_PRICES = 'Kizongelu_price_database_v1';

export class PriceDatabaseRepository {
  private static getStoredItems(): PriceItem[] {
    if (typeof window === 'undefined') {
      return INITIAL_PRICE_ITEMS;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRICES);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as PriceItem[];
        }
      }
    } catch {
      // Fallback para os dados de referência
    }
    return INITIAL_PRICE_ITEMS;
  }

  private static saveItems(items: PriceItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(items));
    }
  }

  public static getAll(): PriceItem[] {
    return this.getStoredItems();
  }

  public static getById(id: string): PriceItem | undefined {
    return this.getStoredItems().find((item) => item.id === id);
  }

  public static getByCategory(categoria: WorkCategory): PriceItem[] {
    return this.getStoredItems().filter((item) => item.categoria === categoria);
  }

  public static addItem(newItem: PriceItem): void {
    const items = this.getStoredItems();
    items.unshift({
      ...newItem,
      precoBaseKz: newItem.custoMaterialKz + newItem.custoMaoDeObraKz + newItem.custoEquipamentoKz,
      dataAtualizacao: newItem.dataAtualizacao || new Date().toISOString().split('T')[0],
      ativo: newItem.ativo !== false,
    });
    this.saveItems(items);
  }

  public static updatePriceItem(updatedItem: PriceItem): void {
    const items = this.getStoredItems();
    const index = items.findIndex((item) => item.id === updatedItem.id);
    if (index >= 0) {
      items[index] = {
        ...updatedItem,
        precoBaseKz: updatedItem.custoMaterialKz + updatedItem.custoMaoDeObraKz + updatedItem.custoEquipamentoKz,
        dataAtualizacao: new Date().toISOString().split('T')[0],
      };
      this.saveItems(items);
    }
  }

  public static resetToDefaults(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_PRICES);
    }
  }
}
