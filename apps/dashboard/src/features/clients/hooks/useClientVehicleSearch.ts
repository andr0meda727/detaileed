import { useMemo } from 'react';
import { ClientResponseDto, VehicleInfoDto } from '@/types';

export interface ClientVehicleMatch {
  client: ClientResponseDto;
  vehicle: VehicleInfoDto;
}

export function useClientVehicleSearch(clients: ClientResponseDto[], query: string, limit = 5): ClientVehicleMatch[] {
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

export function useClientSearch(clients: ClientResponseDto[], query: string, limit = 5): ClientResponseDto[] {
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
