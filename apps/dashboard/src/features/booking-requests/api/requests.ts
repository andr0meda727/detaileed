import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getApiBookingRequests,
  getApiBookingRequestsIdPlan,
  getGetApiBookingRequestsIdPlanQueryKey,
  getGetApiBookingRequestsQueryKey,
  getGetApiBookingsQueryKey,
  getGetApiScheduleDayQueryKey,
  postApiBookingRequestsIdAccept,
  postApiBookingRequestsIdReject,
  type AcceptBookingRequest,
  type OnlineRequestStatus,
} from '@detaileed/api-client';
import { toBookingRequest, toRequestPlan } from '@/features/booking-requests/model/types';

export const REQUESTS_PAGE_SIZE = 20;

/** Prefix of every booking-request query. */
const requestsKey = getGetApiBookingRequestsQueryKey();

/** One page of requests; without a status, pending ones come first, then the newest. */
export function useBookingRequests({ status, page }: { status?: OnlineRequestStatus; page: number }) {
  return useQuery({
    queryKey: [...requestsKey, { status: status ?? null, page }],
    queryFn: async ({ signal }) => {
      const res = await getApiBookingRequests({ status, Page: page, PageSize: REQUESTS_PAGE_SIZE }, { signal });
      return { ...res, items: res.items.map(toBookingRequest) };
    },
    placeholderData: keepPreviousData,
  });
}

/** How many requests wait for an answer (for the sidebar badge); checked every minute. */
export function usePendingRequestsCount() {
  return useQuery({
    queryKey: [...requestsKey, 'pending-count'],
    queryFn: async ({ signal }) =>
      (await getApiBookingRequests({ status: 'Pending', Page: 1, PageSize: 1 }, { signal })).totalCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** The planner's view of a request: does the preferred time fit, and the closest times that do. */
export function useRequestPlan(id: string | null) {
  return useQuery({
    queryKey: getGetApiBookingRequestsIdPlanQueryKey(id ?? ''),
    queryFn: async ({ signal }) => toRequestPlan(await getApiBookingRequestsIdPlan(id!, { signal })),
    enabled: id !== null,
  });
}

/** After an answer: the request lists, the bookings (an accepted request becomes one) and the day board. */
function useAfterDecision() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: requestsKey }),
      queryClient.invalidateQueries({ queryKey: getGetApiBookingsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetApiScheduleDayQueryKey() }),
    ]);
}

// The modal shows these errors itself (with request-specific messages).
const meta = { skipGlobalError: true };

/** Accepts a request: creates a booking at the given (or preferred) time, price and bay. */
export function useAcceptRequest() {
  const refresh = useAfterDecision();
  return useMutation({
    meta,
    mutationFn: ({ id, body }: { id: string; body: AcceptBookingRequest }) => postApiBookingRequestsIdAccept(id, body),
    onSuccess: refresh,
  });
}

/** Rejects a request with an optional reason the customer sees. */
export function useRejectRequest() {
  const refresh = useAfterDecision();
  return useMutation({
    meta,
    mutationFn: ({ id, reason }: { id: string; reason: string | null }) =>
      postApiBookingRequestsIdReject(id, { reason }),
    onSuccess: refresh,
  });
}
