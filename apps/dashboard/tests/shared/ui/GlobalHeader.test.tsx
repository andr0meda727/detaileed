import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlobalHeader } from '@/shared/ui/GlobalHeader';

describe('GlobalHeader', () => {
  it('shows the title, the description and the quick actions', () => {
    const onAddBooking = vi.fn();
    const onAddClient = vi.fn();
    render(
      <GlobalHeader title="Klienci" subtitle="Baza klientów" onAddBooking={onAddBooking} onAddClient={onAddClient} />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Klienci' })).toBeInTheDocument();
    expect(screen.getByText('Baza klientów')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Nowa rezerwacja' }));
    fireEvent.click(screen.getByRole('button', { name: 'Nowy klient' }));
    expect(onAddBooking).toHaveBeenCalledOnce();
    expect(onAddClient).toHaveBeenCalledOnce();
  });

  it('shows no actions without handlers', () => {
    render(<GlobalHeader title="Raporty" subtitle="Eksport danych" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
