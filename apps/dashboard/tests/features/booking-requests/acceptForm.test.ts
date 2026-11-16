import { describe, expect, it } from 'vitest';
import { acceptFormDefaults, acceptFormSchema, toAcceptBody } from '@/features/booking-requests/model/acceptForm';
import type { BookingRequest } from '@/features/booking-requests/model/types';

const WAW = 'Europe/Warsaw';
const request = { preferredAt: '2026-11-20T08:00:00Z', estimatedPrice: 89.5 } as BookingRequest;

describe('accept form', () => {
  it('starts from the preferred time in the studio zone and the estimate', () => {
    expect(acceptFormDefaults(request, WAW)).toEqual({ date: '2026-11-20', time: '09:00', price: '89,5', bayId: null });
  });

  it('sends the time in UTC, the price as a number and the picked bay', () => {
    const values = { date: '2026-11-21', time: '10:30', price: '120,00', bayId: 'bay1' };
    expect(acceptFormSchema.safeParse(values).success).toBe(true);
    expect(toAcceptBody(values, WAW)).toEqual({ scheduledAt: '2026-11-21T09:30:00.000Z', price: 120, bayId: 'bay1' });
  });

  it('rejects a bad price', () => {
    expect(acceptFormSchema.safeParse({ ...acceptFormDefaults(request, WAW), price: '12,345' }).success).toBe(false);
  });
});
