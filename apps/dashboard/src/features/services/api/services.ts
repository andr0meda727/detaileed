import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/apiClient';
import { ServiceResponseDto, CreateServiceDto } from '@/types';

const QUERY_KEY = 'services';

export function useServices() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiGet<ServiceResponseDto[]>('/Service'),
    staleTime: 60_000,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateServiceDto) => apiPost<ServiceResponseDto>('/Service', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (id: string) => apiDelete(`/Service/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
