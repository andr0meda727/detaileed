import { describe, expect, it } from 'vitest';
import type { StudioEmployeeDto } from '@detaileed/api-client';
import { toEmployee } from '@/features/team/model/types';
import { ASSIGNABLE_ROLES, roleById } from '@/features/team/model/roles';

const dto = (over: Partial<StudioEmployeeDto>): StudioEmployeeDto => ({
  userId: 'u',
  email: 'jan@studio.pl',
  firstName: null,
  lastName: null,
  roleId: 3,
  roleName: 'Employee',
  ...over,
});

describe('toEmployee', () => {
  it('joins first and last name, or leaves null when there is none', () => {
    expect(toEmployee(dto({ firstName: 'Jan', lastName: 'Kowalski' })).name).toBe('Jan Kowalski');
    expect(toEmployee(dto({ firstName: 'Jan' })).name).toBe('Jan');
    expect(toEmployee(dto({})).name).toBeNull();
  });

  it('turns a string role id into a number', () => {
    expect(toEmployee(dto({ roleId: '2' })).roleId).toBe(2);
  });
});

describe('roles', () => {
  it('never offers the owner role for invites or role changes', () => {
    expect(ASSIGNABLE_ROLES.map((r) => r.id)).toEqual([2, 3]);
  });

  it('falls back to Pracownik for unknown ids', () => {
    expect(roleById(1).name).toBe('Właściciel');
    expect(roleById(99).name).toBe('Pracownik');
  });
});
