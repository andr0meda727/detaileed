import { Car, Clock } from 'lucide-react';
import { Badge } from '@detaileed/ui';
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
      className="w-full text-left floating-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-green-deep truncate">{request.customerName}</p>
          <Badge tone={status.tone} size="sm">
            {status.label}
          </Badge>
        </div>
        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Car size={13} />
          {car && `${car} · `}
          <span className="font-mono">{request.vehicle.licensePlate}</span> · {vehicleSizeLabel(request.vehicle.size)}
        </p>
        <p className="text-xs text-slate-400 truncate">{request.services.map((s) => s.name).join(', ')}</p>
      </div>
      <div className="sm:text-right shrink-0 space-y-1">
        <p className="text-sm font-bold text-green-deep flex sm:justify-end items-center gap-1.5">
          <Clock size={13} />
          {formatInZone(request.preferredAt, timeZone, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p className="text-xs font-semibold text-slate-500">
          ≈ {formatPln(request.estimatedPrice)} zł{request.hasUnpricedServices && ' + wycena'}
        </p>
      </div>
    </button>
  );
}
