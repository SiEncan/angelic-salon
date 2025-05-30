import { useState } from "react"
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline"

const CustomerFilters = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    rank: "",
    minBookings: "",
    maxBookings: "",
  })

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFilters = () => {
    onFilter(filters)
    setIsFilterOpen(false)
  }

  const resetFilters = () => {
    setFilters({
      rank: "",
      minBookings: "",
      maxBookings: "",
    })
    onFilter({})
    setIsFilterOpen(false)
  }

  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span>Filter</span>
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700">Filter Customers</h3>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Rank</label>
                  <select
                    name="rank"
                    value={filters.rank}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">All Ranks</option>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Diamond">Diamond</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Bookings</label>
                    <input
                      type="number"
                      name="minBookings"
                      value={filters.minBookings}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Bookings</label>
                    <input
                      type="number"
                      name="maxBookings"
                      value={filters.maxBookings}
                      onChange={handleFilterChange}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerFilters
