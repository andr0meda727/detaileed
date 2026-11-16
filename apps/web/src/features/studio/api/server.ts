import { cache } from 'react';
import { getApiPublicStudiosStudioId, getApiPublicStudiosStudioIdReviews } from '@detaileed/api-client';
import { toListing } from '@detaileed/domain/listing';
import { orNotFound, publicRequest } from '@/lib/api/server';
import { REVIEWS_PAGE_SIZE, toReviewPage } from '@/features/studio/model/reviews';

/** A published studio's profile, or null (unpublished or unknown); one request per page render. */
export const getListing = cache(async (studioId: string) => {
  const dto = await orNotFound(getApiPublicStudiosStudioId(studioId, publicRequest));
  return dto && toListing(dto);
});

/** The newest reviews for the first render; the page loads more in the browser. */
export async function getFirstReviews(studioId: string) {
  const page = await orNotFound(
    getApiPublicStudiosStudioIdReviews(studioId, { Limit: REVIEWS_PAGE_SIZE }, publicRequest),
  );
  return page ? toReviewPage(page) : { items: [], nextCursor: null };
}
