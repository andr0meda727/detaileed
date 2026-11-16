import type { BookingRequestDto, OnlineRequestStatus, RequestPlanDto, VehicleSize } from '@detaileed/api-client';

/** A customer's online booking request, with numbers as numbers (the API may send them as strings). */
export interface BookingRequest {
  id: string;
  status: OnlineRequestStatus;
  /** UTC moment the customer asked for. */
  preferredAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicle: { licensePlate: string; brand: string | null; model: string | null; size: VehicleSize };
  /** Each service with the studio's price for the car's size; null = price on request. */
  services: { serviceId: string; name: string; price: number | null }[];
  /** Sum of the priced services. */
  estimatedPrice: number;
  hasUnpricedServices: boolean;
  notes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  decidedAt: string | null;
  /** The booking an accepted request became (its current state). */
  booking: { id: string; scheduledAt: string; status: string; totalPrice: number | null } | null;
}

/** How the planner would fit a request (studios with opening hours and bays). */
export interface RequestPlan {
  planningEnabled: boolean;
  durationMinutes: number;
  preferred: {
    start: string;
    end: string;
    fits: boolean;
    withinOpeningHours: boolean;
    bayId: string | null;
    bayName: string | null;
  };
  alternatives: {
    start: string;
    end: string;
    bayId: string;
    bayName: string;
    minutesFromPreferred: number;
  }[];
  competingRequests: { id: string; preferredAt: string; customerName: string }[];
}

const num = (v: number | string) => Number(v);
const numOrNull = (v: number | string | null | undefined) => (v == null ? null : Number(v));

export function toBookingRequest(dto: BookingRequestDto): BookingRequest {
  return {
    id: dto.id,
    status: dto.status,
    preferredAt: dto.preferredAt,
    customerName: dto.customerName,
    customerPhone: dto.customerPhone,
    customerEmail: dto.customerEmail,
    vehicle: dto.vehicle,
    services: dto.services.map((s) => ({ serviceId: s.serviceId, name: s.name, price: numOrNull(s.price) })),
    estimatedPrice: num(dto.estimatedPrice),
    hasUnpricedServices: dto.hasUnpricedServices,
    notes: dto.notes,
    rejectionReason: dto.rejectionReason,
    createdAt: dto.createdAt,
    decidedAt: dto.decidedAt,
    booking: dto.booking ? { ...dto.booking, totalPrice: numOrNull(dto.booking.totalPrice) } : null,
  };
}

export function toRequestPlan(dto: RequestPlanDto): RequestPlan {
  return {
    planningEnabled: dto.planningEnabled,
    durationMinutes: num(dto.durationMinutes),
    preferred: dto.preferred,
    alternatives: dto.alternatives.map((a) => ({
      start: a.start,
      end: a.end,
      bayId: a.bayId,
      bayName: a.bayName,
      minutesFromPreferred: num(a.minutesFromPreferred),
    })),
    competingRequests: dto.competingRequests,
  };
}
