import type { AuthUser } from '../auth/accounts.ts';
import { today } from '../store/time.ts';
import type { Client, Membership, Studio, Vehicle } from '../store/types.ts';
import { seedUsers } from './accounts.ts';
import { seedClients, seedMemberships, seedStudios } from './studios.ts';

/** Everything the mock knows, rebuilt from the fixtures on start and on `POST /__mock/reset`. */
export interface MockState {
  /** The Warsaw day the sample data is dated from (bookings "today", "in 3 days", …). */
  today: string;
  users: AuthUser[];
  studios: Studio[];
  memberships: Membership[];
  clients: Client[];
  vehicles: Vehicle[];
}

export function seed(): MockState {
  const day = today();
  const { clients, vehicles } = seedClients();
  return {
    today: day,
    users: seedUsers(day),
    studios: seedStudios(day),
    memberships: seedMemberships(),
    clients,
    vehicles,
  };
}
