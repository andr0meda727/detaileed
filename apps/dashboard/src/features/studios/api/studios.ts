import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGetApiStudiosMyQueryKey,
  getGetApiStudiosMyQueryOptions,
  postApiStudios,
  useGetApiStudiosMy,
} from '@detaileed/api-client';
import type { CreateStudioInput } from '@/features/studios/model/types';

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
