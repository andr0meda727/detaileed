import { useMemo } from 'react';
import type { Client, Vehicle } from '@/features/clients/model/types';

export interface ClientVehicleMatch {
  client: Client;
  vehicle: Vehicle;
}

export function useClientVehicleSearch(clients: Client[], query: string, limit = 5): ClientVehicleMatch[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    const results: ClientVehicleMatch[] = [];

    clients.forEach((client) => {
      client.vehicles.forEach((vehicle) => {
        if (
          client.name.toLowerCase().includes(normalizedQuery) ||
          (vehicle.brand || '').toLowerCase().includes(normalizedQuery) ||
          (vehicle.model || '').toLowerCase().includes(normalizedQuery) ||
          vehicle.licensePlate.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({ client, vehicle });
        }
      });
    });

    return results.slice(0, limit);
  }, [clients, query, limit]);
}

export function useClientSearch(clients: Client[], query: string, limit = 5): Client[] {
  return useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(normalizedQuery) ||
          (client.phone || '').toLowerCase().includes(normalizedQuery) ||
          (client.email || '').toLowerCase().includes(normalizedQuery),
      )
      .slice(0, limit);
  }, [clients, query, limit]);
}
