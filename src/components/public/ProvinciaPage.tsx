/**
 * @file src/components/public/ProvinciaPage.tsx
 * Página de SEO Local e Especificidades Provinciais (/obras-em/:provincia) — Fase 15.
 *
 * Funcionalidades:
 * - Conteúdo 100% contextualizado para a província selecionada.
 * - Chips com todos os municípios cobertos.
 * - Tabela de preços médios locais (cimento 50kg, brita, areia, varão, pedreiro, servente).
 * - Desafios geotécnicos e logísticos específicos da região.
 * - Testemunho real de engenheiro ou empreiteiro local.
 * - Injeção automática de Schema.org LocalBusiness e meta tags dedicadas.
 * - CTAs diretos para o Wizard de Orçamentação.
 */

import React, { useEffect } from 'react';
import {
  MapPin,
  Building2,
  HardHat,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Quote,
  Calculator,
  Compass,
  DollarSign,
  Truck,
  Users,
} from 'lucide-react';
import { PROVINCIAS_DATA, ProvinciaInfo, LISTA_8_PROVINCIAS } from '@/lib/data/provincias';
import { updateDocumentSeo, getLocalBusinessSchema } from '@/lib/seo/meta';
import { trackEvent } from '@/lib/analytics/tracker';

interface ProvinciaPageProps {
  provinciaSlug: string;
  onStartWizard: (provinciaSlug?: string) => void;
  onNavigate: (path: string) => void;
}

export const ProvinciaPage: React.FC<ProvinciaPageProps> = ({
  provinciaSlug,
  onStartWizard,
  onNavigate,
}) => {
  const normalizedSlug = provinciaSlug.toLowerCase().trim();
  const provincia: ProvinciaInfo = PROVINCIAS_DATA[normalizedSlug] || PROVINCIAS_DATA['luanda'];

  useEffect(() => {
    // Atualiza metadados e schema estruturado LocalBusiness
    updateDocumentSeo({
      title: provincia.metaTitle,
      description: provincia.metaDescription,
      canonicalUrl: `https://kizongelu.ao/obras-em/${provincia.slug}`,
      schema: getLocalBusinessSchema(provincia.nome, provincia.capital, provincia.precos.custoMedioM2),
    });

    // Tracking de seleção provincial
    trackEvent('province_selector_change', {
      province: provincia.nome,
      slug: provincia.slug,
    });
  }, [provincia]);

  const formatKz = (valor: number) => {
    return valor.toLocaleString('pt-PT') + ' Kz';
  };

  const handleStartCalculo = () => {
    trackEvent('cta_click', {
      location: `provincia_${provincia.slug}`,
      target: 'wizard_start',
    });
    onStartWizard(provincia.slug);
  };

  return (
    <div className="py-8 sm:py-14 space-y-12">
      {/* Topo / Hero da Província */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-[#0F3D5C] via-[#0D344E] to-slate-950 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute right-0 top-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Breadcrumb / Localização */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
            <span
              onClick={() => onNavigate('/')}
              className="hover:text-amber-400 cursor-pointer transition-colors"
            >
              Início
            </span>
            <span>&bull;</span>
            <span
              onClick={() => onNavigate('/#provincias')}
              className="hover:text-amber-400 cursor-pointer transition-colors"
            >
              Províncias de Angola
            </span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">{provincia.nome}</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Região: {provincia.regiao}</span>
              <span className="text-white/40">&bull;</span>
              <span>Capital: {provincia.capital}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Construir e Orçamentar Obras em{' '}
              <span className="text-amber-400">{provincia.nome}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              {provincia.descricaoDetalhada}
            </p>

            {/* Fatores Regionais */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300 block">Custo Médio / m²</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-300">
                  {formatKz(provincia.precos.custoMedioM2)}
                </span>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                <span className="text-[11px] text-slate-300 block">Coef. Logístico</span>
                <span className="text-lg sm:text-xl font-black font-mono text-white">
                  {provincia.coeficienteLogistica.toFixed(2)}x
                </span>
              </div>

              <div className="bg-white/10 rounded-2xl p-3 border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-300 block">Mão de Obra Local</span>
                <span className="text-lg sm:text-xl font-black font-mono text-white">
                  {provincia.coeficienteMaoDeObra.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* CTA do Hero */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleStartCalculo}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calcular Obra em {provincia.nome}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <span className="text-xs text-slate-300 text-center sm:text-left">
                Preços e fretes calibrados para os municípios de {provincia.capital}.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Municípios Cobertos em Chips */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Municípios Cobertos na Província de {provincia.nome}
              </h2>
              <p className="text-xs text-slate-500">
                O motor do Kizongelu ajusta a logística rodoviária e disponibilidade de materiais para cada localidade:
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {provincia.municipios.map((m, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-[#0F3D5C] hover:text-white transition-colors border border-slate-200 cursor-default"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tabela de Preços Médios Locais */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                Observatório de Preços 2026
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Cotações Médias dos Principais Materiais em {provincia.nome}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              Última atualização: Setembro de 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Artigo / Insumo</th>
                  <th className="py-3 px-4">Unidade</th>
                  <th className="py-3 px-4 text-right">Preço Médio Local</th>
                  <th className="py-3 px-4">Referência Técnica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Cimento Portland (Saco)</td>
                  <td className="py-3.5 px-4 text-slate-500">50 kg</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.cimento50kg)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Classes 32.5N / 42.5R (Cimento Portland de uso geral e estrutural)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Areia Média Lavada</td>
                  <td className="py-3.5 px-4 text-slate-500">Metro cúbico (m³)</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.areiaM3)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Areia de rio desassoreada para betão e reboco</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Brita Granítica (Nº 1 e 2)</td>
                  <td className="py-3.5 px-4 text-slate-500">Metro cúbico (m³)</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.britaM3)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Brita de pedreira local para betão armado estrutural</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Varão de Aço Nervurado A400</td>
                  <td className="py-3.5 px-4 text-slate-500">Quilograma (kg)</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.varaoAcoKg)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Varão de diâmetros Ø6 a Ø25 com certificado de ensaio</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Bloco de Cimento 15x20x40</td>
                  <td className="py-3.5 px-4 text-slate-500">Unidade</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.bloco15Un)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Prensado industrialmente com cura a vapor</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Mão de Obra: Pedreiro Oficial</td>
                  <td className="py-3.5 px-4 text-slate-500">Dia de trabalho</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.pedreiroDiaria)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Oficial de 1ª classe com experiência comprovada</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-slate-900">Mão de Obra: Servente de Construção</td>
                  <td className="py-3.5 px-4 text-slate-500">Dia de trabalho</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-[#0F3D5C]">
                    {formatKz(provincia.precos.serventeDiaria)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">Apoio a betoneira, transporte e arrumação de estaleiro</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Desafios Específicos & Testemunho Local */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desafios da Província */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Desafios Técnicos na Província de {provincia.nome}</span>
          </div>

          <p className="text-xs text-amber-950 leading-relaxed">
            Antes de iniciar a sua obra em {provincia.nome}, certifique-se de que o seu mapa de quantidades prevê os seguintes fatores:
          </p>

          <ul className="space-y-2.5 text-xs text-amber-900">
            {provincia.desafiosEspecificos.map((desafio, i) => (
              <li key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{desafio}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Testemunho de Engenheiro / Cliente Local */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <Quote className="w-8 h-8 text-[#0F3D5C]/20" />
            <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
              &ldquo;{provincia.testemunho.texto}&rdquo;
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-[#0F3D5C] text-white flex items-center justify-center font-bold text-sm">
              {provincia.testemunho.nome.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                {provincia.testemunho.nome}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {provincia.testemunho.cargo} &bull; {provincia.testemunho.empresa} ({provincia.testemunho.municipio})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Outras Províncias (Navegação Cruzada) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900">
          Explorar Preços de Construção Noutras Províncias:
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LISTA_8_PROVINCIAS.filter((p) => p.slug !== provincia.slug).map((p) => (
            <button
              key={p.slug}
              onClick={() => onNavigate(`/obras-em/${p.slug}`)}
              className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-slate-900 group-hover:text-[#0F3D5C] block">
                {p.nome}
              </span>
              <span className="text-[10px] text-slate-400">
                {formatKz(p.precos.custoMedioM2)}/m²
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-radial from-[#0F3D5C] to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-5 shadow-xl">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight">
            Pronto para orçamentar a sua obra em {provincia.nome}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Sem estimativas no ar. Obtenha o mapa discriminado de cimento, varão, blocos e mão de obra alinhado com boas práticas de engenharia em minutos.
          </p>
          <div className="pt-2">
            <button
              onClick={handleStartCalculo}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Calculator className="w-5 h-5" />
              <span>Gerar Orçamento Detalhado para {provincia.nome}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
