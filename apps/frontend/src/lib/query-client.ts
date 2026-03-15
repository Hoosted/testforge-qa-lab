import { QueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (!(error instanceof ApiClientError)) {
          return failureCount < 2;
        }

        if (error.statusCode >= 500) {
          return failureCount < 2;
        }

        return false;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
