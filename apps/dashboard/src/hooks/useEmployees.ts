import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, inviteEmployee, changeEmployeeRole, removeEmployee } from '../services/employeeService';
import { EmployeeResponseDto } from '../types';

const QUERY_KEY = 'employees';

export function useEmployees() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => getEmployees(),
    staleTime: 30_000,
  });
}

export function useInviteEmployee() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ email, roleId }: { email: string; roleId: number }) => inviteEmployee({ email, roleId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useChangeEmployeeRole() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) => changeEmployeeRole({ userId, roleId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useRemoveEmployee() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (userId: string) => removeEmployee(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
