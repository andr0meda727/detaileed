'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CalendarCheck, Clock, Inbox } from 'lucide-react';
import { Alert, Badge, Button, EmptyState, LicensePlate, Pagination, Skeleton, useToast } from '@detaileed/ui';
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
    <li className="space-y-3 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href={`/studio/${request.studioId}`}
          className="font-medium underline-offset-4 transition-colors duration-150 hover:underline"
        >
          {request.studioName}
        </Link>
        <Badge tone={status.tone} size="sm">
          {status.label}
        </Badge>
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="text-foreground">{request.services.map((s) => s.name).join(', ')}</p>
        <p className="flex flex-wrap items-center gap-2">
          {car && <span>{car}</span>}
          <LicensePlate plate={request.vehicle.licensePlate} />
          <span>{vehicleSizeLabel(request.vehicle.size)}</span>
        </p>
      </div>
      {request.booking ? (
        <p className="flex items-center gap-2 text-sm font-medium tabular-nums">
          <CalendarCheck size={16} strokeWidth={1.75} aria-hidden className="shrink-0 text-muted-foreground" />
          Termin: {when(request.booking.scheduledAt)}
          {request.booking.totalPrice !== null && ` · ${formatPln(request.booking.totalPrice)} zł`}
        </p>
      ) : (
        <p className="flex items-start gap-2 text-sm tabular-nums text-muted-foreground">
          <Clock size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
          <span>
            Preferowany termin: {when(request.preferredAt)} · szacunkowo {formatPln(request.estimatedPrice)} zł
            {request.hasUnpricedServices && ' + wycena'}
          </span>
        </p>
      )}
      {request.rejectionReason && (
        <p className="border-l-2 border-border-strong pl-3 text-sm text-muted-foreground">
          Studio: {request.rejectionReason}
        </p>
      )}
      {request.status === 'Pending' && (
        <div className="flex justify-end border-t border-border pt-3">
          <Button
            variant="secondary"
            size="sm"
            loading={withdraw.isPending}
            onClick={() => withdraw.mutate(request.id, { onSuccess: () => addToast('Zapytanie wycofane.', 'success') })}
          >
            Wycofaj zapytanie
          </Button>
        </div>
      )}
    </li>
  );
}

/** The customer's requests at every studio, newest first, with withdraw for pending ones. */
export function MyRequestsView() {
  const justSent = useSearchParams().get('sent') === '1';
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyRequests(page);

  if (isLoading) return <Skeleton width="100%" height="240px" className="rounded-lg" />;
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      {justSent && (
        <Alert tone="success" title="Zapytanie wysłane">
          Studio odpowie e-mailem; status zobaczysz tutaj.
        </Alert>
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
      {data && <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />}
    </div>
  );
}
