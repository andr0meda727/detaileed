'use client';

import { useState } from 'react';
import { MessageSquareHeart, Send } from 'lucide-react';
import { ApiError, type ReviewableVisitDto } from '@detaileed/api-client';
import { Button, EmptyState, Skeleton, StarRating, useToast } from '@detaileed/ui';
import { getApiErrorMessage } from '@detaileed/domain/apiErrors';
import { DEFAULT_TIME_ZONE, formatInZone } from '@detaileed/domain/studioTime';
import { usePendingReviews, useSubmitReview } from '@/features/account/api/me';

const MAX_COMMENT = 2000;

const REVIEW_ERRORS: Record<string, string> = {
  REVIEW_ALREADY_EXISTS: 'Ta wizyta ma już Twoją opinię.',
  REVIEW_PERIOD_OVER: 'Minęło 90 dni od wizyty, więc nie można już jej ocenić.',
  REVIEWABLE_VISIT_NOT_FOUND: 'Nie znaleziono tej wizyty.',
  CUSTOMER_PROFILE_REQUIRED: 'Uzupełnij dane kontaktowe, aby wystawić opinię (podpiszemy ją Twoim imieniem).',
};

const day = (iso: string) => formatInZone(iso, DEFAULT_TIME_ZONE, { day: 'numeric', month: 'long', year: 'numeric' });

function ReviewForm({ visit }: { visit: ReviewableVisitDto }) {
  const { addToast } = useToast();
  const submit = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    if (rating === 0) {
      setError('Wybierz ocenę od 1 do 5 gwiazdek.');
      return;
    }
    setError(null);
    submit.mutate(
      { bookingId: visit.bookingId, rating, comment: comment.trim() || null },
      {
        onSuccess: () => addToast('Dziękujemy za opinię!', 'success'),
        onError: (err) =>
          setError(
            err instanceof ApiError && err.code && REVIEW_ERRORS[err.code]
              ? REVIEW_ERRORS[err.code]
              : getApiErrorMessage(err, 'Nie udało się wysłać opinii.'),
          ),
      },
    );
  };

  return (
    <li className="bg-white rounded-2xl border border-green-deep/5 p-4 space-y-3">
      <div>
        <p className="font-bold">{visit.studioName ?? 'Studio'}</p>
        <p className="text-xs text-green-light">
          Wizyta {day(visit.completedAt)} · opinię możesz wystawić do {day(visit.reviewableUntil)}
        </p>
      </div>
      <StarRating
        value={rating}
        onChange={setRating}
        size={26}
        label={`Ocena wizyty w ${visit.studioName ?? 'studiu'}`}
      />
      <textarea
        aria-label="Komentarz (opcjonalnie)"
        rows={3}
        maxLength={MAX_COMMENT}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Jak było? Co studio zrobiło dobrze, co można poprawić?"
        className="w-full px-4 py-3 bg-cream/40 border-2 border-transparent rounded-xl outline-hidden text-sm focus:border-cream-warm"
      />
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button icon={Send} loading={submit.isPending} onClick={send}>
        Wyślij opinię
      </Button>
    </li>
  );
}

/** Completed visits the customer can still review (within 90 days), each with a rating form. */
export function PendingReviews() {
  const { data, isLoading } = usePendingReviews();
  if (isLoading) return <Skeleton width="100%" height="200px" className="rounded-2xl" />;
  if (!data?.length) {
    return (
      <EmptyState
        message="Brak wizyt do oceny. Po wizycie umówionej przez Detaileed pojawi się tutaj."
        icon={MessageSquareHeart}
      />
    );
  }
  return (
    <ul className="space-y-3">
      {data.map((visit) => (
        <ReviewForm key={visit.bookingId} visit={visit} />
      ))}
    </ul>
  );
}
