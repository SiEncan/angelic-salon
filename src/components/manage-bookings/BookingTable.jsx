// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { ArrowUp, ArrowDown, Calendar, Clock, CheckCircle, XCircle, X, Scissors, AlertCircle } from "lucide-react"
import dayjs from "dayjs"
import BookingActions from "./BookingActions"

const BookingTable = ({
  activeTab,
  activeBookings,
  historyBookings,
  handleStatusChange,
  handleViewDetails,
  handleDeleteBooking,
  sortField,
  sortOrder,
  handleSort,
  currentPage,
  selectedDate,
  selectedEmployee,
  selectedStatus,
  searchQuery,
}) => {
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
        return <Clock className="w-4 h-4" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "cancelled":
        return <X className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in progress":
        return <Scissors className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="overflow-x-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${currentPage}-${selectedDate}-${selectedEmployee}-${selectedStatus}-${sortOrder}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-full"
          style={{
            maxHeight: "calc(100vh - 300px)",
            overflowY: "auto",
          }}
        >
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortField === "name" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date & Time
                      {sortField === "date" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Services
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Employee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {sortField === "price" &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeTab === "active" ? (
                  activeBookings.length > 0 ? (
                    activeBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {booking.customerName?.charAt(0) || "?"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                              <div className="text-sm text-gray-500">
                                {dayjs(booking.createdAt.toDate()).format("DD MMM YYYY")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.phone || "No phone"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{dayjs(booking.date).format("DD MMM YYYY")}</div>
                          <div className="text-sm text-gray-500">
                            {booking.time} - {booking.endTime}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{booking.services?.join(", ")}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                            {booking.employeeName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rp{Number(booking.totalPrice).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                              booking.status,
                            )}`}
                          >
                            {getStatusIcon(booking.status)}
                            {booking.status === "pending"
                              ? "Pending Approval"
                              : booking.status === "confirmed"
                                ? "Confirmed"
                                : booking.status === "in progress"
                                  ? "In Progress"
                                  : booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <BookingActions
                            booking={booking}
                            handleStatusChange={handleStatusChange}
                            handleViewDetails={handleViewDetails}
                            handleDeleteBooking={handleDeleteBooking}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="h-8 w-8 text-purple-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-700 mb-2">No Active Bookings</h4>
                          <p className="text-gray-500 text-center max-w-md">
                            There are currently no active bookings that require attention.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : historyBookings.length > 0 ? (
                  historyBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {booking.customerName?.charAt(0) || "?"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">
                              {dayjs(booking.createdAt.toDate()).format("DD MMM YYYY")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.phone || "No phone"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dayjs(booking.date).format("DD MMM YYYY")}</div>
                        <div className="text-sm text-gray-500">
                          {booking.time} - {booking.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{booking.services?.join(", ")}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {booking.employeeName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Rp{Number(booking.totalPrice).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                            booking.status,
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status === "pending"
                            ? "Pending Approval"
                            : booking.status === "confirmed"
                              ? "Confirmed"
                              : booking.status === "rejected"
                                ? "Rejected"
                                : booking.status === "cancelled"
                                  ? "Cancelled"
                                  : booking.status === "completed"
                                    ? "Completed"
                                    : booking.status === "in progress"
                                      ? "In Progress"
                                      : booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <BookingActions
                          booking={booking}
                          handleStatusChange={handleStatusChange}
                          handleViewDetails={handleViewDetails}
                          handleDeleteBooking={handleDeleteBooking}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No Booking History</h4>
                        <p className="text-gray-500 text-center max-w-md">
                          There are no completed or cancelled bookings in the history.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {activeTab === "active" ? (
              activeBookings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {activeBookings.map((booking) => (
                    <div key={booking.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {booking.customerName?.charAt(0) || "?"}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-xs text-gray-500">{booking.phone || "No phone"}</div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                            booking.status,
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status === "pending"
                            ? "Pending Approval"
                            : booking.status === "confirmed"
                              ? "Confirmed"
                              : booking.status === "rejected"
                                ? "Rejected"
                                : booking.status === "cancelled"
                                  ? "Cancelled"
                                  : booking.status === "completed"
                                    ? "Completed"
                                    : booking.status === "in progress"
                                      ? "In Progress"
                                      : booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-500">Date & Time</div>
                          <div className="text-sm font-medium">{dayjs(booking.date).format("DD MMM YYYY")}</div>
                          <div className="text-xs">
                            {booking.time} - {booking.endTime}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-500">Employee</div>
                          <div className="text-sm font-medium">{booking.employeeName}</div>
                          <div className="text-xs text-pink-600">Stylist</div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2 rounded mb-3">
                        <div className="text-xs text-gray-500">Services</div>
                        <div className="text-sm">{booking.services?.join(", ")}</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs text-gray-500">Price</div>
                          <div className="text-sm font-bold">
                            Rp{Number(booking.totalPrice).toLocaleString("id-ID")}
                          </div>
                        </div>

                        <BookingActions
                          booking={booking}
                          handleStatusChange={handleStatusChange}
                          handleViewDetails={handleViewDetails}
                          handleDeleteBooking={handleDeleteBooking}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 flex flex-col items-center justify-center p-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-purple-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No Active Bookings</h4>
                  <p className="text-gray-500 text-center">
                    There are currently no active bookings that require attention.
                  </p>
                </div>
              )
            ) : historyBookings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {historyBookings.map((booking) => (
                  <div key={booking.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                          {booking.customerName?.charAt(0) || "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                          <div className="text-xs text-gray-500">{booking.phone || "No phone"}</div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                          booking.status,
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {booking.status === "rejected"
                          ? "Rejected"
                          : booking.status === "cancelled"
                            ? "Cancelled"
                            : booking.status === "completed"
                              ? "Completed"
                              : booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Date & Time</div>
                        <div className="text-sm font-medium">{dayjs(booking.date).format("DD MMM YYYY")}</div>
                        <div className="text-xs">
                          {booking.time} - {booking.endTime}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Employee</div>
                        <div className="text-sm font-medium">{booking.employeeName}</div>
                        <div className="text-xs text-gray-600">Stylist</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded mb-3">
                      <div className="text-xs text-gray-500">Services</div>
                      <div className="text-sm">{booking.services?.join(", ")}</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">Price</div>
                        <div className="text-sm font-bold">Rp{Number(booking.totalPrice).toLocaleString("id-ID")}</div>
                      </div>

                      <BookingActions
                        booking={booking}
                        handleStatusChange={handleStatusChange}
                        handleViewDetails={handleViewDetails}
                        handleDeleteBooking={handleDeleteBooking}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Booking History</h4>
                <p className="text-gray-500 text-center">
                  There are no completed or cancelled bookings in the history.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default BookingTable