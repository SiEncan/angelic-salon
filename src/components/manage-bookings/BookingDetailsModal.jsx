import { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import {
  X,
  XCircle,
  Phone,
  Calendar,
  User,
  DollarSign,
  Scissors,
  Star,
  Clock,
  CheckCircle,
  Globe,
  EyeOff,
} from "lucide-react"
import dayjs from "dayjs"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"

const BookingDetailsModal = ({ isOpen, booking, onClose }) => {
  const [isUpdating, setIsUpdating] = useState(false)

  if (!isOpen || !booking) return null

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "in progress":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-3.5 h-3.5" />
      case "confirmed":
        return <Calendar className="w-3.5 h-3.5" />
      case "in progress":
        return <Clock className="w-3.5 h-3.5" />
      case "completed":
        return <CheckCircle className="w-3.5 h-3.5" />
      case "rejected":
        return <XCircle className="w-3.5 h-3.5" />
      case "cancelled":
        return <XCircle className="w-3.5 h-3.5" />
      default:
        return null
    }
  }

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = []
    const ratingValue = Number.parseInt(rating) || 0

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= ratingValue ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        />,
      )
    }

    return <div className="flex items-center gap-1">{stars}</div>
  }

  // Toggle review public status
  const toggleReviewPublic = async (isPublic) => {
    if (!booking.id || !booking.review) return

    try {
      setIsUpdating(true)

      // Update the review's isPublic field in Firestore
      const bookingRef = doc(db, "bookings", booking.id)
      await updateDoc(bookingRef, {
        "review.isPublic": isPublic,
      })

      // Update local state if needed
      if (booking.review) {
        booking.review.isPublic = isPublic
      }
    } catch (error) {
      console.error("Error updating review visibility:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-0 flex justify-center items-center z-30 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white z-20 p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Booking Details</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 flex-grow">
            {/* Customer Info */}
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                  {booking.customerName?.charAt(0) || "?"}
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-semibold text-gray-900">{booking.customerName}</h3>
                  <div className="text-sm flex items-center text-gray-600">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{booking.phone || "No phone number"}</span>
                  </div>
                </div>
              </div>

              <div
                className={`px-3 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-md items-center gap-1.5 ${getStatusBadgeStyle(booking.status)}`}
              >
                <span>Status:</span>
                <span className="mt-[1px]">{getStatusIcon(booking.status)}</span>
                <span>
                  {booking.status === "pending"
                    ? "Pending Approval"
                    : booking.status === "confirmed"
                      ? "Confirmed"
                      : booking.status === "in progress"
                        ? "In Progress"
                        : booking.status === "completed"
                          ? "Completed"
                          : booking.status === "rejected"
                            ? "Rejected"
                            : booking.status}
                </span>
              </div>
            </div>

            <div className="mb-2 mt-1 text-xs text-gray-700 font-semibold flex items-center bg-gray-50 p-2 rounded-md">
              Booked at: {dayjs(booking.createdAt?.toDate()).format("ddd, DD MMM YYYY")}
            </div>

            {/* Booking Details - Compact Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" />
                  <h4 className="text-xs font-medium text-gray-700">Date</h4>
                </div>
                <p className="text-sm text-gray-800">{dayjs(booking.date).format("ddd, MMM D, YYYY")}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  <h4 className="text-xs font-medium text-gray-700">Time</h4>
                </div>
                <p className="text-sm text-gray-800">
                  {booking.time} - {booking.endTime}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-purple-600" />
                  <h4 className="text-xs font-medium text-gray-700">Employee</h4>
                </div>
                <p className="text-sm text-gray-800">{booking.employeeName}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-purple-600" />
                  <h4 className="text-xs font-medium text-gray-700">Price</h4>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  Rp {Number(booking.totalPrice).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Services */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Scissors className="h-3.5 w-3.5 text-purple-600" />
                <h4 className="text-xs font-medium text-gray-700">Services</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {booking.services?.map((service, index) => (
                  <span key={index} className="inline-flex text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Review Section */}
            {booking.review ? (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-gray-100 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-purple-600">Customer Review</h4>
                  <span className="text-xs text-gray-600 p-1 rounded bg-white shadow-sm">
                    {booking.review.createdAt ? dayjs(booking.review.createdAt.toDate()).format("MMM D, YYYY") : ""}
                  </span>
                </div>

                {/* Star Rating */}
                <div>
                <div className="mb-3">{renderStarRating(booking.review.rating)}</div>

                {/* Comment */}
                {booking.review.comment && (
                  <div className="p-2 rounded shadow-sm border-l-4 border-purple-300 text-sm text-gray-700 bg-white mb-3">
                    {booking.review.comment}
                  </div>
                )}
                </div>

                {/* Public/Private Toggle */}
                <div className="flex items-center justify-between mt-2 bg-white p-2 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    {booking.review.isPublic ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-xs font-medium">
                      {booking.review.isPublic ? "Shown on landing page" : "Hidden from landing page"}
                    </span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={booking.review.isPublic || false}
                      onChange={(e) => toggleReviewPublic(e.target.checked)}
                      disabled={isUpdating}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-medium text-gray-700">Customer Review</h4>
                </div>
                <p className="text-xs text-gray-500">No review yet</p>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white p-3 border-t mt-auto">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default BookingDetailsModal
