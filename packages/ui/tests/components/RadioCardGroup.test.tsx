import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RadioCardGroup } from '../../src/components/RadioCardGroup';

const options = [
  { value: 'a', label: '10:00 · Stanowisko 2', description: 'Wolne do 13:00', trailing: '3 h' },
  { value: 'b', label: '12:30 · Stanowisko 1' },
  { value: 'c', label: '15:00 · Stanowisko 1', disabled: true },
];

function Example({ onChange = () => {} }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <RadioCardGroup
      aria-label="Wolne terminy"
      options={options}
      value={value}
      onValueChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

describe('RadioCardGroup', () => {
  it('names each radio by its label alone and links the description', () => {
    render(<Example />);
    expect(screen.getByRole('radiogroup', { name: 'Wolne terminy' })).toBeInTheDocument();
    const first = screen.getByRole('radio', { name: '10:00 · Stanowisko 2' });
    expect(first).toHaveAccessibleDescription('Wolne do 13:00');
    expect(first).toHaveTextContent('3 h');
    expect(first).not.toBeChecked();
  });

  it('selects a card on click', () => {
    const onChange = vi.fn();
    render(<Example onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: '12:30 · Stanowisko 1' }));
    expect(onChange).toHaveBeenLastCalledWith('b');
    expect(screen.getByRole('radio', { name: '12:30 · Stanowisko 1' })).toBeChecked();
  });

  it('moves between cards with the arrow keys and skips disabled ones', async () => {
    render(<Example />);
    const first = screen.getByRole('radio', { name: '10:00 · Stanowisko 2' });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    await waitFor(() => expect(screen.getByRole('radio', { name: '12:30 · Stanowisko 1' })).toHaveFocus());
    expect(screen.getByRole('radio', { name: '15:00 · Stanowisko 1' })).toBeDisabled();
  });
});
