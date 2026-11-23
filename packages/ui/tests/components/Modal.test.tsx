import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '../../src/components/Modal';

function WithTrigger({ onClose = () => {} }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Otwórz</button>
      <Modal
        isOpen={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Nowy klient"
        description="Dane kontaktowe"
      >
        <input aria-label="Imię" />
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Ukryty">
        treść
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is a dialog named by its title and described by the description', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Nowy klient" description="Dane kontaktowe">
        <p>treść</p>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Nowy klient' });
    expect(dialog).toHaveAccessibleDescription('Dane kontaktowe');
    expect(dialog).toHaveTextContent('treść');
    expect(dialog).toHaveFocus();
  });

  it('closes with the close button and with Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Okno">
        treść
      </Modal>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('can require a choice: no close button, Escape and outside clicks do nothing', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Pierwsze studio" dismissible={false}>
        <button>Utwórz</button>
      </Modal>,
    );
    expect(screen.queryByRole('button', { name: 'Zamknij' })).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    fireEvent.pointerDown(document.body);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('returns focus to the trigger after closing', async () => {
    render(<WithTrigger />);
    const trigger = screen.getByRole('button', { name: 'Otwórz' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes only the top dialog on Escape', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <Modal isOpen onClose={outer} title="Zewnętrzne">
        <Modal isOpen onClose={inner} title="Wewnętrzne">
          treść
        </Modal>
      </Modal>,
    );
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Wewnętrzne' }), { key: 'Escape' });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it('renders nothing on the server', () => {
    const html = renderToString(
      <Modal isOpen onClose={() => {}} title="Serwer">
        treść
      </Modal>,
    );
    expect(html).not.toContain('Serwer');
  });
});
