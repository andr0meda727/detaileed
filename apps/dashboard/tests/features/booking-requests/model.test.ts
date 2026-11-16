import { describe, expect, it } from 'vitest';
import { ApiError, type BookingRequestDto, type RequestPlanDto } from '@detaileed/api-client';
import { toBookingRequest, toRequestPlan } from '@/features/booking-requests/model/types';
import { requestStatus } from '@/features/booking-requests/model/statuses';
import { requestErrorMessage } from '@/features/booking-requests/model/errors';

const dto: BookingRequestDto = {
  id: 'r1',
  studioId: 's1',
  studioName: 'Detail Kraków',
  status: 'Accepted',
  preferredAt: '2026-11-20T08:00:00Z',
  customerName: 'Anna Nowak',
  customerPhone: '500600700',
  customerEmail: 'anna@example.com',
  vehicle: { licensePlate: 'KR 12345', brand: 'Volvo', model: 'XC90', size: 'Large' },
  services: [
    { serviceId: 'a', name: 'Mycie', price: '89.00' },
    { serviceId: 'b', name: 'Ceramika', price: null },
  ],
  estimatedPrice: '89',
  hasUnpricedServices: true,
  notes: null,
  rejectionReason: null,
  createdAt: '2026-11-16T10:00:00Z',
  decidedAt: '2026-11-16T11:00:00Z',
  booking: { id: 'b1', scheduledAt: '2026-11-20T08:00:00Z', status: 'Utworzona', totalPrice: '120.5' },
};

describe('toBookingRequest', () => {
  it('turns prices into numbers and keeps "on request" as null', () => {
    const r = toBookingRequest(dto);
    expect(r.estimatedPrice).toBe(89);
    expect(r.services.map((s) => s.price)).toEqual([89, null]);
    expect(r.booking?.totalPrice).toBe(120.5);
  });
});

describe('toRequestPlan', () => {
  it('normalises the plan', () => {
    const plan: RequestPlanDto = {
      requestId: 'r1',
      planningEnabled: true,
      durationMinutes: '90',
      preferred: {
        start: '2026-11-20T08:00:00Z',
        end: '2026-11-20T09:30:00Z',
        fits: false,
        withinOpeningHours: true,
        bayId: null,
        bayName: null,
      },
      alternatives: [
        {
          start: '2026-11-20T09:30:00Z',
          end: '2026-11-20T11:00:00Z',
          bayId: 'bay1',
          bayName: 'Stanowisko 1',
          minutesFromPreferred: '90',
          wastedMinutes: 0,
        },
      ],
      competingRequests: [],
    };
    const p = toRequestPlan(plan);
    expect(p.durationMinutes).toBe(90);
    expect(p.alternatives[0].minutesFromPreferred).toBe(90);
  });
});

describe('statuses and errors', () => {
  it('labels statuses', () => {
    expect(requestStatus('Pending')).toMatchObject({ label: 'Oczekujące', tone: 'amber' });
    expect(requestStatus('Unknown').label).toBe('Unknown');
  });

  it('explains request error codes and falls back to the API text', () => {
    expect(requestErrorMessage(new ApiError(409, { code: 'NO_BAY_AVAILABLE' }), 'x')).toMatch(
      /nie ma wolnego stanowiska/,
    );
    expect(requestErrorMessage(new ApiError(400, { detail: 'Coś innego' }), 'x')).toBe('Coś innego');
  });
});
