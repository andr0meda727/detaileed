import type { Client } from '@/features/clients/model/types';

/** Case-insensitive match on name, phone, email and any vehicle's plate, brand or model. */
export function filterClients(clients: Client[], query: string): Client[] {
  const q = query.trim().toLowerCase();
  if (!q) return clients;
  const has = (value: string | null | undefined) => (value ?? '').toLowerCase().includes(q);
  return clients.filter(
    (c) =>
      has(c.name) ||
      has(c.phone) ||
      has(c.email) ||
      c.vehicles.some((v) => has(v.licensePlate) || has(v.brand) || has(v.model)),
  );
}
