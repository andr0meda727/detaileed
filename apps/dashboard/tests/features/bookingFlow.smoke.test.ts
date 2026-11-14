import { describe, expect, it } from 'vitest';
import { buildBookingCreateDto } from '@/features/bookings/utils/buildBookingCreateDto';
import { toggleIdSelection } from '@/shared/lib/selection';

describe('booking flow smoke', () => {
  it('creates payload for existing client and vehicle', () => {
    const dto = buildBookingCreateDto({
      vehicleId: 'veh_existing',
      clientId: 'cli_existing',
      date: '2026-04-20',
      time: '09:15',
      serviceIds: ['svc_wash'],
      priceInput: '120,00',
    });

    expect(dto.clientId).toBe('cli_existing');
    expect(dto.vehicleId).toBe('veh_existing');
    expect(dto.serviceIds).toEqual(['svc_wash']);
  });

  it('creates payload for newly created client and vehicle', () => {
    const dto = buildBookingCreateDto({
      vehicleId: 'veh_new',
      clientId: 'cli_new',
      date: '2026-04-20',
      time: '11:45',
      serviceIds: ['svc_detail', 'svc_interior'],
      priceInput: '399,50',
    });

    expect(dto.clientId).toBe('cli_new');
    expect(dto.vehicleId).toBe('veh_new');
    expect(dto.price).toBe(399.5);
  });

  it('toggles selected services set like booking form does', () => {
    let selected: string[] = [];
    selected = toggleIdSelection(selected, 'svc_1');
    selected = toggleIdSelection(selected, 'svc_2');
    selected = toggleIdSelection(selected, 'svc_1');

    expect(selected).toEqual(['svc_2']);
  });
});
