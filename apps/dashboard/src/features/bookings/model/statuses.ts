/** Booking status lookup rows (ids are the API's status ids; `name` is what responses carry in `status`). */
export const BOOKING_STATUSES = {
  UTWORZONA: { id: '6aeadcad-a836-46fc-a445-3a3a832f49a4', name: 'Utworzona', color: '#3b82f6' },
  ZAKONCZONA: { id: '6f4f4496-dd44-4ad8-8021-37ef6b3279dd', name: 'Zakończona', color: '#64748b' },
  ANULOWANA: { id: 'd89cf9d3-ee24-481a-ac76-c5cb224f1c1a', name: 'Anulowana', color: '#ef4444' },
} as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[keyof typeof BOOKING_STATUSES];
