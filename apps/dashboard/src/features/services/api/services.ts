import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiServiceId,
  getApiService,
  getGetApiServiceQueryKey,
  postApiService,
  putApiServiceId,
} from '@detaileed/api-client';
import { toService, type ServiceInput } from '@/features/services/model/types';

const servicesKey = getGetApiServiceQueryKey();

/** Active services of the studio (not paged), with numbers normalised. */
export function useServices() {
  return useQuery({
    queryKey: servicesKey,
    queryFn: ({ signal }) => getApiService({ signal }),
    select: (services) => services.map(toService),
    staleTime: 60_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useServicesMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: servicesKey }),
  });
}

export const useCreateService = () => useServicesMutation((body: ServiceInput) => postApiService(body));

export const useUpdateService = () =>
  useServicesMutation(({ id, body }: { id: string; body: ServiceInput }) => putApiServiceId(id, body));

/** Deactivates the service; past bookings keep it. */
export const useDeleteService = () => useServicesMutation((id: string) => deleteApiServiceId(id));
