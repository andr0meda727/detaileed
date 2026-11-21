import { Mail, MessageSquare, Phone } from 'lucide-react';
import { Badge } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { formatInZone } from '@detaileed/domain/studioTime';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { requestStatus } from '@/features/booking-requests/model/statuses';
import type { BookingRequest } from '@/features/booking-requests/model/types';

const when = (iso: string, timeZone: string) =>
  formatInZone(iso, timeZone, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

/** Everything the customer sent, and what happened to the request. */
export function RequestSummary({ request, timeZone }: { request: BookingRequest; timeZone: string }) {
  const status = requestStatus(request.status);
  const car = [request.vehicle.brand, request.vehicle.model].filter(Boolean).join(' ');
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xl font-bold text-green-deep">{request.customerName}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
            <a href={`tel:${request.customerPhone}`} className="flex items-center gap-1.5 hover:text-green-deep">
              <Phone size={13} /> {request.customerPhone}
            </a>
            <a href={`mailto:${request.customerEmail}`} className="flex items-center gap-1.5 hover:text-green-deep">
              <Mail size={13} /> {request.customerEmail}
            </a>
          </div>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preferowany termin</p>
          <p className="font-bold text-green-deep first-letter:uppercase">{when(request.preferredAt, timeZone)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pojazd</p>
          <p className="font-bold text-green-deep">
            {car || 'Pojazd'} · <span className="font-mono">{request.vehicle.licensePlate}</span>
          </p>
          <p className="text-xs text-slate-500">{vehicleSizeLabel(request.vehicle.size)}</p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Usługi</p>
        <ul className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
          {request.services.map((s) => (
            <li key={s.serviceId} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="font-semibold text-green-deep">{s.name}</span>
              <span className="text-slate-500">{s.price === null ? 'na zapytanie' : `${formatPln(s.price)} zł`}</span>
            </li>
          ))}
          <li className="flex justify-between px-4 py-2.5 text-sm font-bold text-green-deep">
            <span>Szacunkowo</span>
            <span>
              {formatPln(request.estimatedPrice)} zł{request.hasUnpricedServices && ' + wycena'}
            </span>
          </li>
        </ul>
      </div>

      {request.notes && (
        <p className="flex gap-2 text-sm text-slate-600 bg-amber/10 rounded-xl p-4">
          <MessageSquare size={15} className="shrink-0 mt-0.5 text-amber" /> {request.notes}
        </p>
      )}

      {request.booking && (
        <p className="text-sm bg-green-pale/30 rounded-xl p-4 text-green-deep">
          Rezerwacja: <strong>{when(request.booking.scheduledAt, timeZone)}</strong> ({request.booking.status}
          {request.booking.totalPrice !== null && `, ${formatPln(request.booking.totalPrice)} zł`})
        </p>
      )}
      {request.rejectionReason && (
        <p className="text-sm bg-red-50 text-red-600 rounded-xl p-4">Powód odrzucenia: {request.rejectionReason}</p>
      )}
    </div>
  );
}
