/**
 * @file src/components/public/PrecosIndicePage.tsx
 * Índice Relativo de Custos de Construção em Angola (/precos-angola/indice) — Fase 17.
 * Comparação das 8 principais províncias (Base Luanda = 100) com coeficientes logísticos.
 */

import React from 'react';
import {
  MapPin,
  TrendingUp,
  Truck,
  Building,
  ArrowLeft,
  ArrowRight,
  Info,
  Scale,
  Award,
  Layers,
} from 'lucide-react';
import { LISTA_8_PROVINCIAS, PROVINCIAS_DATA } from '@/lib/data/provincias';
import { formatCurrencyKz } from '@/lib/format/currency';

interface PrecosIndicePageProps {
  onStartWizard?: () => void;
  onNavigate?: (path: string) => void;
}

export const PrecosIndicePage: React.FC<PrecosIndicePageProps> = ({
  onStartWizard,
  onNavigate,
}) => {
  // Matriz de índice relativo calculada sobre a média dos principais insumos (Base Luanda = 100)
  const indices = [
    {
      slug: 'luanda',
      nome: 'Luanda',
      indice: 100,
      coefLogistica: 1.00,
      custoM2: PROVINCIAS_DATA.luanda.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.luanda.precos.cimento50kg,
      fatorDiferencial: 'Polo central de importação marítima e proximidade imediata aos principais polos cimenteiros e industriais.',
      destaque: 'Base de Referência Nacional (100)',
    },
    {
      slug: 'benguela',
      nome: 'Benguela',
      indice: 94,
      coefLogistica: 0.94,
      custoM2: PROVINCIAS_DATA.benguela.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.benguela.precos.cimento50kg,
      fatorDiferencial: 'Polo cimenteiro do Lobito e abundância local de brita granítica de excelente qualidade.',
      destaque: 'Custo 6% Inferior a Luanda',
    },
    {
      slug: 'huila',
      nome: 'Huíla (Lubango)',
      indice: 98,
      coefLogistica: 0.98,
      custoM2: PROVINCIAS_DATA.huila.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.huila.precos.cimento50kg,
      fatorDiferencial: 'Abundância de agregados de pedreiras e granitos locais; ligação ferroviária CFB a partir do Porto do Namibe.',
      destaque: 'Excelente Rácio Qualidade / Preço',
    },
    {
      slug: 'huambo',
      nome: 'Huambo',
      indice: 96,
      coefLogistica: 0.96,
      custoM2: PROVINCIAS_DATA.huambo.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.huambo.precos.cimento50kg,
      fatorDiferencial: 'Custos de mão-de-obra 10% inferiores e areias fluviais de qualidade, com frete compensado pelo CFB.',
      destaque: 'Custo de Mão de Obra Competitivo',
    },
    {
      slug: 'cuanza-sul',
      nome: 'Cuanza Sul (Sumbe/Porto Amboim)',
      indice: 104,
      coefLogistica: 1.04,
      custoM2: PROVINCIAS_DATA['cuanza-sul'].precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA['cuanza-sul'].precos.cimento50kg,
      fatorDiferencial: 'Frete rodoviário através da Estrada Nacional 100; dependência parcial dos entrepostos de Luanda ou Lobito.',
      destaque: '+4% Sobrecusto Logístico',
    },
    {
      slug: 'malanje',
      nome: 'Malanje',
      indice: 108,
      coefLogistica: 1.08,
      custoM2: PROVINCIAS_DATA.malanje.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.malanje.precos.cimento50kg,
      fatorDiferencial: 'Frete de 380 km a partir de Luanda para varões de aço e tintas; agregados locais disponíveis.',
      destaque: '+8% Sobrecusto Logístico',
    },
    {
      slug: 'namibe',
      nome: 'Namibe',
      indice: 102,
      coefLogistica: 1.02,
      custoM2: PROVINCIAS_DATA.namibe.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.namibe.precos.cimento50kg,
      fatorDiferencial: 'Porto comercial activo e ligação rodoviária ao Lubango, com cuidados acrescidos com a salinidade costeira.',
      destaque: '+2% Face à Base de Luanda',
    },
    {
      slug: 'cabinda',
      nome: 'Cabinda',
      indice: 118,
      coefLogistica: 1.18,
      custoM2: PROVINCIAS_DATA.cabinda.precos.custoMedioM2,
      cimentoKz: PROVINCIAS_DATA.cabinda.precos.cimento50kg,
      fatorDiferencial: 'Enclave geográfico com transporte marítimo obrigatório para cimento e ferro a partir de Luanda ou Ponta Negra.',
      destaque: '+18% Fator Insular / Marítimo',
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
      {/* 1. Header */}
      <div className="space-y-4">
        {onNavigate && (
          <button
            onClick={() => onNavigate('/precos-angola')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à Tabela de Preços por Província</span>
          </button>
        )}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
            Índice Relativo Regional de Custos
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
            Mapa Comparativo de Custos de Construção (Base Luanda = 100)
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Compreenda como os factores de frete rodoviário, travessia marítima para Cabinda e fábricas locais de cimento afectam o orçamento final da sua obra em Angola.
          </p>
        </div>
      </div>

      {/* 2. Grelha das 8 Províncias com Índices Visuais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((item) => (
          <div
            key={item.slug}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
              item.slug === 'luanda'
                ? 'bg-[#0F3D5C] text-white border-[#0A293E] shadow-md'
                : 'bg-white text-slate-900 border-slate-200 hover:border-[#0F3D5C] shadow-card-subtle'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${item.slug === 'luanda' ? 'text-amber-300' : 'text-slate-500'}`}>
                  {item.nome}
                </span>
                <span
                  className={`text-xs font-mono font-black px-2 py-0.5 rounded-full ${
                    item.slug === 'luanda'
                      ? 'bg-white/20 text-white'
                      : item.indice > 100
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  Índice {item.indice}
                </span>
              </div>

              <div>
                <span className={`text-2xl font-black font-mono block ${item.slug === 'luanda' ? 'text-white' : 'text-[#0F3D5C]'}`}>
                  {formatCurrencyKz(item.custoM2)}
                </span>
                <span className={`text-[10px] block ${item.slug === 'luanda' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Custo médio por m² de obra
                </span>
              </div>

              <p className={`text-[11px] leading-relaxed ${item.slug === 'luanda' ? 'text-slate-200' : 'text-slate-600'}`}>
                {item.fatorDiferencial}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100/20 mt-4 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${item.slug === 'luanda' ? 'text-amber-300' : 'text-slate-500'}`}>
                {item.destaque}
              </span>
              {onNavigate && (
                <button
                  onClick={() => onNavigate(`/obras-em/${item.slug}`)}
                  className={`text-xs font-bold underline cursor-pointer ${item.slug === 'luanda' ? 'text-white' : 'text-[#0F3D5C]'}`}
                >
                  Detalhes &rarr;
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Tabela Comparativa Detalhada com Explicação dos Coeficientes */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card-subtle space-y-4">
        <h3 className="font-bold text-slate-900 text-base">
          Quadro Comparativo de Sobrecustos e Vantagens Competitivas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Província</th>
                <th className="p-3 text-center">Índice Relativo</th>
                <th className="p-3 text-right">Cimento 50kg (Kz)</th>
                <th className="p-3 text-right">Custo Médio / m²</th>
                <th className="p-3">Fator Logístico Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indices.map((row) => (
                <tr key={row.slug} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{row.nome}</td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                        row.indice === 100
                          ? 'bg-slate-100 text-slate-800'
                          : row.indice > 100
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {row.indice}
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-[#0F3D5C]">
                    {formatCurrencyKz(row.cimentoKz)}
                  </td>
                  <td className="p-3 text-right font-mono font-black text-slate-900">
                    {formatCurrencyKz(row.custoM2)}
                  </td>
                  <td className="p-3 text-slate-600 text-[11px]">{row.fatorDiferencial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Conclusão Técnica do Observatório */}
      <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 text-xs text-slate-700 leading-relaxed">
        <strong className="block text-slate-900 font-bold text-sm">
          Como o Kizongelu Aplica estes Índices nos Orçamentos:
        </strong>
        <p>
          Ao selecionar uma província no assistente de orçamentação, o motor carrega automaticamente a matriz de preços locais e o coeficiente de frete correspondente. Isto assegura que uma moradia orçamentada no Lobito (Benguela) beneficie do menor custo local de cimento, enquanto uma obra em Cabinda incorpore a devida margem de frete marítimo e desembaraço alfandegário.
        </p>
      </div>
    </div>
  );
};

export default PrecosIndicePage;
