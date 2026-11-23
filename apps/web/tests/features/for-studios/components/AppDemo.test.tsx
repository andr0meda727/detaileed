import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AppDemo } from '@/features/for-studios/components/demo/AppDemo';

const nav = () => screen.getByRole('navigation', { name: 'Widoki demo' });

describe('AppDemo', () => {
  it('opens on the home screen without adding a second h1 to the page', () => {
    render(<AppDemo />);
    expect(screen.getByRole('heading', { level: 3, name: 'Dzień dobry' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(within(nav()).getByRole('button', { name: 'Panel główny' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('table', { name: 'Dzisiejsze wizyty' })).toBeInTheDocument();
  });

  it('switches views from the sidebar and shows the screen in the breadcrumb', () => {
    render(<AppDemo />);
    fireEvent.click(within(nav()).getByRole('button', { name: 'Klienci' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Klienci' })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: 'Ścieżka w demo' })).getByText('Klienci')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('filters the client list by a search', () => {
    render(<AppDemo />);
    fireEvent.click(within(nav()).getByRole('button', { name: 'Klienci' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Szukaj klienta' }), { target: { value: 'porsche' } });
    const table = screen.getByRole('table', { name: 'Klienci' });
    expect(within(table).getByText('Marek Wiśniewski')).toBeInTheDocument();
    expect(within(table).queryByText('Jan Kowalski')).not.toBeInTheDocument();
  });

  it('goes from upcoming bookings to the bookings list', () => {
    render(<AppDemo />);
    fireEvent.click(screen.getByRole('button', { name: 'Wszystkie' }));
    expect(screen.getByRole('heading', { level: 3, name: 'Rezerwacje' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'środa, 15 kwietnia' })).toBeInTheDocument();
  });
});
