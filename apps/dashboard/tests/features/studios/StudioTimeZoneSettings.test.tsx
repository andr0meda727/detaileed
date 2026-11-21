import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import { StudioScope } from '@/features/studios/model/StudioContext';
import type { Studio } from '@/features/studios/model/types';

const mutate = vi.fn();

// No network or router: only the mutation hook is replaced.
vi.mock('@/features/studios/api/studios', () => ({
  useChangeStudioTimeZone: () => ({ mutate, isPending: false }),
}));

const { StudioTimeZoneSettings } = await import('@/features/studios/components/StudioTimeZoneSettings');

const studio = (role: string): Studio => ({
  studioId: 's1',
  name: 'Detail Kraków',
  role,
  address: null,
  timeZone: 'Europe/Warsaw',
});

const renderAs = (role: string) =>
  render(<StudioTimeZoneSettings />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ToastProvider>
        <StudioScope studio={studio(role)}>{children}</StudioScope>
      </ToastProvider>
    ),
  });

describe('StudioTimeZoneSettings', () => {
  it('lets the owner pick and save another zone', () => {
    renderAs('Owner');
    const save = screen.getByRole('button', { name: 'Zapisz' });
    expect(save).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Strefa czasowa'), { target: { value: 'Europe/London' } });
    fireEvent.click(save);

    expect(mutate).toHaveBeenCalledWith({ studioId: 's1', timeZone: 'Europe/London' }, expect.anything());
  });

  it('shows the zone read-only to other members', () => {
    renderAs('Employee');
    expect(screen.queryByLabelText('Strefa czasowa')).not.toBeInTheDocument();
    expect(screen.getByText('Europe/Warsaw')).toBeInTheDocument();
  });
});
