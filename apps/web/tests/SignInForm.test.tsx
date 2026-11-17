import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const signInWithPassword = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { signInWithPassword } }) }));
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
    render(<SignInForm next="/studio/s1/rezerwuj" />);
    fill();
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/studio/s1/rezerwuj'));
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
    render(<SignInForm next="/konto" />);
    fill();
    expect(await screen.findByRole('alert')).toHaveTextContent('Nieprawidłowy e-mail lub hasło.');
    expect(replace).not.toHaveBeenCalled();
  });
});
