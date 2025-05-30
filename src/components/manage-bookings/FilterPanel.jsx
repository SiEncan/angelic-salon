import { useState } from "react"
import { Filter, Search, Plus } from "lucide-react"

const FilterPanel = ({
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  selectedStatus,
  setSelectedStatus,
  selectedDate,
  setSelectedDate,
  resetFilters,
  employeesList,
  setIsAddBookingOpen,
  monthNames,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Bookings - {monthNames}</h2>

        <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <input
              type="text"
              placeholder="Search customer or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline">Filters</span>
          </button>

          <button
            onClick={() => setIsAddBookingOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Booking</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Employee
              </label>
              <select
                id="employeeSelect"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="p-2 border rounded-md w-full md:w-40"
              >
                <option value="">All Employees</option>
                {employeesList.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusSelect"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="p-2 border rounded-md w-full md:w-40"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="in progress">In Progress</option>
              </select>
            </div>

            <div>
              <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="dateSelect"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-2 border rounded-md w-full md:w-40"
              />
            </div>

            <button
              onClick={resetFilters}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mt-2 md:mt-0"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel