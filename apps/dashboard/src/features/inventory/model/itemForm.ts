import type { InventoryCategory, InventoryItem, InventoryItemInput } from '@/features/inventory/model/types';
import type { InventoryItemFormValues } from '@/features/inventory/model/schemas';

export const DEFAULT_UNITS = ['ml', 'L', 'szt', 'm²', 'kg'];

const toText = (n: number) => String(n).replace('.', ',');
const toNumber = (text: string) => Number(text.trim().replace(',', '.'));

/**
 * Initial form values: empty for a new item, the item's values for an edit. The API only sends the
 * category's name, so the id is looked up in `categories` (load them before building the form).
 */
export function itemFormDefaults(item: InventoryItem | null, categories: InventoryCategory[]): InventoryItemFormValues {
  if (!item) return { name: '', description: '', categoryId: null, unit: 'ml', stock: '0', minStock: '' };
  return {
    name: item.name,
    description: item.description ?? '',
    categoryId: categories.find((c) => c.name === item.categoryName)?.id ?? null,
    unit: item.unit,
    stock: toText(item.stock),
    minStock: item.minStock ? toText(item.minStock) : '',
  };
}

/** Body of `POST/PUT /api/Inventory`. A minimum of 0 is sent as "no minimum". */
export function toInventoryItemInput(values: InventoryItemFormValues): InventoryItemInput {
  const minStock = values.minStock ? toNumber(values.minStock) : 0;
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    categoryId: values.categoryId,
    unit: values.unit.trim(),
    stock: toNumber(values.stock),
    minStock: minStock || null,
  };
}
