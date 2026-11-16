import { describe, expect, it } from 'vitest';
import { axisHours, blockPosition, boardAxis, minutesIntoDay } from '@/features/planning/model/boardLayout';
import type { DayBoard, Schedule } from '@/features/planning/model/types';

const WAW = 'Europe/Warsaw';
// Monday 16 Nov 2026 (UTC+1).
const board: DayBoard = {
  date: '2026-11-16',
  planningEnabled: true,
  openMinutes: 480,
  utilisationPercent: 25,
  bays: [
    {
      bayId: 'b1',
      name: 'Stanowisko 1',
      bookings: [
        {
          id: 'k',
          start: '2026-11-16T07:00:00Z',
          end: '2026-11-16T09:00:00Z',
          clientName: 'Jan',
          vehicleLicensePlate: 'KR1',
          status: 'Utworzona',
        },
      ],
      freeGaps: [],
      utilisationPercent: 25,
    },
  ],
  unassigned: [],
  pendingRequests: [],
};
const schedule = { openingHours: [{ day: 'Monday', opens: '08:00', closes: '16:00' }] } as Schedule;

describe('board layout', () => {
  it('measures minutes from the studio midnight', () => {
    expect(minutesIntoDay('2026-11-16T07:00:00Z', '2026-11-16', WAW)).toBe(8 * 60);
  });

  it('spans the opening hours, widened to fit bookings', () => {
    expect(boardAxis(board, schedule, WAW)).toEqual({ start: 480, end: 960 });
    const late = {
      ...board,
      unassigned: [{ ...board.bays[0].bookings[0], start: '2026-11-16T16:30:00Z', end: '2026-11-16T17:15:00Z' }],
    };
    expect(boardAxis(late, schedule, WAW).end).toBe(19 * 60);
    expect(boardAxis({ ...board, bays: [] }, undefined, WAW)).toEqual({ start: 480, end: 1080 });
  });

  it('positions a block on the axis', () => {
    const axis = { start: 480, end: 960 };
    expect(blockPosition('2026-11-16T07:00:00Z', '2026-11-16T09:00:00Z', '2026-11-16', WAW, axis)).toEqual({
      left: 0,
      width: 25,
    });
    expect(axisHours(axis)).toEqual([8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });
});
