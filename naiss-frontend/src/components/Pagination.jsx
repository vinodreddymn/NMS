import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function Pagination({ limit, offset, total, onPageChange }) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 bg-white px-3 sm:px-4 py-3 border-t border-gray-200 rounded-b-lg">
      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} results
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
        <button
          onClick={() => onPageChange(Math.max(0, offset - limit))}
          disabled={offset === 0}
          className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div className="hidden xs:flex items-center gap-1 sm:gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = currentPage + i - 2;
            if (pageNum < 1 || pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange((pageNum - 1) * limit)}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition-colors ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        {/* Mobile page indicator */}
        <div className="xs:hidden text-xs text-gray-600 px-2 py-1 rounded-md border border-gray-300">
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={() => onPageChange(offset + limit)}
          disabled={offset + limit >= total}
          className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
