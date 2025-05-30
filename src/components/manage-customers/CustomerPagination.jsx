"use client"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

const CustomerPagination = ({ currentPage, totalPages, prevPage, nextPage, isFirstPage, isLastPage }) => {
  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages || "many"}
      </div>
      <div className="flex space-x-2">
        <button
          onClick={prevPage}
          disabled={isFirstPage}
          className={`p-2 rounded-md flex items-center justify-center ${
            isFirstPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200"
          }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          onClick={nextPage}
          disabled={isLastPage}
          className={`p-2 rounded-md flex items-center justify-center ${
            isLastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-600 hover:bg-purple-200"
          }`}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default CustomerPagination
