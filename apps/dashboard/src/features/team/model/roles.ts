import type { BadgeTone } from '@detaileed/ui';

/** Studio roles as the API numbers them, with their Polish labels and badge tones. */
export const ROLES = [
  {
    id: 1,
    name: 'Właściciel',
    description: 'Pełen dostęp, fakturowanie, statystyki, zarządzanie zespołem',
    tone: 'info',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Zarządzanie rezerwacjami, magazynem i klientami',
    tone: 'neutral',
  },
  {
    id: 3,
    name: 'Pracownik',
    description: 'Tylko odczyt grafiku i listy zadań',
    tone: 'neutral',
  },
] as const satisfies readonly { id: number; name: string; description: string; tone: BadgeTone }[];

export type Role = (typeof ROLES)[number];

export const OWNER_ROLE_ID = 1;

/** Roles that can be invited or assigned: the API refuses to make anyone an owner. */
export const ASSIGNABLE_ROLES = ROLES.filter((r) => r.id !== OWNER_ROLE_ID);

/** The role for an id, falling back to "Pracownik" for unknown ids. */
export function roleById(id: number): Role {
  return ROLES.find((r) => r.id === id) ?? ROLES[2];
}
