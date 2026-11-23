import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BayLane } from '@/features/planning/components/board/BayLane';

describe('BayLane', () => {
  it('places bookings with their local times and shows free gaps', () => {
    render(
      <BayLane
        bay={{
          bayId: 'b1',
          name: 'Stanowisko 1',
          utilisationPercent: 25,
          bookings: [
            {
              id: 'k',
              start: '2026-11-16T07:00:00Z',
              end: '2026-11-16T09:00:00Z',
              clientName: 'Jan Kowalski',
              vehicleLicensePlate: 'KR 1',
              status: 'Utworzona',
            },
          ],
          freeGaps: [{ start: '2026-11-16T09:15:00Z', end: '2026-11-16T15:00:00Z', minutes: 345 }],
        }}
        day="2026-11-16"
        timeZone="Europe/Warsaw"
        axis={{ start: 480, end: 960 }}
        hours={[8, 12, 16]}
      />,
    );
    const block = screen.getByRole('listitem');
    expect(block).toHaveTextContent('08:00–10:00 Jan Kowalski');
    expect(block).toHaveStyle({ left: '0%', width: '25%' });
    expect(block).toHaveClass('before:bg-info-soft', 'border-info');
    expect(screen.getByTitle('Wolne 10:15–16:00 (345 min)')).toBeInTheDocument();
    expect(screen.getByText('25%').parentElement).toHaveTextContent('25% zajęte');
  });
});

describe('BayLane booking colours', () => {
  const lane = (status: string) =>
    render(
      <BayLane
        bay={{
          bayId: 'b1',
          name: 'Stanowisko 1',
          utilisationPercent: 25,
          bookings: [
            {
              id: 'k',
              start: '2026-11-16T07:00:00Z',
              end: '2026-11-16T09:00:00Z',
              clientName: 'Jan Kowalski',
              vehicleLicensePlate: 'KR 1',
              status,
            },
          ],
          freeGaps: [],
        }}
        day="2026-11-16"
        timeZone="Europe/Warsaw"
        axis={{ start: 480, end: 960 }}
        hours={[8, 12, 16]}
      />,
    );

  it.each([
    ['Zakończona', 'border-success'],
    ['Anulowana', 'border-danger'],
    ['Inna', 'border-border-strong'],
  ])('colours a %s booking with %s', (status, edge) => {
    lane(status);
    expect(screen.getByRole('listitem')).toHaveClass(edge);
  });
});
