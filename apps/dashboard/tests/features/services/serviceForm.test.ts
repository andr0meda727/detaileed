import { describe, expect, it } from 'vitest';
import type { ServiceResponseDto } from '@detaileed/api-client';
import { fromPrice, toService } from '@/features/services/model/types';
import { serviceFormSchema } from '@/features/services/model/schemas';
import { serviceFormDefaults, toServiceInput } from '@/features/services/model/serviceForm';

const dto: ServiceResponseDto = {
  id: 's1',
  name: 'Pranie tapicerki',
  category: 'Interior',
  prices: [
    { vehicleSize: 'Medium', price: '249.99' },
    { vehicleSize: 'Large', price: 349 },
  ],
  durationMinutes: '90',
};

describe('toService', () => {
  it('turns string numbers into numbers', () => {
    const service = toService(dto);
    expect(service.durationMinutes).toBe(90);
    expect(service.prices).toEqual([
      { vehicleSize: 'Medium', price: 249.99 },
      { vehicleSize: 'Large', price: 349 },
    ]);
  });

  it('gives the lowest price, or null when all are on request', () => {
    expect(fromPrice(toService(dto))).toBe(249.99);
    expect(fromPrice({ prices: [] })).toBeNull();
  });
});

describe('service form', () => {
  it('starts a new service as Other, 60 minutes, without prices', () => {
    expect(serviceFormDefaults(null)).toEqual({
      name: '',
      category: 'Other',
      durationMinutes: '60',
      prices: { Small: '', Medium: '', Large: '', XL: '' },
    });
  });

  it('fills an edit with the prices per size, decimal commas', () => {
    expect(serviceFormDefaults(toService(dto)).prices).toEqual({ Small: '', Medium: '249,99', Large: '349', XL: '' });
  });

  it('sends only the filled prices, in size order, so empty ones become "on request"', () => {
    const values = {
      ...serviceFormDefaults(toService(dto)),
      prices: { Small: '199', Medium: '', Large: '349,5', XL: '' },
    };
    expect(toServiceInput(values)).toEqual({
      name: 'Pranie tapicerki',
      category: 'Interior',
      durationMinutes: 90,
      prices: [
        { vehicleSize: 'Small', price: 199 },
        { vehicleSize: 'Large', price: 349.5 },
      ],
    });
  });

  it('validates the duration and the prices', () => {
    const ok = serviceFormDefaults(toService(dto));
    expect(serviceFormSchema.safeParse(ok).success).toBe(true);
    expect(serviceFormSchema.safeParse({ ...ok, durationMinutes: '3' }).success).toBe(false);
    expect(serviceFormSchema.safeParse({ ...ok, durationMinutes: '1h' }).success).toBe(false);
    expect(serviceFormSchema.safeParse({ ...ok, prices: { ...ok.prices, XL: '12,345' } }).success).toBe(false);
    expect(serviceFormSchema.safeParse({ ...ok, prices: { ...ok.prices, XL: '-5' } }).success).toBe(false);
  });
});
