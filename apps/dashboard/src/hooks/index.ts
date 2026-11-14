/**
 * hooks/index.ts — re-exports all data hooks for convenient imports.
 */
export { useBookings, useCreateBooking, useDeleteBooking } from '@/features/bookings/api/bookings';
export { useClients, useCreateClient, useDeleteClient } from './useClients';
export { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from './useInventory';
export { useServices, useCreateService, useDeleteService } from './useServices';
export { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from './useCategories';
export { useStudios } from '@/features/studios/api/studios';
