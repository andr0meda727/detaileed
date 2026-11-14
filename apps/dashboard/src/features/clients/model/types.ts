import type { ClientRequest, ClientResponseDto, VehicleRequest, VehicleResponseDto } from '@detaileed/api-client';

export type Client = ClientResponseDto;
export type Vehicle = VehicleResponseDto;
/** Body of `POST/PUT /api/Clients`; `vehicle` is only used on create. */
export type ClientInput = ClientRequest;
/** Body of `POST/PUT /api/Vehicle`. */
export type VehicleInput = VehicleRequest;
