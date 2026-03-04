import { apiPost } from '../apiClient';
import { VehicleInfoDto, CreateVehicleDto } from '../types';

export async function createVehicle(dto: CreateVehicleDto): Promise<VehicleInfoDto> {
    return apiPost<VehicleInfoDto>('/Vehicles', dto);
}
