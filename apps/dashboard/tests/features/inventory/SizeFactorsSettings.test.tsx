import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';

const save = vi.fn();
vi.mock('@/features/inventory/api/ledger', () => ({
  useSizeFactors: () => ({ isLoading: false, data: { small: 0.75, medium: 1, large: 1.3, xl: 1.6 } }),
  useSaveSizeFactors: () => ({ mutate: save, isPending: false }),
}));

const { default: SizeFactorsSettings } = await import('@/features/inventory/components/SizeFactorsSettings');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('SizeFactorsSettings', () => {
  it('saves the factors with Polish decimals', () => {
    render(<SizeFactorsSettings canEdit />, { wrapper });
    fireEvent.change(screen.getByDisplayValue('1,3'), { target: { value: '1,35' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz mnożniki' }));
    expect(save).toHaveBeenCalledWith({ small: 0.75, medium: 1, large: 1.35, xl: 1.6 }, expect.anything());
  });

  it('refuses a bad factor and is read-only for staff', () => {
    save.mockClear();
    const { unmount } = render(<SizeFactorsSettings canEdit />, { wrapper });
    fireEvent.change(screen.getByDisplayValue('1,6'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz mnożniki' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();
    unmount();

    render(<SizeFactorsSettings canEdit={false} />, { wrapper });
    expect(screen.queryByRole('button', { name: 'Zapisz mnożniki' })).toBeNull();
    expect(screen.getByDisplayValue('1,3')).toBeDisabled();
  });
});
