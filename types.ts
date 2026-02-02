
export type BookingStatus = 'Oczekująca' | 'Zatwierdzona' | 'Ukończona' | 'Anulowana';
export type KanbanStage = 'Do zrobienia' | 'W trakcie' | 'Kontrola jakości' | 'Gotowe';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
  vin?: string;
  paintCode?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  nip?: string;
  vehicles: Vehicle[];
}

export interface Booking {
  id: string;
  vehicleId: string;
  serviceName: string;
  date: string;
  time: string;
  price: number;
  depositPaid: boolean;
  status: BookingStatus;
  assignedEmployee: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string; // Zmiana z unii na string dla własnych jednostek
  capacity?: number;
}

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

export type ViewType = 'Dashboard' | 'Bookings' | 'Tasks' | 'Clients' | 'Inventory' | 'Archived' | 'AI';
