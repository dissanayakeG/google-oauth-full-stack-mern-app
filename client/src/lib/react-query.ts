import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error('Error', { description: error.message });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error('Error', { description: error.message || 'Failed to update data' });
    },
  }),

  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default queryClient;
