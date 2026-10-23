/**
 * @file lib/utils/formatters.ts
 * Formatadores padronizados para timestamps relativos em português de Angola e valores monetários.
 */

/**
 * Converte uma data (string ISO, Date ou timestamp numérico) num timestamp relativo amigável:
 * "há 2 horas", "ontem", "há 3 dias", "agora mesmo", etc.
 */
export function formatRelativeTime(dateInput: string | Date | number): string {
  if (!dateInput) return 'recentemente';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return 'recentemente';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Se a data for ligeiramente no futuro devido a pequenos desvios de relógio
  if (diffSec < 45) {
    return 'agora mesmo';
  }

  if (diffMin < 60) {
    return diffMin === 1 ? 'há 1 minuto' : `há ${diffMin} minutos`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? 'há 1 hora' : `há ${diffHours} horas`;
  }

  if (diffDays === 1) {
    return 'ontem';
  }

  if (diffDays < 7) {
    return `há ${diffDays} dias`;
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`;
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? 'há 1 mês' : `há ${months} meses`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}

/**
 * Formata um número segundo as normas angolanas:
 * - Separador de milhares: ponto (.)
 * - Separador decimal: vírgula (,)
 * - Sem decimais se valor inteiro
 * 
 * Exemplos:
 * - 29400000 → "29.400.000"
 * - 3.9 → "3,9"
 * - 4760 → "4.760"
 */
export function formatNumberPt(value: number, maxDecimals = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  const hasDecimals = !Number.isInteger(value);
  const dec = hasDecimals ? maxDecimals : 0;
  const fixedStr = value.toFixed(dec);
  const [intPart, decPart] = fixedStr.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (decPart !== undefined && Number(decPart) !== 0) {
    return `${formattedInt},${decPart}`;
  }
  return formattedInt;
}

/**
 * Formata um valor numérico em Kwanzas angolanos (Kz):
 * - Separador de milhares: ponto (.)
 * - Separador decimal: vírgula (,)
 * - Sufixo: " Kz"
 * - Sem decimais se valor inteiro
 * 
 * Exemplo: 29400000 → "29.400.000 Kz"
 */
export function formatKz(amount: number): string {
  return `${formatNumberPt(amount)} Kz`;
}

