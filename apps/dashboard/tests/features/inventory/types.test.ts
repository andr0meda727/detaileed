import { describe, expect, it } from 'vitest';
import type { InventoryResponseDto } from '@detaileed/api-client';
import { isLowStock, toInventoryItem } from '@/features/inventory/model/types';

describe('inventory items', () => {
  it('turns quantities into numbers', () => {
    const item = toInventoryItem({ id: '1', stock: '2.5', minStock: '3' } as InventoryResponseDto);
    expect(item.stock).toBe(2.5);
    expect(item.minStock).toBe(3);
    expect(toInventoryItem({ id: '2', stock: 1, minStock: null } as InventoryResponseDto).minStock).toBeNull();
  });

  it('flags items below their minimum', () => {
    expect(isLowStock({ stock: 2, minStock: 3 })).toBe(true);
    expect(isLowStock({ stock: 3, minStock: 3 })).toBe(false);
    expect(isLowStock({ stock: 0, minStock: null })).toBe(false);
  });
});
