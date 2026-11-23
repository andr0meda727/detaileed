import type { AuthUser } from '../auth/accounts.ts';
import { today } from '../store/time.ts';
import type {
  Bay,
  Booking,
  Client,
  Consumption,
  CustomerProfile,
  GarageVehicle,
  InventoryCategory,
  InventoryItem,
  Invitation,
  Listing,
  Membership,
  OnlineRequest,
  Recipe,
  Review,
  Schedule,
  Service,
  SizeMultipliers,
  StockMovement,
  Studio,
  Vehicle,
} from '../store/types.ts';
import { seedUsers } from './accounts.ts';
import { seedBookings } from './bookings.ts';
import { seedCustomers } from './customers.ts';
import { seedInventoryCategories, seedInventoryItems, seedLedger, seedRecipes } from './inventory.ts';
import { seedPartners, seedReviews } from './marketplace.ts';
import { seedRequests } from './requests.ts';
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
  listings: Listing[];
  reviews: Review[];
  onlineRequests: OnlineRequest[];
  profiles: CustomerProfile[];
  garage: GarageVehicle[];
}

/** The fixed sample data. */
export function seed(): MockState {
  const day = today();
  const { clients, vehicles } = seedClients();
  const partners = seedPartners(day);
  const customers = seedCustomers();
  return {
    today: day,
    users: seedUsers(day),
    studios: [...seedStudios(day), ...partners.studios],
    memberships: seedMemberships(),
    clients,
    vehicles,
    services: [...seedServices(), ...partners.services],
    bookings: [],
    bays: [...seedBays(), ...partners.bays],
    schedules: [...seedSchedules(day), ...partners.schedules],
    inventoryCategories: seedInventoryCategories(),
    inventory: seedInventoryItems(),
    movements: [],
    recipes: seedRecipes(),
    consumptions: [],
    sizeFactors: [],
    invitations: seedInvitations(),
    listings: partners.listings,
    reviews: seedReviews(day),
    onlineRequests: [],
    profiles: customers.profiles,
    garage: customers.garage,
  };
}

/**
 * Data generated once the fixed data is in the store: bookings that fit the bays (by the planner), online requests
 * (accepted ones booked by the planner too), then the stock ledger of what the completed visits used.
 */
export function populate(): void {
  seedBookings();
  seedRequests();
  seedLedger();
}
