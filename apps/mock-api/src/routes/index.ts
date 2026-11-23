import { supabaseRoutes } from '../auth/supabase.ts';
import type { Route } from '../router.ts';
import { bookingRoutes } from './bookings.ts';
import { clientRoutes } from './clients.ts';
import { planningRoutes } from './planning.ts';
import { serviceRoutes } from './services.ts';
import { studioRoutes } from './studios.ts';

/** Every route of the mock: the API paths of `packages/api-client/openapi.json` and the fake Supabase. */
export const routes: Route[] = [
  ...supabaseRoutes,
  ...studioRoutes,
  ...clientRoutes,
  ...serviceRoutes,
  ...bookingRoutes,
  ...planningRoutes,
];
