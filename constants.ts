
import { Client, Booking, InventoryItem, KanbanTask } from './types';

export const PREDEFINED_SERVICES = [
  'Czyszczenie wnętrza (Standard)',
  'Czyszczenie wnętrza (Premium)',
  'Mycie zewnętrzne (Detailingowe)',
  'Korekta lakieru (1-etapowa)',
  'Korekta lakieru (2-etapowa)',
  'Powłoka ceramiczna (Lakier)',
  'Powłoka ceramiczna (Felgi/Szyby)',
  'Oklejenie PPF (Front)',
  'Oklejenie PPF (Całość)',
  'Przygotowanie do sprzedaży'
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Jan Kowalski',
    email: 'j.kowalski@firma.pl',
    phone: '600-100-200',
    nip: '525-000-00-00',
    vehicles: [
      { id: 'v1', make: 'Audi', model: 'A6 C8', licensePlate: 'WA 12345', vin: 'WUAZZZ4G...', paintCode: 'LY9B' },
      { id: 'v2', make: 'Porsche', model: '911 GT3', licensePlate: 'W0 911', vin: 'WP0ZZZ99...', paintCode: 'C9X' }
    ]
  },
  {
    id: 'c2',
    name: 'Piotr Nowak',
    email: 'p.nowak@gmail.com',
    phone: '505-200-300',
    vehicles: [
      { id: 'v3', make: 'BMW', model: 'X5 M50d', licensePlate: 'KR 555MM', vin: 'WBAXW71...', paintCode: '416' }
    ]
  },
  {
    id: 'c3',
    name: 'Anna Wisniewska',
    email: 'a.wisniewska@interia.pl',
    phone: '788-900-100',
    vehicles: [
      { id: 'v4', make: 'Tesla', model: 'Model 3', licensePlate: 'WE 7G777', vin: '5YJ3E7E...', paintCode: 'PPSB' }
    ]
  }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', vehicleId: 'v1', serviceName: 'Korekta lakieru (2-etapowa)', date: today, time: '08:00', price: 3500, depositPaid: true, status: 'Zatwierdzona', assignedEmployee: 'Marek' },
  { id: 'b2', vehicleId: 'v2', serviceName: 'Oklejenie PPF (Całość)', date: today, time: '10:30', price: 12000, depositPaid: false, status: 'Oczekująca', assignedEmployee: 'Paweł' },
  { id: 'b3', vehicleId: 'v3', serviceName: 'Czyszczenie wnętrza (Premium)', date: tomorrow, time: '14:00', price: 600, depositPaid: true, status: 'Zatwierdzona', assignedEmployee: 'Marek' },
  { id: 'b4', vehicleId: 'v4', serviceName: 'Powłoka ceramiczna (Felgi/Szyby)', date: tomorrow, time: '09:00', price: 1200, depositPaid: true, status: 'Zatwierdzona', assignedEmployee: 'Paweł' },
  { id: 'b5', vehicleId: 'v1', serviceName: 'Czyszczenie wnętrza (Standard)', date: dayAfter, time: '12:00', price: 300, depositPaid: false, status: 'Oczekująca', assignedEmployee: 'Marek' },
  { id: 'b6', vehicleId: 'v3', serviceName: 'Korekta lakieru (1-etapowa)', date: nextWeek, time: '15:30', price: 1500, depositPaid: false, status: 'Zatwierdzona', assignedEmployee: 'Paweł' }
];

export const INITIAL_TASKS: KanbanTask[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Koch Chemie H9.01 Heavy Cut', category: 'Pasty Polerskie', stock: 250, minStock: 500, unit: 'ml', capacity: 1000 },
  { id: 'i2', name: 'Gyeon Q2 Pure EVO', category: 'Powłoki Ceramiczne', stock: 1, minStock: 5, unit: 'szt', capacity: 50 },
  { id: 'i3', name: 'ADBL APC Concentrate', category: 'Chemia Czyszcząca', stock: 10, minStock: 5, unit: 'L', capacity: 5000 },
  { id: 'i4', name: 'Rękawiczki Nitrylowe L', category: 'BHP', stock: 20, minStock: 100, unit: 'szt' }
];
