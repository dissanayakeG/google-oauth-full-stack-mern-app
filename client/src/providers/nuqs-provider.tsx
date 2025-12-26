import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';

interface NuqsProviderProps {
  children: React.ReactNode;
}

export function NuqsProvider({ children }: NuqsProviderProps) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}
