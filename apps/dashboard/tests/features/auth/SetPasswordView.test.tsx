import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const auth = { updateUser: vi.fn() };

vi.mock('@/shared/lib/supabase', () => ({ default: { auth } }));

const { default: SetPasswordView } = await import('@/features/auth/components/SetPasswordView');

const submit = (container: HTMLElement) => {
  const [password, confirm] = container.querySelectorAll('input[type="password"]');
  fireEvent.change(password, { target: { value: 'Nowe1234' } });
  fireEvent.change(confirm, { target: { value: 'Nowe1234' } });
  fireEvent.submit(password.closest('form')!);
};

describe('SetPasswordView', () => {
  afterEach(() => vi.clearAllMocks());

  it('continues as soon as the password is saved', async () => {
    auth.updateUser.mockResolvedValue({ error: null });
    const onSuccess = vi.fn();
    const { container } = render(<SetPasswordView onSuccess={onSuccess} />);
    submit(container);

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'Nowe1234', data: { needs_password: false } });
  });

  it('shows the error and stays when saving fails', async () => {
    auth.updateUser.mockResolvedValue({ error: { message: 'Password is too weak' } });
    const onSuccess = vi.fn();
    const { container } = render(<SetPasswordView onSuccess={onSuccess} />);
    submit(container);

    expect(await screen.findByText('Password is too weak')).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
