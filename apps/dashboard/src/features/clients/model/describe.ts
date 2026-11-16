import type { Client } from '@/features/clients/model/types';
import type { ClientVehicleMatch } from '@/features/clients/hooks/useClientVehicleSearch';

/** Display texts for a vehicle search result: car name, owner, plate. */
export function describeVehicleMatch({ client, vehicle }: ClientVehicleMatch) {
  return {
    key: vehicle.id,
    title: [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Pojazd',
    subtitle: client.name,
    badge: vehicle.licensePlate,
  };
}

/** Display texts for a client search result: name and a contact. */
export function describeClient(client: Client) {
  return {
    key: client.id,
    title: client.name,
    subtitle: client.phone || client.email || 'Brak danych kontaktowych',
  };
}
