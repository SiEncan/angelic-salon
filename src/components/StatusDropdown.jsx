import { useState } from "react"
import { CheckCircle, XCircle, Clock, X } from "lucide-react"

const statusOptions = [
  {
    value: "pending",
    label: "Pending Approval",
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    hover: "hover:bg-yellow-500 hover:text-white",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: "confirmed",
    label: "Confirmed",
    bg: "bg-green-500",
    text: "text-green-500",
    hover: "hover:bg-green-500 hover:text-white",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    value: "rejected",
    label: "Rejected",
    bg: "bg-red-500",
    text: "text-red-500",
    hover: "hover:bg-red-500 hover:text-white",
    icon: <XCircle className="w-4 h-4" />,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    bg: "bg-gray-500",
    text: "text-gray-500",
    hover: "hover:bg-gray-500 hover:text-white",
    icon: <X className="w-4 h-4" />,
  },
  {
    value: "completed",
    label: "Completed",
    bg: "bg-blue-500",
    text: "text-blue-500",
    hover: "hover:bg-blue-500 hover:text-white",
    icon: <CheckCircle className="w-4 h-4" />,
  },
]

const StatusDropdown = ({ booking, editedBookings, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Get current status from edited bookings or original booking
  const currentStatus =
    statusOptions.find((option) => option.value === (editedBookings[booking.id] || booking.status?.toLowerCase())) ||
    statusOptions[0]

  return (
    <div className="relative">
      {/* Button utama tetap berwarna sesuai status */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full md:w-36 flex justify-between items-center px-3 py-2 text-white ${currentStatus.bg} rounded-lg shadow-sm text-sm`}
      >
        <div className="flex items-center gap-1">
          {currentStatus.icon}
          <span>{currentStatus.label}</span>
        </div>
        <span className="text-xs">▼</span>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 top-[110%] w-full md:w-48 bg-white border shadow-lg rounded-md z-50">
          {statusOptions.map((option, index) => (
            <div
              key={option.value}
              onClick={() => {
                handleStatusChange(booking.id, option.value)
                setIsOpen(false)
              }}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2 ${option.text} ${option.hover} transition ${
                index === 0 ? "rounded-t-md" : ""
              } ${index === statusOptions.length - 1 ? "rounded-b-md" : ""}`}
            >
              {option.icon}
              <span>{option.label}</span>
              {option.value === booking.status?.toLowerCase() && <span className="ml-auto">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StatusDropdown
