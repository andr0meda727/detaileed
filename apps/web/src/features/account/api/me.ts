'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  deleteApiMeVehiclesId,
  getApiMeBookingRequests,
  getApiMeProfile,
  getApiMeReviewsPending,
  getApiMeVehicles,
  postApiMeBookingRequests,
  postApiMeBookingRequestsIdWithdraw,
  postApiMeReviews,
  postApiMeVehicles,
  putApiMeProfile,
  putApiMeVehiclesId,
  type GarageVehicleRequest,
  type ProfileRequest,
  type SubmitBookingRequest,
  type SubmitReviewRequest,
} from '@detaileed/api-client';
import { toMyRequest } from '@/features/account/model/requests';

const profileKey = ['/api/me/profile'];
const vehiclesKey = ['/api/me/vehicles'];
const requestsKey = ['/api/me/booking-requests'];
const pendingReviewsKey = ['/api/me/reviews/pending'];

/** The caller's contact details for requests, or null before the first save (`CUSTOMER_PROFILE_NOT_FOUND`). */
export function useProfile() {
  return useQuery({
    queryKey: profileKey,
    queryFn: async ({ signal }) => {
      try {
        return await getApiMeProfile({ signal });
      } catch (err) {
        if (err instanceof ApiError && err.code === 'CUSTOMER_PROFILE_NOT_FOUND') return null;
        throw err;
      }
    },
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProfileRequest) => putApiMeProfile(body),
    onSuccess: (profile) => queryClient.setQueryData(profileKey, profile),
  });
}

/** The caller's saved cars (at most ten). */
export function useGarage() {
  return useQuery({ queryKey: vehiclesKey, queryFn: ({ signal }) => getApiMeVehicles({ signal }) });
}

function useGarageMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    // The forms show these errors next to the fields.
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclesKey }),
  });
}

export const useAddVehicle = () => useGarageMutation((body: GarageVehicleRequest) => postApiMeVehicles(body));
export const useUpdateVehicle = () =>
  useGarageMutation(({ id, body }: { id: string; body: GarageVehicleRequest }) => putApiMeVehiclesId(id, body));
export const useDeleteVehicle = () => useGarageMutation((id: string) => deleteApiMeVehiclesId(id));

/** Sends a booking request; the request form shows its errors itself. */
export function useSubmitRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitBookingRequest) => postApiMeBookingRequests(body),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKey }),
  });
}

export const MY_REQUESTS_PAGE_SIZE = 10;

/** The caller's requests at every studio, newest first. */
export function useMyRequests(page: number) {
  return useQuery({
    queryKey: [...requestsKey, page],
    queryFn: async ({ signal }) => {
      const res = await getApiMeBookingRequests({ Page: page, PageSize: MY_REQUESTS_PAGE_SIZE }, { signal });
      return { items: res.items.map(toMyRequest), totalPages: Number(res.totalPages ?? 0) };
    },
    placeholderData: keepPreviousData,
  });
}

/** Withdraws a pending request. */
export function useWithdrawRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postApiMeBookingRequestsIdWithdraw(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKey }),
  });
}

/** Completed visits the caller can still review. */
export function usePendingReviews() {
  return useQuery({ queryKey: pendingReviewsKey, queryFn: ({ signal }) => getApiMeReviewsPending({ signal }) });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitReviewRequest) => postApiMeReviews(body),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pendingReviewsKey }),
  });
}
