import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../../src/components/Badge';

const dotOf = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-slot="dot"]');

describe('Badge', () => {
  it('is a neutral pill with a dot by default', () => {
    render(<Badge>Szkic</Badge>);
    const badge = screen.getByText('Szkic');
    expect(badge).toHaveClass('rounded-full', 'bg-muted', 'text-muted-foreground');
    expect(dotOf(badge)).toHaveClass('bg-current');
    expect(badge).not.toHaveClass('uppercase');
  });

  it.each([
    ['info', 'bg-info-soft', 'text-info'],
    ['success', 'bg-success-soft', 'text-success'],
    ['warning', 'bg-warning-soft', 'text-warning'],
    ['danger', 'bg-danger-soft', 'text-danger'],
  ] as const)('uses the soft fill and toned text for %s', (tone, fill, text) => {
    render(<Badge tone={tone}>Status</Badge>);
    expect(screen.getByText('Status')).toHaveClass(fill, text);
  });

  it('puts a given colour on the dot only, on a neutral pill', () => {
    render(
      <Badge tone="danger" color="#ef4444">
        Anulowana
      </Badge>,
    );
    const badge = screen.getByText('Anulowana');
    expect(badge).toHaveClass('bg-muted', 'text-muted-foreground');
    expect(badge.style.color).toBe('');
    expect(dotOf(badge)?.style.backgroundColor).toBe('rgb(239, 68, 68)');
  });

  it('falls back to the tone when the colour is missing', () => {
    render(
      <Badge tone="info" color={null}>
        Utworzona
      </Badge>,
    );
    expect(screen.getByText('Utworzona')).toHaveClass('text-info');
  });

  it('can drop the dot', () => {
    render(<Badge dot={false}>3</Badge>);
    expect(dotOf(screen.getByText('3'))).toBeNull();
  });
});
