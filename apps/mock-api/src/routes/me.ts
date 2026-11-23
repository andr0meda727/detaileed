import type {
  GarageVehicleDto,
  GarageVehicleRequest,
  ProfileDto,
  ProfileRequest,
  ReviewableVisitDto,
  SubmitBookingRequest,
  SubmitReviewRequest,
  VehicleSize,
} from '@detaileed/api-client';
import type { AuthUser } from '../auth/accounts.ts';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireUser } from '../store/context.ts';
import { newId } from '../store/ids.ts';
import { paged } from '../store/paging.ts';
import { durationFor, planningEnabled, priceFor, scheduleOf, withinOpeningHours } from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { GarageVehicle, OnlineRequest } from '../store/types.ts';
import { normalizePlate } from './clients.ts';
import { publishedStudio } from './marketplace.ts';
import { toRequestDto } from './requests.ts';
import { servicesOf } from './services.ts';

const MAX_CARS = 10;
const MAX_PENDING_PER_STUDIO = 3;
const REVIEW_DAYS = 90;
const SIZES: VehicleSize[] = ['Small', 'Medium', 'Large', 'XL'];

const profileOf = (user: AuthUser) => db().profiles.find((p) => p.userId === user.id);

function requireProfile(user: AuthUser) {
  const profile = profileOf(user);
  if (!profile) {
    throw problem(
      400,
      'CUSTOMER_PROFILE_REQUIRED',
      'Uzupełnij imię i telefon, aby studio mogło się z Tobą skontaktować.',
    );
  }
  return profile;
}

const toGarageDto = (v: GarageVehicle) =>
  ({ id: v.id, licensePlate: v.licensePlate, brand: v.brand, model: v.model, size: v.size }) satisfies GarageVehicleDto;

const garageOf = (user: AuthUser) => db().garage.filter((v) => v.userId === user.id);

function findCar(user: AuthUser, id: string) {
  const car = garageOf(user).find((v) => v.id === id);
  if (!car) throw problem(404, 'CUSTOMER_VEHICLE_NOT_FOUND', 'Nie znaleziono auta w garażu.');
  return car;
}

/** Validates a car for the garage: a plate once per garage, at most ten cars. */
function readCar(user: AuthUser, body: GarageVehicleRequest, exceptId?: string): Omit<GarageVehicle, 'id' | 'userId'> {
  const licensePlate = normalizePlate(body?.licensePlate ?? '');
  if (!licensePlate) throw validationProblem({ LicensePlate: ['Podaj numer rejestracyjny.'] });
  if (body.size && !SIZES.includes(body.size)) throw validationProblem({ Size: ['Nieznana wielkość auta.'] });
  const cars = garageOf(user);
  if (cars.some((v) => v.id !== exceptId && normalizePlate(v.licensePlate) === licensePlate)) {
    throw problem(409, 'CUSTOMER_VEHICLE_EXISTS', 'Auto z tym numerem rejestracyjnym jest już w garażu.');
  }
  if (!exceptId && cars.length >= MAX_CARS) {
    throw problem(409, 'CUSTOMER_GARAGE_FULL', 'W garażu jest już 10 aut.');
  }
  return {
    licensePlate,
    brand: body.brand?.trim() || null,
    model: body.model?.trim() || null,
    size: body.size ?? 'Medium',
  };
}

function addCar(user: AuthUser, body: GarageVehicleRequest): GarageVehicle {
  const car = { id: newId(), userId: user.id, ...readCar(user, body) };
  db().garage.push(car);
  return car;
}

/** A request for a published studio: the studio's lead time and (when it plans) opening hours apply. */
function submitRequest(req: MockRequest) {
  const user = requireUser(req);
  const profile = requireProfile(user);
  const body = (req.body ?? {}) as SubmitBookingRequest;
  const studio = publishedStudio(body.studioId);
  const offered = servicesOf(studio.id);
  const serviceIds = body.serviceIds ?? [];
  if (serviceIds.length === 0) throw validationProblem({ ServiceIds: ['Wybierz co najmniej jedną usługę.'] });
  if (serviceIds.some((id) => !offered.some((s) => s.id === id))) {
    throw problem(400, 'BOOKING_REQUEST_UNKNOWN_SERVICES', 'Część wybranych usług nie jest już dostępna.');
  }
  const preferred = new Date(body.preferredAt ?? '');
  if (Number.isNaN(preferred.getTime())) throw validationProblem({ PreferredAt: ['Wybierz termin.'] });
  if (preferred.getTime() < Date.now() + scheduleOf(studio.id).minLeadHours * 3_600_000) {
    throw problem(400, 'BOOKING_REQUEST_TOO_SOON', 'Ten termin jest zbyt bliski.');
  }
  const pending = db().onlineRequests.filter(
    (r) => r.customerUserId === user.id && r.studioId === studio.id && r.status === 'Pending',
  );
  if (pending.length >= MAX_PENDING_PER_STUDIO) {
    throw problem(409, 'BOOKING_REQUEST_LIMIT', 'Masz już 3 zapytania czekające na odpowiedź tego studia.');
  }

  const car = body.vehicleId ? findCar(user, body.vehicleId) : null;
  if (!car && !body.vehicle) throw validationProblem({ Vehicle: ['Wybierz auto albo podaj jego dane.'] });
  const vehicle = car ?? { ...readCar(user, body.vehicle!), size: body.vehicle!.size ?? 'Medium' };
  if (planningEnabled(studio.id)) {
    const minutes = durationFor(studio.id, serviceIds, vehicle.size);
    const interval = { start: preferred.getTime(), end: preferred.getTime() + minutes * 60_000 };
    if (!withinOpeningHours(studio, interval)) {
      throw problem(400, 'OUTSIDE_OPENING_HOURS', 'Studio nie pracuje o tej porze.');
    }
  }
  // A new car is saved to the garage along with the request.
  if (!car) addCar(user, { ...body.vehicle!, size: vehicle.size });

  const { lines, total, hasUnpriced } = priceFor(serviceIds, vehicle.size);
  const request: OnlineRequest = {
    id: newId(),
    studioId: studio.id,
    customerUserId: user.id,
    status: 'Pending',
    preferredAt: preferred.toISOString(),
    customerName: profile.name,
    customerPhone: profile.phone,
    customerEmail: user.email,
    vehicle: { licensePlate: vehicle.licensePlate, brand: vehicle.brand, model: vehicle.model, size: vehicle.size },
    serviceIds,
    services: lines,
    estimatedPrice: total,
    hasUnpricedServices: hasUnpriced,
    notes: body.notes?.trim() || null,
    rejectionReason: null,
    createdAt: new Date().toISOString(),
    decidedAt: null,
    bookingId: null,
  };
  db().onlineRequests.push(request);
  return toRequestDto(request);
}

/** Completed visits of the last 90 days at studios where the customer is a client, not reviewed yet. */
function reviewableVisits(user: AuthUser) {
  const state = db();
  const since = Date.now() - REVIEW_DAYS * 86_400_000;
  const clientIds = new Set(state.clients.filter((c) => c.customerUserId === user.id).map((c) => c.id));
  return state.bookings
    .filter((b) => clientIds.has(b.clientId) && b.status === 'completed' && b.completedAt)
    .filter((b) => new Date(b.completedAt!).getTime() >= since)
    .filter((b) => !state.reviews.some((r) => r.bookingId === b.id))
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!));
}

const reviewAuthor = (name: string) => {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
};

export const meRoutes: Route[] = [
  route('GET', '/api/me/profile', (req) => {
    const profile = profileOf(requireUser(req));
    if (!profile) throw problem(404, 'CUSTOMER_PROFILE_NOT_FOUND', 'Uzupełnij swoje dane kontaktowe.');
    return { name: profile.name, phone: profile.phone } satisfies ProfileDto;
  }),

  route('PUT', '/api/me/profile', (req) => {
    const user = requireUser(req);
    const body = (req.body ?? {}) as ProfileRequest;
    const errors: Record<string, string[]> = {};
    if (!body.name?.trim()) errors.Name = ['Podaj imię i nazwisko.'];
    if (!/^\+?[\d\s-]{9,}$/.test(body.phone?.trim() ?? '')) errors.Phone = ['Podaj numer telefonu.'];
    if (Object.keys(errors).length) throw validationProblem(errors);
    let profile = profileOf(user);
    if (!profile) db().profiles.push((profile = { userId: user.id, name: '', phone: '' }));
    profile.name = body.name.trim();
    profile.phone = body.phone.trim();
    return { name: profile.name, phone: profile.phone } satisfies ProfileDto;
  }),

  route('GET', '/api/me/vehicles', (req) => garageOf(requireUser(req)).map(toGarageDto)),

  route('POST', '/api/me/vehicles', (req) => toGarageDto(addCar(requireUser(req), req.body as GarageVehicleRequest))),

  route('PUT', '/api/me/vehicles/{id}', (req) => {
    const user = requireUser(req);
    const car = findCar(user, req.params.id);
    Object.assign(car, readCar(user, req.body as GarageVehicleRequest, car.id));
    return toGarageDto(car);
  }),

  route('DELETE', '/api/me/vehicles/{id}', (req) => {
    const user = requireUser(req);
    const car = findCar(user, req.params.id);
    db().garage = db().garage.filter((v) => v.id !== car.id);
    return empty();
  }),

  route('POST', '/api/me/booking-requests', submitRequest),

  route('GET', '/api/me/booking-requests', (req) => {
    const user = requireUser(req);
    const items = db()
      .onlineRequests.filter((r) => r.customerUserId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toRequestDto);
    return paged(items, req.query);
  }),

  route('POST', '/api/me/booking-requests/{id}/withdraw', (req) => {
    const user = requireUser(req);
    const request = db().onlineRequests.find((r) => r.id === req.params.id && r.customerUserId === user.id);
    if (!request) throw problem(404, 'BOOKING_REQUEST_NOT_FOUND', 'Nie znaleziono zapytania.');
    if (request.status !== 'Pending') {
      throw problem(409, 'BOOKING_REQUEST_ALREADY_DECIDED', 'Studio już odpowiedziało na to zapytanie.');
    }
    request.status = 'Withdrawn';
    request.decidedAt = new Date().toISOString();
    return empty();
  }),

  route('GET', '/api/me/reviews/pending', (req) =>
    reviewableVisits(requireUser(req)).map(
      (b) =>
        ({
          bookingId: b.id,
          studioId: b.studioId,
          studioName: db().studios.find((s) => s.id === b.studioId)?.name ?? null,
          completedAt: b.completedAt!,
          reviewableUntil: new Date(new Date(b.completedAt!).getTime() + REVIEW_DAYS * 86_400_000).toISOString(),
        }) satisfies ReviewableVisitDto,
    ),
  ),

  route('POST', '/api/me/reviews', (req) => {
    const user = requireUser(req);
    const body = (req.body ?? {}) as SubmitReviewRequest;
    const profile = requireProfile(user);
    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw validationProblem({ Rating: ['Ocena musi być od 1 do 5.'] });
    }
    if (db().reviews.some((r) => r.bookingId === body.bookingId)) {
      throw problem(409, 'REVIEW_ALREADY_EXISTS', 'Ta wizyta ma już Twoją opinię.');
    }
    const booking = db().bookings.find(
      (b) =>
        b.id === body.bookingId &&
        b.status === 'completed' &&
        db().clients.some((c) => c.id === b.clientId && c.customerUserId === user.id),
    );
    if (!booking) throw problem(404, 'REVIEWABLE_VISIT_NOT_FOUND', 'Nie znaleziono tej wizyty.');
    if (new Date(booking.completedAt!).getTime() < Date.now() - REVIEW_DAYS * 86_400_000) {
      throw problem(409, 'REVIEW_PERIOD_OVER', 'Minęło 90 dni od wizyty.');
    }
    const review = {
      id: newId(),
      studioId: booking.studioId,
      bookingId: booking.id,
      authorUserId: user.id,
      authorName: reviewAuthor(profile.name),
      rating,
      comment: body.comment?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    db().reviews.push(review);
    return {
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    };
  }),
];
