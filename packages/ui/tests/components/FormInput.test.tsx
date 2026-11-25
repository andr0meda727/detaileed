import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormInput } from '../../src/components/FormInput';

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

  it('links the hint and the error with aria-describedby', () => {
    render(<FormInput label="Hasło" hint="Co najmniej 8 znaków" error="Za krótkie" aria-describedby="extra" />);
    const input = screen.getByLabelText('Hasło');
    expect(input).toHaveAccessibleDescription('Co najmniej 8 znaków Za krótkie');
    expect(input.getAttribute('aria-describedby')).toMatch(/^extra /);
    expect(screen.getByText('Za krótkie')).toHaveClass('text-danger');
  });

  it('has no description and no invalid mark without an error', () => {
    render(<FormInput label="Imię" />);
    const input = screen.getByLabelText('Imię');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('uses one background in the error state, and the caller’s classes win', () => {
    render(<FormInput label="Kod" error="Błąd" className="h-11 font-mono" />);
    const input = screen.getByLabelText('Kod');
    expect(input).toHaveClass('bg-surface', 'border-danger', 'h-11', 'font-mono');
    expect(input).not.toHaveClass('border-border-strong', 'h-9');
  });
});
