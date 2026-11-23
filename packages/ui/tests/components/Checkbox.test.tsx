import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../../src/components/Checkbox';

describe('Checkbox', () => {
  it('is found by its own label and toggles when the label is clicked', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Mycie podwozia" description="+ 40 zł" onCheckedChange={onCheckedChange} />);
    const box = screen.getByLabelText('Mycie podwozia');
    expect(box).toHaveAttribute('role', 'checkbox');
    expect(box).toHaveAccessibleDescription('+ 40 zł');
    expect(box).not.toBeChecked();

    fireEvent.click(screen.getByText('Mycie podwozia'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(box).toBeChecked();
  });

  it('works inside a surrounding label', () => {
    function Wrapped() {
      const [checked, setChecked] = useState(false);
      return (
        <label>
          <Checkbox checked={checked} onCheckedChange={(next) => setChecked(next === true)} />
          Zgoda na kontakt
        </label>
      );
    }
    render(<Wrapped />);
    const box = screen.getByLabelText('Zgoda na kontakt');
    expect(box).toHaveRole('checkbox');
    fireEvent.click(box);
    expect(box).toBeChecked();
  });

  it('shows the mixed state', () => {
    render(<Checkbox aria-label="Wszystkie" checked="indeterminate" />);
    expect(screen.getByRole('checkbox', { name: 'Wszystkie' })).toHaveAttribute('aria-checked', 'mixed');
  });

  it('does not toggle when disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox label="Wyłączone" disabled onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Wyłączone' }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
