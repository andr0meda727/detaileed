import type { DayOfWeek, ServiceCategory, VehicleSize } from '@detaileed/api-client';

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

export interface Service {
  id: string;
  studioId: string;
  name: string;
  category: ServiceCategory;
  /** Prices in złoty per car size; a missing size means "price on request". */
  prices: { vehicleSize: VehicleSize; price: number }[];
  durationMinutes: number;
  /** Deleted services stay for the bookings that used them. */
  deleted: boolean;
}

export type BookingStatusKey = 'created' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  studioId: string;
  clientId: string;
  vehicleId: string;
  scheduledAt: string;
  endsAt: string;
  completedAt: string | null;
  status: BookingStatusKey;
  /** Złoty; null = not priced. */
  price: number | null;
  notes: string | null;
  bayId: string | null;
  serviceIds: string[];
}

export interface Bay {
  id: string;
  studioId: string;
  name: string;
  isActive: boolean;
}

export interface OpeningPeriod {
  day: DayOfWeek;
  /** Studio-local `HH:mm:ss`, as the API sends times of day. */
  opens: string;
  closes: string;
}

export interface SizeMultipliers {
  small: number;
  medium: number;
  large: number;
  xl: number;
}

export interface Schedule {
  studioId: string;
  openingHours: OpeningPeriod[];
  closures: { date: string; reason: string | null }[];
  bufferMinutes: number;
  slotStepMinutes: number;
  minLeadHours: number;
  durationMultipliers: SizeMultipliers;
}
