import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Save } from 'lucide-react';
import Button from '../src/components/Button';

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
    expect(button).toHaveClass('bg-red-50', 'py-5', 'w-full', 'mt-4');
    expect(button.querySelector('svg')).not.toBeNull();
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
