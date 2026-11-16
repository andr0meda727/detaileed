import { weekdayIndex, zonedToUtc } from '@detaileed/domain/studioTime';
import { WEEKDAYS } from '@/features/planning/model/scheduleForm';
import type { DayBoard, Schedule } from '@/features/planning/model/types';

/** Minutes from the start of the studio day `day` to a moment (may be negative or past 24 h across midnight). */
export function minutesIntoDay(moment: string, day: string, timeZone: string): number {
  const dayStart = new Date(zonedToUtc(day, '00:00', timeZone)).getTime();
  return Math.round((new Date(moment).getTime() - dayStart) / 60_000);
}

const hm = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * The board's time axis in minutes of the day: the day's opening hours, widened to fit every booking and gap,
 * in whole hours. 08:00–18:00 when there is nothing to go by.
 */
export function boardAxis(board: DayBoard, schedule: Schedule | undefined, timeZone: string) {
  const weekday = WEEKDAYS[weekdayIndex(board.date)].day;
  const minutes: number[] = (schedule?.openingHours ?? [])
    .filter((p) => p.day === weekday)
    .flatMap((p) => [hm(p.opens), hm(p.closes)]);
  const items = [...board.bays.flatMap((b) => [...b.bookings, ...b.freeGaps]), ...board.unassigned];
  for (const item of items) {
    minutes.push(minutesIntoDay(item.start, board.date, timeZone), minutesIntoDay(item.end, board.date, timeZone));
  }
  if (minutes.length === 0) return { start: 8 * 60, end: 18 * 60 };
  const start = Math.max(0, Math.floor(Math.min(...minutes) / 60) * 60);
  const end = Math.min(24 * 60, Math.ceil(Math.max(...minutes) / 60) * 60);
  return { start, end: Math.max(end, start + 60) };
}

/** Left offset and width (percent of the axis) of a block from `start` to `end`. */
export function blockPosition(
  start: string,
  end: string,
  day: string,
  timeZone: string,
  axis: { start: number; end: number },
) {
  const span = axis.end - axis.start;
  const from = Math.max(minutesIntoDay(start, day, timeZone), axis.start);
  const to = Math.min(minutesIntoDay(end, day, timeZone), axis.end);
  return { left: ((from - axis.start) / span) * 100, width: (Math.max(to - from, 0) / span) * 100 };
}

/** Full hours on the axis, for grid lines and labels. */
export function axisHours(axis: { start: number; end: number }): number[] {
  const hours: number[] = [];
  for (let m = axis.start; m <= axis.end; m += 60) hours.push(m / 60);
  return hours;
}
