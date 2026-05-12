import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '../apiClient';
import { StudioDto, CreateStudioDto } from '../types';
import { createStudio } from '../services/studioService';

const QUERY_KEY = 'studios';

export function useStudios() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiGet<StudioDto[]>('/Studios/my'),
    staleTime: 5 * 60_000,
  });
}

export function useCreateStudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStudioDto) => createStudio(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
