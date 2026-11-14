import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiBookingsId,
  getApiBookings,
  getGetApiBookingsQueryKey,
  postApiBookings,
  postApiBookingsIdCancel,
  postApiBookingsIdComplete,
  putApiBookingsId,
  type GetApiBookingsParams,
} from '@detaileed/api-client';
import { fetchAllPages, MAX_PAGE_SIZE } from '@/shared/lib/paging';
import { toBooking, type BookingInput } from '@/features/bookings/model/types';

export type BookingFilters = Pick<GetApiBookingsParams, 'isCompleted' | 'fromDate' | 'toDate'>;

/** Prefix of every bookings list query; invalidate it after a change. */
const bookingsKey = getGetApiBookingsQueryKey();

/** All bookings matching `filters` (every page), sorted by `scheduledAt` as the API returns them. */
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: [...bookingsKey, filters ?? {}, 'all-pages'],
    queryFn: async ({ signal }) => {
      const items = await fetchAllPages((page) =>
        getApiBookings({ ...filters, Page: page, PageSize: MAX_PAGE_SIZE }, { signal }),
      );
      return items.map(toBooking);
    },
    staleTime: 30_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useBookingMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingsKey }),
  });
}

export const useCreateBooking = () => useBookingMutation((body: BookingInput) => postApiBookings(body).then(toBooking));

export const useUpdateBooking = () =>
  useBookingMutation(({ id, body }: { id: string; body: BookingInput }) => putApiBookingsId(id, body).then(toBooking));

export const useCompleteBooking = () =>
  useBookingMutation((id: string) => postApiBookingsIdComplete(id).then(toBooking));

export const useCancelBooking = () => useBookingMutation((id: string) => postApiBookingsIdCancel(id).then(toBooking));

export const useDeleteBooking = () => useBookingMutation((id: string) => deleteApiBookingsId(id));
