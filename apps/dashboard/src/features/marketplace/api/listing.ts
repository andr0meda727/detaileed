import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  getApiMarketplaceListing,
  getGetApiMarketplaceListingQueryKey,
  postApiMarketplaceListingPublish,
  postApiMarketplaceListingUnpublish,
  putApiMarketplaceListing,
} from '@detaileed/api-client';
import { toListing, type Listing, type ListingInput } from '@/features/marketplace/model/types';

export const listingKey = getGetApiMarketplaceListingQueryKey();

/** The studio's public profile, or null when the owner hasn't saved one yet (`LISTING_NOT_FOUND`). */
export function useListing() {
  return useQuery({
    queryKey: listingKey,
    queryFn: async ({ signal }): Promise<Listing | null> => {
      try {
        return toListing(await getApiMarketplaceListing({ signal }));
      } catch (err) {
        if (err instanceof ApiError && err.code === 'LISTING_NOT_FOUND') return null;
        throw err;
      }
    },
    staleTime: 60_000,
  });
}

function useListingMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKey }),
  });
}

/** Creates or updates the profile (owner). A new profile starts unpublished and copies the studio's services. */
export const useSaveListing = () => useListingMutation((body: ListingInput) => putApiMarketplaceListing(body));

/** Shows the studio on the customer map (owner). Fails with `LISTING_HAS_NO_SERVICES` without services. */
export const usePublishListing = () => useListingMutation(() => postApiMarketplaceListingPublish());

/** Hides the studio from the customer map (owner). */
export const useUnpublishListing = () => useListingMutation(() => postApiMarketplaceListingUnpublish());
