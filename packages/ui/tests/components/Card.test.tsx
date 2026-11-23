import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarDays } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../../src/components/Card';
import { PageHeader } from '../../src/components/PageHeader';
import { Stat } from '../../src/components/Stat';
import { FormSection } from '../../src/components/FormSection';

describe('Card', () => {
  it('renders a header with title, description and actions, a body and a footer', () => {
    render(
      <Card data-testid="card" className="mt-6">
        <CardHeader title="Dzisiejszy grafik" description="3 wizyty" actions={<a href="/grafik">Otwórz</a>} />
        <CardContent>Treść</CardContent>
        <CardFooter>
          <button type="button">Zapisz</button>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('rounded-lg', 'border', 'bg-surface', 'mt-6');
    expect(screen.getByRole('heading', { level: 2, name: 'Dzisiejszy grafik' })).toBeInTheDocument();
    expect(screen.getByText('3 wizyty')).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('link', { name: 'Otwórz' })).toBeInTheDocument();
    expect(screen.getByText('Treść')).toHaveClass('p-5');
    expect(screen.getByRole('button', { name: 'Zapisz' }).parentElement).toHaveClass('justify-end');
  });

  it('takes another heading level for the title', () => {
    render(<CardHeader title="Godziny otwarcia" titleAs="h3" />);
    expect(screen.getByRole('heading', { level: 3, name: 'Godziny otwarcia' })).toBeInTheDocument();
  });
});

describe('PageHeader', () => {
  it('shows the breadcrumb, the page title, the description and the actions', () => {
    render(
      <PageHeader
        title="Rezerwacje"
        description="Wszystkie wizyty studia"
        breadcrumb={<nav aria-label="Ścieżka">Studio</nav>}
        actions={<button type="button">Nowa rezerwacja</button>}
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Rezerwacje' })).toHaveClass('text-2xl', 'tracking-tight');
    expect(screen.getByText('Wszystkie wizyty studia')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Ścieżka' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nowa rezerwacja' })).toBeInTheDocument();
  });
});

describe('Stat', () => {
  it('shows the value in mono with tabular digits and a toned hint', () => {
    render(<Stat label="Klienci" value="218" hint="+6 w tym miesiącu" tone="success" />);
    expect(screen.getByText('218')).toHaveClass('font-mono', 'tabular-nums');
    expect(screen.getByText('Klienci')).toHaveClass('text-faint');
    expect(screen.getByText('+6 w tym miesiącu')).toHaveClass('text-success');
  });

  it('has a quiet hint by default', () => {
    render(<Stat label="Przychód dziś" value="2 340 zł" hint="z 2 wizyt" />);
    expect(screen.getByText('z 2 wizyt')).toHaveClass('text-faint');
  });
});

describe('FormSection', () => {
  it('is a card with an icon and a titled header; the tone changes only the tile', () => {
    const { rerender } = render(
      <FormSection icon={CalendarDays} title="Termin" actions={<span>2 z 3</span>}>
        <div>Pola</div>
      </FormSection>,
    );
    const heading = screen.getByRole('heading', { name: 'Termin' });
    expect(heading.closest('.rounded-lg')).toHaveClass('bg-surface');
    expect(screen.getByText('2 z 3')).toBeInTheDocument();
    expect(heading.previousElementSibling).toHaveClass('bg-muted');

    rerender(
      <FormSection icon={CalendarDays} title="Termin" tone="amber">
        <div>Pola</div>
      </FormSection>,
    );
    expect(screen.getByRole('heading', { name: 'Termin' }).previousElementSibling).toHaveClass('bg-warning-soft');
  });
});
