import { Mail, MessageSquare, Phone } from 'lucide-react';
import { Alert, Badge, LicensePlate } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { formatInZone } from '@detaileed/domain/studioTime';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { requestStatus } from '@/features/booking-requests/model/statuses';
import type { BookingRequest } from '@/features/booking-requests/model/types';

const when = (iso: string, timeZone: string) =>
  formatInZone(iso, timeZone, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

const contactLink =
  'flex items-center gap-1.5 rounded-sm transition-colors duration-150 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/** Everything the customer sent, and what happened to the request. */
export function RequestSummary({ request, timeZone }: { request: BookingRequest; timeZone: string }) {
  const status = requestStatus(request.status);
  const car = [request.vehicle.brand, request.vehicle.model].filter(Boolean).join(' ');
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-foreground">{request.customerName}</p>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a href={`tel:${request.customerPhone}`} className={contactLink}>
              <Phone size={14} strokeWidth={1.75} aria-hidden />
              <span className="font-mono tabular-nums">{request.customerPhone}</span>
            </a>
            <a href={`mailto:${request.customerEmail}`} className={contactLink}>
              <Mail size={14} strokeWidth={1.75} aria-hidden /> {request.customerEmail}
            </a>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-md border border-border bg-subtle p-4">
          <p className="mb-1 text-xs text-faint">Preferowany termin</p>
          <p className="font-medium text-foreground first-letter:uppercase">{when(request.preferredAt, timeZone)}</p>
        </div>
        <div className="rounded-md border border-border bg-subtle p-4">
          <p className="mb-1 text-xs text-faint">Pojazd</p>
          <p className="flex flex-wrap items-center gap-2 font-medium text-foreground">
            {car || 'Pojazd'} <LicensePlate plate={request.vehicle.licensePlate} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{vehicleSizeLabel(request.vehicle.size)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Usługi</p>
        <ul className="divide-y divide-border rounded-md border border-border">
          {request.services.map((s) => (
            <li key={s.serviceId} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
              <span className="text-foreground">{s.name}</span>
              <span className="text-muted-foreground">
                {s.price === null ? (
                  'na zapytanie'
                ) : (
                  <span className="font-mono tabular-nums">{formatPln(s.price)} zł</span>
                )}
              </span>
            </li>
          ))}
          <li className="flex justify-between gap-4 bg-subtle px-4 py-2.5 text-sm font-medium text-foreground">
            <span>Szacunkowo</span>
            <span>
              <span className="font-mono tabular-nums">{formatPln(request.estimatedPrice)} zł</span>
              {request.hasUnpricedServices && ' + wycena'}
            </span>
          </li>
        </ul>
      </div>

      {request.notes && (
        <p className="flex gap-2 rounded-md border border-border bg-subtle p-4 text-sm text-foreground">
          <MessageSquare size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />{' '}
          {request.notes}
        </p>
      )}

      {request.booking && (
        <Alert tone="success">
          Rezerwacja: <strong className="font-medium">{when(request.booking.scheduledAt, timeZone)}</strong> (
          {request.booking.status}
          {request.booking.totalPrice !== null && `, ${formatPln(request.booking.totalPrice)} zł`})
        </Alert>
      )}
      {request.rejectionReason && (
        <p className="rounded-md bg-danger-soft p-4 text-sm text-danger">Powód odrzucenia: {request.rejectionReason}</p>
      )}
    </div>
  );
}
