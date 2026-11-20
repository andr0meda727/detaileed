import { cache } from 'react';
import { getApiPublicStudiosStudioId, getApiPublicStudiosStudioIdReviews } from '@detaileed/api-client';
import { toListing } from '@detaileed/domain/listing';
import { orNotFound, publicRequest } from '@/shared/lib/api/server';
import { REVIEWS_PAGE_SIZE, toReviewPage } from '@/features/studio/model/reviews';

/** Studio ids are UUIDs; anything else is a broken link, answered with 404 without asking the API. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A published studio's profile, or null (unpublished or unknown); one request per page render. */
export const getListing = cache(async (studioId: string) => {
  if (!UUID.test(studioId)) return null;
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
