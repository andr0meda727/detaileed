import type { DayOfWeek, VehicleSize } from '@detaileed/api-client';
import { addDays, dayInZone, weekdayIndex, zonedToUtc } from '@detaileed/domain/studioTime';
import { db } from './store.ts';
import type { Booking, Schedule, SizeMultipliers, Studio } from './types.ts';

/**
 * A small version of the API's planner: opening hours, closures, bays, buffers and service durations decide the
 * free times, the bay a booking lands on and the day board.
 */

export const WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DEFAULT_MULTIPLIERS: SizeMultipliers = { small: 0.9, medium: 1, large: 1.2, xl: 1.4 };

/** A studio's schedule; a studio that never saved one has no opening hours. */
export function scheduleOf(studioId: string): Schedule {
  let schedule = db().schedules.find((s) => s.studioId === studioId);
  if (!schedule) {
    schedule = {
      studioId,
      openingHours: [],
      closures: [],
      bufferMinutes: 15,
      slotStepMinutes: 30,
      minLeadHours: 2,
      durationMultipliers: { ...DEFAULT_MULTIPLIERS },
    };
    db().schedules.push(schedule);
  }
  return schedule;
}

export const activeBays = (studioId: string) => db().bays.filter((b) => b.studioId === studioId && b.isActive);

/** Planning is on once the studio has opening hours and at least one active bay. */
export const planningEnabled = (studioId: string) =>
  scheduleOf(studioId).openingHours.length > 0 && activeBays(studioId).length > 0;

export function multiplierFor(studioId: string, size: VehicleSize): number {
  const m = scheduleOf(studioId).durationMultipliers;
  return { Small: m.small, Medium: m.medium, Large: m.large, XL: m.xl }[size];
}

/** How long the services take on a car of this size, rounded up to 5 minutes (an hour without services). */
export function durationFor(studioId: string, serviceIds: string[], size: VehicleSize): number {
  const base = serviceIds
    .map((id) => db().services.find((s) => s.id === id)?.durationMinutes ?? 0)
    .reduce((sum, minutes) => sum + minutes, 0);
  if (base === 0) return 60;
  return Math.ceil((base * multiplierFor(studioId, size)) / 5) * 5;
}

/** What the services cost for this size; null prices (on request) count as 0 but are reported. */
export function priceFor(serviceIds: string[], size: VehicleSize) {
  let total = 0;
  let hasUnpriced = false;
  const lines = serviceIds.flatMap((id) => {
    const service = db().services.find((s) => s.id === id);
    if (!service) return [];
    const price = service.prices.find((p) => p.vehicleSize === size)?.price ?? null;
    if (price === null) hasUnpriced = true;
    else total += price;
    return [{ serviceId: service.id, name: service.name, price }];
  });
  return { lines, total, hasUnpriced };
}

export interface Interval {
  start: number;
  end: number;
}

const ms = (iso: string) => new Date(iso).getTime();
const iso = (t: number) => new Date(t).toISOString();
export const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

/** The open periods of a studio day as UTC intervals; none on closures. */
export function openPeriods(studio: Studio, day: string): Interval[] {
  const schedule = scheduleOf(studio.id);
  if (schedule.closures.some((c) => c.date === day)) return [];
  const weekday = WEEK[weekdayIndex(day)];
  return schedule.openingHours
    .filter((p) => p.day === weekday)
    .map((p) => ({
      start: ms(zonedToUtc(day, p.opens.slice(0, 5), studio.timeZone)),
      end: ms(zonedToUtc(day, p.closes.slice(0, 5), studio.timeZone)),
    }))
    .sort((a, b) => a.start - b.start);
}

/** Bookings that still hold their bay (not cancelled). */
export const holdsBay = (b: Booking) => b.status !== 'cancelled';

export const bookingInterval = (b: Booking): Interval => ({ start: ms(b.scheduledAt), end: ms(b.endsAt) });

/** Whether the bay is free for the interval, keeping the studio's buffer around other bookings. */
export function bayIsFree(studioId: string, bayId: string, interval: Interval, exceptBookingId?: string): boolean {
  const buffer = scheduleOf(studioId).bufferMinutes * 60_000;
  return !db().bookings.some(
    (b) =>
      b.studioId === studioId &&
      b.bayId === bayId &&
      b.id !== exceptBookingId &&
      holdsBay(b) &&
      overlaps(interval, { start: ms(b.scheduledAt) - buffer, end: ms(b.endsAt) + buffer }),
  );
}

export const freeBays = (studioId: string, interval: Interval, exceptBookingId?: string) =>
  activeBays(studioId).filter((bay) => bayIsFree(studioId, bay.id, interval, exceptBookingId));

export interface Slot {
  start: string;
  end: string;
  bays: { id: string; name: string }[];
}

/** Free start times on the studio days `from`–`to` for a visit of `minutes`. */
export function freeSlots(studio: Studio, from: string, to: string, minutes: number): Slot[] {
  const schedule = scheduleOf(studio.id);
  if (!planningEnabled(studio.id)) return [];
  const earliest = Date.now() + schedule.minLeadHours * 3_600_000;
  const step = schedule.slotStepMinutes * 60_000;
  const slots: Slot[] = [];
  for (let day = from; day <= to; day = addDays(day, 1)) {
    for (const period of openPeriods(studio, day)) {
      for (let start = period.start; start + minutes * 60_000 <= period.end; start += step) {
        if (start < earliest) continue;
        const interval = { start, end: start + minutes * 60_000 };
        const bays = freeBays(studio.id, interval);
        if (bays.length > 0) slots.push({ start: iso(interval.start), end: iso(interval.end), bays });
      }
    }
  }
  return slots;
}

/** Whether a visit lies entirely inside one open period. */
export function withinOpeningHours(studio: Studio, interval: Interval): boolean {
  const day = dayInZone(iso(interval.start), studio.timeZone);
  return openPeriods(studio, day).some((p) => p.start <= interval.start && interval.end <= p.end);
}

/** The studio's bookings on a studio day, in time order. */
export function bookingsOnDay(studio: Studio, day: string): Booking[] {
  return db()
    .bookings.filter((b) => b.studioId === studio.id && dayInZone(b.scheduledAt, studio.timeZone) === day)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

/** Free gaps (at least 15 minutes) of a bay inside the day's open periods. */
export function freeGaps(periods: Interval[], busy: Interval[]): Interval[] {
  const gaps: Interval[] = [];
  const sorted = [...busy].sort((a, b) => a.start - b.start);
  for (const period of periods) {
    let cursor = period.start;
    for (const b of sorted) {
      if (b.end <= cursor || b.start >= period.end) continue;
      if (b.start > cursor) gaps.push({ start: cursor, end: Math.min(b.start, period.end) });
      cursor = Math.max(cursor, b.end);
    }
    if (cursor < period.end) gaps.push({ start: cursor, end: period.end });
  }
  return gaps.filter((g) => g.end - g.start >= 15 * 60_000);
}

export const minutesOf = (i: Interval) => Math.round((i.end - i.start) / 60_000);
export const toIso = iso;
