import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';

const add = vi.fn();
const remove = vi.fn();
vi.mock('@/features/planning/api/planning', () => ({
  useAddClosure: () => ({ mutate: add, isPending: false }),
  useRemoveClosure: () => ({ mutate: remove, isPending: false }),
}));

const { default: ClosuresSettings } = await import('@/features/planning/components/ClosuresSettings');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('ClosuresSettings', () => {
  it('lists upcoming closures only and adds and removes them', () => {
    render(
      <ClosuresSettings
        closures={[
          { date: '2099-12-24', reason: 'Wigilia' },
          { date: '2000-01-01', reason: 'Dawno' },
        ]}
        canEdit
      />,
      { wrapper },
    );
    expect(screen.getByText('Wigilia')).toBeInTheDocument();
    expect(screen.queryByText('Dawno')).toBeNull();

    fireEvent.change(screen.getByLabelText('Dzień zamknięcia'), { target: { value: '2099-12-31' } });
    fireEvent.change(screen.getByLabelText('Powód'), { target: { value: 'Sylwester' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    expect(add).toHaveBeenCalledWith({ date: '2099-12-31', reason: 'Sylwester' }, expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Usuń zamknięcie 2099-12-24' }));
    expect(remove).toHaveBeenCalledWith('2099-12-24', expect.anything());
  });
});
