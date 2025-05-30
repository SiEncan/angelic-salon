import { useState } from "react"
import { Calendar, Clock, Star, MessageSquare } from 'lucide-react'
import { formatDate, formatTime, getStatusDetails } from "./../../utils/formatters"
import FeedbackReviewModal from "./FeedbackReviewModal"

const BookingHistorySection = ({ historyBookings, setIsBookingOpen, onReviewSubmitted }) => {
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking)
    setIsReviewModalOpen(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-purple-500" />
        Riwayat Booking
      </h3>

      {historyBookings.length > 0 ? (
        <div className="overflow-x-auto">
          {/* Desktop view - Enhanced table */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg p-3 border border-gray-100">
              <div className="grid grid-cols-6 gap-4 font-medium text-gray-700">
                <div>Service</div>
                <div>Employee</div>
                <div>Date</div>
                <div>Time</div>
                <div>Status</div>
                <div>Review</div>
              </div>
            </div>

            <div className="space-y-2 mt-2">
              {historyBookings.map((booking, index) => {
                booking.status = booking.status.toLowerCase()
                const statusDetails = getStatusDetails(booking.status)
                const isLast = index === historyBookings.length - 1
                const canReview = booking.status === "completed" && !booking.review
                
                return (
                  <div
                    key={booking.id}
                    className={`grid grid-cols-6 gap-4 p-3 hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm ${
                      isLast ? "rounded-b-lg" : ""
                    }`}
                  >
                    <div className="font-medium text-gray-800">
                      {booking.service || booking.serviceName || booking.services?.join(", ")}
                    </div>
                    <div className="text-gray-700 flex items-center">
                      <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-2 text-xs font-bold">
                        {booking.employeeName}
                      </div>
                    </div>
                    <div className="text-gray-700">{formatDate(booking.date)}</div>
                    <div className="text-gray-700">{formatTime(booking.time)}</div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusDetails.bgColor} ${statusDetails.textColor}`}
                      >
                        {statusDetails.icon}
                        {statusDetails.label}
                      </span>
                    </div>
                    <div>
                      {booking.review ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <Star className="w-4 h-4 mr-1 fill-green-500 stroke-green-500" />
                          <span>Reviewed</span>
                        </div>
                      ) : canReview ? (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md text-xs font-medium flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Add Review
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {booking.status === "cancelled" || booking.status === "rejected" ? "Not available" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile view - Enhanced card style layout */}
          <div className="md:hidden space-y-3">
            {historyBookings.map((booking) => {
              const statusDetails = getStatusDetails(booking.status)
              const canReview = booking.status === "completed" && !booking.review
              
              return (
                <div
                  key={booking.id}
                  className="rounded-lg overflow-hidden shadow-sm border border-gray-100 opacity-80"
                >
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-700">
                        {booking.service || booking.serviceName || booking.services?.join(", ")}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusDetails.bgColor} ${statusDetails.textColor}`}
                      >
                        {statusDetails.icon}
                        {statusDetails.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-white">
                    <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500">Employee</div>
                        <div className="mt-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                          {booking.employeeName}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-1">Date</div>
                        <div className="font-medium text-gray-800">{formatDate(booking.date)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-1">Time</div>
                        <div className="font-medium text-gray-800">{formatTime(booking.time)}</div>
                      </div>
                    </div>
                    
                    {/* Review section for mobile */}
                    <div className="mt-3">
                      {booking.review ? (
                        <div className="flex items-center justify-center bg-green-50 p-2 rounded-lg text-green-600">
                          <Star className="w-4 h-4 mr-1 fill-green-500 stroke-green-500" />
                          <span className="text-sm">You've reviewed this service</span>
                        </div>
                      ) : canReview ? (
                        <button
                          onClick={() => handleOpenReviewModal(booking)}
                          className="w-full py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Add Your Review
                        </button>
                      ) : (
                        booking.status === "completed" && (
                          <div className="text-center text-gray-400 text-xs p-2">
                            Review not available
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No booking history found.</p>
          <div className="mt-4">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="bg-gradient-to-r mx-auto from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Book an Appointment
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      <FeedbackReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        booking={selectedBooking}
        onReviewSubmitted={() => onReviewSubmitted()}
      />
    </div>
  )
}

export default BookingHistorySection