/**
 * @file src/lib/router-utils.ts
 * Utilitários de roteamento universais para suportar:
 * 1. Domínio raiz padrão (Cloud Run, Docker, dev server: localhost:3000 ou /)
 * 2. GitHub Pages com subdirectório (/Kizongelu/)
 * 3. Restauração de SPA a partir de query (?/rota) e hash routing (#/rota)
 */

/**
 * Obtém o subcaminho base da aplicação caso esteja alojada no GitHub Pages
 * (e.g. /Kizongelu ou https://<user>.github.io/<repo>/)
 */
export function getAppBasePath(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;

  // 1. Detecção explícita de repositório Kizongelu (com ou sem subpasta docs)
  const match = pathname.match(/^\/([kK]izongelu)(?:\/docs)?(?:\/|$)/);
  if (match) {
    const hasDocs = pathname.toLowerCase().startsWith(`/${match[1].toLowerCase()}/docs`);
    return hasDocs ? `/${match[1]}/docs` : `/${match[1]}`;
  }

  // 2. Detecção genérica para domínios github.io
  if (window.location.hostname.endsWith('github.io')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      if (segments[1]?.toLowerCase() === 'docs') {
        return `/${segments[0]}/docs`;
      }
      return `/${segments[0]}`;
    }
  }

  return '';
}

/**
 * Normaliza o caminho actual do browser para a rota interna da aplicação.
 * Exemplo:
 * - "/Kizongelu/" -> "/"
 * - "/Kizongelu/precos" -> "/precos"
 * - "/Kizongelu/#/wizard/proj_1/etapa-1" -> "/wizard/proj_1/etapa-1"
 * - "/?/como-funciona" -> "/como-funciona"
 */
export function normalizeAppPath(
  rawPath: string = (typeof window !== 'undefined' ? window.location.pathname : '/'),
  rawHash: string = (typeof window !== 'undefined' ? window.location.hash : '')
): string {
  // Prioridade 1: Suporte a hash routing se presente (e.g. #/precos)
  if (rawHash) {
    let h = rawHash;
    if (h.startsWith('#')) h = h.slice(1);
    if (h.startsWith('!')) h = h.slice(1);
    if (h.startsWith('/')) {
      const cleanHashRoute = h.split('?')[0];
      if (cleanHashRoute) return cleanHashRoute;
    }
  }

  // Prioridade 2: Parâmetro SPA redirect (?/rota ou ?p=/rota)
  if (typeof window !== 'undefined' && window.location.search) {
    const search = window.location.search;
    if (search.startsWith('?/')) {
      const queryRoute = search.slice(2).split('&')[0];
      if (queryRoute && !queryRoute.toLowerCase().includes('docs')) {
        return `/${queryRoute}`.replace(/\/+/g, '/');
      }
    }
    const params = new URLSearchParams(search);
    const pParam = params.get('p');
    if (pParam && !pParam.toLowerCase().includes('docs')) {
      return pParam.startsWith('/') ? pParam : `/${pParam}`;
    }
  }

  // Prioridade 3: Extracção do base path do pathname
  const base = getAppBasePath();
  let path = rawPath;

  if (base && path.toLowerCase().startsWith(base.toLowerCase())) {
    path = path.slice(base.length);
  }

  // Garante barra inicial
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Remove barras duplicadas
  path = path.replace(/\/+/g, '/');

  // Remove barra final a menos que seja apenas '/'
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  return path || '/';
}

/**
 * Constrói a URL externa que deve ser colocada no histórico do browser
 * preservando o prefixo do GitHub Pages se existente.
 */
export function buildExternalUrl(internalPath: string): string {
  const clean = internalPath.startsWith('/') ? internalPath : `/${internalPath}`;
  const base = getAppBasePath();
  return `${base}${clean}`;
}
