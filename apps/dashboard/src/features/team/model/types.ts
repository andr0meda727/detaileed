import type { StudioEmployeeDto } from '@detaileed/api-client';

/** API role ids: 1 Owner, 2 Manager, 3 Employee (only 2 and 3 can be invited or assigned). */
export type RoleId = 1 | 2 | 3;

/** A studio member, with the name joined and `roleId` as a number (the API may send it as a string). */
export interface Employee {
  userId: string;
  email: string;
  /** "First Last", or null when the person hasn't set a name. */
  name: string | null;
  roleId: number;
  roleName: string;
}

export function toEmployee(dto: StudioEmployeeDto): Employee {
  const name = [dto.firstName, dto.lastName].filter(Boolean).join(' ').trim();
  return {
    userId: dto.userId,
    email: dto.email,
    name: name || null,
    roleId: Number(dto.roleId),
    roleName: dto.roleName,
  };
}
