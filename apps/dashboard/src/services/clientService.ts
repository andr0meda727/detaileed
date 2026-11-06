import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient';
import { ClientResponseDto, CreateClientDto } from '../types';

export async function getClients(search?: string, onCacheHit?: (data: ClientResponseDto[]) => void): Promise<ClientResponseDto[]> {
    return apiGet<ClientResponseDto[]>('/Clients', search ? { search } : undefined, onCacheHit);
}

export async function getClient(id: string, onCacheHit?: (data: ClientResponseDto) => void): Promise<ClientResponseDto> {
    return apiGet<ClientResponseDto>(`/Clients/${id}`, undefined, onCacheHit);
}

export async function createClient(dto: CreateClientDto): Promise<ClientResponseDto> {
    return apiPost<ClientResponseDto>('/Clients', dto);
}

export async function updateClient(id: string, dto: CreateClientDto): Promise<ClientResponseDto> {
    return apiPut<ClientResponseDto>(`/Clients/${id}`, dto);
}

export async function deleteClient(id: string): Promise<void> {
    return apiDelete(`/Clients/${id}`);
}
