import { dayInZone, timeInZone } from '@detaileed/domain/studioTime';

/** "14:30": the studio's local time of a moment. */
export function formatBookingTime(iso: string, timeZone: string): string {
  return timeInZone(iso, timeZone);
}

/** "07.03" (day.month of the studio day) for compact lists. */
export function formatBookingDay(iso: string, timeZone: string): string {
  const [, month, day] = dayInZone(iso, timeZone).split('-');
  return `${day}.${month}`;
}
