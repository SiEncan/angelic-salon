import { ChevronLeft, ChevronRight } from 'lucide-react'

const MonthNavigation = ({ monthNames, currentPage, setCurrentPage, activeTab, activeBookings, historyBookings, bookings }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 shadow-lg z-5 px-4 py-3 flex justify-between items-center gap-4">
      <button
        onClick={() => setCurrentPage(currentPage - 1)}
        className="bg-purple-100 hover:bg-purple-200 text-xs md:text-base text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      <span className="text-xs md:text-base font-medium text-gray-600">
        {monthNames} • Showing {activeTab === "active" ? activeBookings.length : historyBookings.length} of{" "}
        {bookings.length} bookings
      </span>

      <button
        onClick={() => setCurrentPage(currentPage + 1)}
        className="bg-purple-100 hover:bg-purple-200 text-xs md:text-base text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

export default MonthNavigation