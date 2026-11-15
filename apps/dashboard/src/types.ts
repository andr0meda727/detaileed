// === API Response DTOs ===

export type StudioRole = 'Owner' | 'Manager' | 'Employee';

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
