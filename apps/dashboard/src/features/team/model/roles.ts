/** Studio roles as the API numbers them, with their Polish labels and badge colours. */
export const ROLES = [
  {
    id: 1,
    name: 'Właściciel',
    description: 'Pełen dostęp, fakturowanie, statystyki, zarządzanie zespołem',
    color: 'text-amber-600 bg-amber-50',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Zarządzanie rezerwacjami, magazynem i klientami',
    color: 'text-indigo-600 bg-indigo-50',
    badgeColor: 'bg-indigo-500',
  },
  {
    id: 3,
    name: 'Pracownik',
    description: 'Tylko odczyt grafiku i listy zadań',
    color: 'text-emerald-600 bg-emerald-50',
    badgeColor: 'bg-emerald-500',
  },
] as const;

export type Role = (typeof ROLES)[number];

export const OWNER_ROLE_ID = 1;

/** Roles that can be invited or assigned: the API refuses to make anyone an owner. */
export const ASSIGNABLE_ROLES = ROLES.filter((r) => r.id !== OWNER_ROLE_ID);

/** The role for an id, falling back to "Pracownik" for unknown ids. */
export function roleById(id: number): Role {
  return ROLES.find((r) => r.id === id) ?? ROLES[2];
}
