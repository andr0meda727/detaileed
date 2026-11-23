import type {
  BayDto,
  BayRequest,
  BoardBookingDto,
  ClosureRequest,
  DayBoardDto,
  OpeningPeriodDto,
  ScheduleDto,
  ScheduleRequest,
  StaffAvailabilityDto,
  VehicleSize,
} from '@detaileed/api-client';
import { addDays } from '@detaileed/domain/studioTime';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireManager, requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import {
  WEEK,
  activeBays,
  bookingInterval,
  bookingsOnDay,
  durationFor,
  freeGaps,
  freeSlots,
  holdsBay,
  minutesOf,
  openPeriods,
  planningEnabled,
  scheduleOf,
  toIso,
} from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { Booking, Schedule, Studio } from '../store/types.ts';
import { BOOKING_STATUS } from './bookings.ts';

const MAX_BAYS = 20;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}(:\d{2})?$/;

export const toBayDto = (b: { id: string; name: string; isActive: boolean }) =>
  ({ id: b.id, name: b.name, isActive: b.isActive }) satisfies BayDto;

export function toScheduleDto(studioId: string) {
  const s = scheduleOf(studioId);
  return {
    planningEnabled: planningEnabled(studioId),
    openingHours: [...s.openingHours].sort(
      (a, b) => WEEK.indexOf(a.day) - WEEK.indexOf(b.day) || a.opens.localeCompare(b.opens),
    ),
    closures: [...s.closures].sort((a, b) => a.date.localeCompare(b.date)),
    bufferMinutes: s.bufferMinutes,
    slotStepMinutes: s.slotStepMinutes,
    minLeadHours: s.minLeadHours,
    durationMultipliers: s.durationMultipliers,
  } satisfies ScheduleDto;
}

const hms = (time: string) => (time.length === 5 ? `${time}:00` : time);

function readOpeningHours(periods: OpeningPeriodDto[]) {
  for (const p of periods) {
    if (!WEEK.includes(p.day) || !TIME.test(p.opens) || !TIME.test(p.closes)) {
      throw validationProblem({ OpeningHours: ['Nieprawidłowy dzień lub godzina.'] });
    }
    if (hms(p.closes) <= hms(p.opens)) {
      throw problem(400, 'INVALID_OPENING_PERIOD', 'Godzina zamknięcia musi być późniejsza niż otwarcia.');
    }
  }
  for (const day of WEEK) {
    const ofDay = periods
      .filter((p) => p.day === day)
      .map((p) => ({ day, opens: hms(p.opens), closes: hms(p.closes) }))
      .sort((a, b) => a.opens.localeCompare(b.opens));
    if (ofDay.length > 3) throw problem(400, 'TOO_MANY_OPENING_PERIODS', 'Za dużo przedziałów godzin w jednym dniu.');
    if (ofDay.some((p, i) => i > 0 && p.opens < ofDay[i - 1].closes)) {
      throw problem(400, 'OVERLAPPING_OPENING_PERIODS', 'Godziny otwarcia w jednym dniu nachodzą na siebie.');
    }
  }
  return periods.map((p) => ({ day: p.day, opens: hms(p.opens), closes: hms(p.closes) }));
}

function readRules(body: ScheduleRequest, current: Schedule) {
  const num = (value: number | string | undefined, fallback: number) =>
    value === undefined || value === null ? fallback : Number(value);
  const buffer = num(body.bufferMinutes, current.bufferMinutes);
  const step = num(body.slotStepMinutes, current.slotStepMinutes);
  const lead = num(body.minLeadHours, current.minLeadHours);
  const m = body.durationMultipliers
    ? {
        small: Number(body.durationMultipliers.small),
        medium: Number(body.durationMultipliers.medium),
        large: Number(body.durationMultipliers.large),
        xl: Number(body.durationMultipliers.xl),
      }
    : current.durationMultipliers;
  const valid =
    buffer >= 0 &&
    buffer <= 120 &&
    step >= 5 &&
    step <= 120 &&
    lead >= 0 &&
    lead <= 168 &&
    Object.values(m).every((x) => x >= 0.5 && x <= 3);
  if (!valid) {
    throw problem(
      400,
      'INVALID_PLANNING_RULES',
      'Sprawdź zasady planowania: bufor, krok startu, wyprzedzenie i mnożniki.',
    );
  }
  return { bufferMinutes: buffer, slotStepMinutes: step, minLeadHours: lead, durationMultipliers: m };
}

const toBoardBooking = (b: Booking): BoardBookingDto => {
  const state = db();
  return {
    id: b.id,
    start: b.scheduledAt,
    end: b.endsAt,
    clientName: state.clients.find((c) => c.id === b.clientId)?.name ?? 'Usunięty klient',
    vehicleLicensePlate: state.vehicles.find((v) => v.id === b.vehicleId)?.licensePlate ?? '—',
    status: BOOKING_STATUS[b.status].name,
  };
};

/** Pending online requests for a day board; the booking-requests area fills this in. */
export const pendingRequestsOnDay: ((studio: Studio, day: string) => DayBoardDto['pendingRequests'])[] = [];

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

function dayBoard(req: MockRequest) {
  const { studio } = requireStudio(req);
  const day = req.query.get('date') || db().today;
  if (!DAY.test(day)) throw validationProblem({ date: ['Podaj dzień w formacie rrrr-mm-dd.'] });
  const periods = openPeriods(studio, day);
  const openMinutes = periods.reduce((sum, p) => sum + minutesOf(p), 0);
  const bookings = bookingsOnDay(studio, day).filter(holdsBay);
  const bays = activeBays(studio.id);
  let bookedMinutes = 0;
  const boardBays = bays.map((bay) => {
    const own = bookings.filter((b) => b.bayId === bay.id);
    const busy = own.map(bookingInterval);
    const minutes = busy.reduce(
      (sum, b) =>
        sum +
        periods.reduce(
          (inner, p) => inner + Math.max(0, Math.min(b.end, p.end) - Math.max(b.start, p.start)) / 60_000,
          0,
        ),
      0,
    );
    bookedMinutes += minutes;
    return {
      bayId: bay.id,
      name: bay.name,
      bookings: own.map(toBoardBooking),
      freeGaps: freeGaps(periods, busy).map((g) => ({
        start: toIso(g.start),
        end: toIso(g.end),
        minutes: minutesOf(g),
      })),
      utilisationPercent: percent(minutes, openMinutes),
    };
  });
  return {
    date: day,
    planningEnabled: planningEnabled(studio.id),
    openMinutes,
    utilisationPercent: percent(bookedMinutes, openMinutes * bays.length),
    bays: boardBays,
    unassigned: bookings.filter((b) => !b.bayId || !bays.some((bay) => bay.id === b.bayId)).map(toBoardBooking),
    pendingRequests: pendingRequestsOnDay.flatMap((provider) => provider(studio, day)),
  } satisfies DayBoardDto;
}

/** `From`–`To` (studio days, at most 14), `ServiceIds`, `VehicleSize`, as both availability endpoints take them. */
export function readAvailabilityQuery(studio: Studio, query: URLSearchParams) {
  const from = query.get('From') || db().today;
  const to = query.get('To') || from;
  if (!DAY.test(from) || !DAY.test(to) || to < from) {
    throw validationProblem({ To: ['Podaj poprawny zakres dni.'] });
  }
  if (to > addDays(from, 13)) throw validationProblem({ To: ['Zakres może mieć najwyżej 14 dni.'] });
  const size = (query.get('VehicleSize') || 'Medium') as VehicleSize;
  const serviceIds = query.getAll('ServiceIds').filter((id) => db().services.some((s) => s.id === id));
  const durationMinutes = durationFor(studio.id, serviceIds, size);
  return { from, to, durationMinutes, slots: freeSlots(studio, from, to, durationMinutes) };
}

function findBay(studioId: string, id: string) {
  const bay = db().bays.find((b) => b.id === id && b.studioId === studioId && b.isActive);
  if (!bay) throw problem(404, 'BAY_NOT_FOUND', 'Nie znaleziono stanowiska.');
  return bay;
}

function readBayName(body: BayRequest) {
  const name = body?.name?.trim();
  if (!name) throw validationProblem({ Name: ['Podaj nazwę stanowiska.'] });
  if (name.length > 50) throw validationProblem({ Name: ['Nazwa może mieć najwyżej 50 znaków.'] });
  return name;
}

export const planningRoutes: Route[] = [
  route('GET', '/api/bays', (req) => {
    const { studio } = requireStudio(req);
    return db()
      .bays.filter((b) => b.studioId === studio.id)
      .map(toBayDto);
  }),

  route('POST', '/api/bays', (req) => {
    const { studio } = requireManager(req);
    const name = readBayName(req.body as BayRequest);
    if (activeBays(studio.id).length >= MAX_BAYS) {
      throw problem(409, 'BAY_LIMIT_REACHED', 'Studio może mieć najwyżej 20 aktywnych stanowisk.');
    }
    const bay = { id: newId(), studioId: studio.id, name, isActive: true };
    db().bays.push(bay);
    return toBayDto(bay);
  }),

  route('PUT', '/api/bays/{id}', (req) => {
    const { studio } = requireManager(req);
    const bay = findBay(studio.id, req.params.id);
    bay.name = readBayName(req.body as BayRequest);
    return toBayDto(bay);
  }),

  route('DELETE', '/api/bays/{id}', (req) => {
    const { studio } = requireManager(req);
    const bay = findBay(studio.id, req.params.id);
    const now = new Date().toISOString();
    if (db().bookings.some((b) => b.bayId === bay.id && b.status === 'created' && b.endsAt > now)) {
      throw problem(409, 'BAY_HAS_UPCOMING_BOOKINGS', 'Na tym stanowisku są jeszcze nadchodzące rezerwacje.');
    }
    bay.isActive = false;
    return empty();
  }),

  route('GET', '/api/schedule', (req) => toScheduleDto(requireStudio(req).studio.id)),

  route('PUT', '/api/schedule', (req) => {
    const { studio } = requireManager(req);
    const body = (req.body ?? {}) as ScheduleRequest;
    const schedule = scheduleOf(studio.id);
    const openingHours = readOpeningHours(body.openingHours ?? []);
    Object.assign(schedule, { openingHours, ...readRules(body, schedule) });
    return toScheduleDto(studio.id);
  }),

  route('POST', '/api/schedule/closures', (req) => {
    const { studio } = requireManager(req);
    const body = (req.body ?? {}) as ClosureRequest;
    if (!body.date || !DAY.test(body.date)) throw validationProblem({ Date: ['Podaj dzień w formacie rrrr-mm-dd.'] });
    const schedule = scheduleOf(studio.id);
    schedule.closures = [
      ...schedule.closures.filter((c) => c.date !== body.date),
      { date: body.date, reason: body.reason?.trim() || null },
    ];
    return toScheduleDto(studio.id);
  }),

  route('DELETE', '/api/schedule/closures/{date}', (req) => {
    const { studio } = requireManager(req);
    const schedule = scheduleOf(studio.id);
    if (!schedule.closures.some((c) => c.date === req.params.date)) {
      throw problem(404, 'CLOSURE_NOT_FOUND', 'Nie znaleziono tego dnia zamknięcia.');
    }
    schedule.closures = schedule.closures.filter((c) => c.date !== req.params.date);
    return empty();
  }),

  route('GET', '/api/schedule/day', dayBoard),

  route('GET', '/api/availability', (req) => {
    const { studio } = requireStudio(req);
    const { durationMinutes, slots } = readAvailabilityQuery(studio, req.query);
    return {
      planningEnabled: planningEnabled(studio.id),
      durationMinutes,
      slots: slots.map((s) => ({
        start: s.start,
        end: s.end,
        suggestedBayId: s.bays[0].id,
        suggestedBayName: s.bays[0].name,
        freeBays: s.bays.length,
      })),
    } satisfies StaffAvailabilityDto;
  }),
];
