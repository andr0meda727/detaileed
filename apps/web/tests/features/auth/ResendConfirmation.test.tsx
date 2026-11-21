import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

const resend = vi.fn();

vi.mock('@/shared/lib/supabase/client', () => ({ getSupabase: () => ({ auth: { resend } }) }));

const { ResendConfirmation } = await import('@/features/auth/components/ResendConfirmation');

describe('ResendConfirmation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resend.mockResolvedValue({ error: null });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('sends the confirmation link again, back to the same place', async () => {
    render(<ResendConfirmation email="anna@example.com" next="/studio/s1/book" />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Wyślij ponownie' })));

    expect(resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'anna@example.com',
      options: {
        emailRedirectTo: 'https://detaileed.com/auth/callback?next=%2Fstudio%2Fs1%2Fbook',
        captchaToken: undefined,
      },
    });
    expect(screen.getByRole('status')).toHaveTextContent('Wysłaliśmy link ponownie.');
  });

  it('waits a minute between sends', async () => {
    render(<ResendConfirmation email="anna@example.com" next="/account" justSent />);
    const button = screen.getByRole('button', { name: /Wyślij ponownie/ });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('60 s');

    for (let i = 0; i < 60; i++) await act(async () => vi.advanceTimersByTime(1000));

    expect(button).toBeEnabled();
    expect(button).toHaveTextContent(/^Wyślij ponownie$/);
  });

  it('shows the Polish message when Supabase refuses', async () => {
    resend.mockResolvedValue({ error: { code: 'over_email_send_rate_limit' } });
    render(<ResendConfirmation email="anna@example.com" next="/account" />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Wyślij ponownie' })));

    expect(screen.getByRole('alert')).toHaveTextContent('Wysłaliśmy już e-mail');
  });

  it('stops loading and shows an error when the request fails', async () => {
    resend.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ResendConfirmation email="anna@example.com" next="/account" />);

    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Wyślij ponownie' })));

    expect(screen.getByRole('alert')).toHaveTextContent('Coś poszło nie tak');
    expect(screen.getByRole('button', { name: 'Wyślij ponownie' })).toBeEnabled();
  });
});
