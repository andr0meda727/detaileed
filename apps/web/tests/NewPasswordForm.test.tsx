import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const updateUser = vi.fn();
const signOut = vi.fn();
const replace = vi.fn();
const addToast = vi.fn();

vi.mock('@/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { updateUser, signOut } }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh: vi.fn() }) }));
vi.mock('@detaileed/ui', async (original) => ({
  ...(await original<typeof import('@detaileed/ui')>()),
  useToast: () => ({ addToast }),
}));

const { default: NewPasswordForm } = await import('@/features/auth/components/NewPasswordForm');

const submit = (password: string, confirm = password) => {
  fireEvent.change(screen.getByLabelText('Nowe hasło'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Powtórz nowe hasło'), { target: { value: confirm } });
  fireEvent.click(screen.getByRole('button', { name: 'Ustaw hasło' }));
};

describe('NewPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signOut.mockResolvedValue({ error: null });
  });

  it('sets the password, signs out other devices and opens the account', async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<NewPasswordForm />);
    submit('Nowe1234');

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/konto'));
    expect(updateUser).toHaveBeenCalledWith({ password: 'Nowe1234' });
    expect(signOut).toHaveBeenCalledWith({ scope: 'others' });
    expect(addToast).toHaveBeenCalledWith('Hasło zostało zmienione.', 'success');
  });

  it('asks for a different password than the old one', async () => {
    updateUser.mockResolvedValue({ error: { code: 'same_password' } });
    render(<NewPasswordForm />);
    submit('Stare1234');

    expect(await screen.findByRole('alert')).toHaveTextContent('różnić od obecnego');
    expect(signOut).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('sends a long-signed-in customer to the account page, which asks for a code', async () => {
    updateUser.mockResolvedValue({ error: { code: 'reauthentication_needed' } });
    render(<NewPasswordForm />);
    submit('Nowe1234');

    expect(await screen.findByRole('alert')).toHaveTextContent('wyślemy Ci kod na e-mail');
    expect(screen.getByRole('link', { name: 'Przejdź do ustawień' })).toHaveAttribute('href', '/konto/bezpieczenstwo');
    expect(replace).not.toHaveBeenCalled();
  });

  it("doesn't send passwords that don't match", async () => {
    render(<NewPasswordForm />);
    submit('Nowe1234', 'Nowe12345');

    expect(await screen.findByText('Hasła muszą być takie same')).toBeInTheDocument();
    expect(updateUser).not.toHaveBeenCalled();
  });
});
