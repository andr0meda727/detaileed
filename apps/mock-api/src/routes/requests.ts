import type {
  AcceptBookingRequest,
  AlternativeDto,
  BookingRequestDto,
  OnlineRequestStatus,
  RejectBookingRequest,
  RequestPlanDto,
} from '@detaileed/api-client';
import { addDays, dayInZone } from '@detaileed/domain/studioTime';
import { problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireStudio } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { paged } from '../store/paging.ts';
import {
  bookingsOnDay,
  durationFor,
  freeBays,
  freeSlots,
  holdsBay,
  overlaps,
  planningEnabled,
  withinOpeningHours,
} from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { Booking, OnlineRequest, Studio } from '../store/types.ts';
import { BOOKING_STATUS, planBooking } from './bookings.ts';
import { normalizePlate } from './clients.ts';
import { pendingRequestsOnDay } from './planning.ts';

const STATUSES: OnlineRequestStatus[] = ['Pending', 'Accepted', 'Rejected', 'Withdrawn'];

export function toRequestDto(r: OnlineRequest): BookingRequestDto {
  const studio = db().studios.find((s) => s.id === r.studioId);
  const booking = r.bookingId ? db().bookings.find((b) => b.id === r.bookingId) : undefined;
  return {
    id: r.id,
    studioId: r.studioId,
    studioName: studio?.name ?? 'Studio',
    status: r.status,
    preferredAt: r.preferredAt,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    customerEmail: r.customerEmail,
    vehicle: r.vehicle,
    services: r.services,
    estimatedPrice: r.estimatedPrice,
    hasUnpricedServices: r.hasUnpricedServices,
    notes: r.notes,
    rejectionReason: r.rejectionReason,
    createdAt: r.createdAt,
    decidedAt: r.decidedAt,
    booking: booking
      ? {
          id: booking.id,
          scheduledAt: booking.scheduledAt,
          status: BOOKING_STATUS[booking.status].name,
          totalPrice: booking.price,
        }
      : null,
  };
}

function findRequest(studioId: string, id: string) {
  const request = db().onlineRequests.find((r) => r.id === id && r.studioId === studioId);
  if (!request) throw problem(404, 'BOOKING_REQUEST_NOT_FOUND', 'Nie znaleziono zapytania w tym studiu.');
  return request;
}

function findPending(studioId: string, id: string) {
  const request = findRequest(studioId, id);
  if (request.status !== 'Pending') {
    throw problem(409, 'BOOKING_REQUEST_ALREADY_DECIDED', 'To zapytanie zostało już rozpatrzone.');
  }
  return request;
}

const requestMinutes = (r: OnlineRequest) => durationFor(r.studioId, r.serviceIds, r.vehicle.size);

/** The preferred time, the nearest free alternatives and other pending requests wanting the same time. */
function plan(req: MockRequest): RequestPlanDto {
  const { studio } = requireStudio(req);
  const request = findRequest(studio.id, req.params.id);
  const minutes = requestMinutes(request);
  const start = new Date(request.preferredAt).getTime();
  const interval = { start, end: start + minutes * 60_000 };
  const free = freeBays(studio.id, interval);
  const inHours = withinOpeningHours(studio, interval);
  const day = dayInZone(request.preferredAt, studio.timeZone);
  const alternatives: AlternativeDto[] = freeSlots(studio, day, addDays(day, 6), minutes)
    .filter((s) => s.start !== request.preferredAt)
    .map((s) => ({ slot: s, distance: Math.abs(new Date(s.start).getTime() - start) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .map(({ slot, distance }) => ({
      start: slot.start,
      end: slot.end,
      bayId: slot.bays[0].id,
      bayName: slot.bays[0].name,
      minutesFromPreferred: Math.round(distance / 60_000),
      wastedMinutes: wastedMinutes(studio, slot.bays[0].id, slot.start),
    }));
  const competingRequests = db()
    .onlineRequests.filter((r) => r.studioId === studio.id && r.status === 'Pending' && r.id !== request.id)
    .filter((r) => {
      const otherStart = new Date(r.preferredAt).getTime();
      return overlaps(interval, { start: otherStart, end: otherStart + requestMinutes(r) * 60_000 });
    })
    .map((r) => ({ id: r.id, preferredAt: r.preferredAt, customerName: r.customerName }));
  return {
    requestId: request.id,
    planningEnabled: planningEnabled(studio.id),
    durationMinutes: minutes,
    preferred: {
      start: request.preferredAt,
      end: new Date(interval.end).toISOString(),
      fits: inHours && free.length > 0,
      withinOpeningHours: inHours,
      bayId: free[0]?.id ?? null,
      bayName: free[0]?.name ?? null,
    },
    alternatives,
    competingRequests,
  };
}

/** Minutes left unusable between the previous booking on the bay and this start (a gap under an hour). */
function wastedMinutes(studio: Studio, bayId: string, start: string): number {
  const previous = bookingsOnDay(studio, dayInZone(start, studio.timeZone))
    .filter((b) => b.bayId === bayId && holdsBay(b) && b.endsAt <= start)
    .at(-1);
  if (!previous) return 0;
  const gap = Math.round((new Date(start).getTime() - new Date(previous.endsAt).getTime()) / 60_000);
  return gap < 60 ? gap : 0;
}

/**
 * Turns a request into a booking: the customer becomes (or is matched to) a client of the studio, the car to one
 * of their vehicles, and the planner books a bay at the chosen time.
 */
export function acceptRequest(studio: Studio, request: OnlineRequest, body: AcceptBookingRequest): Booking {
  const state = db();
  let client = state.clients.find(
    (c) =>
      c.studioId === studio.id &&
      ((request.customerUserId && c.customerUserId === request.customerUserId) ||
        (c.email && c.email.toLowerCase() === request.customerEmail.toLowerCase())),
  );
  const clientExisted = Boolean(client);
  if (!client) {
    client = {
      id: newId(),
      studioId: studio.id,
      name: request.customerName,
      email: request.customerEmail,
      phone: request.customerPhone,
      nip: null,
      customerUserId: request.customerUserId,
    };
    state.clients.push(client);
  }
  const plate = normalizePlate(request.vehicle.licensePlate);
  let vehicle = state.vehicles.find((v) => v.studioId === studio.id && normalizePlate(v.licensePlate) === plate);
  const vehicleExisted = Boolean(vehicle);
  if (!vehicle) {
    vehicle = { id: newId(), studioId: studio.id, clientId: client.id, ...request.vehicle, licensePlate: plate };
    state.vehicles.push(vehicle);
  }
  const price = body.price === null || body.price === undefined || body.price === '' ? null : Number(body.price);
  let booking: Booking;
  try {
    booking = planBooking(studio, {
      clientId: client.id,
      vehicleId: vehicle.id,
      scheduledAt: body.scheduledAt ?? request.preferredAt,
      serviceIds: request.serviceIds,
      price: price ?? request.estimatedPrice,
      notes: request.notes,
      bayId: body.bayId ?? null,
    });
  } catch (err) {
    // Nothing changes when the planner refuses: drop the client and car made for this request.
    state.clients = state.clients.filter((c) => c.id !== client.id || clientExisted);
    state.vehicles = state.vehicles.filter((v) => v.id !== vehicle.id || vehicleExisted);
    throw err;
  }
  state.bookings.push(booking);
  request.status = 'Accepted';
  request.decidedAt = new Date().toISOString();
  request.bookingId = booking.id;
  return booking;
}

// Pending requests show on the day board of the day the customer asked for.
pendingRequestsOnDay.push((studio, day) =>
  db()
    .onlineRequests.filter(
      (r) => r.studioId === studio.id && r.status === 'Pending' && dayInZone(r.preferredAt, studio.timeZone) === day,
    )
    .map((r) => ({
      id: r.id,
      preferredAt: r.preferredAt,
      customerName: r.customerName,
      vehicleLicensePlate: r.vehicle.licensePlate,
    })),
);

export const requestRoutes: Route[] = [
  route('GET', '/api/booking-requests', (req) => {
    const { studio } = requireStudio(req);
    const status = req.query.get('status') as OnlineRequestStatus | null;
    if (status && !STATUSES.includes(status)) throw validationProblem({ status: ['Nieznany status.'] });
    const items = db()
      .onlineRequests.filter((r) => r.studioId === studio.id && (!status || r.status === status))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toRequestDto);
    return paged(items, req.query);
  }),

  route('GET', '/api/booking-requests/{id}/plan', plan),

  route('POST', '/api/booking-requests/{id}/accept', (req) => {
    const { studio } = requireStudio(req);
    const request = findPending(studio.id, req.params.id);
    acceptRequest(studio, request, (req.body ?? {}) as AcceptBookingRequest);
    return toRequestDto(request);
  }),

  route('POST', '/api/booking-requests/{id}/reject', (req) => {
    const { studio } = requireStudio(req);
    const request = findPending(studio.id, req.params.id);
    const body = (req.body ?? {}) as RejectBookingRequest;
    request.status = 'Rejected';
    request.rejectionReason = body.reason?.trim() || null;
    request.decidedAt = new Date().toISOString();
    return toRequestDto(request);
  }),
];
