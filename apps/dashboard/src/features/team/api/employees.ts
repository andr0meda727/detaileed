import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteApiEmployeesUserId,
  getApiEmployees,
  getGetApiEmployeesQueryKey,
  patchApiEmployeesRole,
  postApiEmployeesInvite,
} from '@detaileed/api-client';
import { toEmployee } from '@/features/team/model/types';

const employeesKey = getGetApiEmployeesQueryKey();

/** Members of the current studio (owner only, not paged). */
export function useEmployees() {
  return useQuery({
    queryKey: employeesKey,
    queryFn: async ({ signal }) => (await getApiEmployees({ signal })).map(toEmployee),
    staleTime: 30_000,
  });
}

// The screens show their own error toasts for these, so the global one is skipped.
const meta = { skipGlobalError: true };

function useEmployeesMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    meta,
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeesKey }),
  });
}

/** Sends an invitation email; the person joins once they accept it. */
export const useInviteEmployee = () =>
  useEmployeesMutation(({ email, roleId }: { email: string; roleId: number }) =>
    postApiEmployeesInvite({ email, roleId }),
  );

export const useChangeEmployeeRole = () =>
  useEmployeesMutation(({ userId, roleId }: { userId: string; roleId: number }) =>
    patchApiEmployeesRole({ userId, roleId }),
  );

export const useRemoveEmployee = () => useEmployeesMutation((userId: string) => deleteApiEmployeesUserId(userId));
