import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '../apiClient';
import { BookingResponseDto, BookingCreateDto } from '../types';

export interface BookingFilters {
  isCompleted?: boolean;
  fromDate?: string;
  toDate?: string;
}

const QUERY_KEY = 'bookings';

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => apiGet<BookingResponseDto[]>('/Bookings', filters as Record<string, string | boolean | undefined>),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (dto: BookingCreateDto) => apiPost<BookingResponseDto>('/Bookings', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    meta: { skipGlobalError: true },
    mutationFn: (id: string) => apiDelete(`/Bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
