import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/Badge';

describe('Badge', () => {
  it('uses the tone classes by default', () => {
    render(<Badge tone="amber">Właściciel</Badge>);
    expect(screen.getByText('Właściciel')).toHaveClass('text-amber', 'bg-amber/10');
  });

  it('tints itself with a given colour instead of the tone', () => {
    render(<Badge color="#ef4444">Anulowana</Badge>);
    const badge = screen.getByText('Anulowana');
    expect(badge).not.toHaveClass('text-green-deep');
    expect(badge.style.color).toBe('rgb(239, 68, 68)');
    // jsdom drops color-mix() values, so only the plain colour can be checked here.
  });

  it('falls back to the tone when the colour is missing', () => {
    render(<Badge color={null}>Utworzona</Badge>);
    expect(screen.getByText('Utworzona')).toHaveClass('text-green-deep');
  });
});
