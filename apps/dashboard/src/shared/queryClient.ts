import { MutationCache, QueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@/shared/lib/errorHandler';

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      /** Set when the caller shows the error itself (inline form errors, own toast). */
      skipGlobalError?: boolean;
    };
  }
}

/** Every failed mutation is reported through `notifyError` unless it sets `meta.skipGlobalError`. */
export function createQueryClient(notifyError: (message: string) => void): QueryClient {
  return new QueryClient({
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.skipGlobalError) return;
        notifyError(getApiErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
      },
    },
  });
}
