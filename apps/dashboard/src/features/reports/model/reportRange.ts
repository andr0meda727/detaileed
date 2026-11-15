const MAX_DAYS = 366;

/**
 * Checks a report range of \`YYYY-MM-DD\` dates before it is sent; returns the Polish error message, or null
 * when the range is fine. The API accepts at most a year.
 */
export function reportRangeError(dateFrom: string, dateTo: string): string | null {
  if (!dateFrom || !dateTo) return 'Wybierz zakres dat';
  if (dateFrom > dateTo) return 'Data od nie może być późniejsza niż data do';
  const days = (Date.parse(dateTo) - Date.parse(dateFrom)) / 86_400_000 + 1;
  if (days > MAX_DAYS) return 'Raport może obejmować najwyżej rok';
  return null;
}
