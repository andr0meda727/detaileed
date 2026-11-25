import type { BookingRequest, BookingResponseDto } from '@detaileed/api-client';
import { dayInZone } from '@detaileed/domain/studioTime';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { paged } from '../store/paging.ts';
import { activeBays, bayIsFree, durationFor, freeBays, planningEnabled, priceFor, toIso } from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { Booking, BookingStatusKey, Studio } from '../store/types.ts';

/** The API's booking status rows: `status` carries the name, `statusColor` the colour of the status row. */
export const BOOKING_STATUS: Record<BookingStatusKey, { id: string; name: string; color: string }> = {
  created: { id: '6aeadcad-a836-46fc-a445-3a3a832f49a4', name: 'Utworzona', color: '#3b82f6' },
  completed: { id: '6f4f4496-dd44-4ad8-8021-37ef6b3279dd', name: 'Zakończona', color: '#64748b' },
  cancelled: { id: 'd89cf9d3-ee24-481a-ac76-c5cb224f1c1a', name: 'Anulowana', color: '#ef4444' },
};

const statusById = (id: string | undefined): BookingStatusKey =>
  (Object.entries(BOOKING_STATUS).find(([, s]) => s.id === id)?.[0] as BookingStatusKey | undefined) ?? 'created';

export function toBookingDto(b: Booking) {
  const state = db();
  const client = state.clients.find((c) => c.id === b.clientId);
  const vehicle = state.vehicles.find((v) => v.id === b.vehicleId);
  const bay = b.bayId ? state.bays.find((x) => x.id === b.bayId) : undefined;
  return {
    id: b.id,
    scheduledAt: b.scheduledAt,
    endsAt: b.endsAt,
    completedAt: b.completedAt,
    totalPrice: b.price,
    status: BOOKING_STATUS[b.status].name,
    statusColor: BOOKING_STATUS[b.status].color,
    notes: b.notes,
    vehicle: {
      id: b.vehicleId,
      licensePlate: vehicle?.licensePlate ?? '—',
      brand: vehicle?.brand ?? null,
      model: vehicle?.model ?? null,
      size: vehicle?.size ?? 'Medium',
    },
    client: {
      id: b.clientId,
      name: client?.name ?? 'Usunięty klient',
      email: client?.email ?? null,
      phone: client?.phone ?? null,
    },
    services: b.serviceIds.flatMap((id) => state.services.find((s) => s.id === id)?.name ?? []),
    bay: bay ? { id: bay.id, name: bay.name } : null,
  } satisfies BookingResponseDto;
}

function findBooking(studioId: string, id: string) {
  const booking = db().bookings.find((b) => b.id === id && b.studioId === studioId);
  if (!booking) throw problem(404, 'BOOKING_NOT_FOUND', 'Nie znaleziono rezerwacji.');
  return booking;
}

const toNumber = (value: unknown) =>
  value === null || value === undefined || value === '' || Number.isNaN(Number(value)) ? null : Number(value);

/**
 * Builds a booking from the request like the API: the car and client must belong to the studio, the end follows
 * from the services and the car's size, and a planning studio needs a free bay (the chosen one or any).
 */
export function planBooking(studio: Studio, body: BookingRequest, existing?: Booking): Booking {
  const state = db();
  const client = state.clients.find((c) => c.id === body.clientId && c.studioId === studio.id);
  const vehicle = state.vehicles.find((v) => v.id === body.vehicleId && v.clientId === body.clientId);
  if (!client || !vehicle) {
    throw problem(404, 'BOOKING_CLIENT_OR_VEHICLE_NOT_FOUND', 'Nie znaleziono klienta lub pojazdu.');
  }
  if (!body.scheduledAt || Number.isNaN(new Date(body.scheduledAt).getTime())) {
    throw validationProblem({ ScheduledAt: ['Podaj termin wizyty.'] });
  }
  const serviceIds = body.serviceIds ?? [];
  if (serviceIds.some((id) => !state.services.some((s) => s.id === id && s.studioId === studio.id))) {
    throw validationProblem({ ServiceIds: ['Wybrano nieznaną usługę.'] });
  }
  const start = new Date(body.scheduledAt).getTime();
  const minutes = durationFor(studio.id, serviceIds, vehicle.size);
  const interval = { start, end: start + minutes * 60_000 };

  let bayId: string | null = body.bayId ?? null;
  if (planningEnabled(studio.id)) {
    if (bayId) {
      if (!activeBays(studio.id).some((b) => b.id === bayId)) {
        throw problem(404, 'BAY_NOT_FOUND', 'Nie znaleziono stanowiska.');
      }
      if (!bayIsFree(studio.id, bayId, interval, existing?.id)) {
        throw problem(409, 'BAY_TAKEN', 'Wybrane stanowisko jest już zajęte w tym czasie.');
      }
    } else if (!existing?.bayId || !bayIsFree(studio.id, existing.bayId, interval, existing.id)) {
      const free = freeBays(studio.id, interval, existing?.id);
      if (free.length === 0) throw problem(409, 'NO_BAY_AVAILABLE', 'O tej godzinie nie ma wolnego stanowiska.');
      bayId = free[0].id;
    } else {
      bayId = existing.bayId;
    }
  } else {
    bayId = null;
  }

  const cents = toNumber(body.priceInCents);
  const price = toNumber(body.price) ?? (cents !== null ? cents / 100 : priceFor(serviceIds, vehicle.size).total);
  const status = body.statusId ? statusById(body.statusId) : (existing?.status ?? 'created');
  return {
    id: existing?.id ?? newId(),
    studioId: studio.id,
    clientId: client.id,
    vehicleId: vehicle.id,
    scheduledAt: toIso(interval.start),
    endsAt: toIso(interval.end),
    completedAt: status === 'completed' ? (existing?.completedAt ?? new Date().toISOString()) : null,
    status,
    price,
    notes: body.notes?.trim() || null,
    bayId,
    serviceIds,
  };
}

/** `fromDate`/`toDate` may be studio days (`yyyy-MM-dd`, both included) or moments. */
function inRange(b: Booking, studio: Studio, from: string | null, to: string | null) {
  const day = dayInZone(b.scheduledAt, studio.timeZone);
  if (from && (from.length === 10 ? day < from : b.scheduledAt < new Date(from).toISOString())) return false;
  if (to && (to.length === 10 ? day > to : b.scheduledAt > new Date(to).toISOString())) return false;
  return true;
}

function listBookings(req: MockRequest) {
  const { studio } = requireStudio(req);
  const completed = req.query.get('isCompleted');
  const from = req.query.get('fromDate');
  const to = req.query.get('toDate');
  const items = db()
    .bookings.filter((b) => b.studioId === studio.id)
    .filter((b) => completed === null || (b.status === 'completed') === (completed === 'true'))
    .filter((b) => inRange(b, studio, from, to))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .map(toBookingDto);
  return paged(items, req.query);
}

/** Hooks other areas use when a visit is completed (the inventory records what it used). */
export const onBookingCompleted: ((booking: Booking) => void)[] = [];

export const bookingRoutes: Route[] = [
  route('GET', '/api/Bookings', listBookings),

  route('POST', '/api/Bookings', (req) => {
    const { studio } = requireStudio(req);
    const booking = planBooking(studio, (req.body ?? {}) as BookingRequest);
    db().bookings.push(booking);
    if (booking.status === 'completed') onBookingCompleted.forEach((hook) => hook(booking));
    return toBookingDto(booking);
  }),

  route('GET', '/api/Bookings/{id}', (req) => toBookingDto(findBooking(requireStudio(req).studio.id, req.params.id))),

  route('PUT', '/api/Bookings/{id}', (req) => {
    const { studio } = requireStudio(req);
    const booking = findBooking(studio.id, req.params.id);
    const wasCompleted = booking.status === 'completed';
    Object.assign(booking, planBooking(studio, (req.body ?? {}) as BookingRequest, booking));
    if (!wasCompleted && booking.status === 'completed') onBookingCompleted.forEach((hook) => hook(booking));
    return toBookingDto(booking);
  }),

  route('DELETE', '/api/Bookings/{id}', (req) => {
    const { studio } = requireStudio(req);
    const booking = findBooking(studio.id, req.params.id);
    db().bookings = db().bookings.filter((b) => b.id !== booking.id);
    return empty();
  }),

  route('POST', '/api/Bookings/{id}/complete', (req) => {
    const { studio } = requireStudio(req);
    const booking = findBooking(studio.id, req.params.id);
    if (booking.status === 'cancelled') {
      throw problem(409, 'BOOKING_CANCELLED', 'Nie można zakończyć anulowanej rezerwacji.');
    }
    if (booking.status !== 'completed') {
      booking.status = 'completed';
      booking.completedAt = new Date().toISOString();
      onBookingCompleted.forEach((hook) => hook(booking));
    }
    return toBookingDto(booking);
  }),

  route('POST', '/api/Bookings/{id}/cancel', (req) => {
    const { studio } = requireStudio(req);
    const booking = findBooking(studio.id, req.params.id);
    if (booking.status === 'completed') {
      throw problem(409, 'BOOKING_COMPLETED', 'Nie można anulować zakończonej rezerwacji.');
    }
    booking.status = 'cancelled';
    return toBookingDto(booking);
  }),
];
