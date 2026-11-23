import { BOOKING_STATUSES } from '@/features/bookings';

/** Classes of a booking block on the day board: the status tone's soft fill (on a `::before` layer over an opaque
 * surface, so the hour lines don't show through) with a solid edge in the tone. */
const TONES: Record<string, string> = {
  [BOOKING_STATUSES.UTWORZONA.name]: 'before:bg-info-soft border-info',
  [BOOKING_STATUSES.ZAKONCZONA.name]: 'before:bg-success-soft border-success',
  [BOOKING_STATUSES.ANULOWANA.name]: 'before:bg-danger-soft border-danger',
};

const NEUTRAL = 'before:bg-muted border-border-strong';

/** The block colours for a booking status name the API sends; neutral for a status the app doesn't know. */
export function bookingBlockTone(status: string | null | undefined): string {
  return (status && TONES[status]) || NEUTRAL;
}
