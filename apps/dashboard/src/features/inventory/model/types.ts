import type { CategoryResponseDto, InventoryCreateDto, InventoryResponseDto } from '@detaileed/api-client';

/** A stock item with quantities as numbers (the API may send decimals as strings). */
export type InventoryItem = Omit<InventoryResponseDto, 'stock' | 'minStock'> & {
  stock: number;
  minStock: number | null;
};

/** Body of `POST/PUT /api/Inventory`; a changed `stock` on update is recorded as a stocktake. */
export type InventoryItemInput = InventoryCreateDto;

export type InventoryCategory = CategoryResponseDto;

export function toInventoryItem(dto: InventoryResponseDto): InventoryItem {
  return { ...dto, stock: Number(dto.stock), minStock: dto.minStock === null ? null : Number(dto.minStock) };
}

/** Below its minimum stock (items without a minimum never are). */
export function isLowStock(item: Pick<InventoryItem, 'stock' | 'minStock'>): boolean {
  return item.minStock !== null && item.stock < item.minStock;
}
