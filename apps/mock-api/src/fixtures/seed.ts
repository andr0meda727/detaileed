import type { AuthUser } from '../auth/accounts.ts';
import { today } from '../store/time.ts';
import type {
  Bay,
  Booking,
  Client,
  Consumption,
  InventoryCategory,
  InventoryItem,
  Invitation,
  Membership,
  Recipe,
  Schedule,
  Service,
  SizeMultipliers,
  StockMovement,
  Studio,
  Vehicle,
} from '../store/types.ts';
import { seedUsers } from './accounts.ts';
import { seedBookings } from './bookings.ts';
import { seedInventoryCategories, seedInventoryItems, seedLedger, seedRecipes } from './inventory.ts';
import { seedBays, seedSchedules, seedServices } from './services.ts';
import { seedClients, seedInvitations, seedMemberships, seedStudios } from './studios.ts';

/** Everything the mock knows, rebuilt from the fixtures on start and on `POST /__mock/reset`. */
export interface MockState {
  /** The Warsaw day the sample data is dated from (bookings "today", "in 3 days", …). */
  today: string;
  users: AuthUser[];
  studios: Studio[];
  memberships: Membership[];
  clients: Client[];
  vehicles: Vehicle[];
  services: Service[];
  bookings: Booking[];
  bays: Bay[];
  schedules: Schedule[];
  inventoryCategories: InventoryCategory[];
  inventory: InventoryItem[];
  movements: StockMovement[];
  recipes: Recipe[];
  consumptions: Consumption[];
  sizeFactors: (SizeMultipliers & { studioId: string })[];
  invitations: Invitation[];
}

/** The fixed sample data. */
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
    services: seedServices(),
    bookings: [],
    bays: seedBays(),
    schedules: seedSchedules(day),
    inventoryCategories: seedInventoryCategories(),
    inventory: seedInventoryItems(),
    movements: [],
    recipes: seedRecipes(),
    consumptions: [],
    sizeFactors: [],
    invitations: seedInvitations(),
  };
}

/**
 * Data generated once the fixed data is in the store: bookings that fit the bays (by the planner), then the stock
 * ledger of what the completed ones used.
 */
export function populate(): void {
  seedBookings();
  seedLedger();
}
