import { describe, expect, it } from 'vitest';
import type { Client } from '@/features/clients/model/types';
import { filterClients } from '@/features/clients/model/filterClients';

const client = (over: Partial<Client>): Client =>
  ({ id: 'c', name: 'Jan Kowalski', email: null, phone: '500600700', nip: null, vehicles: [], ...over }) as Client;

describe('filterClients', () => {
  const jan = client({ id: 'jan' });
  const anna = client({
    id: 'anna',
    name: 'Anna Nowak',
    email: 'Anna@Example.com',
    phone: '111222333',
    vehicles: [{ id: 'v', licensePlate: 'KR 12345', brand: 'Tesla', model: null } as Client['vehicles'][number]],
  });

  it('returns everyone for an empty query', () => {
    expect(filterClients([jan, anna], ' ')).toEqual([jan, anna]);
  });

  it('matches name, phone, email and vehicles case-insensitively', () => {
    expect(filterClients([jan, anna], 'kowal')).toEqual([jan]);
    expect(filterClients([jan, anna], '500600')).toEqual([jan]);
    expect(filterClients([jan, anna], 'anna@')).toEqual([anna]);
    expect(filterClients([jan, anna], 'kr 123')).toEqual([anna]);
    expect(filterClients([jan, anna], 'tesla')).toEqual([anna]);
  });
});
