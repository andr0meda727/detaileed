import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../src/components/Table';

describe('Table', () => {
  it('renders an accessible table inside a horizontal scroll wrapper', () => {
    render(
      <Table aria-label="Dzisiejsze wizyty" className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead>Godzina</TableHead>
            <TableHead className="text-right">Kwota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono">09:00</TableCell>
            <TableCell className="text-right">280 zł</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'Dzisiejsze wizyty' });
    expect(table).toHaveClass('min-w-[640px]');
    // The wrapper is the containing block, so an `sr-only` head can't widen the page.
    expect(table.parentElement).toHaveClass('overflow-x-auto', 'relative');

    const head = screen.getByRole('columnheader', { name: 'Godzina' });
    expect(head).toHaveAttribute('scope', 'col');
    expect(head).toHaveClass('text-xs', 'text-faint');
    expect(screen.getByRole('columnheader', { name: 'Kwota' })).toHaveClass('text-right');
    expect(screen.getByRole('columnheader', { name: 'Kwota' })).not.toHaveClass('text-left');

    expect(screen.getByRole('cell', { name: '09:00' })).toHaveClass('font-mono');
    expect(screen.getAllByRole('row')[1]).toHaveClass('border-b', 'border-border');
  });

  it('keeps the table look without stacked: no phone-only classes, no labels', () => {
    render(
      <Table aria-label="Klienci">
        <TableBody>
          <TableRow>
            <TableCell label="Telefon">600 100 200</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = screen.getByRole('cell', { name: '600 100 200' });
    expect(cell).not.toHaveAttribute('data-label');
    expect(cell.className).not.toContain('max-md:');
    expect(screen.getByRole('row').className).not.toContain('max-md:');
  });

  it('turns rows into stacked cards below md when stacked', () => {
    render(
      <Table aria-label="Dzisiejsze wizyty" className="min-w-[760px]" stacked>
        <TableHeader>
          <TableRow>
            <TableHead>Klient</TableHead>
            <TableHead>Usługi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell stack="primary" label="Klient">
              Jan Kowalski
            </TableCell>
            <TableCell label="Usługi" className="text-right">
              Mycie
            </TableCell>
            <TableCell stack="full" label="Uwagi">
              Bez wosku
            </TableCell>
            <TableCell stack="actions">
              <button type="button">Więcej</button>
            </TableCell>
            <TableCell stack="hidden">Stanowisko 1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={4}>Brak wizyt</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'Dzisiejsze wizyty' });
    // The minimum width applies only from md up.
    expect(table).toHaveClass('min-w-[760px]', 'max-md:min-w-0', 'max-md:block');
    expect(screen.getAllByRole('rowgroup')[0]).toHaveClass('max-md:hidden');
    expect(screen.getAllByRole('row')[1]).toHaveClass('max-md:grid', 'max-md:grid-cols-2');

    // Columns still have their heads for screen readers and tests from md up.
    expect(screen.getByRole('columnheader', { name: 'Usługi' })).toBeInTheDocument();

    const primary = screen.getByRole('cell', { name: 'Jan Kowalski' });
    expect(primary).toHaveClass('max-md:col-span-2');
    expect(primary).not.toHaveAttribute('data-label');

    const services = screen.getByRole('cell', { name: 'Mycie' });
    expect(services).toHaveAttribute('data-label', 'Usługi');
    expect(services).toHaveClass('text-right', 'max-md:text-left', 'max-md:before:content-[attr(data-label)]');

    expect(screen.getByRole('cell', { name: 'Bez wosku' })).toHaveClass('max-md:col-span-2');
    expect(screen.getByRole('button', { name: 'Więcej' }).parentElement).toHaveClass('max-md:absolute');
    expect(screen.getByRole('cell', { name: 'Stanowisko 1' })).toHaveClass('max-md:hidden');
    // A cell spanning the row (an empty state) spans the card too.
    expect(screen.getByRole('cell', { name: 'Brak wizyt' })).toHaveClass('max-md:col-span-2');
  });
});
