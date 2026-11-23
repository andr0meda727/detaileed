import type { OnlineRequestStatus, VehicleSize } from '@detaileed/api-client';
import { HttpError } from '../http.ts';
import { stableId } from '../store/ids.ts';
import { priceFor } from '../store/planning.ts';
import { db } from '../store/store.ts';
import { at } from '../store/time.ts';
import type { OnlineRequest } from '../store/types.ts';
import { acceptRequest } from '../routes/requests.ts';
import { USER } from './accounts.ts';
import { partnerId } from './marketplace.ts';
import { serviceId } from './services.ts';
import { STUDIO } from './studios.ts';

type Customer = [name: string, phone: string, email: string, userId: string | null];
type Car = [plate: string, brand: string, model: string, size: VehicleSize];

const MARTA: Customer = ['Marta Zielińska', '+48 601 234 118', 'klient@demo.detaileed.com', USER.customer];
const COROLLA: Car = ['WX 4821K', 'Toyota', 'Corolla', 'Medium'];
const XC60: Car = ['WI 7753P', 'Volvo', 'XC60', 'Large'];

interface RequestRow {
  key: string;
  studio: string;
  status: OnlineRequestStatus;
  customer: Customer;
  car: Car;
  services: string[];
  /** Days from today and local time of the preferred start. */
  preferred: [offset: number, time: string];
  /** Hours before now the request was sent. */
  sentHoursAgo: number;
  decidedHoursAgo?: number;
  notes?: string;
  rejectionReason?: string;
}

/** The busy studio's inbox (every status) and the demo customer's requests, one of them at another studio. */
const REQUESTS: RequestRow[] = [
  {
    key: 'marta-pending',
    studio: STUDIO.full,
    status: 'Pending',
    customer: MARTA,
    car: XC60,
    services: ['polish-1'],
    preferred: [2, '09:00'],
    sentHoursAgo: 20,
    notes: 'Czy da się odebrać auto tego samego dnia po 17?',
  },
  {
    key: 'bartosz',
    studio: STUDIO.full,
    status: 'Pending',
    customer: ['Bartosz Michalski', '+48 600 300 214', 'bartosz.michalski@example.com', null],
    car: ['WX 55821', 'BMW', '320i', 'Medium'],
    services: ['ceramic'],
    preferred: [3, '08:00'],
    sentHoursAgo: 2,
  },
  {
    key: 'karolina',
    studio: STUDIO.full,
    status: 'Pending',
    customer: ['Karolina Sikorska', '+48 698 120 447', 'karolina.sikorska@example.com', null],
    car: ['WE 1A202', 'Kia', 'Picanto', 'Small'],
    services: ['wash-premium', 'interior'],
    preferred: [1, '12:00'],
    sentHoursAgo: 5,
    notes: 'Fotelik dziecięcy zostaje w aucie.',
  },
  {
    key: 'monika',
    studio: STUDIO.full,
    status: 'Pending',
    customer: ['Monika Jabłońska', '+48 513 882 090', 'monika.jablonska@example.com', null],
    car: ['WPI 2F515', 'Skoda', 'Fabia', 'Small'],
    services: ['wash'],
    preferred: [1, '12:30'],
    sentHoursAgo: 3,
  },
  {
    key: 'adam',
    studio: STUDIO.full,
    status: 'Pending',
    customer: ['Adam Górski', '+48 601 777 352', 'adam.gorski@example.com', null],
    car: ['WGM 7Q700', 'Audi', 'Q7', 'XL'],
    services: ['ppf'],
    preferred: [5, '08:00'],
    sentHoursAgo: 26,
    notes: 'Proszę o wycenę folii na cały przód z reflektorami.',
  },
  {
    key: 'marta-accepted',
    studio: STUDIO.full,
    status: 'Accepted',
    customer: MARTA,
    car: COROLLA,
    services: ['wash-premium'],
    preferred: [4, '14:00'],
    sentHoursAgo: 50,
    decidedHoursAgo: 30,
  },
  {
    key: 'rafal',
    studio: STUDIO.full,
    status: 'Accepted',
    customer: ['Rafał Kubiak', '+48 784 220 615', 'rafal.kubiak@example.com', null],
    car: ['WA 7720N', 'Opel', 'Astra', 'Medium'],
    services: ['interior', 'ozone'],
    preferred: [2, '13:00'],
    sentHoursAgo: 70,
    decidedHoursAgo: 66,
  },
  {
    key: 'lukasz',
    studio: STUDIO.full,
    status: 'Rejected',
    customer: ['Łukasz Wróbel', '+48 507 641 338', 'lukasz.wrobel@example.com', null],
    car: ['WN 99013', 'Mazda', '6', 'Medium'],
    services: ['polish-2'],
    preferred: [1, '08:00'],
    sentHoursAgo: 60,
    decidedHoursAgo: 52,
    rejectionReason: 'W tym tygodniu mamy pełny grafik na korekty – zapraszamy od przyszłego poniedziałku.',
  },
  {
    key: 'marta-withdrawn',
    studio: STUDIO.full,
    status: 'Withdrawn',
    customer: MARTA,
    car: COROLLA,
    services: ['tyres'],
    preferred: [7, '10:00'],
    sentHoursAgo: 96,
    decidedHoursAgo: 80,
    notes: 'Opony zimowe w bagażniku.',
  },
  {
    key: 'marta-rejected',
    studio: partnerId('perla'),
    status: 'Rejected',
    customer: MARTA,
    car: XC60,
    services: ['upholstery'],
    preferred: [-3, '10:00'],
    sentHoursAgo: 150,
    decidedHoursAgo: 140,
    rejectionReason: 'Niestety nie pierzemy już tapicerki w autach z pakietem skórzanym. Polecamy studio na Mokotowie.',
  },
];

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

/** Serves a service key of the busy studio, or the same service of a partner studio. */
const serviceFor = (studioId: string, key: string) =>
  studioId === STUDIO.full ? serviceId(key) : stableId(`service:${studioId}:${key}`);

export function seedRequests() {
  const state = db();
  for (const row of REQUESTS) {
    const [name, phone, email, userId] = row.customer;
    const [licensePlate, brand, model, size] = row.car;
    const serviceIds = row.services.map((key) => serviceFor(row.studio, key));
    const { lines, total, hasUnpriced } = priceFor(serviceIds, size);
    const request: OnlineRequest = {
      id: stableId(`request:${row.key}`),
      studioId: row.studio,
      customerUserId: userId,
      status: row.status === 'Accepted' ? 'Pending' : row.status,
      preferredAt: at(state.today, row.preferred[0], row.preferred[1]),
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      vehicle: { licensePlate, brand, model, size },
      serviceIds,
      services: lines,
      estimatedPrice: total,
      hasUnpricedServices: hasUnpriced,
      notes: row.notes ?? null,
      rejectionReason: row.rejectionReason ?? null,
      createdAt: hoursAgo(row.sentHoursAgo),
      decidedAt: row.decidedHoursAgo === undefined ? null : hoursAgo(row.decidedHoursAgo),
      bookingId: null,
    };
    state.onlineRequests.push(request);
    if (row.status !== 'Accepted') continue;
    // Accepted at the preferred time, or the next hour with a free bay.
    const studio = state.studios.find((s) => s.id === row.studio)!;
    for (let shift = 0; shift < 8; shift++) {
      const scheduledAt = new Date(new Date(request.preferredAt).getTime() + shift * 3_600_000).toISOString();
      try {
        acceptRequest(studio, request, { scheduledAt });
        break;
      } catch (err) {
        if (!(err instanceof HttpError)) throw err;
      }
    }
    request.decidedAt = hoursAgo(row.decidedHoursAgo ?? 1);
  }
}
