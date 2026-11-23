/**
 * Hard-coded data of the landing page's dashboard demo. Times are the studio's wall-clock times (no time zone), so
 * the server and every browser render the same text. Money is złoty, as in the API.
 */

import type { BadgeTone } from '@detaileed/ui';

export type DemoBooking = (typeof MOCK_BOOKINGS)[number];

export const DEMO_TODAY = '2026-04-15';

/** Status tones as the dashboard maps booking statuses: Utworzona is info, Zakończona success. */
export const MOCK_BOOKINGS = [
  {
    id: '1',
    scheduledAt: '2026-04-15T09:00',
    endsAt: '2026-04-15T13:00',
    bay: 'Stanowisko 1',
    completedAt: null,
    totalPrice: 4500,
    status: 'Utworzona',
    statusTone: 'info',
    vehicle: { licensePlate: 'WA 12345', brand: 'BMW', model: 'M4 Competition' },
    client: { name: 'Jan Kowalski' },
    services: ['Korekta lakieru', 'Ceramika'],
  },
  {
    id: '2',
    scheduledAt: '2026-04-15T11:30',
    endsAt: '2026-04-15T14:00',
    bay: 'Myjnia',
    completedAt: null,
    totalPrice: 1200,
    status: 'Utworzona',
    statusTone: 'info',
    vehicle: { licensePlate: 'KR 98765', brand: 'Mercedes', model: 'AMG GT' },
    client: { name: 'Anna Nowak' },
    services: ['Mycie detailingowe', 'Wosk'],
  },
  {
    id: '3',
    scheduledAt: '2026-04-15T14:00',
    endsAt: '2026-04-15T18:00',
    bay: 'Stanowisko 2',
    completedAt: '2026-04-15T16:00',
    totalPrice: 9800,
    status: 'Zakończona',
    statusTone: 'success',
    vehicle: { licensePlate: 'GD 55555', brand: 'Porsche', model: '911 Turbo S' },
    client: { name: 'Marek Wiśniewski' },
    services: ['PPF folia ochronna', 'Korekta lakieru', 'Ceramika'],
  },
  {
    id: '4',
    scheduledAt: '2026-04-16T08:00',
    endsAt: '2026-04-16T12:00',
    bay: 'Stanowisko 1',
    completedAt: null,
    totalPrice: 2400,
    status: 'Utworzona',
    statusTone: 'info',
    vehicle: { licensePlate: 'PO 77777', brand: 'Audi', model: 'RS6 Avant' },
    client: { name: 'Karolina Dąbrowska' },
    services: ['Korekta lakieru'],
  },
  {
    id: '5',
    scheduledAt: '2026-04-17T10:00',
    endsAt: '2026-04-17T15:00',
    bay: 'Stanowisko 2',
    completedAt: null,
    totalPrice: 5200,
    status: 'Utworzona',
    statusTone: 'info',
    vehicle: { licensePlate: 'WR 33333', brand: 'Tesla', model: 'Model S Plaid' },
    client: { name: 'Piotr Lewandowski' },
    services: ['Ceramika', 'Detailing wnętrza'],
  },
  {
    id: '6',
    scheduledAt: '2026-04-18T09:00',
    endsAt: '2026-04-18T11:00',
    bay: 'Myjnia',
    completedAt: null,
    totalPrice: 450,
    status: 'Utworzona',
    statusTone: 'info',
    vehicle: { licensePlate: 'LU 44444', brand: 'Volkswagen', model: 'Golf R' },
    client: { name: 'Tomasz Zieliński' },
    services: ['Mycie detailingowe'],
  },
  {
    id: '7',
    scheduledAt: '2026-04-14T12:00',
    endsAt: '2026-04-14T18:00',
    bay: 'Stanowisko 2',
    completedAt: '2026-04-14T15:00',
    totalPrice: 14500,
    status: 'Zakończona',
    statusTone: 'success',
    vehicle: { licensePlate: 'WA 99999', brand: 'Lamborghini', model: 'Huracán EVO' },
    client: { name: 'Robert Szymański' },
    services: ['PPF folia ochronna', 'Ceramika', 'Detailing wnętrza'],
  },
] satisfies ({ statusTone: BadgeTone } & Record<string, unknown>)[];

export const MOCK_CLIENTS = [
  {
    id: 'c1',
    name: 'Jan Kowalski',
    email: 'jan@email.com',
    phone: '+48 500 100 200',
    nip: '1234567890',
    vehicles: [{ id: 'v1', licensePlate: 'WA 12345', brand: 'BMW', model: 'M4 Competition' }],
  },
  {
    id: 'c2',
    name: 'Anna Nowak',
    email: 'anna@firma.pl',
    phone: '+48 600 300 400',
    nip: null,
    vehicles: [{ id: 'v2', licensePlate: 'KR 98765', brand: 'Mercedes', model: 'AMG GT' }],
  },
  {
    id: 'c3',
    name: 'Marek Wiśniewski',
    email: null,
    phone: '+48 700 500 600',
    nip: null,
    vehicles: [
      { id: 'v3', licensePlate: 'GD 55555', brand: 'Porsche', model: '911 Turbo S' },
      { id: 'v8', licensePlate: 'GD 11111', brand: 'Porsche', model: 'Cayenne' },
    ],
  },
  {
    id: 'c4',
    name: 'Karolina Dąbrowska',
    email: 'karolina@auto.pl',
    phone: '+48 800 700 800',
    nip: '9876543210',
    vehicles: [{ id: 'v4', licensePlate: 'PO 77777', brand: 'Audi', model: 'RS6 Avant' }],
  },
  {
    id: 'c5',
    name: 'Piotr Lewandowski',
    email: 'piotr@tech.io',
    phone: '+48 900 800 700',
    nip: null,
    vehicles: [{ id: 'v5', licensePlate: 'WR 33333', brand: 'Tesla', model: 'Model S Plaid' }],
  },
  {
    id: 'c6',
    name: 'Tomasz Zieliński',
    email: null,
    phone: '+48 501 502 503',
    nip: null,
    vehicles: [{ id: 'v6', licensePlate: 'LU 44444', brand: 'Volkswagen', model: 'Golf R' }],
  },
  {
    id: 'c7',
    name: 'Robert Szymański',
    email: 'robert@luxury.com',
    phone: '+48 600 600 600',
    nip: '5556667778',
    vehicles: [
      { id: 'v7', licensePlate: 'WA 99999', brand: 'Lamborghini', model: 'Huracán EVO' },
      { id: 'v9', licensePlate: 'WA 88888', brand: 'Ferrari', model: 'F8 Tributo' },
    ],
  },
];

export const MOCK_INVENTORY = [
  { id: 'i1', name: 'Gyeon Q² Mohs EVO', categoryName: 'Powłoki ceramiczne', unit: 'ml', stock: 450, minStock: 200 },
  { id: 'i2', name: 'Rupes DA Fine', categoryName: 'Pasty polerskie', unit: 'ml', stock: 120, minStock: 300 },
  { id: 'i3', name: 'Koch Chemie GSF', categoryName: 'Szampony', unit: 'L', stock: 8, minStock: 3 },
  { id: 'i4', name: 'Pad polerski 150mm', categoryName: 'Akcesoria', unit: 'szt', stock: 4, minStock: 10 },
  { id: 'i5', name: 'IPA 99%', categoryName: 'Chemia', unit: 'L', stock: 15, minStock: 5 },
  { id: 'i6', name: 'Mikrofibra bezszwowa', categoryName: 'Akcesoria', unit: 'szt', stock: 25, minStock: 10 },
  { id: 'i7', name: 'XPEL Ultimate Plus PPF', categoryName: 'Folie ochronne', unit: 'm²', stock: 12, minStock: 5 },
];

/** Role tones as in the dashboard's team list: the owner info, everyone else neutral. */
export const MOCK_EMPLOYEES = [
  {
    userId: 'u1',
    email: 'jan.detailer@studio.pl',
    name: 'Jan Majewski',
    role: 'Właściciel',
    tone: 'info',
  },
  {
    userId: 'u2',
    email: 'kasia.wraps@studio.pl',
    name: 'Katarzyna Wójcik',
    role: 'Manager',
    tone: 'neutral',
  },
  {
    userId: 'u3',
    email: 'mateusz@studio.pl',
    name: 'Mateusz Kamiński',
    role: 'Pracownik',
    tone: 'neutral',
  },
] satisfies ({ tone: BadgeTone } & Record<string, unknown>)[];

/** Revenue of completed bookings in złoty: per day of the last week and per week of the last month. */
export const MOCK_REVENUE = {
  weekly: [
    { name: 'Czw', rev: 3200 },
    { name: 'Pt', rev: 5400 },
    { name: 'Sob', rev: 7900 },
    { name: 'Nd', rev: 0 },
    { name: 'Pon', rev: 4100 },
    { name: 'Wt', rev: 14500 },
    { name: 'Śr', rev: 9800 },
  ],
  monthly: [
    { name: '23.03', rev: 31200 },
    { name: '30.03', rev: 27800 },
    { name: '06.04', rev: 36400 },
    { name: '13.04', rev: 44900 },
  ],
};
