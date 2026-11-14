import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getApiInventory,
  getGetApiInventoryQueryKey,
  postApiInventory,
  putApiInventoryId,
} from '@detaileed/api-client';
import { fetchAllPages, MAX_PAGE_SIZE } from '@/shared/lib/paging';
import { toInventoryItem, type InventoryItemInput } from '@/features/inventory/model/types';

const inventoryKey = getGetApiInventoryQueryKey();

/** All stock items (every page); `isLowStock` limits them to items below their minimum. */
export function useInventory(isLowStock?: boolean) {
  return useQuery({
    queryKey: [...inventoryKey, { isLowStock }, 'all-pages'],
    queryFn: async ({ signal }) => {
      const items = await fetchAllPages((page) =>
        getApiInventory({ isLowStock, Page: page, PageSize: MAX_PAGE_SIZE }, { signal }),
      );
      return items.map(toInventoryItem);
    },
    staleTime: 30_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useInventoryMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKey }),
  });
}

export const useCreateInventoryItem = () =>
  useInventoryMutation((dto: InventoryItemInput) => postApiInventory(dto).then(toInventoryItem));

export const useUpdateInventoryItem = () =>
  useInventoryMutation(({ id, dto }: { id: string; dto: InventoryItemInput }) =>
    putApiInventoryId(id, dto).then(toInventoryItem),
  );
