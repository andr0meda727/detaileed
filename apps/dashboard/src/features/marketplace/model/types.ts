import type { ListingRequest } from '@detaileed/api-client';

/** The studio's public profile; shared with the customer site. */
export type { Listing } from '@detaileed/domain/listing';
export { toListing } from '@detaileed/domain/listing';

/** Body of `PUT /api/marketplace/listing`. */
export type ListingInput = ListingRequest;
