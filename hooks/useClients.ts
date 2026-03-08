import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient';
import { ClientResponseDto, CreateClientDto } from '../types';

const QUERY_KEY = 'clients';

export function useClients(search?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, search],
    queryFn: () =>
      apiGet<ClientResponseDto[]>('/Clients', search ? { search } : undefined),
    staleTime: 60_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClientDto) => apiPost<ClientResponseDto>('/Clients', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: CreateClientDto }) =>
      apiPut<ClientResponseDto>(`/Clients/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/Clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
