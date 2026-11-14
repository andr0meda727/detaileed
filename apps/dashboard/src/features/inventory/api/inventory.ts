import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/apiClient';
import { InventoryResponseDto, InventoryCreateDto } from '@/types';

const QUERY_KEY = 'inventory';

export function useInventory(isLowStock?: boolean) {
  return useQuery({
    queryKey: [QUERY_KEY, isLowStock],
    queryFn: () => apiGet<InventoryResponseDto[]>('/Inventory', isLowStock !== undefined ? { isLowStock } : undefined),
    staleTime: 30_000,
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: InventoryCreateDto) => apiPost<InventoryResponseDto>('/Inventory', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ id, dto }: { id: string; dto: InventoryCreateDto }) =>
      apiPut<InventoryResponseDto>(`/Inventory/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
