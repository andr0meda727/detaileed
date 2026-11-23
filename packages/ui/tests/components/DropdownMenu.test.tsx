import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Trash2 } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../src/components/DropdownMenu';
import { stubResizeObserver } from './resizeObserverStub';

beforeEach(stubResizeObserver);

function renderMenu(onEdit = vi.fn(), onDelete = vi.fn()) {
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Akcje</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Rezerwacja</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onEdit}>Edytuj</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger icon={Trash2} onSelect={onDelete}>
          Usuń
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  return { onEdit, onDelete };
}

describe('DropdownMenu', () => {
  it('opens from the keyboard and lists the items', async () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Akcje' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.keyDown(trigger, { key: 'Enter' });
    const menu = await screen.findByRole('menu');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(menu).toHaveTextContent('Rezerwacja');
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Edytuj', 'Usuń']);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('runs the selected item and closes, returning focus to the trigger', async () => {
    const { onDelete } = renderMenu();
    const trigger = screen.getByRole('button', { name: 'Akcje' });
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Usuń' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes on Escape without running anything', async () => {
    const { onEdit, onDelete } = renderMenu();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Akcje' }), { key: 'Enter' });
    fireEvent.keyDown(await screen.findByRole('menu'), { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });
});
