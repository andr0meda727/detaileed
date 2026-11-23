import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog, type ConfirmDialogProps } from '../../src/components/ConfirmDialog';

function renderDialog(props: Partial<ConfirmDialogProps> = {}) {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Usunąć pojazd?"
      description="Tej operacji nie można cofnąć."
      confirmLabel="Usuń"
      {...props}
    />,
  );
  return { onOpenChange, onConfirm };
}

describe('ConfirmDialog', () => {
  it('is an alert dialog with its title and description, focused on cancel', () => {
    renderDialog();
    const dialog = screen.getByRole('alertdialog', { name: 'Usunąć pojazd?' });
    expect(dialog).toHaveAccessibleDescription('Tej operacji nie można cofnąć.');
    expect(screen.getByRole('button', { name: 'Anuluj' })).toHaveFocus();
  });

  it('confirms without closing by itself', () => {
    const { onConfirm, onOpenChange } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('cancels with the cancel button and with Escape', () => {
    const { onConfirm, onOpenChange } = renderDialog({ cancelLabel: 'Wróć' });
    fireEvent.click(screen.getByRole('button', { name: 'Wróć' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('blocks both buttons and Escape while loading', () => {
    const { onConfirm, onOpenChange } = renderDialog({ loading: true, tone: 'danger' });
    expect(screen.getByRole('button', { name: 'Usuń' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('returns focus to the button that opened it', async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Usuń pojazd</button>
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            onConfirm={() => setOpen(false)}
            title="Usunąć pojazd?"
            description="Tej operacji nie można cofnąć."
            confirmLabel="Usuń"
          />
        </>
      );
    }
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Usuń pojazd' });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
