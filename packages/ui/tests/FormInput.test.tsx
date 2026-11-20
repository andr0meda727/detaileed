import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import FormInput from '../src/components/FormInput';

describe('FormInput', () => {
  it('is labelled by its label', () => {
    render(<FormInput label="E-mail" defaultValue="anna@example.com" />);
    expect(screen.getByLabelText('E-mail')).toHaveValue('anna@example.com');
  });

  it('keeps a given id and marks errors', () => {
    render(<FormInput label="Telefon" id="phone" error="Podaj numer" />);
    const input = screen.getByLabelText('Telefon');
    expect(input).toHaveAttribute('id', 'phone');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
