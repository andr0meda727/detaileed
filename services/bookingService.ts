import { apiGet, apiPost, apiPut, apiDelete } from '../apiClient';
import { BookingResponseDto, BookingCreateDto } from '../types';

export interface BookingFilters {
    isCompleted?: boolean;
    fromDate?: string;
    toDate?: string;
}

export async function getBookings(filters?: BookingFilters, onCacheHit?: (data: BookingResponseDto[]) => void): Promise<BookingResponseDto[]> {
    return apiGet<BookingResponseDto[]>('/Bookings', filters as Record<string, string | boolean | undefined>, onCacheHit);
}

export async function getBooking(id: string, onCacheHit?: (data: BookingResponseDto) => void): Promise<BookingResponseDto> {
    return apiGet<BookingResponseDto>(`/Bookings/${id}`, undefined, onCacheHit);
}

export async function createBooking(dto: BookingCreateDto): Promise<BookingResponseDto> {
    return apiPost<BookingResponseDto>('/Bookings', dto);
}

export async function updateBooking(id: string, dto: BookingCreateDto): Promise<BookingResponseDto> {
    return apiPut<BookingResponseDto>(`/Bookings/${id}`, dto);
}

export async function deleteBooking(id: string): Promise<void> {
    return apiDelete(`/Bookings/${id}`);
}
