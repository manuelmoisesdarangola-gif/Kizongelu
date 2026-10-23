/**
 * @file lib/seo/meta.ts
 * Gestão de Metadados e Esquemas Estruturados Schema.org (JSON-LD) para SEO (Fase 15).
 * Implementa Organization, LocalBusiness, Product, FAQPage e Article.
 */

export interface SeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  schema?: Record<string, any>;
}

export function updateDocumentSeo(props: SeoProps): void {
  if (typeof document === 'undefined') return;

  const { title, description, canonicalUrl, ogType = 'website', ogImage, schema } = props;

  // 1. Title
  document.title = title;

  // 2. Meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. OpenGraph
  const setMetaProperty = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:type', ogType);
  if (canonicalUrl) {
    setMetaProperty('og:url', canonicalUrl);
  }
  if (ogImage) {
    setMetaProperty('og:image', ogImage);
  }

  // 4. Twitter Cards
  const setMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);

  // 5. Schema.org JSON-LD
  if (schema) {
    const scriptId = 'schema-structured-data';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema, null, 2);
  }
}

/**
 * Esquema Schema.org Organization (Kizongelu)
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kizongelu',
    alternateName: ['Kizongelu', 'Kizongelu IA', 'Kizongelu Angola'],
    url: 'https://kizongelu.ao',
    logo: 'https://kizongelu.ao/icons/icon-512x512.png',
    description: 'Plataforma SaaS de engenharia e orçamentação determinística de obras para Angola.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Luanda',
      addressCountry: 'AO',
      streetAddress: 'Talatona, Luanda Sul',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+244-923-000-111',
      contactType: 'customer support',
      areaServed: 'AO',
      availableLanguage: ['Portuguese'],
    },
    sameAs: [
      'https://www.facebook.com/kizongelu.ao',
      'https://www.linkedin.com/company/kizongelu',
    ],
  };
}

/**
 * Esquema Schema.org LocalBusiness (por Província de Angola)
 */
export function getLocalBusinessSchema(provinciaNome: string, capital: string, precoMedioM2: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Kizongelu Engenharia & Orçamentos - ${provinciaNome}`,
    description: `Serviço especializado de medições, orçamentos analíticos e controlo de custos de construção civil na província de ${provinciaNome}, Angola.`,
    url: `https://kizongelu.ao/obras-em/${provinciaNome.toLowerCase()}`,
    address: {
      '@type': 'PostalAddress',
      addressRegion: provinciaNome,
      addressLocality: capital,
      addressCountry: 'AO',
    },
    priceRange: `${precoMedioM2.toLocaleString('pt-PT')} Kz/m²`,
    currenciesAccepted: 'AOA',
    paymentAccepted: 'MULTICAIXA Express, Transferência bancária',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${provinciaNome}, Angola`,
    },
  };
}

/**
 * Esquema Schema.org Product (SaaS de Orçamentos e Caderno de Encargos)
 */
export function getProductSchema(nomePlano: string, precoKz: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Plano ${nomePlano} - Kizongelu Orçamentação`,
    description: 'Acesso a motor determinístico de engenharia, listas de compras e cadernos de encargos certificados com QR Code.',
    brand: {
      '@type': 'Brand',
      name: 'Kizongelu',
    },
    offers: {
      '@type': 'Offer',
      price: precoKz,
      priceCurrency: 'AOA',
      availability: 'https://schema.org/InStock',
      url: 'https://kizongelu.ao/plano',
    },
  };
}

/**
 * Esquema Schema.org FAQPage
 */
export function getFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

/**
 * Esquema Schema.org Article (para Artigos do Blog)
 */
export function getArticleSchema(article: {
  title: string;
  excerpt: string;
  date: string;
  authorName: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Kizongelu',
      logo: {
        '@type': 'ImageObject',
        url: 'https://kizongelu.ao/icons/icon-512x512.png',
      },
    },
    datePublished: article.date,
    mainEntityOfPage: `https://kizongelu.ao/blog/${article.slug}`,
  };
}
