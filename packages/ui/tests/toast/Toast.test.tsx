import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '../../src/toast/ToastContext';
import { useToast, type ToastType } from '../../src/toast/useToast';
import { TOAST_DURATION_MS } from '../../src/toast/Toast';

function Trigger({ message, type }: { message: string; type: ToastType }) {
  const { addToast } = useToast();
  return (
    <button type="button" onClick={() => addToast(message, type)}>
      Pokaż
    </button>
  );
}

function renderWith(message: string, type: ToastType) {
  render(
    <ToastProvider>
      <Trigger message={message} type={type} />
    </ToastProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Pokaż' }));
}

describe('toasts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('announces success politely in a labelled region', () => {
    renderWith('Zapisano zmiany', 'success');
    expect(screen.getByRole('status')).toHaveTextContent('Zapisano zmiany');
    expect(screen.getByRole('region', { name: 'Powiadomienia' })).toHaveAttribute('aria-live', 'polite');
  });

  it('announces errors assertively', () => {
    renderWith('Nie udało się zapisać', 'error');
    expect(screen.getByRole('alert')).toHaveTextContent('Nie udało się zapisać');
  });

  it('closes with the labelled close button', () => {
    renderWith('Wysłano zaproszenie', 'info');
    fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Wysłano zaproszenie')).toBeNull();
  });

  it('stays about five seconds, and longer while hovered', () => {
    renderWith('Zapisano', 'success');
    const toast = screen.getByRole('status');
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('Zapisano')).toBeInTheDocument();

    fireEvent.mouseEnter(toast);
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS * 2));
    expect(screen.getByText('Zapisano')).toBeInTheDocument();

    fireEvent.mouseLeave(toast);
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS));
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByText('Zapisano')).toBeNull();
  });
});
