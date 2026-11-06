import { apiGet, apiPost, apiDelete } from '../apiClient';
import { ServiceResponseDto, CreateServiceDto } from '../types';

export async function getServices(onCacheHit?: (data: ServiceResponseDto[]) => void): Promise<ServiceResponseDto[]> {
    return apiGet<ServiceResponseDto[]>('/Service', undefined, onCacheHit);
}

export async function createService(dto: CreateServiceDto): Promise<ServiceResponseDto> {
    return apiPost<ServiceResponseDto>('/Service', dto);
}

export async function deleteService(id: string): Promise<void> {
    return apiDelete(`/Service/${id}`);
}
