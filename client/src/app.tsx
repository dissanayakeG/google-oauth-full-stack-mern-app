import { RouterProvider } from 'react-router-dom'
import { router } from "./lib/routes";
import { AuthProvider } from './providers/auth-context';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/react-query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App