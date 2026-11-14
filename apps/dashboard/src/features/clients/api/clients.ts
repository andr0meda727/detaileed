import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiClientsId,
  deleteApiVehicleId,
  getApiClients,
  getGetApiClientsQueryKey,
  postApiClients,
  postApiVehicle,
  putApiClientsId,
  putApiVehicleId,
} from '@detaileed/api-client';
import { fetchAllPages, MAX_PAGE_SIZE } from '@/shared/lib/paging';
import type { ClientInput, VehicleInput } from '@/features/clients/model/types';

/** Prefix of every client list query. Vehicles come nested in clients, so vehicle changes refresh it too. */
const clientsKey = getGetApiClientsQueryKey();

/** All clients (every page) with their vehicles; `search` matches name, email, phone, plate, brand, model. */
export function useClients(search?: string) {
  return useQuery({
    queryKey: [...clientsKey, { search: search ?? '' }, 'all-pages'],
    queryFn: ({ signal }) =>
      fetchAllPages((page) =>
        getApiClients({ search: search || undefined, Page: page, PageSize: MAX_PAGE_SIZE }, { signal }),
      ),
    staleTime: 60_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useClientsMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clientsKey }),
  });
}

export const useCreateClient = () => useClientsMutation((body: ClientInput) => postApiClients(body));

export const useUpdateClient = () =>
  useClientsMutation(({ id, dto }: { id: string; dto: ClientInput }) => putApiClientsId(id, dto));

export const useDeleteClient = () => useClientsMutation((id: string) => deleteApiClientsId(id));

export const useCreateVehicle = () => useClientsMutation((body: VehicleInput) => postApiVehicle(body));

export const useUpdateVehicle = () =>
  useClientsMutation(({ id, dto }: { id: string; dto: VehicleInput }) => putApiVehicleId(id, dto));

export const useDeleteVehicle = () => useClientsMutation((id: string) => deleteApiVehicleId(id));
