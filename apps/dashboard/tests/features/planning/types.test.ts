import { describe, expect, it } from 'vitest';
import { toDayBoard, toHm, toHms, toSchedule, toStaffAvailability } from '@/features/planning/model/types';

describe('planning normalisers', () => {
  it('turns times of day into HH:mm and numbers into numbers', () => {
    const schedule = toSchedule({
      planningEnabled: true,
      openingHours: [{ day: 'Monday', opens: '08:00:00', closes: '16:30:00' }],
      closures: [{ date: '2026-12-24', reason: 'Wigilia' }],
      bufferMinutes: '15',
      slotStepMinutes: 30,
      minLeadHours: '12',
      durationMultipliers: { small: '0.85', medium: 1, large: '1.25', xl: '1.5' },
    });
    expect(schedule.openingHours).toEqual([{ day: 'Monday', opens: '08:00', closes: '16:30' }]);
    expect(schedule.bufferMinutes).toBe(15);
    expect(schedule.durationMultipliers).toEqual({ small: 0.85, medium: 1, large: 1.25, xl: 1.5 });
  });

  it('converts times both ways', () => {
    expect(toHm('08:05:00')).toBe('08:05');
    expect(toHms('08:05')).toBe('08:05:00');
  });

  it('normalises the day board and availability', () => {
    const board = toDayBoard({
      date: '2026-11-16',
      planningEnabled: true,
      openMinutes: '480',
      utilisationPercent: '37.5',
      bays: [
        {
          bayId: 'b1',
          name: 'Stanowisko 1',
          bookings: [],
          freeGaps: [{ start: 'a', end: 'b', minutes: '60' }],
          utilisationPercent: 50,
        },
      ],
      unassigned: [],
      pendingRequests: [],
    });
    expect(board.openMinutes).toBe(480);
    expect(board.bays[0].freeGaps[0].minutes).toBe(60);
    expect(
      toStaffAvailability({
        planningEnabled: true,
        durationMinutes: '90',
        slots: [{ start: 'a', end: 'b', suggestedBayId: 'b1', suggestedBayName: 'S1', freeBays: '2' }],
      }).slots[0].freeBays,
    ).toBe(2);
  });
});
