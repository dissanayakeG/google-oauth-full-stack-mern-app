import { RouterProvider } from 'react-router-dom'
import { router } from "./routes/routes";
import { AuthProvider } from './providers/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./App.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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