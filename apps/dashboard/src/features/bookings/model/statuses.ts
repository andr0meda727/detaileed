import type { BadgeTone } from '@detaileed/ui';

/** Booking status lookup rows (ids are the API's status ids; `name` is what responses carry in `status`). */
export const BOOKING_STATUSES = {
  UTWORZONA: { id: '6aeadcad-a836-46fc-a445-3a3a832f49a4', name: 'Utworzona' },
  ZAKONCZONA: { id: '6f4f4496-dd44-4ad8-8021-37ef6b3279dd', name: 'Zakończona' },
  ANULOWANA: { id: 'd89cf9d3-ee24-481a-ac76-c5cb224f1c1a', name: 'Anulowana' },
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];

const STATUS_TONES: Record<string, BadgeTone> = {
  [BOOKING_STATUSES.UTWORZONA.name]: 'info',
  [BOOKING_STATUSES.ZAKONCZONA.name]: 'success',
  [BOOKING_STATUSES.ANULOWANA.name]: 'danger',
};

/** The badge tone of a status name the API sends; `undefined` for a status the app doesn't know. */
export function bookingStatusTone(status: string | null | undefined): BadgeTone | undefined {
  return status ? STATUS_TONES[status] : undefined;
}
