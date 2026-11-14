import { apiGet, apiPost, apiPut, apiDelete } from '@/apiClient';
import { ClientResponseDto, CreateClientDto } from '@/types';

export async function getClients(search?: string): Promise<ClientResponseDto[]> {
  return apiGet<ClientResponseDto[]>('/Clients', search ? { search } : undefined);
}

export async function getClient(id: string): Promise<ClientResponseDto> {
  return apiGet<ClientResponseDto>(`/Clients/${id}`, undefined);
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
