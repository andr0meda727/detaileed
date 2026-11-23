import { Car, Clock } from 'lucide-react';
import { Badge, LicensePlate } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { formatInZone } from '@detaileed/domain/studioTime';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { requestStatus } from '@/features/booking-requests/model/statuses';
import type { BookingRequest } from '@/features/booking-requests/model/types';

interface RequestCardProps {
  request: BookingRequest;
  timeZone: string;
  onOpen: () => void;
}

/** One request in the list: who, which car, what, when they'd like to come, and the estimate. */
export function RequestCard({ request, timeZone, onOpen }: RequestCardProps) {
  const status = requestStatus(request.status);
  const car = [request.vehicle.brand, request.vehicle.model].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-5 text-left transition-colors duration-150 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{request.customerName}</p>
          <Badge tone={status.tone} size="sm">
            {status.label}
          </Badge>
        </div>
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Car size={14} strokeWidth={1.75} aria-hidden />
          {car && <span>{car}</span>}
          <LicensePlate plate={request.vehicle.licensePlate} />
          <span>{vehicleSizeLabel(request.vehicle.size)}</span>
        </p>
        <p className="truncate text-xs text-faint">{request.services.map((s) => s.name).join(', ')}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 sm:items-end">
        <p className="flex items-center gap-1.5 text-sm text-foreground">
          <Clock size={14} strokeWidth={1.75} className="text-muted-foreground" aria-hidden />
          <span className="font-mono tabular-nums">
            {formatInZone(request.preferredAt, timeZone, {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          ≈ <span className="font-mono tabular-nums">{formatPln(request.estimatedPrice)}</span> zł
          {request.hasUnpricedServices && ' + wycena'}
        </p>
      </div>
    </button>
  );
}
