import { isLowStock, type InventoryItem } from '@/features/inventory/model/types';

/**
 * Items matching the search (name or category) and the selected category, low-stock items first,
 * then by name.
 */
export function filterInventory(items: InventoryItem[], query: string, category: string | null): InventoryItem[] {
  const q = query.trim().toLowerCase();
  return items
    .filter((i) => !q || i.name.toLowerCase().includes(q) || (i.categoryName ?? '').toLowerCase().includes(q))
    .filter((i) => !category || i.categoryName === category)
    .sort((a, b) => Number(isLowStock(b)) - Number(isLowStock(a)) || a.name.localeCompare(b.name));
}
