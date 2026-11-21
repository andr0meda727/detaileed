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
    <section className="space-y-4" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-serif text-3xl">
        Opinie {reviewCount > 0 && <span className="text-green-light text-xl">({reviewCount})</span>}
      </h2>
      {items.length === 0 ? (
        <p className="text-green-light">Studio nie ma jeszcze opinii. Opinię może wystawić klient po wizycie.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="bg-white rounded-2xl border border-green-deep/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold">{r.authorName}</p>
                <StarRating value={r.rating} size={14} />
              </div>
              <p className="text-xs text-green-light mt-0.5">
                {formatInZone(r.createdAt, timeZone, { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              {r.comment && <p className="mt-2 text-green-deep/80 whitespace-pre-line">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
      {reviews.hasNextPage && (
        <Button variant="secondary" loading={reviews.isFetchingNextPage} onClick={() => reviews.fetchNextPage()}>
          Pokaż więcej opinii
        </Button>
      )}
    </section>
  );
}
