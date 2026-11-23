import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { Schedule } from '@/features/planning/model/types';

const save = vi.fn();
vi.mock('@/features/planning/api/planning', () => ({ useSaveSchedule: () => ({ mutate: save, isPending: false }) }));

const { ScheduleSettings } = await import('@/features/planning/components/settings/ScheduleSettings');

const schedule: Schedule = {
  planningEnabled: false,
  openingHours: [{ day: 'Monday', opens: '08:00', closes: '16:00' }],
  closures: [],
  bufferMinutes: 15,
  slotStepMinutes: 15,
  minLeadHours: 12,
  durationMultipliers: { small: 0.85, medium: 1, large: 1.25, xl: 1.5 },
};
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

// jsdom has no ResizeObserver; the Radix switch measures itself with one.
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('ScheduleSettings', () => {
  it('copies Monday to the workdays and saves the hours', async () => {
    render(<ScheduleSettings schedule={schedule} canEdit />, { wrapper });
    expect(screen.getAllByText('Zamknięte')).toHaveLength(6);

    fireEvent.click(screen.getByRole('button', { name: 'Pon. na wt.–pt.' }));
    expect(screen.getAllByText('Zamknięte')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz godziny i zasady' }));

    await waitFor(() => expect(save).toHaveBeenCalled());
    const body = save.mock.calls[0][0];
    expect(body.openingHours.map((p: { day: string }) => p.day)).toEqual([
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ]);
    expect(body.openingHours[0]).toEqual({ day: 'Monday', opens: '08:00:00', closes: '16:00:00' });
  });

  it('shows an overlap instead of saving', async () => {
    save.mockClear();
    render(<ScheduleSettings schedule={schedule} canEdit />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj przedział (przerwa)' }));
    // The new period starts at 13:00; move it inside the morning one.
    fireEvent.change(screen.getAllByLabelText('Poniedziałek: otwarcie')[1], { target: { value: '15:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz godziny i zasady' }));
    expect(await screen.findByText('Nachodzi na inny przedział')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
  });

  it('is read-only for staff', () => {
    render(<ScheduleSettings schedule={schedule} canEdit={false} />, { wrapper });
    expect(screen.queryByRole('button', { name: 'Zapisz godziny i zasady' })).toBeNull();
    expect(screen.getAllByLabelText('Poniedziałek: otwarcie')[0]).toBeDisabled();
  });

  it('opens and closes a day with its switch', () => {
    render(<ScheduleSettings schedule={schedule} canEdit />, { wrapper });
    const tuesday = screen.getByRole('switch', { name: 'Wtorek: otwarte' });
    expect(tuesday).not.toBeChecked();

    fireEvent.click(tuesday);
    expect(screen.getAllByText('Zamknięte')).toHaveLength(5);
    expect(screen.getByLabelText('Wtorek: otwarcie')).toHaveValue('08:00');

    fireEvent.click(screen.getByRole('switch', { name: 'Poniedziałek: otwarte' }));
    expect(screen.getAllByText('Zamknięte')).toHaveLength(6);
  });
});
