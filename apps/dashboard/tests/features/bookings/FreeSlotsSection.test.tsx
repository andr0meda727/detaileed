import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { buildBookingCreateDto } from '@/features/bookings';

const state = vi.hoisted(() => ({ planning: true }));
const availability = vi.fn();
vi.mock('@/features/planning', () => ({
  useSchedule: () => ({ data: { planningEnabled: state.planning } }),
  useBays: () => ({
    data: [
      { id: 'b1', name: 'Stanowisko 1', isActive: true },
      { id: 'b2', name: 'Stanowisko 2', isActive: true },
    ],
  }),
  useStaffAvailability: (params: unknown, enabled: boolean) => {
    availability(params, enabled);
    return {
      isLoading: false,
      data: {
        planningEnabled: true,
        durationMinutes: 90,
        slots: [
          {
            start: '2026-11-16T09:00:00Z',
            end: '2026-11-16T10:30:00Z',
            suggestedBayId: 'b2',
            suggestedBayName: 'Stanowisko 2',
            freeBays: 1,
          },
        ],
      },
    };
  },
}));

const { FreeSlotsSection } = await import('@/features/bookings/components/form/FreeSlotsSection');

const props = {
  date: '2026-11-16',
  serviceIds: ['s1'],
  size: 'Large' as const,
  timeZone: 'Europe/Warsaw',
  pickedStart: null,
  bayId: null,
};

describe('FreeSlotsSection', () => {
  it('offers the day’s free slots for the services and car size, and a bay choice', () => {
    const onPickSlot = vi.fn();
    const onBayChange = vi.fn();
    render(<FreeSlotsSection {...props} onPickSlot={onPickSlot} onBayChange={onBayChange} />);

    expect(availability).toHaveBeenCalledWith(
      { from: '2026-11-16', to: '2026-11-16', serviceIds: ['s1'], size: 'Large' },
      true,
    );
    fireEvent.click(screen.getByRole('radio', { name: '10:00 · Stanowisko 2' }));
    expect(onPickSlot).toHaveBeenCalledWith({ start: '2026-11-16T09:00:00Z', bayId: 'b2' });

    fireEvent.change(screen.getByLabelText('Stanowisko'), { target: { value: 'b1' } });
    expect(onBayChange).toHaveBeenCalledWith('b1');
  });

  it('stays hidden while the studio does not plan', () => {
    state.planning = false;
    const { container } = render(<FreeSlotsSection {...props} onPickSlot={vi.fn()} onBayChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
    state.planning = true;
  });
});

describe('buildBookingCreateDto', () => {
  it('sends the picked bay, or null to let the planner choose', () => {
    const base = {
      vehicleId: 'v',
      clientId: 'c',
      date: '2026-11-16',
      time: '10:00',
      timeZone: 'Europe/Warsaw',
      serviceIds: ['s1'],
      priceInput: '100',
    };
    expect(buildBookingCreateDto({ ...base, bayId: 'b2' }).bayId).toBe('b2');
    expect(buildBookingCreateDto(base).bayId).toBeNull();
  });
});
