import { describe, expect, it } from 'vitest';
import { ApiError } from '@detaileed/api-client';
import { NEW_CAR, requestFormDefaults, requestFormSchema, toSubmitRequest } from '@/features/booking/model/requestForm';
import { groupSlotsByDay } from '@/features/booking/model/slots';
import { bookingErrorMessage } from '@/features/booking/model/errors';

const WAW = 'Europe/Warsaw';
const now = new Date('2026-11-16T10:00:00Z');

describe('request form rules', () => {
  const base = { ...requestFormDefaults(['a'], 'Large', true), vehicleChoice: 'car1' };

  it('needs a free slot when the studio plans', () => {
    const schema = requestFormSchema(true, WAW, now);
    expect(schema.safeParse(base).error?.issues[0].message).toBe('Wybierz wolny termin');
    expect(schema.safeParse({ ...base, slotStart: '2026-11-17T08:00:00Z' }).success).toBe(true);
  });

  it('needs a future day and time otherwise', () => {
    const schema = requestFormSchema(false, WAW, now);
    expect(schema.safeParse({ ...base, date: '2026-11-16', time: '10:00' }).error?.issues[0].message).toBe(
      'Wybierz termin w przyszłości',
    );
    expect(schema.safeParse({ ...base, date: '2026-11-16', time: '12:00' }).success).toBe(true);
  });

  it('checks a typed car and the services', () => {
    const schema = requestFormSchema(true, WAW, now);
    const res = schema.safeParse({ ...base, serviceIds: [], vehicleChoice: NEW_CAR, slotStart: 'x' });
    const paths = res.error?.issues.map((i) => i.path.join('.'));
    expect(paths).toContain('serviceIds');
    expect(paths).toContain('car.licensePlate');
  });
});

describe('toSubmitRequest', () => {
  it('sends a garage car and a slot', () => {
    const values = {
      ...requestFormDefaults(['a', 'b'], 'Medium', true),
      vehicleChoice: 'car1',
      slotStart: '2026-11-17T08:00:00Z',
    };
    expect(toSubmitRequest(values, 's1', WAW, true)).toEqual({
      studioId: 's1',
      serviceIds: ['a', 'b'],
      vehicleId: 'car1',
      vehicle: null,
      preferredAt: '2026-11-17T08:00:00Z',
      notes: null,
    });
  });

  it('sends a typed car and the local time in UTC', () => {
    const values = {
      ...requestFormDefaults(['a'], 'Large', false),
      car: { licensePlate: 'kr 12345', brand: '', model: '', size: 'Large' as const },
      date: '2026-11-20',
      time: '09:00',
      notes: '  Psia sierść ',
    };
    expect(toSubmitRequest(values, 's1', WAW, false)).toMatchObject({
      vehicleId: null,
      vehicle: { licensePlate: 'KR 12345', brand: null, model: null, size: 'Large' },
      preferredAt: '2026-11-20T08:00:00.000Z',
      notes: 'Psia sierść',
    });
  });
});

describe('groupSlotsByDay', () => {
  it('groups by the studio day with local times', () => {
    const days = groupSlotsByDay(
      [{ start: '2026-11-17T08:00:00Z' }, { start: '2026-11-16T23:30:00Z' }, { start: '2026-11-17T07:00:00Z' }],
      WAW,
    );
    expect(days.map((d) => [d.day, d.slots.map((s) => s.time)])).toEqual([['2026-11-17', ['00:30', '08:00', '09:00']]]);
  });
});

describe('bookingErrorMessage', () => {
  it('explains request error codes', () => {
    expect(bookingErrorMessage(new ApiError(409, { code: 'BOOKING_REQUEST_LIMIT' }))).toMatch(/3 zapytania/);
    expect(bookingErrorMessage(new ApiError(400, { detail: 'Inny błąd' }))).toBe('Inny błąd');
  });

  it('explains garage errors a request can run into', () => {
    expect(bookingErrorMessage(new ApiError(409, { code: 'CUSTOMER_GARAGE_FULL' }))).toMatch(/10 aut/);
  });
});
