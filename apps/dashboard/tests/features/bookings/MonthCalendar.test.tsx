import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MonthCalendar } from '@/features/bookings/components/tasks/MonthCalendar';

const props = {
  month: '2026-11',
  selectedDate: '2026-11-16',
  today: '2026-11-23',
  hasBookings: (date: string) => date === '2026-11-20',
};

describe('MonthCalendar', () => {
  it('marks the picked day, names days with bookings and picks a day', () => {
    const onSelectDate = vi.fn();
    render(<MonthCalendar {...props} onShiftMonth={vi.fn()} onSelectDate={onSelectDate} />);

    expect(screen.getByRole('button', { name: '16 listopada' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '20 listopada, są rezerwacje' }));
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-20');
  });

  it('moves between months', () => {
    const onShiftMonth = vi.fn();
    render(<MonthCalendar {...props} onShiftMonth={onShiftMonth} onSelectDate={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Następny miesiąc' }));
    fireEvent.click(screen.getByRole('button', { name: 'Poprzedni miesiąc' }));
    expect(onShiftMonth.mock.calls).toEqual([[1], [-1]]);
  });
});
