import type { VehicleSize } from '@detaileed/api-client';
import { stableId } from '../store/ids.ts';
import { TZ, at } from '../store/time.ts';
import type { Client, Membership, Studio, Vehicle } from '../store/types.ts';
import { USER } from './accounts.ts';

/** The owner's two studios: a busy one with months of data and a new, empty one (for empty states). */
export const STUDIO = {
  full: stableId('studio:full'),
  empty: stableId('studio:empty'),
} as const;

export function seedStudios(today: string): Studio[] {
  return [
    {
      id: STUDIO.full,
      name: 'Auto Spa Mokotów',
      phone: '+48 22 345 67 89',
      email: 'studio@demo.detaileed.com',
      address: 'ul. Puławska 145',
      city: 'Warszawa',
      latitude: 52.1932,
      longitude: 21.0221,
      timeZone: TZ,
      createdAt: at(today, -400, '09:00'),
    },
    {
      id: STUDIO.empty,
      name: 'Auto Spa Wola',
      phone: null,
      email: null,
      address: null,
      city: null,
      latitude: null,
      longitude: null,
      timeZone: TZ,
      createdAt: at(today, -2, '18:30'),
    },
  ];
}

export function seedMemberships(): Membership[] {
  return [
    { studioId: STUDIO.full, userId: USER.owner, roleId: 1 },
    { studioId: STUDIO.full, userId: USER.manager, roleId: 2 },
    { studioId: STUDIO.full, userId: USER.employee, roleId: 3 },
    { studioId: STUDIO.full, userId: USER.employee2, roleId: 3 },
    { studioId: STUDIO.empty, userId: USER.owner, roleId: 1 },
  ];
}

type Car = [plate: string, brand: string, model: string, size: VehicleSize];
type ClientRow = [key: string, name: string, phone: string, email: string | null, nip: string | null, cars: Car[]];

/** The busy studio's regulars. `marta` is the demo customer, who also has these cars in her garage. */
const CLIENTS: ClientRow[] = [
  [
    'marta',
    'Marta Zielińska',
    '+48 601 234 118',
    'klient@demo.detaileed.com',
    null,
    [
      ['WX 4821K', 'Toyota', 'Corolla', 'Medium'],
      ['WI 7753P', 'Volvo', 'XC60', 'Large'],
    ],
  ],
  [
    'jan',
    'Jan Kowalski',
    '+48 502 118 904',
    'jan.kowalski@example.com',
    null,
    [['WA 12345', 'Skoda', 'Octavia', 'Medium']],
  ],
  [
    'katarzyna',
    'Katarzyna Nowicka',
    '+48 698 441 207',
    'katarzyna.nowicka@example.com',
    null,
    [['WE 5S218', 'Audi', 'A4 Avant', 'Medium']],
  ],
  ['piotr', 'Piotr Wójcik', '+48 515 730 662', null, null, [['WPI 88214', 'BMW', 'X5', 'XL']]],
  [
    'agnieszka',
    'Agnieszka Kamińska',
    '+48 609 552 381',
    'a.kaminska@example.com',
    null,
    [['WW 3K471', 'Fiat', '500', 'Small']],
  ],
  [
    'michal',
    'Michał Lewandowski',
    '+48 533 019 744',
    'm.lewandowski@example.com',
    null,
    [
      ['WX 9P012', 'Mercedes-Benz', 'C 220d', 'Medium'],
      ['WX 1G550', 'Mercedes-Benz', 'GLE', 'Large'],
    ],
  ],
  [
    'ewa',
    'Ewa Dąbrowska',
    '+48 664 908 215',
    'ewa.dabrowska@example.com',
    null,
    [['WB 62117', 'Kia', 'Sportage', 'Large']],
  ],
  [
    'grzegorz',
    'Grzegorz Mazur',
    '+48 501 663 470',
    'g.mazur@example.com',
    null,
    [['WE 911GM', 'Porsche', '911 Carrera', 'Medium']],
  ],
  ['aleksandra', 'Aleksandra Krawczyk', '+48 692 301 558', null, null, [['WN 4720C', 'Toyota', 'Yaris', 'Small']]],
  [
    'pawel',
    'Paweł Szymański',
    '+48 518 274 093',
    'pawel.szymanski@example.com',
    null,
    [['WU 38402', 'Volkswagen', 'Passat', 'Medium']],
  ],
  [
    'transbud',
    'Transbud Sp. z o.o.',
    '+48 22 610 42 00',
    'flota@example.com',
    '5213456789',
    [
      ['WZ 71203', 'Ford', 'Transit Custom', 'XL'],
      ['WZ 71204', 'Ford', 'Ranger', 'XL'],
    ],
  ],
  [
    'joanna',
    'Joanna Woźniak',
    '+48 605 880 132',
    'joanna.wozniak@example.com',
    null,
    [['WD 20981', 'Mazda', 'CX-5', 'Large']],
  ],
  [
    'tomasz',
    'Tomasz Kaczmarek',
    '+48 790 412 655',
    'tomasz.kaczmarek@example.com',
    null,
    [['WO 3T333', 'Tesla', 'Model 3', 'Medium']],
  ],
  ['natalia', 'Natalia Pawlak', '+48 728 556 019', null, null, [['WL 51006', 'Hyundai', 'i20', 'Small']]],
  [
    'krzysztof',
    'Krzysztof Zając',
    '+48 609 117 342',
    'k.zajac@example.com',
    null,
    [['WPR 1D110', 'Land Rover', 'Defender 110', 'XL']],
  ],
  [
    'magdalena',
    'Magdalena Król',
    '+48 512 903 461',
    'magdalena.krol@example.com',
    null,
    [['WS 22870', 'Peugeot', '3008', 'Large']],
  ],
];

export const clientId = (key: string) => stableId(`client:${key}`);
export const vehicleId = (plate: string) => stableId(`vehicle:${plate}`);

/** Keys of the regulars, for the booking generator. */
export const CLIENT_KEYS = CLIENTS.map(([key]) => key);

export function seedClients(): { clients: Client[]; vehicles: Vehicle[] } {
  const clients: Client[] = [];
  const vehicles: Vehicle[] = [];
  for (const [key, name, phone, email, nip, cars] of CLIENTS) {
    const id = clientId(key);
    clients.push({
      id,
      studioId: STUDIO.full,
      name,
      phone,
      email,
      nip,
      customerUserId: key === 'marta' ? USER.customer : null,
    });
    for (const [plate, brand, model, size] of cars) {
      vehicles.push({
        id: vehicleId(plate),
        studioId: STUDIO.full,
        clientId: id,
        licensePlate: plate,
        brand,
        model,
        size,
      });
    }
  }
  return { clients, vehicles };
}
