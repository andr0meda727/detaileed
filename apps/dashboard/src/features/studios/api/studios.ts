import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
  getGetApiStudiosMyQueryKey,
  getGetApiStudiosMyQueryOptions,
  postApiStudios,
  putApiStudiosTimeZone,
  useGetApiStudiosMy,
} from '@detaileed/api-client';
import type { CreateStudioInput, Studio } from '@/features/studios/model/types';

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
