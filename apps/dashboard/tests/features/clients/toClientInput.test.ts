import { describe, expect, it } from 'vitest';
import { newClientWithVehicleSchema } from '@/features/clients/model/schemas';
import { toNewClientInput, toVehicleFields } from '@/features/clients/model/toClientInput';

const valid = {
  name: 'Jan Kowalski',
  phone: '500600700',
  email: '',
  nip: '',
  vehicle: { brand: 'BMW', model: '', licensePlate: 'wx 1234a' },
};

describe('newClientWithVehicleSchema', () => {
  it('accepts a client with a vehicle', () => {
    expect(newClientWithVehicleSchema.safeParse(valid).success).toBe(true);
  });

  it('reports the missing plate under vehicle.licensePlate', () => {
    const result = newClientWithVehicleSchema.safeParse({ ...valid, vehicle: { ...valid.vehicle, licensePlate: '' } });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['vehicle', 'licensePlate']);
  });

  it('rejects an invalid phone number', () => {
    expect(newClientWithVehicleSchema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false);
  });
});

describe('toVehicleFields', () => {
  it('upper-cases the plate and turns empty optional fields into null', () => {
    expect(toVehicleFields({ brand: ' BMW ', model: '', licensePlate: ' wx1234a ' })).toEqual({
      licensePlate: 'WX1234A',
      brand: 'BMW',
      model: null,
    });
  });
});

describe('toNewClientInput', () => {
  it('builds the create-client body with the vehicle', () => {
    expect(toNewClientInput({ ...valid, name: ' Jan Kowalski ', email: 'jan@example.com' })).toEqual({
      name: 'Jan Kowalski',
      phone: '500600700',
      email: 'jan@example.com',
      nip: null,
      vehicle: { licensePlate: 'WX 1234A', brand: 'BMW', model: null },
    });
  });
});
