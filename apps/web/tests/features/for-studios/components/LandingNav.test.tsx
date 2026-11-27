import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';

vi.mock('next/navigation', () => ({ usePathname: () => '/for-studios' }));
// jsdom has no ResizeObserver; the Radix menu measures its trigger with one.
vi.stubGlobal(
  'ResizeObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

const { LandingNav } = await import('@/features/for-studios/components/LandingNav');

describe('LandingNav', () => {
  it('puts the section links and the theme switch behind a menu button on phones', async () => {
    render(<LandingNav />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    expect(trigger).toHaveClass('md:hidden');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(await screen.findByRole('menuitem', { name: 'Cennik' })).toHaveAttribute('href', '#pricing');
    expect(screen.getByRole('menuitem', { name: 'Demo' })).toHaveAttribute('href', '#demo');
    expect(within(screen.getByRole('menu')).getByRole('radiogroup', { name: 'Motyw' })).toBeInTheDocument();
  });
});
