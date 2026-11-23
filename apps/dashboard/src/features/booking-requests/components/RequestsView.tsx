import { getRouteApi } from '@tanstack/react-router';
import { Inbox } from 'lucide-react';
import { EmptyState, Pagination, SegmentedControl, Skeleton } from '@detaileed/ui';
import type { OnlineRequestStatus } from '@detaileed/api-client';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';
import { useStudioTimeZone } from '@/features/studios';
import { useBookingRequests } from '@/features/booking-requests/api/requests';
import { REQUEST_STATUSES } from '@/features/booking-requests/model/statuses';
import { RequestCard } from '@/features/booking-requests/components/RequestCard';
import { RequestDetailsModal } from '@/features/booking-requests/components/RequestDetailsModal';

const routeApi = getRouteApi('/_signed-in/s/$studioId/requests');

const ALL = 'all';
const FILTERS: { value: OnlineRequestStatus | typeof ALL; label: string }[] = [
  { value: ALL, label: 'Wszystkie' },
  ...REQUEST_STATUSES.map(({ value, label }) => ({ value, label })),
];

/** Booking requests customers sent from the map; the filter, page and open request live in the URL. */
export function RequestsView() {
  const { status, page = 1, id } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const timeZone = useStudioTimeZone();
  const { data, isLoading } = useBookingRequests({ status, page });
  const items = data?.items ?? [];
  const opened = id ? (items.find((r) => r.id === id) ?? null) : null;

  const setSearch = (next: { status?: typeof status; page?: number; id?: string }) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  return (
    <div className="flex flex-col gap-6">
      <GlobalHeader title="Zapytania" subtitle="Rezerwacje wysłane przez klientów z mapy Detaileed" />

      <div className="max-w-full overflow-x-auto">
        <SegmentedControl
          aria-label="Status zapytań"
          className="w-max"
          options={FILTERS}
          value={status ?? ALL}
          onValueChange={(value) =>
            setSearch({ status: value === ALL ? undefined : value, page: undefined, id: undefined })
          }
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height="92px" className="rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="Brak zapytań. Opublikuj profil studia, aby klienci mogli je wysyłać." icon={Inbox} />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((r) => (
            <li key={r.id}>
              <RequestCard request={r} timeZone={timeZone} onOpen={() => setSearch({ id: r.id })} />
            </li>
          ))}
        </ul>
      )}

      {data && (
        <Pagination page={page} totalPages={data.totalPages} onPageChange={(next) => setSearch({ page: next })} />
      )}

      <RequestDetailsModal
        key={id ?? 'none'}
        request={opened}
        missing={!!id && !isLoading && !opened}
        timeZone={timeZone}
        onClose={() => setSearch({ id: undefined })}
      />
    </div>
  );
}
