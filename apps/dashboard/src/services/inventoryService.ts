import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient';
import { InventoryResponseDto, InventoryCreateDto, CategoryResponseDto, CategoryCreateDto } from '../types';

export async function getInventory(isLowStock?: boolean, onCacheHit?: (data: InventoryResponseDto[]) => void): Promise<InventoryResponseDto[]> {
    return apiGet<InventoryResponseDto[]>('/Inventory', isLowStock !== undefined ? { isLowStock } : undefined, onCacheHit);
}

export async function getInventoryItem(id: string, onCacheHit?: (data: InventoryResponseDto) => void): Promise<InventoryResponseDto> {
    return apiGet<InventoryResponseDto>(`/Inventory/${id}`, undefined, onCacheHit);
}

export async function createInventoryItem(dto: InventoryCreateDto): Promise<InventoryResponseDto> {
    return apiPost<InventoryResponseDto>('/Inventory', dto);
}

export async function updateInventoryItem(id: string, dto: InventoryCreateDto): Promise<InventoryResponseDto> {
    return apiPut<InventoryResponseDto>(`/Inventory/${id}`, dto);
}

// Categories
export async function getCategories(onCacheHit?: (data: CategoryResponseDto[]) => void): Promise<CategoryResponseDto[]> {
    return apiGet<CategoryResponseDto[]>('/inventory-categories', undefined, onCacheHit);
}

export async function createCategory(dto: CategoryCreateDto): Promise<CategoryResponseDto> {
    return apiPost<CategoryResponseDto>('/inventory-categories', dto);
}

export async function updateCategory(id: string, dto: CategoryCreateDto): Promise<CategoryResponseDto> {
    return apiPut<CategoryResponseDto>(`/inventory-categories/${id}`, dto);
}

export async function deleteCategory(id: string): Promise<void> {
    return apiDelete(`/inventory-categories/${id}`);
}
