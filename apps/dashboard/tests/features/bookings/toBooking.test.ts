import { describe, expect, it } from 'vitest';
import type { BookingResponseDto } from '@detaileed/api-client';
import { toBooking } from '@/features/bookings/model/types';

const dto = (totalPrice: BookingResponseDto['totalPrice']) => ({ id: '1', totalPrice }) as BookingResponseDto;

describe('toBooking', () => {
  it('turns the price into a number of złoty', () => {
    expect(toBooking(dto('249.99')).totalPrice).toBe(249.99);
    expect(toBooking(dto(120)).totalPrice).toBe(120);
    expect(toBooking(dto(null)).totalPrice).toBe(0);
  });
});
