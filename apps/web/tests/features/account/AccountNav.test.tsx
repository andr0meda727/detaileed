import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AccountNav } from '@/features/account/components/AccountNav';

vi.mock('next/navigation', () => ({ usePathname: () => '/account/cars' }));

describe('AccountNav', () => {
  it('links every account page and marks the current one', () => {
    render(<AccountNav />);
    expect(screen.getByRole('tablist', { name: 'Konto' })).toBeInTheDocument();
    const current = screen.getByRole('tab', { name: 'Moje auta' });
    expect(current).toHaveAttribute('href', '/account/cars');
    expect(current).toHaveAttribute('aria-selected', 'true');
    expect(current).toHaveAttribute('aria-current', 'page');
    const other = screen.getByRole('tab', { name: 'Hasło' });
    expect(other).toHaveAttribute('href', '/account/security');
    expect(other).toHaveAttribute('aria-selected', 'false');
  });
});
