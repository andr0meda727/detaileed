import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getGetApiStudiosMyQueryKey, getGetApiStudiosMyQueryOptions, useGetApiStudiosMy } from '@detaileed/api-client';
import { CreateStudioDto } from '@/types';
import { createStudio } from '@/features/studios/api/studioService';

const STALE_TIME = 5 * 60_000;

export const studiosQueryKey = getGetApiStudiosMyQueryKey();

/** Studios the signed-in user belongs to; also loaded by the studio route guard. */
export const studiosQueryOptions = getGetApiStudiosMyQueryOptions({ query: { staleTime: STALE_TIME } });

export function useStudios() {
  return useGetApiStudiosMy({ query: { staleTime: STALE_TIME } });
}

// Creating a studio is not in the API spec yet (backend work in progress), so this still uses the legacy client.
export function useCreateStudio() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateStudioDto) => createStudio(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: studiosQueryKey }),
  });
}
