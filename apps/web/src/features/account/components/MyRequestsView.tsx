'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarCheck, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { Badge, Button, EmptyState, Skeleton, useToast } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { DEFAULT_TIME_ZONE, formatInZone } from '@detaileed/domain/studioTime';
import { vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { useMyRequests, useWithdrawRequest } from '@/features/account/api/me';
import { MY_REQUEST_STATUS, type MyRequest } from '@/features/account/model/requests';

// Requests don't carry the studio's time zone yet; every studio is in Poland for now.
const when = (iso: string) =>
  formatInZone(iso, DEFAULT_TIME_ZONE, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

function RequestItem({ request }: { request: MyRequest }) {
  const { addToast } = useToast();
  const withdraw = useWithdrawRequest();
  const status = MY_REQUEST_STATUS[request.status] ?? { label: request.status, tone: 'neutral' as const };
  const car = [request.vehicle.brand, request.vehicle.model].filter(Boolean).join(' ');
  return (
    <li className="bg-white rounded-2xl border border-green-deep/5 p-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/studio/${request.studioId}`} className="font-bold hover:underline">
          {request.studioName}
        </Link>
        <Badge tone={status.tone} size="sm">
          {status.label}
        </Badge>
      </div>
      <p className="text-sm text-green-light">
        {request.services.map((s) => s.name).join(', ')} · {car && `${car} `}
        <span className="font-mono">{request.vehicle.licensePlate}</span> ({vehicleSizeLabel(request.vehicle.size)})
      </p>
      {request.booking ? (
        <p className="text-sm font-semibold flex items-center gap-1.5">
          <CalendarCheck size={15} className="text-green-light" /> Termin: {when(request.booking.scheduledAt)}
          {request.booking.totalPrice !== null && ` · ${formatPln(request.booking.totalPrice)} zł`}
        </p>
      ) : (
        <p className="text-sm">
          Preferowany termin: {when(request.preferredAt)} · szacunkowo {formatPln(request.estimatedPrice)} zł
          {request.hasUnpricedServices && ' + wycena'}
        </p>
      )}
      {request.rejectionReason && <p className="text-sm text-red-600">Studio: {request.rejectionReason}</p>}
      {request.status === 'Pending' && (
        <Button
          variant="ghost"
          loading={withdraw.isPending}
          onClick={() => withdraw.mutate(request.id, { onSuccess: () => addToast('Zapytanie wycofane.', 'success') })}
        >
          Wycofaj zapytanie
        </Button>
      )}
    </li>
  );
}

/** The customer's requests at every studio, newest first, with withdraw for pending ones. */
export default function MyRequestsView() {
  const justSent = useSearchParams().get('sent') === '1';
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyRequests(page);

  if (isLoading) return <Skeleton width="100%" height="240px" className="rounded-2xl" />;
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {justSent && (
        <p role="status" className="bg-green-pale/40 rounded-2xl p-4 text-sm font-semibold">
          Zapytanie wysłane. Studio odpowie e-mailem; status zobaczysz tutaj.
        </p>
      )}
      {items.length === 0 ? (
        <EmptyState message="Nie wysłano jeszcze żadnego zapytania. Znajdź studio na mapie." icon={Inbox} />
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <RequestItem key={r.id} request={r} />
          ))}
        </ul>
      )}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm font-semibold">
          <button
            type="button"
            aria-label="Poprzednia strona"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {page} / {data.totalPages}
          <button
            type="button"
            aria-label="Następna strona"
            disabled={page >= data.totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
