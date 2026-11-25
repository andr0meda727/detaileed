'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getApiPublicStudiosStudioIdReviews } from '@detaileed/api-client';
import { Button, StarRating } from '@detaileed/ui';
import { formatInZone } from '@detaileed/domain/studioTime';
import { REVIEWS_PAGE_SIZE, toReviewPage, type ReviewPage } from '@/features/studio/model/reviews';

interface ReviewsListProps {
  studioId: string;
  timeZone: string;
  reviewCount: number;
  /** The first page, rendered on the server. */
  initial: ReviewPage;
}

/** The studio's reviews, newest first, with "show more" (cursor paging). */
export function ReviewsList({ studioId, timeZone, reviewCount, initial }: ReviewsListProps) {
  const reviews = useInfiniteQuery({
    queryKey: ['/api/public/studios', studioId, 'reviews'],
    queryFn: async ({ pageParam }) =>
      toReviewPage(
        await getApiPublicStudiosStudioIdReviews(studioId, {
          Limit: REVIEWS_PAGE_SIZE,
          Cursor: pageParam ?? undefined,
        }),
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => last.nextCursor,
    initialData: { pages: [initial], pageParams: [null] },
    staleTime: 60_000,
  });
  const items = reviews.data.pages.flatMap((p) => p.items);

  return (
    <section className="flex flex-col gap-3" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-xl font-semibold tracking-tight text-foreground">
        Opinie{' '}
        {reviewCount > 0 && (
          <span className="font-mono text-base font-normal tabular-nums text-faint">({reviewCount})</span>
        )}
      </h2>
      {items.length === 0 ? (
        <p className="text-muted-foreground">Studio nie ma jeszcze opinii. Opinię może wystawić klient po wizycie.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{r.authorName}</p>
                <StarRating value={r.rating} size={14} />
              </div>
              <p className="mt-0.5 text-xs text-faint">
                {formatInZone(r.createdAt, timeZone, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {r.comment && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {reviews.hasNextPage && (
        <Button
          variant="secondary"
          className="self-start"
          loading={reviews.isFetchingNextPage}
          onClick={() => reviews.fetchNextPage()}
        >
          Pokaż więcej opinii
        </Button>
      )}
    </section>
  );
}
