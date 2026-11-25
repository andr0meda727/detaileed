import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NameForm } from '@/shared/ui/NameForm';

function renderForm() {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(<NameForm label="Nazwa kategorii" placeholder="np. Polerowanie" onSave={onSave} saving={false} />);
  return { onSave, input: screen.getByLabelText('Nazwa kategorii') };
}

describe('NameForm', () => {
  it('saves the trimmed name', async () => {
    const { onSave, input } = renderForm();
    fireEvent.change(input, { target: { value: '  Chemia  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('Chemia'));
  });

  it('requires a name and links the error to the field', async () => {
    const { onSave, input } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(await screen.findByText('Nazwa jest wymagana')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription('Nazwa jest wymagana');
    expect(onSave).not.toHaveBeenCalled();
  });
});
