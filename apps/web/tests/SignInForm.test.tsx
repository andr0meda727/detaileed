import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const signInWithPassword = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock('@/shared/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { signInWithPassword } }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, refresh }) }));

const { default: SignInForm } = await import('@/features/auth/components/SignInForm');

const fill = () => {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'anna@example.com' } });
  fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'Haslo1234' } });
  fireEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
};

describe('SignInForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('goes back to `next` after signing in', async () => {
    signInWithPassword.mockResolvedValue({ error: null });
    render(<SignInForm next="/studio/s1/book" />);
    fill();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/studio/s1/book'));
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'anna@example.com',
      password: 'Haslo1234',
      options: { captchaToken: undefined },
    });
  });

  it('shows the Polish message for wrong credentials', async () => {
    signInWithPassword.mockResolvedValue({
      error: { code: 'invalid_credentials', message: 'Invalid login credentials' },
    });
    render(<SignInForm next="/account" />);
    fill();
    expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy e-mail lub hasło.');
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: 'Wyślij link ponownie' })).not.toBeInTheDocument();
  });

  it('offers to resend the confirmation link to an unconfirmed account', async () => {
    signInWithPassword.mockResolvedValue({ error: { code: 'email_not_confirmed' } });
    render(<SignInForm next="/account/bookings" />);
    fill();

    const link = await screen.findByRole('link', { name: 'Wyślij link ponownie' });
    expect(link).toHaveAttribute('href', '/confirm-email?email=anna%40example.com&next=%2Faccount%2Fbookings');
  });
});
