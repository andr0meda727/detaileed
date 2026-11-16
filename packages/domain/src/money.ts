/** Formats złoty the Polish way without the currency: 1234.5 → "1234,50". */
export function formatPln(amount: number | null | undefined): string {
  return (amount ?? 0).toFixed(2).replace('.', ',');
}
