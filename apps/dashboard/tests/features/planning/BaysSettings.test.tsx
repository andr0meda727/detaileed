import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApiError } from '@detaileed/api-client';
import { ToastProvider } from '@detaileed/ui';

const create = vi.fn();
const rename = vi.fn();
const remove = vi.fn();
vi.mock('@/features/planning/api/planning', () => ({
  useBays: () => ({
    isLoading: false,
    data: [
      { id: 'b1', name: 'Stanowisko 1', isActive: true },
      { id: 'b0', name: 'Stare', isActive: false },
    ],
  }),
  useCreateBay: () => ({ mutate: create, isPending: false }),
  useRenameBay: () => ({ mutate: rename, isPending: false }),
  useDeleteBay: () => ({ mutate: remove, isPending: false }),
}));

const { default: BaysSettings } = await import('@/features/planning/components/BaysSettings');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('BaysSettings', () => {
  it('lists active bays and lets the owner add, rename and switch one off', async () => {
    remove.mockImplementation((_id, opts) => opts.onError(new ApiError(409, { code: 'BAY_HAS_UPCOMING_BOOKINGS' })));
    render(<BaysSettings canEdit />, { wrapper });
    expect(screen.getByText('Stanowiska (1/20)')).toBeInTheDocument();
    expect(screen.queryByText('Stare')).toBeNull();

    fireEvent.change(screen.getByLabelText('Nowe stanowisko'), { target: { value: 'Stanowisko 2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    expect(create).toHaveBeenCalledWith('Stanowisko 2', expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Zmień nazwę: Stanowisko 1' }));
    fireEvent.change(screen.getByLabelText('Nazwa stanowiska'), { target: { value: 'Myjnia' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz nazwę' }));
    expect(rename).toHaveBeenCalledWith({ id: 'b1', name: 'Myjnia' }, expect.anything());

    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wyłącz: Stanowisko 1' }));
    expect(await screen.findByText(/nadchodzące rezerwacje/)).toBeInTheDocument();
  });

  it('is read-only for staff', () => {
    render(<BaysSettings canEdit={false} />, { wrapper });
    expect(screen.queryByRole('button', { name: 'Dodaj' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Wyłącz/ })).toBeNull();
  });
});
