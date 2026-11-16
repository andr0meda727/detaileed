import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import StarRating from '../src/StarRating';

describe('StarRating', () => {
  it('shows a rating read-only', () => {
    render(<StarRating value={4.7} />);
    expect(screen.getByRole('img', { name: 'Ocena: 4.7 na 5' })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('picks a rating when editable', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: '3 na 5' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: '5 na 5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
