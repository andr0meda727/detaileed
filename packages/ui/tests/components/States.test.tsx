import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { EmptyState } from '../../src/components/EmptyState';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { Skeleton } from '../../src/components/Skeleton';

describe('EmptyState', () => {
  it('shows the icon in a muted circle, the message and one action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Brak zapytań"
        message="Opublikuj profil studia."
        action={<button type="button">Opublikuj</button>}
      />,
    );
    expect(screen.getByText('Brak zapytań')).toBeInTheDocument();
    expect(screen.getByText('Opublikuj profil studia.')).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('button', { name: 'Opublikuj' })).toBeInTheDocument();
  });

  it('has a default message', () => {
    render(<EmptyState />);
    expect(screen.getByText('Brak danych')).toBeInTheDocument();
  });
});

describe('LoadingSpinner', () => {
  it('is a status with screen-reader text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Ładowanie…');
  });

  it('uses its size, className and fullPage props', () => {
    render(<LoadingSpinner size={32} className="py-4" fullPage />);
    const status = screen.getByRole('status');
    expect(status).toHaveClass('min-h-screen', 'py-4');
    expect(status.querySelector('svg')).toHaveAttribute('width', '32');
  });
});

describe('Skeleton', () => {
  it('is a hidden muted block that pulses only without reduced motion', () => {
    const { container } = render(<Skeleton width="100%" height="80px" />);
    const block = container.firstChild as HTMLElement;
    expect(block).toHaveAttribute('aria-hidden', 'true');
    expect(block).toHaveClass('bg-muted', 'motion-safe:animate-pulse', 'rounded-md');
    expect(block.style.height).toBe('80px');
  });

  it('lets className override the shape', () => {
    const { container } = render(<Skeleton className="rounded-2xl" circle />);
    const block = container.firstChild as HTMLElement;
    expect(block).toHaveClass('rounded-2xl');
    expect(block).not.toHaveClass('rounded-full');
  });
});
