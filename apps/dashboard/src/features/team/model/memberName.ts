import type { Employee } from '@/features/team/model/types';

/** Display name of a member: the name, or the part of the email before "@". */
export function memberName(emp: Pick<Employee, 'name' | 'email'>): string {
  return emp.name || emp.email.split('@')[0];
}
