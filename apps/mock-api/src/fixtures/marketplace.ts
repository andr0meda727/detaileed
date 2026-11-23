import { stableId } from '../store/ids.ts';
import { TZ, at } from '../store/time.ts';
import type { Bay, Listing, Review, Schedule, Service, Studio } from '../store/types.ts';
import { USER } from './accounts.ts';
import { CUSTOMER_VISITS } from './bookings.ts';
import { partnerServices } from './services.ts';
import { STUDIO } from './studios.ts';

type PartnerRow = [
  key: string,
  name: string,
  address: string,
  city: string,
  lat: number,
  lng: number,
  phone: string,
  services: string[],
  priceFactor: number,
  description: string,
];

/** Other published studios, so the map search shows a few pins around Warsaw (and one in Kraków). */
const PARTNERS: PartnerRow[] = [
  [
    'perla',
    'Perła Car Care',
    'ul. Grochowska 278',
    'Warszawa',
    52.2489,
    21.0905,
    '+48 22 810 33 21',
    ['wash', 'wash-premium', 'interior', 'upholstery', 'polish-1', 'ozone'],
    0.95,
    'Rodzinne studio na Grochowie. Mycie ręczne, pranie tapicerki i odświeżanie lakieru w rozsądnych cenach.',
  ],
  [
    'bielany',
    'Detailing Bielany',
    'ul. Marymoncka 34',
    'Warszawa',
    52.2843,
    20.9585,
    '+48 503 772 140',
    ['wash-premium', 'interior', 'leather', 'polish-1', 'polish-2', 'ceramic'],
    1.05,
    'Korekty lakieru i powłoki ceramiczne. Pracujemy wyłącznie na profesjonalnych kosmetykach.',
  ],
  [
    'wilanow',
    'Wilanów Auto Detailing',
    'ul. Przyczółkowa 120',
    'Warszawa',
    52.162,
    21.075,
    '+48 600 418 905',
    ['polish-2', 'ceramic', 'ppf', 'leather'],
    1.2,
    'Folie ochronne PPF, powłoki ceramiczne i pełne przygotowanie auta do sprzedaży.',
  ],
  [
    'zoliborz',
    'Myjnia Ręczna Żoliborz',
    'ul. Słowackiego 15',
    'Warszawa',
    52.2687,
    20.9846,
    '+48 22 663 01 87',
    ['wash', 'wash-premium', 'interior', 'tyres', 'rims'],
    0.9,
    'Szybkie mycie ręczne bez zapisów i sezonowa wymiana opon.',
  ],
  [
    'ursynow',
    'Ursynów Car Spa',
    'ul. Ciszewskiego 15',
    'Warszawa',
    52.149,
    21.033,
    '+48 517 230 664',
    ['wash', 'wash-premium', 'interior', 'upholstery', 'ozone', 'tyres'],
    1,
    'Kompleksowe sprzątanie aut, ozonowanie i pranie tapicerki. Parking dla klientów.',
  ],
  [
    'krakow',
    'Kraków Detailing Studio',
    'ul. Kamieńskiego 11',
    'Kraków',
    50.0349,
    19.9536,
    '+48 12 265 44 90',
    ['wash-premium', 'interior', 'polish-1', 'polish-2', 'ceramic', 'ppf'],
    1,
    'Studio detailingu w Krakowie: od mycia premium po folie PPF.',
  ],
];

export const partnerId = (key: string) => stableId(`studio:${key}`);

export function seedPartners(today: string) {
  const studios: Studio[] = [];
  const services: Service[] = [];
  const bays: Bay[] = [];
  const schedules: Schedule[] = [];
  const listings: Listing[] = [];
  for (const [key, name, address, city, latitude, longitude, phone, keys, factor, description] of PARTNERS) {
    const id = partnerId(key);
    studios.push({
      id,
      name,
      phone,
      email: null,
      address,
      city,
      latitude,
      longitude,
      timeZone: TZ,
      createdAt: at(today, -300, '09:00'),
    });
    services.push(...partnerServices(id, keys, factor));
    bays.push(
      { id: stableId(`bay:${key}:1`), studioId: id, name: 'Stanowisko 1', isActive: true },
      { id: stableId(`bay:${key}:2`), studioId: id, name: 'Stanowisko 2', isActive: true },
    );
    const day = (d: Schedule['openingHours'][number]['day'], opens = '08:00:00', closes = '18:00:00') => ({
      day: d,
      opens,
      closes,
    });
    schedules.push({
      studioId: id,
      openingHours: [
        day('Monday'),
        day('Tuesday'),
        day('Wednesday'),
        day('Thursday'),
        day('Friday'),
        day('Saturday', '09:00:00', '14:00:00'),
      ],
      closures: [],
      bufferMinutes: 15,
      slotStepMinutes: 30,
      minLeadHours: 12,
      durationMultipliers: { small: 0.9, medium: 1, large: 1.2, xl: 1.4 },
    });
    listings.push({ studioId: id, description, isPublished: true });
  }
  listings.push({
    studioId: STUDIO.full,
    description:
      'Studio detailingu na Mokotowie: mycie ręczne, sprzątanie wnętrz, korekty lakieru, powłoki ceramiczne i folie PPF. ' +
      'Trzy stanowiska, wygodny dojazd z Puławskiej i poczekalnia z kawą.',
    isPublished: true,
  });
  return { studios, services, bays, schedules, listings };
}

type ReviewRow = [author: string, rating: number, comment: string | null, daysAgo: number];

const STUDIO_REVIEWS: ReviewRow[] = [
  ['Jan K.', 5, 'Auto wygląda lepiej niż z salonu. Pełen profesjonalizm i terminowość.', 3],
  ['Katarzyna N.', 5, 'Pranie tapicerki po wakacjach z psem – efekt rewelacyjny, żadnego zapachu.', 8],
  ['Grzegorz M.', 5, 'Korekta lakieru w 911 zrobiona perfekcyjnie. Polecam każdemu, kto dba o auto.', 13],
  ['Ewa D.', 4, 'Bardzo dokładne mycie, jedynie trzeba było chwilę poczekać na odbiór.', 17],
  ['Michał L.', 5, 'Powłoka ceramiczna po pół roku nadal trzyma jak pierwszego dnia.', 24],
  ['Natalia P.', 5, null, 29],
  ['Paweł S.', 4, 'Dobra cena za sprzątanie wnętrza, miła obsługa.', 33],
  ['Joanna W.', 5, 'Umówiłam się online, wszystko gotowe na czas. Wrócę na pewno.', 38],
  ['Krzysztof Z.', 3, 'Efekt dobry, ale termin przesunięto mi o dzień.', 52],
  ['Aleksandra K.', 5, 'Fiat jak nowy! Dziękuję za cierpliwość przy foteliku dziecięcym.', 61],
  ['Tomasz K.', 5, 'Tesla po zimie odmieniona. Świetny kontakt przez telefon.', 70],
  ['Magdalena K.', 4, 'Solidna robota, polecam mycie premium z woskiem.', 85],
];

const PARTNER_REVIEWS: Record<string, ReviewRow[]> = {
  perla: [
    ['Robert W.', 5, 'Tanio i porządnie. Polecam pranie tapicerki.', 5],
    ['Iwona S.', 4, 'Dobre mycie, trochę ciasno na parkingu.', 20],
    ['Damian P.', 4, null, 41],
  ],
  bielany: [
    ['Marek T.', 5, 'Najlepsza korekta lakieru w Warszawie.', 9],
    ['Ola B.', 5, 'Ceramika na nowym aucie – rewelacja.', 30],
    ['Sebastian K.', 4, 'Drogo, ale warto.', 66],
    ['Kinga R.', 5, null, 90],
  ],
  wilanow: [
    ['Wojciech L.', 5, 'Folia PPF założona bez jednego pęcherzyka.', 14],
    ['Ewelina M.', 4, 'Profesjonalnie, choć trzeba się umawiać z wyprzedzeniem.', 48],
  ],
  zoliborz: [
    ['Andrzej N.', 4, 'Szybko i sprawnie, mycie w 40 minut.', 2],
    ['Beata C.', 3, 'Felgi mogłyby być doczyszczone dokładniej.', 26],
    ['Igor F.', 5, 'Opony wymienione od ręki.', 55],
  ],
  ursynow: [
    ['Patrycja G.', 5, 'Ozonowanie pomogło – zapach papierosów zniknął.', 11],
    ['Hubert J.', 4, null, 37],
  ],
  krakow: [
    ['Maciej O.', 5, 'Świetne studio, polecam powłoki.', 7],
    ['Zuzanna H.', 5, 'Auto przygotowane do sprzedaży w jeden dzień.', 44],
  ],
};

export function seedReviews(today: string): Review[] {
  const review = (studioId: string, key: string, [authorName, rating, comment, daysAgo]: ReviewRow): Review => ({
    id: stableId(`review:${key}`),
    studioId,
    bookingId: null,
    authorUserId: null,
    authorName,
    rating,
    comment,
    createdAt: at(today, -daysAgo, '19:20'),
  });
  return [
    ...STUDIO_REVIEWS.map((row, i) => review(STUDIO.full, `full:${i}`, row)),
    ...Object.entries(PARTNER_REVIEWS).flatMap(([key, rows]) =>
      rows.map((row, i) => review(partnerId(key), `${key}:${i}`, row)),
    ),
    {
      id: stableId('review:marta'),
      studioId: STUDIO.full,
      bookingId: CUSTOMER_VISITS.reviewed,
      authorUserId: USER.customer,
      authorName: 'Marta Z.',
      rating: 5,
      comment: 'Wnętrze wysprzątane co do okruszka, a ozonowanie usunęło zapach po psie. Polecam!',
      createdAt: at(today, -44, '20:05'),
    },
  ];
}
