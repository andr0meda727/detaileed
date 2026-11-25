import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SearchInput } from '../../src/components/SearchInput';

describe('SearchInput', () => {
  it('is a named search box that forwards its ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchInput aria-label="Szukaj klienta" ref={ref} placeholder="Imię, telefon…" />);
    const input = screen.getByRole('searchbox', { name: 'Szukaj klienta' });
    expect(ref.current).toBe(input);
    expect(input).toHaveClass('h-9', 'pl-9');
  });

  it('shows a clear button only while there is text, and clears with it or Escape', () => {
    const onClear = vi.fn();
    const { rerender } = render(<SearchInput aria-label="Szukaj" value="" onChange={() => {}} onClear={onClear} />);
    expect(screen.queryByRole('button', { name: 'Wyczyść wyszukiwanie' })).toBeNull();

    rerender(<SearchInput aria-label="Szukaj" value="Kowal" onChange={() => {}} onClear={onClear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Wyczyść wyszukiwanie' }));
    expect(onClear).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Escape' });
    expect(onClear).toHaveBeenCalledTimes(2);
  });

  it('passes typing through', () => {
    const onChange = vi.fn();
    render(<SearchInput aria-label="Szukaj" defaultValue="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Audi' } });
    expect(onChange).toHaveBeenCalled();
  });
});
