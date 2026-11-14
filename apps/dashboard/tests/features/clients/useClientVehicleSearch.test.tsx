import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useClientSearch, useClientVehicleSearch } from '@/features/clients/hooks/useClientVehicleSearch';
import type { Client as ClientResponseDto, Vehicle } from '@/features/clients/model/types';

// The API sends sizes as strings ("Medium"); the spec types them as numbers, so cast.
const size = 'Medium' as unknown as Vehicle['size'];

const clientsFixture: ClientResponseDto[] = [
  {
    id: 'c1',
    name: 'Jan Kowalski',
    email: 'jan@example.com',
    phone: '123456789',
    nip: null,
    vehicles: [
      { id: 'v1', licensePlate: 'WX1234A', brand: 'BMW', model: 'M3', size },
      { id: 'v2', licensePlate: 'WW9988Z', brand: 'Audi', model: 'A6', size },
    ],
  },
  {
    id: 'c2',
    name: 'Anna Nowak',
    email: 'anna@example.com',
    phone: '987654321',
    nip: null,
    vehicles: [{ id: 'v3', licensePlate: 'KR12345', brand: 'Tesla', model: 'Model 3', size }],
  },
];

describe('useClientVehicleSearch', () => {
  it('returns matching client-vehicle pairs', () => {
    const { result } = renderHook(() => useClientVehicleSearch(clientsFixture, 'bmw'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].vehicle.id).toBe('v1');
    expect(result.current[0].client.id).toBe('c1');
  });
});

describe('useClientSearch', () => {
  it('returns matching clients by contact data', () => {
    const { result } = renderHook(() => useClientSearch(clientsFixture, 'anna@example'));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('c2');
  });
});
