import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const updateUser = vi.fn();
const signOut = vi.fn();
const reauthenticate = vi.fn();
const addToast = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({ auth: { updateUser, signOut, reauthenticate } }),
}));
vi.mock('@detaileed/ui', async (original) => ({
  ...(await original<typeof import('@detaileed/ui')>()),
  useToast: () => ({ addToast }),
}));

const { default: ChangePasswordForm } = await import('@/features/account/components/ChangePasswordForm');

const submit = (password: string) => {
  fireEvent.change(screen.getByLabelText('Nowe hasło'), { target: { value: password } });
  fireEvent.change(screen.getByLabelText('Powtórz nowe hasło'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Zmień hasło' }));
};

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signOut.mockResolvedValue({ error: null });
  });

  it('changes the password and signs out other devices', async () => {
    updateUser.mockResolvedValue({ error: null });
    render(<ChangePasswordForm />);
    submit('Nowe1234');

    await waitFor(() => expect(addToast).toHaveBeenCalledWith('Hasło zostało zmienione.', 'success'));
    expect(updateUser).toHaveBeenCalledWith({ password: 'Nowe1234' });
    expect(signOut).toHaveBeenCalledWith({ scope: 'others' });
  });

  it('asks for the emailed code when Supabase wants to reauthenticate', async () => {
    updateUser
      .mockResolvedValueOnce({ error: { code: 'reauthentication_needed' } })
      .mockResolvedValueOnce({ error: null });
    reauthenticate.mockResolvedValue({ error: null });
    render(<ChangePasswordForm />);
    submit('Nowe1234');

    const codeInput = await screen.findByLabelText('Kod z e-maila');
    expect(reauthenticate).toHaveBeenCalled();
    fireEvent.change(codeInput, { target: { value: ' 123456 ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Potwierdź i zmień hasło' }));

    await waitFor(() => expect(addToast).toHaveBeenCalledWith('Hasło zostało zmienione.', 'success'));
    expect(updateUser).toHaveBeenLastCalledWith({ password: 'Nowe1234', nonce: '123456' });
  });

  it('shows a wrong code and lets the customer try again', async () => {
    updateUser
      .mockResolvedValueOnce({ error: { code: 'reauthentication_needed' } })
      .mockResolvedValueOnce({ error: { code: 'reauthentication_not_valid' } });
    reauthenticate.mockResolvedValue({ error: null });
    render(<ChangePasswordForm />);
    submit('Nowe1234');

    fireEvent.change(await screen.findByLabelText('Kod z e-maila'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Potwierdź i zmień hasło' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Kod jest nieprawidłowy');
    expect(screen.getByLabelText('Kod z e-maila')).toBeInTheDocument();
    expect(addToast).not.toHaveBeenCalled();
  });
});
