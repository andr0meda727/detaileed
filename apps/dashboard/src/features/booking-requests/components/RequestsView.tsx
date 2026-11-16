import { getRouteApi } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { EmptyState, Skeleton } from '@detaileed/ui';
import GlobalHeader from '@/shared/ui/GlobalHeader';
import { useStudioTimeZone } from '@/features/studios';
import { useBookingRequests } from '@/features/booking-requests/api/requests';
import { REQUEST_STATUSES } from '@/features/booking-requests/model/statuses';
import RequestCard from '@/features/booking-requests/components/RequestCard';
import RequestDetailsModal from '@/features/booking-requests/components/RequestDetailsModal';

const routeApi = getRouteApi('/_auth/s/$studioId/requests');

const FILTERS = [{ value: undefined, label: 'Wszystkie' }, ...REQUEST_STATUSES];

/** Booking requests customers sent from the map; the filter, page and open request live in the URL. */
export default function RequestsView() {
  const { status, page = 1, id } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const timeZone = useStudioTimeZone();
  const { data, isLoading } = useBookingRequests({ status, page });
  const items = data?.items ?? [];
  const opened = id ? (items.find((r) => r.id === id) ?? null) : null;

  const setSearch = (next: { status?: typeof status; page?: number; id?: string }) =>
    navigate({ search: (prev) => ({ ...prev, ...next }) });

  return (
    <div className="space-y-8">
      <GlobalHeader title="Zapytania" subtitle="Rezerwacje wysłane przez klientów z mapy Detaileed" />

      <div className="flex gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 overflow-x-auto w-fit max-w-full">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            type="button"
            aria-pressed={status === f.value}
            onClick={() => setSearch({ status: f.value, page: undefined, id: undefined })}
            className={`px-4 py-2.5 rounded-xl text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all ${status === f.value ? 'bg-green-deep text-cream-warm' : 'text-slate-400 hover:text-green-deep hover:bg-slate-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="100%" height="92px" className="rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState message="Brak zapytań. Opublikuj profil studia, aby klienci mogli je wysyłać." icon={Inbox} />
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <RequestCard key={r.id} request={r} timeZone={timeZone} onOpen={() => setSearch({ id: r.id })} />
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm font-semibold text-slate-500">
          <button
            type="button"
            aria-label="Poprzednia strona"
            disabled={page <= 1}
            onClick={() => setSearch({ page: page - 1 })}
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          {page} / {data.totalPages}
          <button
            type="button"
            aria-label="Następna strona"
            disabled={page >= data.totalPages}
            onClick={() => setSearch({ page: page + 1 })}
            className="p-2 rounded-xl hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
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
