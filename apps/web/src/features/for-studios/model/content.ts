/** Copy of the /for-studios landing page. */

export type FeatureId = 'calendar' | 'crm' | 'finance' | 'inventory' | 'reports';

export const FEATURES: {
  id: FeatureId;
  title: string;
  desc: string;
  /** Width in the 12-column grid from md up: wide = 7, narrow = 5, third = 4. */
  layout: 'wide' | 'narrow' | 'third';
}[] = [
  {
    id: 'calendar',
    title: 'Harmonogram & Rezerwacje',
    desc: 'Widok kalendarza i listy zleceń w jednym. Dodaj nową rezerwację w kilka sekund — klient, pojazd, usługa, termin.',
    layout: 'wide',
  },
  {
    id: 'crm',
    title: 'CRM — Baza Klientów',
    desc: 'Pełna historia każdego klienta, pojazdy, faktury i notatki w jednym miejscu.',
    layout: 'narrow',
  },
  {
    id: 'finance',
    title: 'Finanse studia',
    desc: 'Przychody, zestawienia tygodniowe i miesięczne. Zawsze wiesz ile zarabia Twoje studio.',
    layout: 'third',
  },
  {
    id: 'inventory',
    title: 'Magazyn',
    desc: 'Śledź stan produktów chemicznych i akcesoriów. Alerty przy niskim stanie.',
    layout: 'third',
  },
  {
    id: 'reports',
    title: 'Raporty',
    desc: 'Statystyki studia, najpopularniejsze usługi i historia archiwalna.',
    layout: 'third',
  },
];

export const STEPS = [
  { num: '01', title: 'Utwórz studio', desc: 'Zarejestruj się i wprowadź dane swojego studia.' },
  {
    num: '02',
    title: 'Dodaj klientów i rezerwacje',
    desc: 'Stwórz profil klienta, a następnie dodaj rezerwację. Pierwsza rezerwacja gotowa w mniej niż 1 minutę.',
  },
  {
    num: '03',
    title: 'Zarządzaj wszystkim z jednego miejsca',
    desc: 'Rezerwacje, baza klientów, magazyn i raporty — wszystko zsynchronizowane, w czasie rzeczywistym, na każdym urządzeniu.',
  },
];

/** The plans; the featured one is highlighted and gets the primary button. */
export const PRICING = [
  {
    tier: 'Starter',
    amount: 'XXX zł',
    period: '/ miesiąc',
    features: ['Do 8 rezerwacji / miesiąc', 'CRM — do 25 klientów', 'Podstawowe funkcjonalności'],
    btnLabel: 'Zacznij za darmo',
    featured: false,
  },
  {
    tier: 'Pro',
    amount: 'XXX zł',
    period: '/ miesiąc',
    features: [
      'Do 100 rezerwacji / miesiąc',
      'CRM — do 200 klientów',
      'Wszystkie funkcjonalności',
      'Raporty',
      'Archiwum zleceń',
      'Wsparcie',
    ],
    btnLabel: 'Zacznij z Pro',
    featured: true,
  },
  {
    tier: 'MAX',
    amount: 'XXX zł',
    period: '/ miesiąc',
    features: ['Nielimitowane rezerwacje', 'Priorytetowe wsparcie', 'Zaawansowane statystyki'],
    btnLabel: 'Zacznij z MAX',
    featured: false,
  },
];
