import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Moon, Sun } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from '../../src/components/SegmentedControl';

const options = [
  { value: 'day', label: 'Dzień' },
  { value: 'week', label: 'Tydzień' },
  { value: 'month', label: 'Miesiąc' },
] as const;

type Range = (typeof options)[number]['value'];

function Example({ onChange = () => {} }: { onChange?: (value: Range) => void }) {
  const [value, setValue] = useState<Range>('day');
  return (
    <SegmentedControl
      aria-label="Zakres"
      options={options}
      value={value}
      onValueChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

describe('SegmentedControl', () => {
  it('is a named radio group with one checked', () => {
    render(<Example />);
    expect(screen.getByRole('radiogroup', { name: 'Zakres' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Dzień' })).toHaveAttribute('aria-checked', 'true');
  });

  it('selects on click and keeps the choice when the active segment is clicked again', () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Tydzień' }));
    expect(onChange).toHaveBeenLastCalledWith('week');
    expect(screen.getByRole('radio', { name: 'Tydzień' })).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(screen.getByRole('radio', { name: 'Tydzień' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('radio', { name: 'Tydzień' })).toHaveAttribute('aria-checked', 'true');
  });

  it('moves focus with the arrow keys', async () => {
    render(<Example />);
    const first = screen.getByRole('radio', { name: 'Dzień' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Tydzień' })).toHaveFocus());
  });

  it('keeps the labels as names when only icons are shown', () => {
    render(
      <SegmentedControl
        aria-label="Motyw"
        iconOnly
        size="sm"
        options={[
          { value: 'light', label: 'Jasny', icon: Sun },
          { value: 'dark', label: 'Ciemny', icon: Moon },
        ]}
        value="dark"
        onValueChange={() => {}}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Ciemny' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.queryByText('Jasny')).not.toBeInTheDocument();
  });
});
