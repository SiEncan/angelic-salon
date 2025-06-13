import { useState } from "react"
import { CheckCircleIcon, CalendarIcon, ClockIcon, XCircleIcon, StarIcon } from "@heroicons/react/24/outline"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import EmployeeRatingChart from "./employee-rating-chart"

const EmployeePerformanceCard = ({ name, metrics, employee, currentPage }) => {
  const [showRatings, setShowRatings] = useState(false)

  const currentYear = new Date().getFullYear()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="bg-gradient-to-r from-purple-500 to-pink-300 h-3"></div>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
            {name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">{employee?.specialization || "Employee"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center">
              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" /> Completed
            </span>
            <span className="font-semibold text-green-600">{metrics.completedBookings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center">
              <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" /> Confirmed
            </span>
            <span className="font-semibold text-blue-600">{metrics.confirmedBookings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center">
              <ClockIcon className="h-4 w-4 text-purple-500 mr-1" /> In Progress
            </span>
            <span className="font-semibold text-purple-600">{metrics.inProgressBookings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 flex items-center">
              <XCircleIcon className="h-4 w-4 text-red-500 mr-1" /> Cancelled
            </span>
            <span className="font-semibold text-red-600">{metrics.cancelledBookings}</span>
          </div>

          {/* Rating summary */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <span className="text-gray-600 flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-500 mr-1" /> Rating
            </span>
            <span className="font-semibold text-yellow-600">
              {metrics.averageRating ? `${metrics.averageRating} (${metrics.ratingCount})` : "No ratings"}
            </span>
          </div>
        </div>

        {/* Toggle ratings button */}
        <button
          onClick={() => setShowRatings(!showRatings)}
          className="mt-4 w-full py-2 px-3 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center"
        >
          {showRatings ? "Hide Ratings" : "Show Ratings"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ml-1 transition-transform ${showRatings ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable ratings section */}
        {showRatings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 border-t border-gray-100 pt-4"
          >
            <EmployeeRatingChart 
              employeeName={name} 
              month={currentPage} 
              year={currentYear} 
              metrics={metrics} 
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default EmployeePerformanceCard
