interface EmailPaginationProps {
  page: number;
  totalPages: number;
  hasMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function EmailPagination({
  page,
  totalPages,
  hasMore,
  onPrevPage,
  onNextPage,
}: EmailPaginationProps) {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={onPrevPage}
        disabled={page === 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={onNextPage}
        disabled={!hasMore}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
