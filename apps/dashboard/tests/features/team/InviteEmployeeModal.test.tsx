import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InviteEmployeeModal } from '@/features/team/components/InviteEmployeeModal';

beforeEach(() => {
  // jsdom has no ResizeObserver; Radix radio groups measure their items with one.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('InviteEmployeeModal', () => {
  it('invites an employee by default, or the picked role', async () => {
    const onInvite = vi.fn(async () => {});
    render(<InviteEmployeeModal isOpen onClose={vi.fn()} onInvite={onInvite} />);

    expect(screen.getByRole('radio', { name: 'Pracownik' })).toBeChecked();

    fireEvent.change(screen.getByLabelText('Email do logowania'), { target: { value: 'jan@studio.pl' } });
    fireEvent.click(screen.getByRole('radio', { name: 'Manager' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij zaproszenie' }));

    await waitFor(() => expect(onInvite).toHaveBeenCalledWith(2, 'jan@studio.pl'));
  });
});
