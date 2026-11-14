import { describe, expect, it } from 'vitest';
import type { InventoryItem } from '@/features/inventory/model/types';
import { filterInventory } from '@/features/inventory/model/filterInventory';

const item = (name: string, over: Partial<InventoryItem> = {}): InventoryItem =>
  ({
    id: name,
    name,
    categoryName: 'Chemia',
    stock: 10,
    minStock: null,
    unit: 'L',
    description: null,
    ...over,
  }) as InventoryItem;

describe('filterInventory', () => {
  const wax = item('Wosk');
  const shampoo = item('Szampon', { stock: 1, minStock: 5 });
  const towel = item('Ręcznik', { categoryName: 'Akcesoria' });

  it('puts low-stock items first, then sorts by name', () => {
    expect(filterInventory([wax, towel, shampoo], '', null).map((i) => i.name)).toEqual(['Szampon', 'Ręcznik', 'Wosk']);
  });

  it('filters by name or category text and by the selected category', () => {
    expect(filterInventory([wax, towel, shampoo], 'wos', null)).toEqual([wax]);
    expect(filterInventory([wax, towel, shampoo], 'akces', null)).toEqual([towel]);
    expect(filterInventory([wax, towel, shampoo], '', 'Chemia').map((i) => i.name)).toEqual(['Szampon', 'Wosk']);
  });
});
