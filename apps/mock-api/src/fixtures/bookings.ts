import { addDays } from '@detaileed/domain/studioTime';
import { stableId } from '../store/ids.ts';
import { bayIsFree, durationFor, openPeriods, priceFor, toIso } from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { Booking, Studio } from '../store/types.ts';
import { bayId, serviceId } from './services.ts';
import { CLIENT_KEYS, STUDIO, clientId, vehicleId } from './studios.ts';

/** A fixed-seed random generator, so every reset builds the same calendar (relative to today). */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Typical visits, the quick ones more often. */
const VISITS: string[][] = [
  ['wash'],
  ['wash'],
  ['wash-premium'],
  ['wash-premium'],
  ['interior'],
  ['wash', 'interior'],
  ['wash-premium', 'interior'],
  ['tyres'],
  ['tyres', 'rims'],
  ['interior', 'ozone'],
  ['upholstery'],
  ['leather'],
  ['polish-1'],
  ['polish-2'],
  ['ceramic'],
];

const NOTES = [
  'Klient prosi o telefon przed odbiorem.',
  'Rysa na tylnym zderzaku – pokazać klientowi.',
  'Odbiór po 17:00.',
  'Pies w aucie – dużo sierści na tylnej kanapie.',
  'Fotelik dziecięcy do wyjęcia i wyczyszczenia.',
  'Klient zostawia kluczyki w recepcji.',
  'Stały klient – 10% rabatu.',
];

const BAYS = [bayId('1'), bayId('2'), bayId('wash')];
const BUFFER = 15 * 60_000;

function vehicleOf(key: string, pick: () => number) {
  const cars = db().vehicles.filter((v) => v.clientId === clientId(key));
  return cars[Math.floor(pick() * cars.length)];
}

/** Adds a booking to the store when its bay is free; returns whether it fit. */
function place(studio: Studio, b: Omit<Booking, 'endsAt' | 'price'> & { price?: number | null }): Booking | null {
  const vehicle = db().vehicles.find((v) => v.id === b.vehicleId)!;
  const minutes = durationFor(studio.id, b.serviceIds, vehicle.size);
  const start = new Date(b.scheduledAt).getTime();
  const interval = { start, end: start + minutes * 60_000 };
  if (b.bayId && !bayIsFree(studio.id, b.bayId, interval)) return null;
  const price = b.price === undefined ? priceFor(b.serviceIds, vehicle.size).total : b.price;
  const booking: Booking = { ...b, endsAt: toIso(interval.end), price };
  db().bookings.push(booking);
  return booking;
}

function finish(booking: Booking, now: number) {
  if (new Date(booking.endsAt).getTime() > now) return;
  booking.status = 'completed';
  booking.completedAt = toIso(new Date(booking.endsAt).getTime() + 10 * 60_000);
}

/** Visits of the demo customer: two recent ones to review and an older one she already reviewed. */
export const CUSTOMER_VISITS = {
  recent: stableId('booking:marta-recent'),
  older: stableId('booking:marta-older'),
  reviewed: stableId('booking:marta-reviewed'),
};

function seedCustomerVisits(studio: Studio, today: string) {
  const visits: [id: string, offset: number, plate: string, services: string[]][] = [
    [CUSTOMER_VISITS.recent, -6, 'WX 4821K', ['wash-premium', 'interior']],
    [CUSTOMER_VISITS.older, -20, 'WI 7753P', ['polish-1']],
    [CUSTOMER_VISITS.reviewed, -45, 'WX 4821K', ['interior', 'ozone']],
  ];
  for (const [id, offset, plate, services] of visits) {
    const start = openPeriods(studio, addDays(today, offset))[0]?.start;
    if (start === undefined) continue;
    const booking = place(studio, {
      id,
      studioId: studio.id,
      clientId: clientId('marta'),
      vehicleId: vehicleId(plate),
      scheduledAt: toIso(start),
      completedAt: null,
      status: 'created',
      notes: null,
      bayId: bayId('1'),
      serviceIds: services.map(serviceId),
    });
    if (booking) finish(booking, Date.now());
  }
}

/**
 * About eight weeks back and three weeks ahead of bookings on the busy studio's three bays: past ones mostly
 * completed (a few cancelled), today's done until now, upcoming ones thinning out, plus one unassigned visit.
 */
export function seedBookings() {
  const state = db();
  const studio = state.studios.find((s) => s.id === STUDIO.full)!;
  const today = state.today;
  const now = Date.now();
  const pick = random(20261123);
  seedCustomerVisits(studio, today);

  for (let offset = -56; offset <= 21; offset++) {
    const day = addDays(today, offset);
    const perBay = offset <= 3 ? 3 : offset <= 10 ? 2 : 1;
    for (const [bayIndex, bay] of BAYS.entries()) {
      for (const period of openPeriods(studio, day)) {
        let cursor = period.start + Math.floor(pick() * 3) * 30 * 60_000;
        let placed = 0;
        let attempts = 0;
        while (placed < perBay && attempts++ < 12 && cursor + 45 * 60_000 <= period.end) {
          // The wash bay takes quick visits only.
          const visits = bayIndex === 2 ? VISITS.slice(0, 10) : VISITS;
          const services = visits[Math.floor(pick() * visits.length)];
          const key = CLIENT_KEYS[1 + Math.floor(pick() * (CLIENT_KEYS.length - 1))];
          const vehicle = vehicleOf(key, pick);
          const minutes = durationFor(studio.id, services.map(serviceId), vehicle.size);
          // Too long for what's left of the day: try a shorter visit.
          if (cursor + minutes * 60_000 > period.end) continue;
          const booking = place(studio, {
            id: stableId(`booking:${day}:${bay}:${placed}`),
            studioId: studio.id,
            clientId: clientId(key),
            vehicleId: vehicle.id,
            scheduledAt: toIso(cursor),
            completedAt: null,
            status: 'created',
            notes: pick() < 0.2 ? NOTES[Math.floor(pick() * NOTES.length)] : null,
            bayId: bay,
            serviceIds: services.map(serviceId),
          });
          if (!booking) {
            cursor += 30 * 60_000;
            continue;
          }
          placed++;
          if (offset < 0 && pick() < 0.08) booking.status = 'cancelled';
          else finish(booking, now);
          if (booking.notes === NOTES[6] && booking.price) booking.price = Math.round(booking.price * 0.9);
          cursor = new Date(booking.endsAt).getTime() + BUFFER + Math.floor(pick() * 3) * 30 * 60_000;
        }
      }
    }
  }

  // One visit without a bay (taken over the phone before planning was set up), today and tomorrow.
  for (const offset of [0, 1]) {
    const start = openPeriods(studio, addDays(today, offset))[0]?.start;
    if (start === undefined) continue;
    const vehicle = vehicleOf('transbud', pick);
    place(studio, {
      id: stableId(`booking:unassigned:${offset}`),
      studioId: studio.id,
      clientId: clientId('transbud'),
      vehicleId: vehicle.id,
      scheduledAt: toIso(start + 4 * 3_600_000),
      completedAt: null,
      status: 'created',
      notes: 'Auto firmowe – faktura na Transbud.',
      bayId: null,
      serviceIds: [serviceId('wash'), serviceId('interior')],
    });
  }
}
