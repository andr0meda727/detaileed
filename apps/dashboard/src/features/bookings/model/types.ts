import type { BookingRequest, BookingResponseDto } from '@detaileed/api-client';

/** A booking with `totalPrice` as a number in złoty (the API may send decimals as strings). */
export type Booking = Omit<BookingResponseDto, 'totalPrice'> & { totalPrice: number };

/** Body of create/update (`POST /api/Bookings`, `PUT /api/Bookings/{id}`); `price` is in złoty. */
export type BookingInput = BookingRequest;

export function toBooking(dto: BookingResponseDto): Booking {
  return { ...dto, totalPrice: Number(dto.totalPrice ?? 0) };
}
