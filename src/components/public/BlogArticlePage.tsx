/**
 * @file src/components/public/BlogArticlePage.tsx
 * Ecrã de Leitura Otimizado de Artigo Técnico do Blog (/blog/:slug) — Fase 15.
 *
 * Funcionalidades:
 * - Layout de leitura focado (máx 720px) para legibilidade e tipografia limpa.
 * - Autor + data de publicação + tempo de leitura estimado.
 * - Blocos de destaque destacados (Dica, Atenção, Exemplo com dados numéricos).
 * - CTA inline de conversão para o Wizard.
 * - Partilha nativa no WhatsApp e Facebook.
 * - Artigos relacionados com navegação direta.
 * - Injeção automática de Schema.org Article.
 */

import React, { useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  Building2,
  AlertTriangle,
  Lightbulb,
  Calculator,
  MessageCircle,
  Facebook,
  ExternalLink,
} from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, BlogArticle } from '@/lib/data/blog';
import { updateDocumentSeo, getArticleSchema } from '@/lib/seo/meta';
import { trackEvent } from '@/lib/analytics/tracker';

interface BlogArticlePageProps {
  slug: string;
  onNavigateBlog: () => void;
  onNavigateArticle: (slug: string) => void;
  onStartWizard: () => void;
}

export const BlogArticlePage: React.FC<BlogArticlePageProps> = ({
  slug,
  onNavigateBlog,
  onNavigateArticle,
  onStartWizard,
}) => {
  const article = getArticleBySlug(slug);

  useEffect(() => {
    if (article) {
      updateDocumentSeo({
        title: `${article.title} | Blog Kizongelu Angola`,
        description: article.excerpt,
        ogType: 'article',
        canonicalUrl: `https://kizongelu.ao/blog/${article.slug}`,
        schema: getArticleSchema({
          title: article.title,
          excerpt: article.excerpt,
          date: article.date,
          authorName: article.author.name,
          slug: article.slug,
        }),
      });
    }
  }, [article]);

  if (!article) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Artigo não encontrado</h2>
        <p className="text-xs text-slate-500">
          O artigo solicitado não existe ou foi arquivado.
        </p>
        <button
          onClick={onNavigateBlog}
          className="px-4 py-2 bg-[#0F3D5C] text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Voltar ao Blog
        </button>
      </div>
    );
  }

  const relatedArticles = getRelatedArticles(article.slug);

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`${article.title} - Leia no Kizongelu: https://kizongelu.ao/blog/${article.slug}`);
    trackEvent('whatsapp_share', { article: article.slug });
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(`https://kizongelu.ao/blog/${article.slug}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="py-8 sm:py-14 max-w-[720px] mx-auto px-4 sm:px-6 space-y-8">
      {/* Botão Voltar */}
      <button
        onClick={onNavigateBlog}
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#0F3D5C] hover:text-[#F59E0B] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Voltar a todos os artigos</span>
      </button>

      {/* Cabeçalho do Artigo */}
      <header className="space-y-4 border-b border-slate-200 pb-6">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          {article.category}
        </span>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-[#0F3D5C] text-white font-bold text-xs flex items-center justify-center">
              {article.author.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">{article.author.name}</span>
              <span className="text-[10px] text-slate-400">{article.author.role}</span>
            </div>
          </div>

          <span className="text-slate-300 hidden sm:inline">&bull;</span>

          <div className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{article.date}</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">&bull;</span>

          <div className="flex items-center space-x-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{article.readTime}</span>
          </div>
        </div>

        {/* Botões de Partilha */}
        <div className="flex items-center space-x-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400">Partilhar:</span>
          <button
            onClick={handleShareWhatsapp}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-emerald-200"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleShareFacebook}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-blue-200"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </button>
        </div>
      </header>

      {/* Resumo / Lead */}
      <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed italic bg-slate-50 p-4 rounded-2xl border-l-4 border-[#0F3D5C]">
        {article.excerpt}
      </p>

      {/* Conteúdo Principal com Blocos Especiais */}
      <div className="space-y-8 text-sm text-slate-800 leading-relaxed font-normal">
        {article.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight pt-2">
              {section.heading}
            </h2>

            {section.content.map((p, pIdx) => (
              <p key={pIdx} className="text-slate-700 leading-relaxed">
                {p}
              </p>
            ))}

            {/* Tabela de Preços / Dados se existir */}
            {section.table && (
              <div className="overflow-x-auto my-4 rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      {section.table.headers.map((h, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3.5">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bloco de Dica */}
            {section.dica && (
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start space-x-3 text-xs text-emerald-950 my-3">
                <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 block font-bold mb-0.5">Dica de Engenharia:</strong>
                  <span>{section.dica}</span>
                </div>
              </div>
            )}

            {/* Bloco de Atenção */}
            {section.atencao && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start space-x-3 text-xs text-amber-950 my-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 block font-bold mb-0.5">Atenção em Obra:</strong>
                  <span>{section.atencao}</span>
                </div>
              </div>
            )}

            {/* Bloco de Exemplo */}
            {section.exemplo && (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2 text-xs text-blue-950 my-3">
                <strong className="text-[#0F3D5C] block font-black text-sm">
                  {section.exemplo.titulo}
                </strong>
                <p className="text-blue-900">{section.exemplo.descricao}</p>
                {section.exemplo.dados && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200 text-xs">
                    {Object.entries(section.exemplo.dados).map(([k, v]) => (
                      <div key={k} className="bg-white/80 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-500 block">{k}</span>
                        <span className="font-bold text-[#0F3D5C] font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* CTA Inline */}
      <div className="my-8 p-6 rounded-3xl bg-gradient-to-r from-[#0F3D5C] to-slate-900 text-white space-y-3 text-center shadow-xl">
        <h3 className="text-base sm:text-lg font-black tracking-tight">
          Precisa de calcular as quantidades exatas para o seu projeto?
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Evite compras a mais e faltas na obra. O motor determinístico do Kizongelu gera a lista completa de compras em 2 minutos.
        </p>
        <button
          onClick={onStartWizard}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center space-x-2 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>Começar Cálculo do Meu Orçamento</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Artigos Relacionados */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <h3 className="text-base font-black text-slate-900">Artigos Relacionados:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {relatedArticles.map((rel) => (
            <div
              key={rel.slug}
              onClick={() => onNavigateArticle(rel.slug)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#0F3D5C] shadow-xs cursor-pointer transition-all space-y-2 group"
            >
              <span className="text-[10px] font-bold text-amber-600 block uppercase">
                {rel.category}
              </span>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0F3D5C] line-clamp-2">
                {rel.title}
              </h4>
              <span className="text-[11px] text-slate-400 block">{rel.readTime}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
