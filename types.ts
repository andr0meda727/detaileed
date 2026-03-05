
// === API Response DTOs ===

export interface VehicleInfoDto {
  id: string;
  licensePlate: string;
  brand: string | null;
  model: string | null;
}

export interface CreateVehicleDto {
  clientId: string;
  licensePlate: string;
  brand?: string | null;
  model?: string | null;
}

export interface ClientInfoDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface BookingResponseDto {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  totalPrice: number;
  status: string;
  statusColor: string;
  notes: string | null;
  vehicle: VehicleInfoDto;
  client: ClientInfoDto;
  services: string[];
}

export interface BookingCreateDto {
  vehicleId: string;
  clientId: string;
  scheduledAt: string;
  statusId?: string;
  serviceIds?: string[];
  price?: number;
  notes?: string | null;
}

export interface ClientResponseDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  nip: string | null;
  vehicles: VehicleInfoDto[];
}

export interface CreateClientVehicleDto {
  licensePlate: string;
  brand?: string | null;
  model?: string | null;
}

export interface CreateClientDto {
  name: string;
  email?: string | null;
  phone?: string | null;
  nip?: string | null;
  vehicle?: CreateClientVehicleDto | null;
}

export interface ServiceResponseDto {
  id: string;
  name: string;
}

export interface CreateServiceDto {
  name: string;
}

export interface InventoryResponseDto {
  id: string;
  studioId: string;
  categoryName: string | null;
  name: string;
  description: string | null;
  unit: string;
  stock: number;
  minStock: number | null;
}

export interface InventoryCreateDto {
  categoryId?: string | null;
  name: string;
  description?: string | null;
  unit: string;
  stock: number;
  minStock?: number | null;
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

export type ViewType = 'Dashboard' | 'Bookings' | 'Tasks' | 'Clients' | 'Inventory' | 'Archived';
