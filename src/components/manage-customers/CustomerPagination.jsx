import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

const CustomerPagination = ({
  currentPage,
  totalPages,
  totalCustomers,
  customersPerPage,
  prevPage,
  nextPage,
  goToPage,
  isFirstPage,
  isLastPage,
}) => {
  // Calculate displayed range
  const startIndex = (currentPage - 1) * customersPerPage + 1
  const endIndex = Math.min(currentPage * customersPerPage, totalCustomers)

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)

      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(totalPages, 5)
      }
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between mt-4 px-2">
        <div className="text-sm text-gray-600">
          Showing {totalCustomers} of {totalCustomers} customers
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-2 gap-4">
      <div className="text-sm text-gray-600">
        Showing {startIndex} to {endIndex} of {totalCustomers} customers
      </div>

      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={prevPage}
          disabled={isFirstPage}
          className={`p-2 rounded-md flex items-center justify-center ${
            isFirstPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
          }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        {/* Page numbers */}
        <div className="flex space-x-1">
          {/* First page if not in range */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => goToPage(1)}
                className="px-3 py-2 rounded-md text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                1
              </button>
              {pageNumbers[0] > 2 && <span className="px-2 py-2 text-gray-400">...</span>}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                page === currentPage
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-purple-100 text-purple-600 hover:bg-purple-200"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Last page if not in range */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 py-2 text-gray-400">...</span>
              )}
              <button
                onClick={() => goToPage(totalPages)}
                className="px-3 py-2 rounded-md text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={nextPage}
          disabled={isLastPage}
          className={`p-2 rounded-md flex items-center justify-center ${
            isLastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
          }`}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default CustomerPagination
