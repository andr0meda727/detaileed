import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApiError } from '@detaileed/api-client';
import { ToastProvider } from '@detaileed/ui';

const submit = vi.fn();
vi.mock('@/features/account/api/me', () => ({
  usePendingReviews: () => ({
    isLoading: false,
    data: [
      {
        bookingId: 'b1',
        studioId: 's1',
        studioName: 'Detail Kraków',
        completedAt: '2026-11-10T12:00:00Z',
        reviewableUntil: '2027-02-08T12:00:00Z',
      },
    ],
  }),
  useSubmitReview: () => ({ mutate: submit, isPending: false }),
}));

const { default: PendingReviews } = await import('@/features/account/components/PendingReviews');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('PendingReviews', () => {
  it('asks for stars, then sends the rating and comment', () => {
    render(<PendingReviews />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij opinię' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Wybierz ocenę');
    expect(submit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: '5 na 5' }));
    fireEvent.change(screen.getByLabelText('Komentarz (opcjonalnie)'), { target: { value: ' Świetnie! ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij opinię' }));
    expect(submit).toHaveBeenCalledWith({ bookingId: 'b1', rating: 5, comment: 'Świetnie!' }, expect.anything());
  });

  it('explains when the review period is over', () => {
    submit.mockImplementation((_body, opts) => opts.onError(new ApiError(400, { code: 'REVIEW_PERIOD_OVER' })));
    render(<PendingReviews />, { wrapper });
    fireEvent.click(screen.getByRole('radio', { name: '4 na 5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij opinię' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Minęło 90 dni');
  });
});
