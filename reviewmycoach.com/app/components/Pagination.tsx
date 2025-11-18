'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showInfo = false,
  totalItems = 0,
  itemsPerPage = 10,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate the range of pages to show
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show first page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add the calculated range
    rangeWithDots.push(...range);

    // Always show last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const renderPageButton = (page: number | string, index: number) => {
    if (page === '...') {
      return (
        <span
          key={`dots-${index}`}
          className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500"
        >
          ...
        </span>
      );
    }

    const pageNum = page as number;
    const isCurrentPage = pageNum === currentPage;

    return (
      <button
        key={pageNum}
        onClick={() => onPageChange(pageNum)}
        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border rounded-full transition-colors ${
          isCurrentPage
            ? 'z-10 bg-white border-gray-600 text-gray-900'
            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        aria-current={isCurrentPage ? 'page' : undefined}
      >
        {pageNum}
      </button>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info */}
      {showInfo && (
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          of <span className="font-medium">{totalItems}</span> results
        </div>
      )}

      {/* Pagination */}
      <nav className="relative z-0 inline-flex items-center gap-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-3 py-2 rounded-full border text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Page Numbers */}
        {visiblePages.map((page, index) => renderPageButton(page, index))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-3 py-2 rounded-full border text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile: Jump to Page */}
      <div className="sm:hidden flex items-center space-x-2">
        <label htmlFor="page-jump" className="text-sm text-gray-700">
          Page:
        </label>
        <select
          id="page-jump"
          value={currentPage}
          onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
          className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-700">of {totalPages}</span>
      </div>
    </div>
  );
} 