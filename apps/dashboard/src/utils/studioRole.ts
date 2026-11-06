import { StudioRole } from '../types';

const EMPLOYEE_ALIASES = new Set(['3', 'pracownik', 'employee']);
const OWNER_ALIASES = new Set(['1', 'właściciel', 'wlasciciel', 'owner']);
const MANAGER_ALIASES = new Set(['2', 'manager']);

export function normalizeStudioRole(role?: string | null): StudioRole | null {
  if (!role) return null;

  const normalized = role.trim().toLowerCase();
  if (OWNER_ALIASES.has(normalized)) return 'Owner';
  if (MANAGER_ALIASES.has(normalized)) return 'Manager';
  if (EMPLOYEE_ALIASES.has(normalized)) return 'Employee';

  return null;
}

export function isEmployeeRole(role?: string | null): boolean {
  return normalizeStudioRole(role) === 'Employee';
}

export function isOwnerRole(role?: string | null): boolean {
  return normalizeStudioRole(role) === 'Owner';
}
