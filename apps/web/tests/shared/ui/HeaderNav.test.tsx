import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ usePathname: () => '/for-studios' }));

const { HeaderMenu, HeaderNav } = await import('@/shared/ui/HeaderNav');

describe('HeaderNav', () => {
  it('links the map and the studio page and marks the current one', () => {
    render(<HeaderNav />);
    const nav = screen.getByRole('navigation', { name: 'Główne' });
    expect(nav).toHaveClass('max-md:hidden');
    expect(screen.getByRole('link', { name: 'Szukaj na mapie' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Dla studiów' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('HeaderMenu', () => {
  beforeEach(() => {
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

  it('opens the links and the theme switch from a menu button on phones', async () => {
    render(<HeaderMenu className="md:hidden" />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    expect(trigger).toHaveClass('md:hidden');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(await screen.findByRole('menuitem', { name: 'Szukaj na mapie' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('menuitem', { name: 'Dla studiów' })).toHaveAttribute('aria-current', 'page');

    const theme = screen.getByRole('radiogroup', { name: 'Motyw' });
    fireEvent.click(screen.getByRole('radio', { name: 'Ciemny' }));
    expect(screen.getByRole('radio', { name: 'Ciemny' })).toBeChecked();
    expect(theme).toBeInTheDocument();
  });
});
