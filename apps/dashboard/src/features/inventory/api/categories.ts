import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/apiClient';
import { CategoryResponseDto, CategoryCreateDto } from '@/types';

const QUERY_KEY = 'categories';

export function useCategories() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiGet<CategoryResponseDto[]>('/inventory-categories'),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: CategoryCreateDto) => apiPost<CategoryResponseDto>('/inventory-categories', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ id, dto }: { id: string; dto: CategoryCreateDto }) =>
      apiPut<CategoryResponseDto>(`/inventory-categories/${id}`, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (id: string) => apiDelete(`/inventory-categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
