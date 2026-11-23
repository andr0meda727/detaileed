import type {
  BookingResponseDto,
  ClientResponseDto,
  DayBoardDto,
  ListingDto,
  PagedResponseOfBookingRequestDto,
  PagedResponseOfBookingResponseDto,
  PagedResponseOfStudioPinDto,
  ReviewableVisitDto,
  ServiceResponseDto,
  StaffAvailabilityDto,
  UserStudioDto,
} from '@detaileed/api-client';
import { todayInZone } from '@detaileed/domain/studioTime';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { CUSTOMER, EMPLOYEE, OWNER, call, ownerStudios, signIn, startMock, type Mock } from './helpers.ts';

let mock: Mock;
let owner: string;
let studios: { full: string; empty: string };
beforeAll(async () => {
  mock = await startMock();
  owner = await signIn(mock, OWNER);
  studios = await ownerStudios(mock, owner);
});
afterAll(() => mock.close());
beforeEach(() => call(mock, null, 'POST', '/__mock/reset'));

const today = todayInZone('Europe/Warsaw');

describe('sample data', () => {
  it('gives each demo account its studios and role', async () => {
    const mine = async (email: string) =>
      (await call<UserStudioDto[]>(mock, await signIn(mock, email), 'GET', '/api/Studios/my')).body;
    expect((await mine(OWNER)).map((s) => [s.name, s.role])).toEqual([
      ['Auto Spa Mokotów', 'Owner'],
      ['Auto Spa Wola', 'Owner'],
    ]);
    expect((await mine(EMPLOYEE)).map((s) => s.role)).toEqual(['Employee']);
    expect(await mine(CUSTOMER)).toEqual([]);
  });

  it('fills today in the busy studio and leaves the new one empty', async () => {
    const day = await call<DayBoardDto>(mock, owner, 'GET', `/api/schedule/day?date=${today}`, {
      studioId: studios.full,
    });
    expect(day.body.planningEnabled).toBe(true);
    expect(day.body.bays.flatMap((b) => b.bookings).length).toBeGreaterThan(3);

    const bookings = await call<PagedResponseOfBookingResponseDto>(mock, owner, 'GET', '/api/Bookings?PageSize=100', {
      studioId: studios.empty,
    });
    expect(bookings.body.items).toEqual([]);
    const listing = await call<{ code: string }>(mock, owner, 'GET', '/api/marketplace/listing', {
      studioId: studios.empty,
    });
    expect(listing.body.code).toBe('LISTING_NOT_FOUND');
  });

  it('refuses a studio the user does not work in', async () => {
    const customer = await signIn(mock, CUSTOMER);
    const res = await call<{ code: string }>(mock, customer, 'GET', '/api/Clients', { studioId: studios.full });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('STUDIO_ACCESS_DENIED');
  });

  it('pages and searches clients', async () => {
    const res = await call<{ items: ClientResponseDto[]; totalCount: number }>(
      mock,
      owner,
      'GET',
      '/api/Clients?search=WX%204821K&Page=1&PageSize=5',
      { studioId: studios.full },
    );
    expect(res.body.totalCount).toBe(1);
    expect(res.body.items[0].name).toBe('Marta Zielińska');
  });

  it('offers free slots for services and a car size', async () => {
    const services = await call<ServiceResponseDto[]>(mock, owner, 'GET', '/api/service', { studioId: studios.full });
    const wash = services.body.find((s) => s.name === 'Mycie ręczne podstawowe')!;
    const res = await call<StaffAvailabilityDto>(
      mock,
      owner,
      'GET',
      `/api/availability?From=${today}&To=${today}&ServiceIds=${wash.id}&VehicleSize=XL`,
      { studioId: studios.full },
    );
    expect(res.body.durationMinutes).toBe(70);
  });

  it('shows published studios on the map and their public page', async () => {
    const pins = await call<PagedResponseOfStudioPinDto>(
      mock,
      null,
      'GET',
      '/api/public/studios?MinLat=52.0&MaxLat=52.4&MinLng=20.8&MaxLng=21.3&Category=Ppf&VehicleSize=Medium',
    );
    expect(pins.body.items.map((p) => p.name)).toEqual(['Auto Spa Mokotów', 'Wilanów Auto Detailing']);
    const page = await call<ListingDto>(mock, null, 'GET', `/api/public/studios/${studios.full}`);
    expect(page.body.isPublished).toBe(true);
    expect(page.body.reviewCount).toBeGreaterThan(10);
    const hidden = await call<{ code: string }>(mock, null, 'GET', `/api/public/studios/${studios.empty}`);
    expect(hidden.status).toBe(404);
  });

  it('gives the customer requests in every status and visits to review', async () => {
    const customer = await signIn(mock, CUSTOMER);
    const mine = await call<PagedResponseOfBookingRequestDto>(mock, customer, 'GET', '/api/me/booking-requests');
    expect(new Set(mine.body.items.map((r) => r.status))).toEqual(
      new Set(['Pending', 'Accepted', 'Rejected', 'Withdrawn']),
    );
    expect(mine.body.items.find((r) => r.status === 'Accepted')?.booking).not.toBeNull();
    const reviews = await call<ReviewableVisitDto[]>(mock, customer, 'GET', '/api/me/reviews/pending');
    expect(reviews.body).toHaveLength(2);
  });
});

describe('mutations', () => {
  it('creates a client and books, completes and cancels visits', async () => {
    const studioId = studios.full;
    const client = await call<ClientResponseDto>(mock, owner, 'POST', '/api/Clients', {
      studioId,
      body: {
        name: 'Nowy Klient',
        phone: '+48 500 000 000',
        vehicle: { licensePlate: 'wa 00001', brand: 'Skoda', model: 'Superb', size: 'Large' },
      },
    });
    expect(client.body.vehicles[0].licensePlate).toBe('WA 00001');
    const services = await call<ServiceResponseDto[]>(mock, owner, 'GET', '/api/service', { studioId });
    const wash = services.body.find((s) => s.name === 'Mycie premium z woskiem')!;

    const booking = await call<BookingResponseDto>(mock, owner, 'POST', '/api/Bookings', {
      studioId,
      body: {
        clientId: client.body.id,
        vehicleId: client.body.vehicles[0].id,
        scheduledAt: '2030-06-03T08:00:00.000Z',
        serviceIds: [wash.id],
        notes: null,
        bayId: null,
      },
    });
    expect(booking.status).toBe(200);
    expect(booking.body).toMatchObject({ status: 'Utworzona', totalPrice: 180, services: ['Mycie premium z woskiem'] });
    expect(booking.body.bay).not.toBeNull();

    const done = await call<BookingResponseDto>(mock, owner, 'POST', `/api/Bookings/${booking.body.id}/complete`, {
      studioId,
    });
    expect(done.body.status).toBe('Zakończona');
    const used = await call<{ lines: unknown[] }>(
      mock,
      owner,
      'GET',
      `/api/inventory/consumptions/${booking.body.id}`,
      {
        studioId,
      },
    );
    expect(used.body.lines.length).toBeGreaterThan(0);
    const cancel = await call<{ code: string }>(mock, owner, 'POST', `/api/Bookings/${booking.body.id}/cancel`, {
      studioId,
    });
    expect(cancel.status).toBe(409);
  });

  it('refuses a bay that is taken', async () => {
    const studioId = studios.full;
    const day = await call<DayBoardDto>(mock, owner, 'GET', `/api/schedule/day?date=${today}`, { studioId });
    const busyBay = day.body.bays.find((b) => b.bookings.length > 0)!;
    const taken = await call<BookingResponseDto>(mock, owner, 'GET', `/api/Bookings/${busyBay.bookings[0].id}`, {
      studioId,
    });
    const clients = await call<{ items: ClientResponseDto[] }>(
      mock,
      owner,
      'GET',
      '/api/Clients?search=Jan%20Kowalski',
      {
        studioId,
      },
    );
    const jan = clients.body.items[0];
    const res = await call<{ code: string }>(mock, owner, 'POST', '/api/Bookings', {
      studioId,
      body: {
        clientId: jan.id,
        vehicleId: jan.vehicles[0].id,
        scheduledAt: taken.body.scheduledAt,
        serviceIds: [],
        bayId: busyBay.bayId,
      },
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('BAY_TAKEN');
  });

  it('accepts a request into a booking and the customer sees it', async () => {
    const studioId = studios.full;
    const inbox = await call<PagedResponseOfBookingRequestDto>(
      mock,
      owner,
      'GET',
      '/api/booking-requests?status=Pending',
      {
        studioId,
      },
    );
    const request = inbox.body.items.find((r) => r.customerEmail === CUSTOMER)!;
    const accepted = await call<{ status: string; booking: unknown }>(
      mock,
      owner,
      'POST',
      `/api/booking-requests/${request.id}/accept`,
      { studioId, body: { scheduledAt: '2030-06-04T08:00:00.000Z' } },
    );
    expect(accepted.body.status).toBe('Accepted');
    expect(accepted.body.booking).not.toBeNull();
    const again = await call<{ code: string }>(mock, owner, 'POST', `/api/booking-requests/${request.id}/reject`, {
      studioId,
      body: { reason: null },
    });
    expect(again.body.code).toBe('BOOKING_REQUEST_ALREADY_DECIDED');
  });

  it('lets the customer review a visit once', async () => {
    const customer = await signIn(mock, CUSTOMER);
    const [visit] = (await call<ReviewableVisitDto[]>(mock, customer, 'GET', '/api/me/reviews/pending')).body;
    const body = { bookingId: visit.bookingId, rating: 5, comment: 'Super!' };
    const review = await call<{ authorName: string }>(mock, customer, 'POST', '/api/me/reviews', { body });
    expect(review.body.authorName).toBe('Marta Z.');
    const twice = await call<{ code: string }>(mock, customer, 'POST', '/api/me/reviews', { body });
    expect(twice.body.code).toBe('REVIEW_ALREADY_EXISTS');
  });

  it('restores the sample data on reset', async () => {
    const studioId = studios.full;
    const before = await call<{ totalCount: number }>(mock, owner, 'GET', '/api/Clients', { studioId });
    await call(mock, owner, 'POST', '/api/Clients', {
      studioId,
      body: { name: 'Do usunięcia', phone: '+48 511 111 111' },
    });
    expect((await call<{ totalCount: number }>(mock, owner, 'GET', '/api/Clients', { studioId })).body.totalCount).toBe(
      before.body.totalCount + 1,
    );
    expect((await call(mock, null, 'POST', '/__mock/reset')).status).toBe(204);
    expect((await call<{ totalCount: number }>(mock, owner, 'GET', '/api/Clients', { studioId })).body.totalCount).toBe(
      before.body.totalCount,
    );
  });
});
