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
    expect(table.parentElement).toHaveClass('overflow-x-auto');

    const head = screen.getByRole('columnheader', { name: 'Godzina' });
    expect(head).toHaveAttribute('scope', 'col');
    expect(head).toHaveClass('text-xs', 'text-faint');
    expect(screen.getByRole('columnheader', { name: 'Kwota' })).toHaveClass('text-right');
    expect(screen.getByRole('columnheader', { name: 'Kwota' })).not.toHaveClass('text-left');

    expect(screen.getByRole('cell', { name: '09:00' })).toHaveClass('font-mono');
    expect(screen.getAllByRole('row')[1]).toHaveClass('border-b', 'border-border');
  });
});
