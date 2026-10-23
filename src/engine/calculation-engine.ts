/**
 * @file src/engine/calculation-engine.ts
 * Motor de Cálculo Determinístico para Obras em Angola.
 * 
 * REGRA CRÍTICA 1: "Motor de Cálculo (determinístico) e IA vivem em módulos SEPARADOS.
 * A IA nunca escreve valores numéricos no orçamento."
 * 
 * REGRA CRÍTICA 2: "Preços e coeficientes vivem na BASE DE DADOS — nunca hardcoded no código."
 */

import { getProvinceData } from '../db/provinces-database';
import { PriceDatabaseRepository } from '../db/price-database';
import {
  validateBudgetCrossCheck,
  CrossValidationResult,
  crossValidate,
  CalculationInputForCrossValidation,
  CrossValidationAlert,
} from '../../lib/calculation-engine/typology-benchmarks';
import { formatKz } from '../../lib/utils/formatters';
import {
  AngolaProvince,
  BudgetItemInput,
  BudgetChapterSummary,
  BudgetCalculationResult,
  CalculatedBudgetItem,
  WorkCategory,
} from '../types/domain';

export const CATEGORY_NAMES_PT: Record<WorkCategory, string> = {
  estaleiro_demolicoes: '1. Trabalhos Preparatórios, Estaleiro e Demolições',
  fundacoes_estruturas: '2. Fundações e Estruturas de Betão Armado',
  alvenarias_paredes: '3. Alvenarias, Paredes e Muros',
  coberturas_impermeabilizacoes: '4. Coberturas e Impermeabilizações',
  revestimentos_acabamentos: '5. Revestimentos, Pavimentos e Acabamentos',
  instalacoes_eletricas: '6. Redes e Instalações Elétricas',
  instalacoes_hidraulicas: '7. Redes de Águas, Esgotos e Drenagem',
  carpintarias_serralharias: '8. Caixilharias, Portas e Serralharias',
  pinturas: '9. Pinturas e Tratamento de Superfícies',
};

export interface CalculationOptions {
  provincia: AngolaProvince;
  itens: BudgetItemInput[];
  taxaBDI?: number; // Padrão: 0.22 (22%)
  taxaEncargosSociais?: number; // Padrão: 0.25 (25%)
  taxaIVA?: number; // Padrão: 0.14 (14% Regime Geral AGT Angola)
  horasDiaEquipa?: number; // Padrão: 48h/dia (6 operários * 8h)
}

export class CalculationEngine {
  /**
   * Executa o cálculo determinístico de um orçamento com base na base de dados
   * de preços e nos coeficientes específicos da província de Angola selecionada.
   */
  public static calculate(options: CalculationOptions): BudgetCalculationResult {
    const {
      provincia,
      itens,
      taxaBDI = 0.22,
      taxaEncargosSociais = 0.25,
      taxaIVA = 0.14,
      horasDiaEquipa = 48,
    } = options;

    const dadosProvincia = getProvinceData(provincia);

    let custoDiretoMateriaisKz = 0;
    let custoDiretoMaoDeObraKz = 0;
    let custoDiretoEquipamentosKz = 0;
    let totalHorasTrabalhoEstimadas = 0;

    const itensCalculados: CalculatedBudgetItem[] = [];

    // 1. Processamento determinístico item a item
    for (const itemInput of itens) {
      const artigo = PriceDatabaseRepository.getById(itemInput.artigoId);
      if (!artigo) {
        continue;
      }

      // Ajuste dos custos com base nos coeficientes regionais da BD
      const custoMaterialUnitarioKz = Math.round(
        artigo.custoMaterialKz * dadosProvincia.coeficienteLogistica
      );

      const custoMaoDeObraUnitarioKz = Math.round(
        artigo.custoMaoDeObraKz * dadosProvincia.coeficienteMaoDeObra
      );

      // Equipamento tem componente logística ponderada (manutenção e combustível regional)
      const fatorEquipamento = 1 + (dadosProvincia.coeficienteLogistica - 1) * 0.4;
      const custoEquipamentoUnitarioKz = Math.round(artigo.custoEquipamentoKz * fatorEquipamento);

      const precoUnitarioKz =
        custoMaterialUnitarioKz + custoMaoDeObraUnitarioKz + custoEquipamentoUnitarioKz;

      const subtotalKz = precoUnitarioKz * itemInput.quantidade;
      const horasItem = artigo.rendimentoHomemHora * itemInput.quantidade;

      custoDiretoMateriaisKz += custoMaterialUnitarioKz * itemInput.quantidade;
      custoDiretoMaoDeObraKz += custoMaoDeObraUnitarioKz * itemInput.quantidade;
      custoDiretoEquipamentosKz += custoEquipamentoUnitarioKz * itemInput.quantidade;
      totalHorasTrabalhoEstimadas += horasItem;

      itensCalculados.push({
        artigoId: artigo.id,
        codigo: artigo.codigo,
        descricao: artigo.descricao,
        categoria: artigo.categoria,
        unidade: artigo.unidade,
        quantidade: itemInput.quantidade,
        precoUnitarioKz,
        custoMaterialKz: custoMaterialUnitarioKz,
        custoMaoDeObraKz: custoMaoDeObraUnitarioKz,
        custoEquipamentoKz: custoEquipamentoUnitarioKz,
        subtotalKz,
        horasEstimadasTrabalho: Number(horasItem.toFixed(1)),
        notas: itemInput.notas,
      });
    }

    const custoDiretoTotalKz =
      custoDiretoMateriaisKz + custoDiretoMaoDeObraKz + custoDiretoEquipamentosKz;

    // 2. Encargos Sociais sobre a Mão de Obra direta
    const valorEncargosSociaisKz = Math.round(
      custoDiretoMaoDeObraKz * taxaEncargosSociais
    );

    // 3. BDI (Benefícios e Despesas Indiretas: estaleiro central, seguros, risco e lucro)
    const baseBDI = custoDiretoTotalKz + valorEncargosSociaisKz;
    const valorBDIKz = Math.round(baseBDI * taxaBDI);

    // 4. Preço de venda antes de impostos
    const subtotalAntesIVAKz = baseBDI + valorBDIKz;

    // 5. IVA de Angola (AGT)
    const valorIVAKz = Math.round(subtotalAntesIVAKz * taxaIVA);
    const precoTotalFinalKz = subtotalAntesIVAKz + valorIVAKz;

    // 6. Estimativa de tempo (dias úteis de obra)
    const diasEstimadosObra = Math.max(1, Math.ceil(totalHorasTrabalhoEstimadas / horasDiaEquipa));

    // 7. Agrupamento em capítulos para o Mapa de Quantidades e Custos
    const categoriasPresentes: WorkCategory[] = [
      'estaleiro_demolicoes',
      'fundacoes_estruturas',
      'alvenarias_paredes',
      'coberturas_impermeabilizacoes',
      'revestimentos_acabamentos',
      'instalacoes_eletricas',
      'instalacoes_hidraulicas',
      'carpintarias_serralharias',
      'pinturas',
    ];

    const capitulos: BudgetChapterSummary[] = [];

    for (const cat of categoriasPresentes) {
      const itensDoCapitulo = itensCalculados.filter((it) => it.categoria === cat);
      if (itensDoCapitulo.length > 0) {
        const subtotalMateriais = itensDoCapitulo.reduce(
          (acc, cur) => acc + cur.custoMaterialKz * cur.quantidade,
          0
        );
        const subtotalMaoDeObra = itensDoCapitulo.reduce(
          (acc, cur) => acc + cur.custoMaoDeObraKz * cur.quantidade,
          0
        );
        const subtotalEquip = itensDoCapitulo.reduce(
          (acc, cur) => acc + cur.custoEquipamentoKz * cur.quantidade,
          0
        );
        const subtotalGeral = itensDoCapitulo.reduce((acc, cur) => acc + cur.subtotalKz, 0);

        capitulos.push({
          categoria: cat,
          nomeCategoria: CATEGORY_NAMES_PT[cat],
          itens: itensDoCapitulo,
          subtotalMateriaisKz: subtotalMateriais,
          subtotalMaoDeObraKz: subtotalMaoDeObra,
          subtotalEquipamentosKz: subtotalEquip,
          subtotalGeralKz: subtotalGeral,
        });
      }
    }

    return {
      custoDiretoMateriaisKz,
      custoDiretoMaoDeObraKz,
      custoDiretoEquipamentosKz,
      custoDiretoTotalKz,
      taxaBDI,
      valorBDIKz,
      taxaEncargosSociais,
      valorEncargosSociaisKz,
      taxaIVA,
      valorIVAKz,
      precoTotalFinalKz,
      totalHorasTrabalhoEstimadas: Number(totalHorasTrabalhoEstimadas.toFixed(1)),
      diasEstimadosObra,
      capitulos,
    };
  }

  /**
   * Formata valores em Kwanzas (Kz) no padrão angolano com separador de milhares por ponto (.)
   * Exemplo: 13423828 -> "13.423.828 Kz"
   */
  public static formatKz(valor: number): string {
    return formatKz(valor);
  }

  /**
   * Validação cruzada do orçamento contra os intervalos de referência de mercado.
   */
  public static validateCrossCheck(
    tipologia: string,
    dimensao: number,
    totalCalculadoKz: number,
    provincia: string = 'Luanda'
  ): CrossValidationResult {
    return validateBudgetCrossCheck(tipologia, dimensao, totalCalculadoKz, provincia);
  }

  /**
   * Validação cruzada entre cálculo directo e referência imobiliária.
   * Custo estimado via imobiliária = precoVendaMercado / 1.3
   * Alerta se divergência > 20%.
   */
  public static crossValidate(
    calculation: CalculationInputForCrossValidation
  ): CrossValidationAlert {
    return crossValidate(calculation);
  }
}
