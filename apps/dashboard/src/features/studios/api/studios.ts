import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  getApiStudiosCurrent,
  getGetApiMarketplaceListingQueryKey,
  getGetApiStudiosCurrentQueryKey,
  getGetApiStudiosMyQueryKey,
  getGetApiStudiosMyQueryOptions,
  postApiStudios,
  putApiStudiosCurrent,
  putApiStudiosTimeZone,
  useGetApiStudiosMy,
  type ChangeStudioDetailsRequest,
} from '@detaileed/api-client';
import type { CreateStudioInput, Studio } from '@/features/studios/model/types';
import { toStudioDetails } from '@/features/studios/model/studioDetailsForm';

const STALE_TIME = 5 * 60_000;

export const studiosQueryKey = getGetApiStudiosMyQueryKey();

/** Studios the signed-in user belongs to; also loaded by the studio route guard. */
export const studiosQueryOptions = getGetApiStudiosMyQueryOptions({ query: { staleTime: STALE_TIME } });

export function useStudios() {
  return useGetApiStudiosMy({ query: { staleTime: STALE_TIME } });
}

/** Opens a new studio; the caller becomes its owner. */
export function useCreateStudio() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateStudioInput) => postApiStudios(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studiosQueryKey }),
  });
}

export const studioDetailsKey = getGetApiStudiosCurrentQueryKey();

/** The current studio's details (name, contact data, address and pin). */
export function useStudioDetails() {
  return useQuery({
    queryKey: studioDetailsKey,
    queryFn: async ({ signal }) => toStudioDetails(await getApiStudiosCurrent({ signal })),
    staleTime: STALE_TIME,
  });
}

/** How long the public profile takes to copy new details; it is refetched after that. */
export const LISTING_COPY_DELAY_MS = 2_000;

/**
 * Changes the current studio's details (owner only). The studio list (the name in the menu) is refreshed at once;
 * the public profile copies the details a moment later, so it is refetched then.
 */
export function useSaveStudioDetails() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: ChangeStudioDetailsRequest) => putApiStudiosCurrent(body),
    onSuccess: async () => {
      const listingKey = getGetApiMarketplaceListingQueryKey();
      setTimeout(() => void queryClient.invalidateQueries({ queryKey: listingKey }), LISTING_COPY_DELAY_MS);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studioDetailsKey }),
        queryClient.invalidateQueries({ queryKey: studiosQueryKey }),
        queryClient.invalidateQueries({ queryKey: listingKey }),
      ]);
      await router.invalidate();
    },
  });
}

/**
 * Changes the current studio's IANA time zone (owner only; the API acts on the active studio). The cached studio
 * list and the route context (where screens read the zone from) are updated at once.
 */
export function useChangeStudioTimeZone() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({ timeZone }: { studioId: string; timeZone: string }) => putApiStudiosTimeZone({ timeZone }),
    onSuccess: async (_, { studioId, timeZone }) => {
      queryClient.setQueryData<Studio[]>(studiosQueryKey, (studios) =>
        studios?.map((s) => (s.studioId === studioId ? { ...s, timeZone } : s)),
      );
      await router.invalidate();
    },
  });
}
