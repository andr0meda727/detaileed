import type { AuthUser } from '../auth/accounts.ts';
import { today } from '../store/time.ts';
import { seedUsers } from './accounts.ts';

/** Everything the mock knows, rebuilt from the fixtures on start and on `POST /__mock/reset`. */
export interface MockState {
  /** The Warsaw day the sample data is dated from (bookings "today", "in 3 days", …). */
  today: string;
  users: AuthUser[];
}

export function seed(): MockState {
  const day = today();
  return { today: day, users: seedUsers(day) };
}
