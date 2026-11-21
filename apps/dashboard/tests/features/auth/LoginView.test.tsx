import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const auth = { signInWithPassword: vi.fn(), resetPasswordForEmail: vi.fn() };

vi.mock('@/shared/lib/supabase', () => ({ supabase: { auth } }));
vi.mock('@/shared/lib/siteConfig', () => ({ TURNSTILE_SITE_KEY: 'site-key' }));

const turnstile = {
  render: vi.fn<(container: HTMLElement, options: Record<string, unknown>) => string>(() => 'widget-1'),
  reset: vi.fn(),
  remove: vi.fn(),
};
window.turnstile = turnstile;

const { LoginView } = await import('@/features/auth/components/LoginView');

const solve = async (token: string) => {
  await waitFor(() => expect(turnstile.render).toHaveBeenCalled());
  act(() => (turnstile.render.mock.calls.at(-1)![1].callback as (token: string) => void)(token));
};

describe('LoginView captcha', () => {
  afterEach(() => vi.clearAllMocks());

  it('sends the captcha token when signing in and shows a Polish message when it is rejected', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: { code: 'captcha_failed', message: 'captcha' } });
    render(<LoginView onLogin={vi.fn()} />);
    const submit = screen.getByRole('button', { name: /Zaloguj się/ });
    expect(submit).toBeDisabled();

    await solve('token-1');
    fireEvent.change(screen.getByPlaceholderText('email@detaileed.com'), { target: { value: 'jan@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'tajne' } });
    fireEvent.click(submit);

    expect(await screen.findByText(/nie jesteś robotem/)).toBeInTheDocument();
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'jan@example.com',
      password: 'tajne',
      options: { captchaToken: 'token-1' },
    });
    expect(turnstile.reset).toHaveBeenCalledWith('widget-1');
  });

  it('sends the captcha token with a password reset', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    render(<LoginView onLogin={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Nie pamiętam hasła/ }));

    await solve('token-2');
    fireEvent.change(screen.getByPlaceholderText('id@detaileed.pl'), { target: { value: 'jan@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Wyślij link resetujący/ }));

    expect(await screen.findByText('Sprawdź skrzynkę')).toBeInTheDocument();
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'jan@example.com',
      expect.objectContaining({ captchaToken: 'token-2' }),
    );
  });
});
