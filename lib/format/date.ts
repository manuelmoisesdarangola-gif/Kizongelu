/**
 * @file lib/format/date.ts
 * Formatação padronizada de datas e horas para Angola / PT-PT.
 * Exemplo de saída: "26/03/2025, 14:32"
 */

export function formatDatePT(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return '';

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput;

  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}
