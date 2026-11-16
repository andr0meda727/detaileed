import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  getApiInventoryConsumptionsAccuracy,
  getApiInventoryConsumptionsBookingId,
  getApiInventoryForecast,
  getApiInventoryIdMovements,
  getApiInventoryRecipesServiceId,
  getApiInventorySizeFactors,
  getGetApiInventoryQueryKey,
  postApiInventoryIdMovements,
  putApiInventoryConsumptionsBookingId,
  putApiInventoryRecipesServiceId,
  putApiInventorySizeFactors,
  type RecipeRequest,
  type SizeFactorsDto,
  type StockChangeKind,
} from '@detaileed/api-client';
import {
  toAccuracyRow,
  toConsumption,
  toForecastItem,
  toRecipe,
  toSizeFactors,
  toStockMovement,
} from '@/features/inventory/model/ledger';

const inventoryKey = getGetApiInventoryQueryKey();
const movementsKey = (itemId: string) => ['/api/Inventory', itemId, 'movements'];
const forecastKey = ['/api/inventory/forecast'];
const accuracyKey = ['/api/inventory/consumptions/accuracy'];

export const MOVEMENTS_PAGE_SIZE = 15;

/** An item's stock history, newest first. */
export function useMovements(itemId: string, page: number) {
  return useQuery({
    queryKey: [...movementsKey(itemId), page],
    queryFn: async ({ signal }) => {
      const res = await getApiInventoryIdMovements(itemId, { Page: page, PageSize: MOVEMENTS_PAGE_SIZE }, { signal });
      return { items: res.items.map(toStockMovement), totalPages: Number(res.totalPages ?? 0) };
    },
    placeholderData: keepPreviousData,
  });
}

/** Records a delivery (adds) or a stocktake (sets the counted stock). */
export function useAddMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      kind,
      quantity,
      note,
    }: {
      itemId: string;
      kind: StockChangeKind;
      quantity: number;
      note: string | null;
    }) => postApiInventoryIdMovements(itemId, { kind, quantity, note }),
    meta: { skipGlobalError: true },
    onSuccess: (_item, { itemId }) =>
      Promise.all(
        [inventoryKey, movementsKey(itemId), forecastKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}

/** The materials one service uses on a Medium car. */
export function useRecipe(serviceId: string | null) {
  return useQuery({
    queryKey: ['/api/inventory/recipes', serviceId],
    queryFn: async ({ signal }) => toRecipe(await getApiInventoryRecipesServiceId(serviceId!, { signal })),
    enabled: serviceId !== null,
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, body }: { serviceId: string; body: RecipeRequest }) =>
      putApiInventoryRecipesServiceId(serviceId, body),
    meta: { skipGlobalError: true },
    onSuccess: (_r, { serviceId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/inventory/recipes', serviceId] }),
        queryClient.invalidateQueries({ queryKey: forecastKey }),
      ]),
  });
}

/** How much more material each car size takes than a Medium one. */
export function useSizeFactors() {
  return useQuery({
    queryKey: ['/api/inventory/size-factors'],
    queryFn: async ({ signal }) => toSizeFactors(await getApiInventorySizeFactors({ signal })),
  });
}

export function useSaveSizeFactors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SizeFactorsDto) => putApiInventorySizeFactors(body),
    meta: { skipGlobalError: true },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/inventory/size-factors'] }),
  });
}

/** What a completed visit used, or null until it is recorded (`CONSUMPTION_NOT_FOUND`). */
export function useConsumption(bookingId: string | null) {
  return useQuery({
    queryKey: ['/api/inventory/consumptions', bookingId],
    queryFn: async ({ signal }) => {
      try {
        return toConsumption(await getApiInventoryConsumptionsBookingId(bookingId!, { signal }));
      } catch (err) {
        if (err instanceof ApiError && err.code === 'CONSUMPTION_NOT_FOUND') return null;
        throw err;
      }
    },
    enabled: bookingId !== null,
  });
}

/** Records what a visit really used; stock moves by the difference and the estimates learn from it. */
export function useCorrectConsumption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      lines,
    }: {
      bookingId: string;
      lines: { serviceId: string; itemId: string; actualQuantity: number }[];
    }) => putApiInventoryConsumptionsBookingId(bookingId, { lines }),
    meta: { skipGlobalError: true },
    onSuccess: (_c, { bookingId }) =>
      Promise.all(
        [['/api/inventory/consumptions', bookingId], inventoryKey, forecastKey, accuracyKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ),
  });
}

/** Per item: daily use, days left, planned use by the next two weeks' bookings and when it runs out. */
export function useForecast() {
  return useQuery({
    queryKey: forecastKey,
    queryFn: async ({ signal }) => (await getApiInventoryForecast({ signal })).map(toForecastItem),
  });
}

/** How well the material estimates match what visits really used. */
export function useAccuracy() {
  return useQuery({
    queryKey: accuracyKey,
    queryFn: async ({ signal }) => (await getApiInventoryConsumptionsAccuracy({ signal })).map(toAccuracyRow),
  });
}
