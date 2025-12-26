import { Outlet } from 'react-router-dom';
import LoadingSkeleton from '@/components/app/app-loading-skeleton';
import Error from '@/components/app/app-error';
import { useMe } from '@/features/users/hooks/use-me-hook';

export default function AuthLayout() {
  const { isLoading, error, refetch } = useMe();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <Error error={error as Error} onRetry={() => refetch()} />;

  return (
    <main className="h-[100dvh] bg-white">
      <Outlet />
    </main>
  );
}
