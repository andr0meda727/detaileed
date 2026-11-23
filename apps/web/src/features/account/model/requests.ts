import type { BookingRequestDto, OnlineRequestStatus, VehicleSize } from '@detaileed/api-client';

/** One of the caller's booking requests, with numbers as numbers. */
export interface MyRequest {
  id: string;
  studioId: string;
  studioName: string;
  status: OnlineRequestStatus;
  preferredAt: string;
  vehicle: { licensePlate: string; brand: string | null; model: string | null; size: VehicleSize };
  services: { serviceId: string; name: string; price: number | null }[];
  estimatedPrice: number;
  hasUnpricedServices: boolean;
  rejectionReason: string | null;
  createdAt: string;
  booking: { scheduledAt: string; status: string; totalPrice: number | null } | null;
}

const numOrNull = (v: number | string | null | undefined) => (v == null ? null : Number(v));

export function toMyRequest(dto: BookingRequestDto): MyRequest {
  return {
    id: dto.id,
    studioId: dto.studioId,
    studioName: dto.studioName,
    status: dto.status,
    preferredAt: dto.preferredAt,
    vehicle: dto.vehicle,
    services: dto.services.map((s) => ({ serviceId: s.serviceId, name: s.name, price: numOrNull(s.price) })),
    estimatedPrice: Number(dto.estimatedPrice),
    hasUnpricedServices: dto.hasUnpricedServices,
    rejectionReason: dto.rejectionReason,
    createdAt: dto.createdAt,
    booking: dto.booking
      ? {
          scheduledAt: dto.booking.scheduledAt,
          status: dto.booking.status,
          totalPrice: numOrNull(dto.booking.totalPrice),
        }
      : null,
  };
}

/** Customer-facing status labels and badge tones. */
export const MY_REQUEST_STATUS: Record<string, { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }> =
  {
    Pending: { label: 'Czeka na odpowiedź', tone: 'warning' },
    Accepted: { label: 'Przyjęte', tone: 'success' },
    Rejected: { label: 'Odrzucone', tone: 'danger' },
    Withdrawn: { label: 'Wycofane', tone: 'neutral' },
  };
