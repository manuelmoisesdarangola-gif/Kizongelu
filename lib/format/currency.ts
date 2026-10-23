/**
 * @file lib/format/currency.ts
 * Formatação padronizada para valores monetários em Kwanza (Kz).
 * Exemplo de saída: "12.999 Kz"
 */

export function formatCurrencyKz(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '0 Kz';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Formatação no padrão de Angola com separador de milhar por ponto (.)
  const parts = Math.round(num).toString().split('');
  const formattedInteger = parts
    .reverse()
    .reduce((acc, digit, idx) => {
      return (idx > 0 && idx % 3 === 0 ? digit + '.' : digit) + acc;
    }, '');

  return `${formattedInteger} Kz`;
}
