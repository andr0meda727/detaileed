import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const resetPasswordForEmail = vi.fn();

vi.mock('@/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { resetPasswordForEmail } }) }));

const { default: ForgotPasswordForm } = await import('@/features/auth/components/ForgotPasswordForm');

const send = (email: string) => {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } });
  fireEvent.click(screen.getByRole('button', { name: 'Wyślij link' }));
};

describe('ForgotPasswordForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends a link that comes back to the new-password page', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordForm />);
    send('anna@example.com');

    await waitFor(() =>
      expect(resetPasswordForEmail).toHaveBeenCalledWith('anna@example.com', {
        redirectTo: 'https://detaileed.com/auth/callback?next=/nowe-haslo',
        captchaToken: undefined,
      }),
    );
  });

  it("doesn't say whether the account exists", async () => {
    resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<ForgotPasswordForm />);
    send('nobody@example.com');

    expect(await screen.findByText(/Jeśli konto z adresem/)).toHaveTextContent('nobody@example.com');
  });

  it('shows the Polish message when Supabase refuses', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { code: 'over_email_send_rate_limit' } });
    render(<ForgotPasswordForm />);
    send('anna@example.com');

    expect(await screen.findByRole('alert')).toHaveTextContent('Wysłaliśmy już e-mail');
  });
});
