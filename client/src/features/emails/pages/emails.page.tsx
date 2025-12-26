import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '@/providers/auth-context';
import { MainErrorFallback } from '@/components/app/app-error-boundary';
import { useNavigate } from 'react-router-dom';
import { useEmails } from '@/features/emails/hooks/use-emails-hook';
import { useDebouncedSearch } from '@/hooks/use-debounced-search';
import { parseAsInteger, useQueryState } from 'nuqs';
import { EmailHeader } from '@/features/emails/components/email-header';
import { EmailSearch } from '@/features/emails/components/email-search';
import { EmailList } from '@/features/emails/components/email-list';
import { EmailPagination } from '@/features/emails/components/email-pagination';
import { EmailLoading } from '@/features/emails/components/email-loading';

export default function EmailsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { value: search, debouncedValue: debouncedSearch, onChange } = useDebouncedSearch('');
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize] = useQueryState('pageSize', parseAsInteger.withDefault(5));
  const offset = (page - 1) * pageSize;
  const { data, isLoading, refetch } = useEmails({
    offset,
    limit: pageSize,
    search: debouncedSearch,
  });

  const handleNextPage = () => {
    if (data?.hasMore) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleFetchEmail = (emailId: string) => {
    navigate(`/email/${emailId}`);
  };

  const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <EmailHeader user={user} onLogout={logout} />
      <EmailSearch value={search} onChange={onChange} />

      <section className="max-w-6xl mx-auto p-4 md:p-8 min-h-[60vh]">
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-semibold text-gray-800">Inbox</h2>
          <span className="text-sm text-gray-500">{data?.emails?.length || 0} messages</span>
        </div>

        <ErrorBoundary FallbackComponent={MainErrorFallback} onReset={() => refetch()}>
          {isLoading ? (
            <EmailLoading />
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <EmailList emails={data?.emails || []} onEmailClick={handleFetchEmail} />
              </div>

              <EmailPagination
                page={page}
                totalPages={totalPages}
                hasMore={data?.hasMore || false}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            </>
          )}
        </ErrorBoundary>
      </section>
    </div>
  );
}
