import { apiGet, apiPost, apiDelete, apiPatch } from '../apiClient';
import { EmployeeResponseDto, InviteEmployeeDto, ChangeEmployeeRoleDto } from '../types';

export async function getEmployees(onCacheHit?: (data: EmployeeResponseDto[]) => void): Promise<EmployeeResponseDto[]> {
    return apiGet<EmployeeResponseDto[]>('/Employees', undefined, onCacheHit);
}

export async function inviteEmployee(dto: InviteEmployeeDto): Promise<void> {
    return apiPost<void>('/Employees/invite', dto);
}

export async function changeEmployeeRole(dto: ChangeEmployeeRoleDto): Promise<void> {
    return apiPatch<void>('/Employees/role', dto);
}

export async function removeEmployee(userId: string): Promise<void> {
    return apiDelete(`/Employees/${userId}`);
}
