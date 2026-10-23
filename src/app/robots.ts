/**
 * @file src/app/robots.ts
 * Robots metadata handler for Next.js / SEO crawlers (Fase 15).
 */

export interface RobotsConfig {
  rules: {
    userAgent: string | string[];
    allow?: string | string[];
    disallow?: string | string[];
    crawlDelay?: number;
  };
  sitemap?: string | string[];
  host?: string;
}

export default function robots(): RobotsConfig {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/*',
        '/painel',
        '/painel/*',
        '/projetos/*/preview',
        '/plano',
        '/definicoes',
      ],
    },
    sitemap: 'https://kizongelu.ao/sitemap.xml',
    host: 'https://kizongelu.ao',
  };
}
