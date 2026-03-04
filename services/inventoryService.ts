import { apiGet, apiPost, apiPut } from '../apiClient';
import { InventoryResponseDto, InventoryCreateDto } from '../types';

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
