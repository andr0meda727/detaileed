import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Alert } from '../../src/components/Alert';
import { Pagination } from '../../src/components/Pagination';
import { Avatar } from '../../src/components/Avatar';
import { Kbd } from '../../src/components/Kbd';
import { LicensePlate } from '../../src/components/LicensePlate';
import { initials } from '../../src/lib/initials';

describe('Alert', () => {
  it('announces danger at once, with its title and action', () => {
    render(
      <Alert tone="danger" title="Nie udało się wczytać" action={<button type="button">Spróbuj ponownie</button>}>
        Sprawdź połączenie.
      </Alert>,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-danger-soft');
    expect(alert).toHaveTextContent('Nie udało się wczytać');
    expect(screen.getByText('Nie udało się wczytać')).toHaveClass('text-danger');
    expect(screen.getByRole('button', { name: 'Spróbuj ponownie' })).toBeInTheDocument();
  });

  it('is a polite status in the other tones', () => {
    render(<Alert tone="info">Nowe zapytania czekają.</Alert>);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toHaveClass('bg-info-soft');
  });
});

describe('Pagination', () => {
  it('moves between pages and says where you are', () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={onPageChange} />);
    expect(screen.getByRole('navigation', { name: 'Stronicowanie' })).toHaveTextContent('Strona 2 z 5');
    fireEvent.click(screen.getByRole('button', { name: 'Poprzednia' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole('button', { name: 'Następna' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  it('disables the buttons at the ends', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Poprzednia' })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Następna' })).toBeDisabled();
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Avatar', () => {
  it('shows the initials and is named by the full name', () => {
    render(<Avatar name="Anna Kowalczyk" />);
    expect(screen.getByRole('img', { name: 'Anna Kowalczyk' })).toHaveTextContent('AK');
  });

  it('can be decorative', () => {
    const { container } = render(<Avatar name="Jan Nowak" decorative />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['Anna Maria Kowalczyk', 'AK'],
    ['połysk', 'PO'],
    ['  łukasz  żak ', 'ŁŻ'],
    ['', '?'],
    [null, '?'],
  ])('takes the initials of %j', (name, expected) => {
    expect(initials(name)).toBe(expected);
  });
});

describe('Kbd and LicensePlate', () => {
  it('renders a key', () => {
    render(<Kbd>Esc</Kbd>);
    expect(screen.getByText('Esc').tagName).toBe('KBD');
  });

  it('shows a plate upper case with single spaces, in mono', () => {
    render(<LicensePlate plate=" wx  4821k" />);
    expect(screen.getByText('WX 4821K')).toHaveClass('font-mono', 'border-border-strong');
  });
});
