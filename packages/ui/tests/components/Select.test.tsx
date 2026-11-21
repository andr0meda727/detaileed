import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Select } from '../../src/components/Select';

const options = [
  { value: 'Small', label: 'Małe' },
  { value: 'Medium', label: 'Średnie' },
];

describe('Select', () => {
  it('is labelled and reports changes', () => {
    const onChange = vi.fn();
    render(<Select label="Wielkość" options={options} defaultValue="Medium" onChange={onChange} />);
    const select = screen.getByLabelText('Wielkość');
    expect(select).toHaveValue('Medium');
    fireEvent.change(select, { target: { value: 'Small' } });
    expect(onChange).toHaveBeenCalled();
    expect(select).toHaveValue('Small');
  });

  it('shows the error and marks itself invalid', () => {
    render(<Select label="Wielkość" options={options} error="Wybierz wielkość" />);
    expect(screen.getByText('Wybierz wielkość')).toBeInTheDocument();
    expect(screen.getByLabelText('Wielkość')).toHaveAttribute('aria-invalid', 'true');
  });
});
