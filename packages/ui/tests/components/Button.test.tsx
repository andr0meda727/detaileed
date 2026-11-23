import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Save } from 'lucide-react';
import { Button } from '../../src/components/Button';

describe('Button', () => {
  it('is a plain button by default, so it never submits a form by accident', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Dodaj</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders a link with the button look and its icon inside when asChild is set', () => {
    render(
      <Button asChild variant="secondary" icon={Save}>
        <a href="/sign-in">Zaloguj się</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Zaloguj się' });
    expect(link).toHaveAttribute('href', '/sign-in');
    expect(link).not.toHaveAttribute('type');
    expect(link).not.toHaveAttribute('disabled');
    expect(link).toHaveClass('border-border-strong', 'h-9');
    expect(link.querySelector('svg')).not.toBeNull();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('submits when asked to', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Zapisz</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('applies the variant, the size and full width, and keeps extra layout classes', () => {
    render(
      <Button variant="danger" size="lg" fullWidth className="mt-4" icon={Save}>
        Usuń
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Usuń' });
    expect(button).toHaveClass('bg-danger', 'text-danger-foreground', 'h-10', 'w-full', 'mt-4');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  it('is an inverted primary, 36px high, by default', () => {
    render(<Button>Zapisz</Button>);
    const button = screen.getByRole('button', { name: 'Zapisz' });
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground', 'h-9', 'focus-visible:ring-2');
    expect(button).not.toHaveClass('uppercase');
  });

  it('draws secondary as an outline and keeps success as an alias of primary', () => {
    render(
      <>
        <Button variant="secondary">Anuluj</Button>
        <Button variant="success" size="sm">
          Zakończ
        </Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Anuluj' })).toHaveClass('border-border-strong', 'bg-transparent');
    expect(screen.getByRole('button', { name: 'Zakończ' })).toHaveClass('bg-primary', 'h-8');
  });

  it('lets layout classes from the caller win', () => {
    render(<Button className="h-12 w-40">Dalej</Button>);
    const button = screen.getByRole('button', { name: 'Dalej' });
    expect(button).toHaveClass('h-12', 'w-40');
    expect(button).not.toHaveClass('h-9');
  });

  it('renders a square icon button named by its aria-label', () => {
    render(<Button icon={Save} variant="ghost" aria-label="Zapisz zmiany" />);
    const button = screen.getByRole('button', { name: 'Zapisz zmiany' });
    expect(button).toHaveClass('size-9');
    expect(button).not.toHaveClass('px-3.5');
  });

  it('does not fire clicks while disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Zapisz
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a spinner and blocks clicks while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading icon={Save} onClick={onClick}>
        Zapisz
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Zapisz' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.animate-spin')).not.toBeNull();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
