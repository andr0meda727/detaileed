import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiInventoryCategoriesId,
  getApiInventoryCategories,
  getGetApiInventoryCategoriesQueryKey,
  getGetApiInventoryQueryKey,
  postApiInventoryCategories,
  putApiInventoryCategoriesId,
} from '@detaileed/api-client';

const categoriesKey = getGetApiInventoryCategoriesQueryKey();

/** Inventory categories of the studio (not paged). */
export function useCategories() {
  return useQuery({
    queryKey: categoriesKey,
    queryFn: ({ signal }) => getApiInventoryCategories({ signal }),
    staleTime: 60_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useCategoriesMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    // Items show their category's name, so a rename or delete refreshes them too.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: categoriesKey }),
        queryClient.invalidateQueries({ queryKey: getGetApiInventoryQueryKey() }),
      ]),
  });
}

export const useCreateCategory = () =>
  useCategoriesMutation((dto: { name: string }) => postApiInventoryCategories(dto));

export const useUpdateCategory = () =>
  useCategoriesMutation(({ id, dto }: { id: string; dto: { name: string } }) => putApiInventoryCategoriesId(id, dto));

export const useDeleteCategory = () => useCategoriesMutation((id: string) => deleteApiInventoryCategoriesId(id));
