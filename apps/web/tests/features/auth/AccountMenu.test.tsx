import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

type Listener = (event: string, session: object | null) => void;
let listener: Listener = () => {};
const signOut = vi.fn().mockResolvedValue({ error: null });
const push = vi.fn();
const refresh = vi.fn();

vi.mock('@/shared/lib/supabase/client', () => ({
  getSupabase: () => ({
    auth: {
      signOut,
      onAuthStateChange: (fn: Listener) => {
        listener = fn;
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
    },
  }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh }) }));

const { AccountMenu } = await import('@/features/auth/components/AccountMenu');

describe('AccountMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom has no ResizeObserver; the Radix menu measures its trigger with one.
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  it('offers sign-in and sign-up links to a guest', () => {
    render(<AccountMenu />);
    act(() => listener('INITIAL_SESSION', null));
    expect(screen.getByRole('link', { name: 'Zaloguj się' })).toHaveAttribute('href', '/sign-in');
    expect(screen.getByRole('link', { name: 'Załóż konto' })).toHaveAttribute('href', '/sign-up');
  });

  it('opens a menu with the account and sign-out once signed in', async () => {
    render(<AccountMenu />);
    act(() => listener('SIGNED_IN', { user: {} }));
    fireEvent.keyDown(screen.getByRole('button', { name: 'Moje konto' }), { key: 'Enter' });

    fireEvent.click(await screen.findByRole('menuitem', { name: 'Moje konto' }));
    expect(push).toHaveBeenCalledWith('/account');

    fireEvent.keyDown(screen.getByRole('button', { name: 'Moje konto' }), { key: 'Enter' });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Wyloguj' }));
    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(push).toHaveBeenLastCalledWith('/');
  });
});
