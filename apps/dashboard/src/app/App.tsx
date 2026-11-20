import React, { useEffect, useState } from 'react';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { subscribeToAuthChanges } from '@/app/auth';
import { router } from '@/app/router';
import { ToastProvider, useToast } from '@detaileed/ui';
import { createQueryClient } from '@/shared/queryClient';

const AppRouter: React.FC = () => {
  const queryClient = useQueryClient();
  // Route guards read the session in beforeLoad; re-run them whenever it changes.
  useEffect(() => subscribeToAuthChanges(() => void router.invalidate()), []);
  return <RouterProvider router={router} context={{ queryClient }} />;
};

const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [queryClient] = useState(() => createQueryClient((message) => addToast(message, 'error')));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const App: React.FC = () => (
  <ToastProvider>
    <QueryProvider>
      <AppRouter />
    </QueryProvider>
  </ToastProvider>
);

export default App;
