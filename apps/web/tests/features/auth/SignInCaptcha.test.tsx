import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const signInWithPassword = vi.fn();

vi.mock('@/shared/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { signInWithPassword } }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock('@/shared/lib/site', async (original) => ({ ...(await original()), TURNSTILE_SITE_KEY: 'site-key' }));

const turnstile = {
  render: vi.fn<(container: HTMLElement, options: Record<string, unknown>) => string>(() => 'widget-1'),
  reset: vi.fn(),
  remove: vi.fn(),
};
window.turnstile = turnstile;

const { SignInForm } = await import('@/features/auth/components/SignInForm');

const solve = (token: string) =>
  act(() => (turnstile.render.mock.calls.at(-1)![1].callback as (token: string) => void)(token));

describe('SignInForm with captcha', () => {
  afterEach(() => vi.clearAllMocks());

  it('waits for the captcha, sends its token and asks for a new one afterwards', async () => {
    signInWithPassword.mockResolvedValue({ error: { code: 'invalid_credentials' } });
    render(<SignInForm next="/account" />);
    const submit = screen.getByRole('button', { name: 'Zaloguj się' });
    expect(submit).toBeDisabled();

    await waitFor(() => expect(turnstile.render).toHaveBeenCalled());
    solve('token-1');
    expect(submit).toBeEnabled();

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'anna@example.com' } });
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'Haslo1234' } });
    fireEvent.click(submit);

    await screen.findByRole('alert');
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'anna@example.com',
      password: 'Haslo1234',
      options: { captchaToken: 'token-1' },
    });
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1');
    expect(submit).toBeDisabled();
  });
});
