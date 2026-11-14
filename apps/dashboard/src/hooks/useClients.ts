import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient';
import { ClientResponseDto, CreateClientDto, CreateVehicleDto, VehicleInfoDto } from '../types';

const QUERY_KEY = 'clients';

export function useClients(search?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, search],
    queryFn: () => apiGet<ClientResponseDto[]>('/Clients', search ? { search } : undefined),
    staleTime: 60_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateClientDto) => apiPost<ClientResponseDto>('/Clients', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ id, dto }: { id: string; dto: CreateClientDto }) => apiPut<ClientResponseDto>(`/Clients/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (id: string) => apiDelete(`/Clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CreateVehicleDto) => apiPost<VehicleInfoDto>('/Vehicle', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ id, dto }: { id: string; dto: CreateVehicleDto }) => apiPut<VehicleInfoDto>(`/Vehicle/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (id: string) => apiDelete(`/Vehicle/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
