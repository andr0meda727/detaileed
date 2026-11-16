import { describe, expect, it } from 'vitest';
import { inventoryItemFormSchema } from '@/features/inventory/model/schemas';
import { itemFormDefaults, toInventoryItemInput } from '@/features/inventory/model/itemForm';
import type { InventoryItem } from '@/features/inventory/model/types';

const item: InventoryItem = {
  id: 'i1',
  studioId: 's1',
  name: 'Szampon',
  description: null,
  categoryName: 'Chemia',
  unit: 'L',
  stock: 2.5,
  minStock: 1,
};
const categories = [{ id: 'cat1', name: 'Chemia' }] as Parameters<typeof itemFormDefaults>[1];

describe('itemFormDefaults', () => {
  it('starts a new item empty, in ml', () => {
    expect(itemFormDefaults(null, categories)).toEqual({
      name: '',
      description: '',
      categoryId: null,
      unit: 'ml',
      stock: '0',
      minStock: '',
    });
  });

  it('fills an edit with the item, decimal commas and the category id looked up by name', () => {
    expect(itemFormDefaults(item, categories)).toMatchObject({ categoryId: 'cat1', stock: '2,5', minStock: '1' });
  });

  it('leaves the minimum empty when the item has none', () => {
    expect(itemFormDefaults({ ...item, minStock: null }, categories).minStock).toBe('');
  });
});

describe('inventoryItemFormSchema', () => {
  const valid = itemFormDefaults(item, categories);

  it('accepts decimals with a comma or a dot', () => {
    expect(inventoryItemFormSchema.safeParse({ ...valid, stock: '2,5', minStock: '0.5' }).success).toBe(true);
  });

  it('rejects negative or non-numeric quantities and an empty name or unit', () => {
    for (const patch of [{ stock: '-1' }, { stock: 'abc' }, { minStock: '1,' }, { name: ' ' }, { unit: '' }]) {
      expect(inventoryItemFormSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
    }
  });
});

describe('toInventoryItemInput', () => {
  it('keeps decimals instead of rounding them', () => {
    expect(toInventoryItemInput({ ...itemFormDefaults(item, categories), stock: '2,75' })).toEqual({
      name: 'Szampon',
      description: null,
      categoryId: 'cat1',
      unit: 'L',
      stock: 2.75,
      minStock: 1,
    });
  });

  it('sends an empty or zero minimum as no minimum', () => {
    const values = itemFormDefaults(item, categories);
    expect(toInventoryItemInput({ ...values, minStock: '' }).minStock).toBeNull();
    expect(toInventoryItemInput({ ...values, minStock: '0' }).minStock).toBeNull();
  });
});
