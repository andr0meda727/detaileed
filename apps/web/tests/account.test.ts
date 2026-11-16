import { describe, expect, it } from 'vitest';
import { carSchema, profileSchema, toCarRequest } from '@/features/account/model/schemas';
import { toMyRequest } from '@/features/account/model/requests';

describe('profile and car rules', () => {
  it('validates the phone like the backend', () => {
    expect(profileSchema.safeParse({ name: 'Anna Nowak', phone: '+48 500 600 700' }).success).toBe(true);
    expect(profileSchema.safeParse({ name: 'Anna Nowak', phone: '12345' }).success).toBe(false);
  });

  it('validates plates and maps a car for the API', () => {
    expect(carSchema.safeParse({ licensePlate: 'KR 12345', brand: '', model: '', size: 'Large' }).success).toBe(true);
    expect(carSchema.safeParse({ licensePlate: 'KR_12345!', brand: '', model: '', size: 'Large' }).success).toBe(false);
    expect(toCarRequest({ licensePlate: ' kr 12345 ', brand: 'Volvo', model: '', size: 'Large' })).toEqual({
      licensePlate: 'KR 12345',
      brand: 'Volvo',
      model: null,
      size: 'Large',
    });
  });
});

describe('toMyRequest', () => {
  it('normalises prices', () => {
    const r = toMyRequest({
      id: 'r1',
      studioId: 's1',
      studioName: 'Detail Kraków',
      status: 'Accepted',
      preferredAt: '2026-11-20T08:00:00Z',
      customerName: 'Anna',
      customerPhone: '500600700',
      customerEmail: 'a@b.pl',
      vehicle: { licensePlate: 'KR 1', brand: null, model: null, size: 'Medium' },
      services: [{ serviceId: 'a', name: 'Mycie', price: '89' }],
      estimatedPrice: '89',
      hasUnpricedServices: false,
      notes: null,
      rejectionReason: null,
      createdAt: '2026-11-16T10:00:00Z',
      decidedAt: null,
      booking: { id: 'b', scheduledAt: '2026-11-20T09:00:00Z', status: 'Utworzona', totalPrice: '95.5' },
    });
    expect(r.estimatedPrice).toBe(89);
    expect(r.services[0].price).toBe(89);
    expect(r.booking?.totalPrice).toBe(95.5);
  });
});
