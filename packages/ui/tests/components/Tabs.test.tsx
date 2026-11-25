import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/Tabs';

function Example() {
  const [tab, setTab] = useState('items');
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList aria-label="Magazyn">
        <TabsTrigger value="items">Produkty</TabsTrigger>
        <TabsTrigger value="ledger">Ruchy</TabsTrigger>
      </TabsList>
      <TabsContent value="items">Lista produktów</TabsContent>
      <TabsContent value="ledger">Historia ruchów</TabsContent>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('shows the panel of the selected tab', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Magazyn' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Produkty' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Lista produktów');
  });

  it('switches tabs with the arrow keys', async () => {
    render(<Example />);
    const first = screen.getByRole('tab', { name: 'Produkty' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    const second = screen.getByRole('tab', { name: 'Ruchy' });
    await waitFor(() => expect(second).toHaveFocus());
    fireEvent.focus(second);
    expect(second).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Historia ruchów');
  });

  it('works with links for tabs kept in the URL', () => {
    render(
      <Tabs value="ledger">
        <TabsList>
          <TabsTrigger value="items" asChild>
            <a href="/inventory">Produkty</a>
          </TabsTrigger>
          <TabsTrigger value="ledger" asChild>
            <a href="/inventory/ledger">Ruchy</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    const active = screen.getByRole('tab', { name: 'Ruchy' });
    expect(active.tagName).toBe('A');
    expect(active).toHaveAttribute('href', '/inventory/ledger');
    expect(active).toHaveAttribute('aria-selected', 'true');
  });
});
