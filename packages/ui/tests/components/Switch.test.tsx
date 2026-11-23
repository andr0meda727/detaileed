import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../../src/components/Switch';

describe('Switch', () => {
  it('is a switch named by its label that toggles on click', () => {
    const onCheckedChange = vi.fn();
    render(
      <Switch
        label="Widoczny w wyszukiwarce"
        description="Klienci znajdą studio na mapie"
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole('switch', { name: 'Widoczny w wyszukiwarce' });
    expect(control).toHaveAccessibleDescription('Klienci znajdą studio na mapie');
    expect(control).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(control);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(control).toHaveAttribute('aria-checked', 'true');
  });

  it('is found by label text and follows the controlled value', () => {
    render(<Switch label="Powiadomienia" checked onCheckedChange={() => {}} />);
    expect(screen.getByLabelText('Powiadomienia')).toHaveAttribute('aria-checked', 'true');
  });
});
