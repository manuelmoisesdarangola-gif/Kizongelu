/**
 * @file src/app/sitemap.ts
 * Dynamic Sitemap Generator for Next.js / SEO crawlers (Fase 15).
 */

import { LISTA_8_PROVINCIAS } from '@/lib/data/provincias';
import { BLOG_ARTICLES } from '@/lib/data/blog';

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export default function sitemap(): SitemapEntry[] {
  const baseUrl = 'https://kizongelu.ao';
  const currentDate = new Date().toISOString().split('T')[0];

  const staticRoutes: SitemapEntry[] = [
    { url: `${baseUrl}/`, lastModified: currentDate, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/como-funciona`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/precos`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/plano`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/ferramentas`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/sobre`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contactos`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/termos`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacidade`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/cookies`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/aviso-tecnico`, lastModified: currentDate, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/verificar`, lastModified: currentDate, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const toolsRoutes: SitemapEntry[] = [
    'calculadora-de-blocos',
    'calculadora-de-betao',
    'calculadora-de-ceramica',
    'calculadora-de-muro',
  ].map((slug) => ({
    url: `${baseUrl}/ferramentas/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const provinciaRoutes: SitemapEntry[] = LISTA_8_PROVINCIAS.map((prov) => ({
    url: `${baseUrl}/obras-em/${prov.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const blogRoutes: SitemapEntry[] = BLOG_ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...toolsRoutes, ...provinciaRoutes, ...blogRoutes];
}
