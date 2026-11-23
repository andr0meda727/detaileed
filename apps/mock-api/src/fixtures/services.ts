import type { ServiceCategory, VehicleSize } from '@detaileed/api-client';
import { addDays } from '@detaileed/domain/studioTime';
import { stableId } from '../store/ids.ts';
import type { Bay, Schedule, Service } from '../store/types.ts';
import { STUDIO } from './studios.ts';

type Prices = [small: number, medium: number, large: number, xl: number | null];
type ServiceRow = [key: string, name: string, category: ServiceCategory, prices: Prices, minutes: number];

/** The busy studio's price list (złoty per car size). The PPF film has no XL price: "on request". */
const SERVICES: ServiceRow[] = [
  ['wash', 'Mycie ręczne podstawowe', 'ExteriorWash', [60, 70, 90, 110], 45],
  ['wash-premium', 'Mycie premium z woskiem', 'ExteriorWash', [130, 150, 180, 210], 90],
  ['interior', 'Sprzątanie wnętrza', 'Interior', [160, 190, 230, 280], 90],
  ['upholstery', 'Pranie tapicerki', 'Interior', [250, 300, 360, 430], 180],
  ['leather', 'Czyszczenie i impregnacja skór', 'Interior', [280, 320, 380, 450], 150],
  ['polish-1', 'Polerowanie jednoetapowe', 'Polishing', [650, 750, 900, 1050], 300],
  ['polish-2', 'Korekta lakieru dwuetapowa', 'Polishing', [1100, 1300, 1550, 1800], 480],
  ['ceramic', 'Powłoka ceramiczna (3 lata)', 'Ceramic', [1800, 2100, 2500, 2900], 420],
  ['ppf', 'Folia PPF – przód auta', 'Ppf', [3600, 4200, 4900, null], 540],
  ['tyres', 'Wymiana opon z wyważeniem', 'WheelsAndTyres', [120, 140, 160, 200], 60],
  ['rims', 'Czyszczenie i zabezpieczenie felg', 'WheelsAndTyres', [150, 150, 180, 220], 60],
  ['ozone', 'Ozonowanie wnętrza', 'Other', [80, 80, 100, 120], 30],
];

const SIZES: VehicleSize[] = ['Small', 'Medium', 'Large', 'XL'];

export const serviceId = (key: string) => stableId(`service:${key}`);

export function seedServices(): Service[] {
  return SERVICES.map(([key, name, category, prices, minutes]) => ({
    id: serviceId(key),
    studioId: STUDIO.full,
    name,
    category,
    prices: SIZES.flatMap((vehicleSize, i) => (prices[i] === null ? [] : [{ vehicleSize, price: prices[i] }])),
    durationMinutes: minutes,
    deleted: false,
  }));
}

export const bayId = (key: string) => stableId(`bay:${key}`);

export function seedBays(): Bay[] {
  return [
    { id: bayId('1'), studioId: STUDIO.full, name: 'Stanowisko 1', isActive: true },
    { id: bayId('2'), studioId: STUDIO.full, name: 'Stanowisko 2', isActive: true },
    { id: bayId('wash'), studioId: STUDIO.full, name: 'Myjnia', isActive: true },
    { id: bayId('old'), studioId: STUDIO.full, name: 'Stanowisko 4 (remont)', isActive: false },
  ];
}

/** Open every day (short Sundays), so "today" always has a schedule; two closures ahead. */
export function seedSchedules(today: string): Schedule[] {
  const weekday = (day: Schedule['openingHours'][number]['day']) => ({ day, opens: '08:00:00', closes: '18:00:00' });
  return [
    {
      studioId: STUDIO.full,
      openingHours: [
        weekday('Monday'),
        weekday('Tuesday'),
        weekday('Wednesday'),
        weekday('Thursday'),
        weekday('Friday'),
        { day: 'Saturday', opens: '09:00:00', closes: '15:00:00' },
        { day: 'Sunday', opens: '10:00:00', closes: '14:00:00' },
      ],
      closures: [
        { date: addDays(today, 12), reason: 'Szkolenie zespołu z powłok ceramicznych' },
        { date: addDays(today, 26), reason: 'Inwentaryzacja' },
      ],
      bufferMinutes: 15,
      slotStepMinutes: 30,
      minLeadHours: 2,
      durationMultipliers: { small: 0.8, medium: 1, large: 1.2, xl: 1.5 },
    },
  ];
}
