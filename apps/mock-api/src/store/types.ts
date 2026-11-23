import type { VehicleSize } from '@detaileed/api-client';

/**
 * The mock's own records. Handlers turn them into the API's DTOs (generated models), so related data
 * (a booking's client, a listing's services) is always read fresh.
 */

export interface Studio {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timeZone: string;
  createdAt: string;
}

/** Role ids as the API numbers them: 1 owner, 2 manager, 3 employee. */
export type RoleId = 1 | 2 | 3;

export interface Membership {
  studioId: string;
  userId: string;
  roleId: RoleId;
}

export interface Client {
  id: string;
  studioId: string;
  name: string;
  email: string | null;
  phone: string;
  nip: string | null;
  /** The customer account behind this client (from an accepted online request), if any. */
  customerUserId: string | null;
}

export interface Vehicle {
  id: string;
  studioId: string;
  clientId: string;
  licensePlate: string;
  brand: string | null;
  model: string | null;
  size: VehicleSize;
}
