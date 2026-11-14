import { describe, expect, it } from 'vitest';
import { buildBookingCreateDto } from '@/features/bookings/model/buildBookingCreateDto';
import { BOOKING_STATUSES } from '@/constants';

describe('buildBookingCreateDto', () => {
  it('builds booking create payload from form values', () => {
    const dto = buildBookingCreateDto({
      vehicleId: 'veh_1',
      clientId: 'cli_1',
      date: '2026-04-15',
      time: '10:30',
      serviceIds: ['svc_1', 'svc_2'],
      priceInput: '199,99',
    });

    expect(dto.vehicleId).toBe('veh_1');
    expect(dto.clientId).toBe('cli_1');
    expect(dto.statusId).toBe(BOOKING_STATUSES.UTWORZONA.id);
    expect(dto.serviceIds).toEqual(['svc_1', 'svc_2']);
    expect(dto.price).toBe(199.99);
    expect(dto.notes).toBeNull();
    expect(dto.scheduledAt).toContain('T');
  });
});
