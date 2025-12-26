import { RouterProvider } from 'react-router-dom';
import { router } from '@/lib/routes';
import { AuthProvider } from '@/providers/auth-context';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/lib/react-query';
import { Toaster } from 'sonner';
import { NuqsProvider } from '@/providers/nuqs-provider';

function App() {
  return (
    <NuqsProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster position="top-right" richColors />
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </NuqsProvider>
  );
}

export default App;
