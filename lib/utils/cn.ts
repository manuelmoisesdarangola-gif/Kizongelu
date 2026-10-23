/**
 * @file lib/utils/cn.ts
 * Helper de classes CSS para junção condicional e deduplicação de utilitários Tailwind.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
