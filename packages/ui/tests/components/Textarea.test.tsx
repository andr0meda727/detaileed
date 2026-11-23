import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Textarea } from '../../src/components/Textarea';
import { FieldError } from '../../src/components/FieldError';

describe('Textarea', () => {
  it('is labelled, forwards its ref and reports changes', () => {
    const ref = createRef<HTMLTextAreaElement>();
    const onChange = vi.fn();
    render(<Textarea label="Uwagi" ref={ref} onChange={onChange} />);
    const textarea = screen.getByLabelText('Uwagi');
    expect(ref.current).toBe(textarea);
    fireEvent.change(textarea, { target: { value: 'Rysa na drzwiach' } });
    expect(onChange).toHaveBeenCalled();
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('marks and describes errors', () => {
    render(<Textarea label="Opis" error="Za długi opis" />);
    const textarea = screen.getByLabelText('Opis');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAccessibleDescription('Za długi opis');
  });
});

describe('FieldError', () => {
  it('renders the message in the danger colour', () => {
    render(<FieldError id="e1">Wybierz termin</FieldError>);
    expect(screen.getByText('Wybierz termin')).toHaveAttribute('id', 'e1');
    expect(screen.getByText('Wybierz termin')).toHaveClass('text-danger');
  });

  it('renders nothing without a message', () => {
    const { container } = render(<FieldError id="e2" />);
    expect(container).toBeEmptyDOMElement();
  });
});
