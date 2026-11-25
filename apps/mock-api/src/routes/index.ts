import { supabaseRoutes } from '../auth/supabase.ts';
import type { Route } from '../router.ts';
import { recordConsumption } from '../store/inventory.ts';
import { bookingRoutes, onBookingCompleted } from './bookings.ts';
import { clientRoutes } from './clients.ts';
import { inventoryRoutes } from './inventory.ts';
import { marketplaceRoutes } from './marketplace.ts';
import { meRoutes } from './me.ts';
import { planningRoutes } from './planning.ts';
import { requestRoutes } from './requests.ts';
import { serviceRoutes } from './services.ts';
import { studioRoutes } from './studios.ts';
import { teamRoutes } from './team.ts';

// A completed visit takes its materials off the stock.
onBookingCompleted.push(recordConsumption);

/** Every route of the mock: the API paths of `packages/api-client/openapi.json` and the fake Supabase. */
export const routes: Route[] = [
  ...supabaseRoutes,
  ...studioRoutes,
  ...clientRoutes,
  ...serviceRoutes,
  ...bookingRoutes,
  ...planningRoutes,
  ...inventoryRoutes,
  ...teamRoutes,
  ...marketplaceRoutes,
  ...requestRoutes,
  ...meRoutes,
];
