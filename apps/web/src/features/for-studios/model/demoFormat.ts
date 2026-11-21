/**
 * Date text for the demo's wall-clock times (`YYYY-MM-DDTHH:mm`). Plain string work instead of `Date` in the
 * local time zone, so the server-rendered HTML matches what the browser renders.
 */

const MONTHS_SHORT = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
const MONTHS_GENITIVE = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];
const WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

/** `09:00` */
export const timeOf = (at: string) => at.slice(11, 16);

/** `15.04` */
export const dayMonthOf = (at: string) => `${at.slice(8, 10)}.${at.slice(5, 7)}`;

/** `15` */
export const dayOf = (at: string) => at.slice(8, 10);

/** `kwi` */
export const shortMonthOf = (at: string) => MONTHS_SHORT[Number(at.slice(5, 7)) - 1];

/** `YYYY-MM-DD` of a wall-clock time. */
export const dateOf = (at: string) => at.slice(0, 10);

/** `środa, 15 kwietnia` for a `YYYY-MM-DD` date. */
export function longDateOf(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS_GENITIVE[d.getUTCMonth()]}`;
}
