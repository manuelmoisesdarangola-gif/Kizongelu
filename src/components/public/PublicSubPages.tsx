/**
 * @file src/components/public/PublicSubPages.tsx
 * Páginas institucionais e de suporte para o Layout 1 (Público):
 * - Como Funciona
 * - Preços & Planos Detalhados
 * - Blog Técnico de Construção em Angola
 * - Sobre Nós & Engenharia
 * - Contactos Talatona
 * - Termos, Privacidade, Cookies & Aviso Técnico
 * - Ferramentas e Calculadoras Gratuitas
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  FileSpreadsheet,
  Building2,
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  TrendingDown,
  Layers,
  Award,
  FileCheck,
} from 'lucide-react';
import { BLOG_ARTICLES, CATEGORIAS_BLOG, BlogArticle } from '@/lib/data/blog';
import { updateDocumentSeo } from '@/lib/seo/meta';

interface SubPageProps {
  onStartWizard: () => void;
  onNavigate: (path: string) => void;
  onLogin: () => void;
}

// 1. COMO FUNCIONA
export const ComoFuncionaPage: React.FC<SubPageProps> = ({ onStartWizard, onNavigate }) => {
  const steps = [
    {
      num: '01',
      title: 'Definição da Obra & Localização',
      desc: 'Indique a província de Angola (Luanda, Benguela, Huíla, Huambo, entre outras), tipo de estrutura e área bruta de construção.',
    },
    {
      num: '02',
      title: 'Cálculo Determinístico de Materiais',
      desc: 'O motor de engenharia calcula o número exacto de sacos de cimento Portland, varões de aço A400, inertes e blocos de betão.',
    },
    {
      num: '03',
      title: 'Aplicação dos Preços Reais em Kwanzas (Kz)',
      desc: 'Os coeficientes de mercado e cotações de armazéns locais são aplicados com margens e encargos calibrados.',
    },
    {
      num: '04',
      title: 'Orçamento e Mapa de Quantidades com Verificação QR',
      desc: 'Descarregue o dossier completo em PDF profissional com código QR para validação anti-fraude em processos de obra.',
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Metodologia de Engenharia
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Como funciona o Kizongelu
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Substitua estimativas por cálculo rigoroso baseado em boas práticas de engenharia civil e nos rendimentos de mão de obra e materiais em Angola.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {steps.map((s) => (
          <div key={s.num} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-3xl font-black text-[#0F3D5C]/20">{s.num}</span>
            <h3 className="text-lg font-bold text-[#0F3D5C]">{s.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0F3D5C] text-white p-8 sm:p-12 rounded-3xl text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-black">Pronto para saber quanto vai gastar?</h2>
        <p className="text-sm text-slate-200 max-w-xl mx-auto">
          Veja a estimativa gratuita em minutos. Desbloqueie o orçamento completo quando quiser.
        </p>
        <button
          onClick={onStartWizard}
          className="px-8 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer inline-flex items-center space-x-2"
        >
          <span>Começar o orçamento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 2. PREÇOS & PLANOS (Fase 13)
export const PrecosPage: React.FC<SubPageProps> = ({ onStartWizard, onLogin }) => {
  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Transparência Total em Kwanzas (Kz)
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Pacotes de Orçamentos
        </h1>
        <p className="text-base text-slate-600">
          Escolha o pacote certo para o seu tipo de obra. Orçamentos sem expiração.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {/* Card 1 — PARTICULAR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Particular</span>
            <div className="text-3xl font-black text-[#0F3D5C]">
              12.999{' '}
              <span className="text-xs font-semibold text-slate-500 block">
                Kz · Pagamento único
              </span>
            </div>
            <p className="text-xs text-slate-500">Para quem vai construir ou remodelar a sua própria casa.</p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">1 orçamento completo</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>1 utilizador</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>PDF profissional + QR</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Acesso permanente</span></li>
            </ul>
          </div>
          <div>
            <button
              onClick={onStartWizard}
              className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Emitir orçamento &rarr;
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">Acesso permanente</p>
          </div>
        </div>

        {/* Card 2 — PROFISSIONAL */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profissional</span>
            <div className="text-3xl font-black text-[#0F3D5C]">
              15.999{' '}
              <span className="text-xs font-semibold text-slate-500 block">
                Kz · Pacote único
              </span>
            </div>
            <p className="text-xs text-slate-500">Para engenheiros civis, arquitectos e orçamentistas independentes.</p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">3 orçamentos completos</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>1 utilizador</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>PDF profissional + QR</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Suporte por WhatsApp em horário laboral</span></li>
            </ul>
          </div>
          <div>
            <button
              onClick={onLogin}
              className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Comprar pacote &rarr;
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
          </div>
        </div>

        {/* Card 3 — EMPRESA (Recomendado) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#F59E0B] shadow-xl flex flex-col justify-between space-y-6 relative">
          <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide px-3 py-0.5 rounded-full uppercase shadow-xs leading-normal">
            ⭐ RECOMENDADO
          </span>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">Empresa</span>
            </div>
            <div className="text-3xl font-black text-[#0F3D5C]">
              29.999{' '}
              <span className="text-xs font-semibold text-slate-500 block">
                Kz · Pacote único
              </span>
            </div>
            <p className="text-xs text-slate-500">Para pequenas construtoras, empreiteiros e gabinetes técnicos.</p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">6 orçamentos completos</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">2 utilizadores</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>PDF com logótipo da sua empresa</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Margens configuráveis</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Exportação Excel (.xlsx)</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Gestor de conta dedicado</span></li>
            </ul>
          </div>
          <div>
            <button
              onClick={onLogin}
              className="w-full py-3 bg-[#F59E0B] text-slate-950 font-black text-xs rounded-xl hover:bg-[#D97706] transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Comprar pacote &rarr;
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
          </div>
        </div>

        {/* Card 4 — EMPRESA PLUS (borda navy 2px) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-[#0F3D5C] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow relative">
          <span className="absolute -top-3 right-4 bg-[#0F3D5C] text-white font-black text-[10px] tracking-wide px-3 py-0.5 rounded-full uppercase shadow-xs leading-normal">
            MELHOR VALOR
          </span>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-[#0F3D5C] uppercase tracking-wider whitespace-nowrap">Empresa Plus</span>
            </div>
            <div className="text-3xl font-black text-[#0F3D5C]">
              49.999{' '}
              <span className="text-xs font-semibold text-slate-500 block">
                Kz · Pacote único
              </span>
            </div>
            <p className="text-xs text-slate-500">Para médias/grandes construtoras com múltiplos projectos em simultâneo.</p>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">12 orçamentos completos</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="font-semibold">Até 5 utilizadores</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Tudo do pacote Empresa</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Dossiê técnico para processos de crédito</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Gestor de conta com engenheiro dedicado</span></li>
              <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Suporte telefónico directo</span></li>
            </ul>
          </div>
          <div>
            <button
              onClick={onLogin}
              className="w-full py-3 bg-[#0F3D5C] text-white font-bold text-xs rounded-xl hover:bg-[#0A293E] transition-colors cursor-pointer"
            >
              Comprar pacote &rarr;
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. BLOG
export const BlogPage: React.FC<SubPageProps> = ({ onStartWizard, onNavigate }) => {
  const [selectedCat, setSelectedCat] = useState<string>('Todas');
  const [visibleCount, setVisibleCount] = useState<number>(6);

  useEffect(() => {
    updateDocumentSeo({
      title: 'Blog de Construção Civil e Preços de Obras em Angola | Kizongelu',
      description: 'Artigos técnicos, comparativos de preços de materiais (cimento, ferro, blocos) e legislação para obras em Luanda, Benguela, Huíla e restantes províncias.',
      canonicalUrl: 'https://kizongelu.ao/blog',
    });
  }, []);

  const allPosts = BLOG_ARTICLES;
  const categories = CATEGORIAS_BLOG;

  const filtered = allPosts.filter((p) => selectedCat === 'Todas' || p.category === selectedCat);
  const featuredPost = allPosts.find((p) => p.featured) || allPosts[0];
  const gridPosts = filtered.slice(0, visibleCount);

  return (
    <div className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          CONHECIMENTO E ENGENHARIA PRÁTICA
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Blog de Construção Civil
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Artigos técnicos, comparativos de preços de mercado e orientações normativas para construir com segurança financeira.
        </p>
      </div>

      {/* Artigo em Destaque (Featured Hero) */}
      {selectedCat === 'Todas' && featuredPost && (
        <div
          onClick={() => onNavigate(`/blog/${featuredPost.slug}`)}
          className="bg-gradient-to-br from-[#0F3D5C] via-[#0A293E] to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[10px] uppercase rounded-full tracking-wider">
              Artigo em Destaque
            </span>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-snug group-hover:text-amber-300 transition-colors">
              {featuredPost.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 line-clamp-3">
              {featuredPost.excerpt}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="text-amber-300 font-bold">{featuredPost.author.name}</span>
              <span>&bull;</span>
              <span>{featuredPost.date}</span>
              <span>&bull;</span>
              <span>{featuredPost.readTime}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros por Categoria */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-[#0F3D5C] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grelha de 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gridPosts.map((p) => (
          <div
            key={p.slug}
            onClick={() => onNavigate(`/blog/${p.slug}`)}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-[#0F3D5C] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {p.category}
                </span>
                <span>{p.readTime}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F3D5C] leading-snug transition-colors">
                {p.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {p.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#0F3D5C] font-bold">
              <span>Ler artigo completo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Paginação Carregar Mais */}
      {visibleCount < filtered.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Carregar mais artigos
          </button>
        </div>
      )}
    </div>
  );
};

// 4. CONTACTOS
export const ContactosPage: React.FC<SubPageProps> = ({ onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [assunto, setAssunto] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Estamos Próximos de Si
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Contactos
        </h1>
        <p className="text-base text-slate-600">
          Dúvidas sobre orçamentos, validação de comprovativos Multicaixa Express ou parcerias institucionais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#0F3D5C]">Informações de Contacto</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Escritório:</strong>
                <span>Talatona, Luanda &bull; Angola</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Email Geral:</strong>
                <a href="mailto:suporte@kizongelu.ao" className="hover:text-[#0F3D5C] transition-colors">
                  suporte@kizongelu.ao
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[#0F3D5C]">Envie-nos uma mensagem</h3>
          
          {submitted ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5">
              <strong className="block font-bold text-sm text-emerald-950">Mensagem enviada com sucesso!</strong>
              <p className="text-emerald-800">
                A nossa equipa responderá em até 24 horas úteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  placeholder="O seu nome completo"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0F3D5C] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email ou WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="+244 9XX XXX XXX ou email@exemplo.ao"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0F3D5C] focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Assunto <span className="font-normal text-slate-400">(opcional)</span>
                </label>
                <select
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0F3D5C] focus:bg-white transition-colors text-slate-700 cursor-pointer"
                >
                  <option value="">Seleccione um assunto</option>
                  <option value="duvida_orcamento">Dúvida sobre orçamento</option>
                  <option value="problema_pagamento">Problema com pagamento</option>
                  <option value="parceria">Parceria institucional</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mensagem
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Como podemos ajudar?"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#0F3D5C] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F3D5C] text-white text-xs font-bold rounded-xl hover:bg-[#0A293E] active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                Enviar Mensagem
              </button>

              <div className="pt-1 text-center space-y-1 text-[11px] text-slate-500">
                <p>
                  Ao enviar, aceita a nossa{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/privacidade')}
                    className="text-amber-600 hover:text-amber-700 underline underline-offset-2 font-medium cursor-pointer"
                  >
                    Política de Privacidade
                  </button>
                  .
                </p>
                <p className="text-slate-400">
                  Respondemos em até 24 horas úteis.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// 5. SOBRE NÓS
export const SobrePage: React.FC<SubPageProps> = ({ onStartWizard }) => {
  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Engenharia Nacional
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
          Sobre o Kizongelu
        </h1>
        <p className="text-base text-slate-600">
          Nascido da necessidade real de proprietários e empreiteiros em Angola terem orçamentos sem distorções nem desperdícios de dinheiro.
        </p>
      </div>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h2 className="text-xl font-bold text-[#0F3D5C]">A Nossa Missão</h2>
        <p>
          O Kizongelu foi concebido por engenheiros civis angolanos para combater dois grandes problemas da construção em Angola: a falta de previsibilidade de custos e a sobrefaturação de quantidades de cimento, ferro e blocos.
        </p>
        <p>
          Através de algoritmos determinísticos calibrados segundo boas práticas de engenharia civil e a realidade dos principais polos construtivos de Luanda, Benguela, Huambo e Lubango, permitimos que qualquer pessoa saiba com precisão quanto vai gastar antes de comprar o primeiro bloco.
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="font-bold text-[#0F3D5C]">Feito com rigor e orgulho em Angola 🇦🇴</span>
          <button
            onClick={onStartWizard}
            className="px-5 py-2.5 bg-[#F59E0B] text-slate-950 font-bold text-xs rounded-xl hover:bg-[#D97706]"
          >
            Experimentar Grátis
          </button>
        </div>
      </div>
    </div>
  );
};

// 6. LEGAL: TERMOS, PRIVACIDADE, COOKIES & AVISO TÉCNICO
export const LegalPage: React.FC<{ type: 'termos' | 'privacidade' | 'cookies' | 'aviso-tecnico' }> = ({ type }) => {
  const titles = {
    termos: 'Termos e Condições de Utilização',
    privacidade: 'Política de Privacidade e Proteção de Dados',
    cookies: 'Gestão de Cookies e Armazenamento Local',
    'aviso-tecnico': 'Aviso Técnico & Isenção de Responsabilidade',
  };

  return (
    <div className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F3D5C]">{titles[type]}</h1>
        <p className="text-xs text-slate-400">Última atualização: Setembro de 2026 &bull; República de Angola</p>

        {type === 'termos' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">1. Objeto</h3>
            <p>O Kizongelu disponibiliza ferramentas de software como serviço (SaaS) para orçamentação e estimativa de quantidades de materiais de construção civil com cotações em Kwanzas (Kz).</p>
            <h3 className="font-bold text-slate-900">2. Pagamentos e Desbloqueio</h3>
            <p>Os pagamentos são processados em moeda nacional através de Multicaixa Express e transferências bancárias directas para as nossas coordenadas oficiais de liquidação.</p>
          </div>
        )}

        {type === 'privacidade' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">1. Recolha de Dados</h3>
            <p>Recolhemos apenas os dados estritamente necessários para o cálculo dos orçamentos, emissão dos orçamentos e mapas de quantidades e validação de autenticidade documental.</p>
            <h3 className="font-bold text-slate-900">2. Segurança e Soberania dos Dados</h3>
            <p>Todos os dados são cifrados em repouso e em trânsito com estrita observância das boas práticas de proteção de dados.</p>
          </div>
        )}

        {type === 'cookies' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">1. Utilização de Cookies</h3>
            <p>Utilizamos cookies técnicos essenciais para a manutenção da sua sessão autenticada e preferências de visualização.</p>
          </div>
        )}

        {type === 'aviso-tecnico' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900">1. Natureza das Estimativas</h3>
            <p>Os orçamentos gerados pelo Kizongelu constituem peças técnicas de engenharia de custos baseadas em parâmetros normativos. Não dispensam o projecto de execução e a fiscalização de um engenheiro civil ou arquitecto credenciado no local da obra.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. FERRAMENTAS & CALCULADORAS GRÁTIS
export const FerramentasPage: React.FC<SubPageProps> = ({ onStartWizard, onNavigate }) => {
  const tools = [
    {
      slug: 'calculadora-de-blocos',
      title: 'Calculadora de Blocos de Alvenaria',
      desc: 'Calcule a quantidade exata de blocos de 10, 15 ou 20 para alvenarias de elevação e muros, com margem de quebra e cimento de assentamento.',
      badge: 'Alvenaria',
    },
    {
      slug: 'calculadora-de-betao',
      title: 'Calculadora de Betão & Inertes (m³)',
      desc: 'Converta qualquer volume cúbico (sapatas, vigas, lajes) em sacos de cimento de 50 kg, metros cúbicos de areia e brita 1 e 2.',
      badge: 'Estruturas',
    },
    {
      slug: 'calculadora-de-ceramica',
      title: 'Calculadora de Cerâmica & Cimento Cola',
      desc: 'Dimensione caixas de piso ou azulejo (60x60, 45x45, 80x80), sacos de cimento cola de 25 kg e betume de juntas com margem de corte.',
      badge: 'Acabamentos',
    },
    {
      slug: 'calculadora-de-muro',
      title: 'Calculadora Completa de Muro de Vedação',
      desc: 'Orçamento estimativo de muros com sapatas, pilares a cada 2.5m, viga de coroamento e blocos de 15 para lotes 20x30m e 30x40m.',
      badge: 'Perímetro',
    },
  ];

  return (
    <div className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
          Utilitários de Engenharia Gratuitos
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0F3D5C] tracking-tight">
          Calculadoras Rápidas de Construção
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Mini-ferramentas práticas com fórmulas de engenharia civil e cotações reais em Kwanzas (Kz) para conferir quantidades no armazém ou no estaleiro.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((t) => (
          <div
            key={t.slug}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#0F3D5C] hover:shadow-md transition-all group"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
                {t.badge}
              </span>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0F3D5C] leading-snug">
                {t.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t.desc}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate(`/ferramentas/${t.slug}`)}
                className="w-full py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Usar Calculadora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onStartWizard}
                className="w-full py-1.5 text-[11px] font-semibold text-slate-400 hover:text-amber-600 transition-colors text-center block cursor-pointer"
              >
                Ou criar orçamento completo &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
