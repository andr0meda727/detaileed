'use client';

import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { configureApiClient } from '@detaileed/api-client';
import { ToastProvider, useToast } from '@detaileed/ui';
import { API_URL } from '@/lib/site';
import { createQueryClient } from '@/lib/queryClient';
import { getAccessToken } from '@/lib/supabase/client';

// Browser-side API config. Only in the browser: on the server the fetcher's config is shared by every request,
// so per-user settings must never be set there.
if (typeof window !== 'undefined') {
  configureApiClient({ baseUrl: API_URL, getToken: getAccessToken });
}

function QueryLayer({ children }: { children: ReactNode }) {
  const { addToast } = useToast();
  const [client] = useState(() => createQueryClient((message) => addToast(message, 'error')));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Client-side providers: toasts and React Query (with failed mutations toasted). */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <QueryLayer>{children}</QueryLayer>
    </ToastProvider>
  );
}
