/**
 * hooks/index.ts — re-exports all data hooks for convenient imports.
 */
export { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from '@/features/inventory/api/inventory';
export { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/features/inventory/api/categories';
