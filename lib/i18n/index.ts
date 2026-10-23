/**
 * @file lib/i18n/index.ts
 * Gestor de Internacionalização (i18n).
 * V1 activa com dicionário integral PT-PT / Português de Angola.
 * Estrutura preparada para comutação dinâmica PT-PT e EN.
 */

import { pt } from './pt';
import { en } from './en';

export type SupportedLocale = 'pt-AO' | 'en';

export const CURRENT_LOCALE: SupportedLocale = 'pt-AO';

const dictionaries = {
  'pt-AO': pt,
  'en': en,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type I18nKey = NestedKeyOf<typeof pt>;

/**
 * Traduz uma chave com fallback automático para PT-AO.
 */
export function t(key: string, locale: SupportedLocale = CURRENT_LOCALE): string {
  const dict = dictionaries[locale] || pt;
  const parts = key.split('.');

  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback para PT
      let fallback: any = pt;
      for (const p of parts) {
        if (fallback && typeof fallback === 'object' && p in fallback) {
          fallback = fallback[p];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
  }

  return typeof current === 'string' ? current : key;
}

export function useTranslation() {
  return {
    t,
    locale: CURRENT_LOCALE,
    isRTL: false,
    formatCurrency: (value: number) => {
      return new Intl.NumberFormat('pt-AO', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value) + ' Kz';
    },
  };
}

export { pt, en };
