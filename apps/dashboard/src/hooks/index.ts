/**
 * hooks/index.ts — re-exports all data hooks for convenient imports.
 */
export { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from './useInventory';
export { useServices, useCreateService, useDeleteService } from '@/features/services/api/services';
export { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from './useCategories';
