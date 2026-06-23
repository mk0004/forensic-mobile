import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';
import { showAppError } from '@/lib/error-toast';

function toMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) {
        return;
      }
      showAppError(toMessage(error));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});
