import { queryOptions, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../apiClient';
import { StudioDto, CreateStudioDto } from '../types';
import { createStudio } from '../services/studioService';

export const STUDIOS_QUERY_KEY = 'studios';

/** Studios the signed-in user belongs to; also loaded by the studio route guard. */
export const studiosQueryOptions = queryOptions({
  queryKey: [STUDIOS_QUERY_KEY],
  queryFn: () => apiGet<StudioDto[]>('/Studios/my'),
  staleTime: 5 * 60_000,
});

export function useStudios() {
  return useQuery(studiosQueryOptions);
}

export function useCreateStudio() {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateStudioDto) => createStudio(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [STUDIOS_QUERY_KEY] }),
  });
}
