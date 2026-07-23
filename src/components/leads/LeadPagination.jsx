import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi';

export default function LeadPagination({ currentPage, setCurrentPage, totalPages, totalLeads, pageSize }) {
  if (totalLeads === 0) return null;

  return (
    <div className="data-table-footer">
      <span>
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads}
      </span>
      <div className="pagination" role="navigation" aria-label="Pagination">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          aria-label="Previous page"
          aria-disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          <HiOutlineChevronLeft />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
          .map((page, idx, arr) => {
            const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
            return (
              <span key={page} className="flex gap-1">
                {showEllipsis && <span className="px-2 py-1 text-gray-400">...</span>}
                <button
                  className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              </span>
            );
          })}
        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          aria-label="Next page"
          aria-disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          <HiOutlineChevronRight />
        </button>
      </div>
    </div>
  );
}
