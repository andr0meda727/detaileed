import { DEMO_EMAILS, DEMO_PASSWORD, type AuthUser } from '../auth/accounts.ts';
import { stableId } from '../store/ids.ts';
import { at } from '../store/time.ts';

/** Ids of the people the other fixtures refer to. */
export const USER = {
  owner: stableId('user:owner'),
  employee: stableId('user:employee'),
  customer: stableId('user:customer'),
  manager: stableId('user:manager'),
  employee2: stableId('user:employee-2'),
} as const;

/** The three demo accounts (password `demo1234`) and the team members who can't sign in. */
export function seedUsers(today: string): AuthUser[] {
  const person = (
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    canSignIn: boolean,
    joinedDaysAgo: number,
  ): AuthUser => ({
    id,
    email,
    password: canSignIn ? DEMO_PASSWORD : null,
    firstName,
    lastName,
    createdAt: at(today, -joinedDaysAgo, '10:00'),
    lastSignInAt: null,
    metadata: {},
  });
  return [
    person(USER.owner, DEMO_EMAILS.owner, 'Tomasz', 'Wiśniewski', true, 400),
    person(USER.employee, DEMO_EMAILS.employee, 'Kamil', 'Nowak', true, 210),
    person(USER.customer, DEMO_EMAILS.customer, 'Marta', 'Zielińska', true, 120),
    person(USER.manager, 'anna.kowalczyk@demo.detaileed.com', 'Anna', 'Kowalczyk', false, 300),
    person(USER.employee2, 'piotr.lewandowski@demo.detaileed.com', 'Piotr', 'Lewandowski', false, 90),
  ];
}
