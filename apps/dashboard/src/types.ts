// === API Response DTOs ===

export type StudioRole = 'Owner' | 'Manager' | 'Employee';

export interface InviteEmployeeDto {
  email: string;
  roleId: number;
}

export interface ChangeEmployeeRoleDto {
  userId: string;
  roleId: number;
}

export interface EmployeeResponseDto {
  userId: string;
  email: string;
  name?: string | null;
  roleId: number;
}

// === Legacy types kept for UI compatibility ===

export type KanbanStage = 'Do zrobienia' | 'W trakcie' | 'Kontrola jakości' | 'Gotowe';

export interface KanbanTask {
  id: string;
  bookingId: string;
  title: string;
  description: string;
  licensePlate: string;
  carModel: string;
  assignedTo: string;
  stage: KanbanStage;
  deadline: string;
}

export interface CreateStudioDto {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface UpdateStudioDto {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}
