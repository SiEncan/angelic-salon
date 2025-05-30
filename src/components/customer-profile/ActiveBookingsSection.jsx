import { Clock4, Calendar, PhoneIcon, InboxIcon as EnvelopeIcon, CalendarIcon, BookmarkIcon } from 'lucide-react'
import { formatDate, formatTime, getStatusDetails } from "../../utils/formatters"

const ActiveBookingsSection = ({ activeBookings }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock4 className="text-purple-500" />
        Booking Aktif
      </h3>

      <div className="overflow-x-auto">
        {activeBookings.length > 0 ? (
          <>
            {/* Desktop view - Enhanced table */}
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-3 border border-gray-100">
                <div className="grid grid-cols-5 gap-4 font-medium text-purple-800">
                  <div>Service</div>
                  <div>Employee</div>
                  <div>Date</div>
                  <div>Time</div>
                  <div>Status</div>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {activeBookings.map((booking, index) => {
                  const statusDetails = getStatusDetails(booking.status)
                  const isLast = index === activeBookings.length - 1

                  return (
                    <div
                      key={booking.id}
                      className={`grid grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm hover:bg-purple-50 transition-colors ${
                        isLast ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div className="font-medium text-gray-800">
                        {booking.service || booking.serviceName || booking.services?.join(", ")}
                      </div>
                      <div className="text-gray-700 flex items-center">
                        <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-xs font-bold">
                          {booking.employeeName}
                        </div>
                      </div>
                      <div className="text-gray-700">{formatDate(booking.date)}</div>
                      <div className="text-gray-700">{formatTime(booking.time)}</div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusDetails.bgColor} ${statusDetails.textColor}`}
                          title={
                            statusDetails.label === "Terkonfirmasi"
                              ? "Booking terkonfirmasi, silahkan datang sesuai jadwal. Kami menantikan kedatangan Anda!"
                              : statusDetails.label === "Menunggu Konfirmasi"
                              ? "Booking Anda sedang diproses. Kami akan menghubungi Anda segera."
                              : statusDetails.label === "Ditolak"
                              ? "Booking ditolak, silahkan pilih jadwal lain atau hubungi kami untuk informasi lebih lanjut."
                              : ""
                          }
                        >
                          {statusDetails.icon}
                          {statusDetails.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile view - Enhanced card style layout */}
            <div className="md:hidden space-y-3">
              {activeBookings.map((booking) => {
                const statusDetails = getStatusDetails(booking.status)
                return (
                  <div
                    key={booking.id}
                    className={`rounded-lg overflow-hidden shadow-sm border ${
                      booking.status === "rejected"
                        ? "border-red-200"
                        : "border-gray-100"
                    }`}
                  >
                    <div
                      className={`p-3 ${
                        booking.status === "rejected"
                          ? "bg-gradient-to-r from-red-50 to-pink-50"
                          : booking.status === "confirmed"
                          ? "bg-gradient-to-r from-green-50 to-blue-50"
                          : "bg-gradient-to-r from-purple-100 to-pink-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-medium text-purple-900">
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
                          <div className="mt-1 px-3 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-medium">
                            {booking.employeeName}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-purple-50 rounded-lg p-2">
                          <div className="text-xs text-purple-700 mb-1">Date</div>
                          <div className="font-medium text-gray-800">{formatDate(booking.date)}</div>
                        </div>
                        <div className="bg-pink-50 rounded-lg p-2">
                          <div className="text-xs text-pink-700 mb-1">Time</div>
                          <div className="font-medium text-gray-800">{formatTime(booking.time)}</div>
                        </div>
                      </div>

                      {booking.status === "rejected" && (
                        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700">
                          <p className="font-medium">Booking ditolak</p>
                          <p className="text-xs mt-1">
                            Silahkan pilih jadwal lain atau hubungi kami untuk informasi lebih lanjut.
                          </p>
                        </div>
                      )}

                      {booking.status === "pending" && (
                        <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-700">
                          <p className="font-medium">Menunggu konfirmasi</p>
                          <p className="text-xs mt-1">
                            Booking Anda sedang diproses. Kami akan menghubungi Anda segera.
                          </p>
                        </div>
                      )}

                      {booking.status === "confirmed" && (
                        <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700">
                          <p className="font-medium">Booking terkonfirmasi</p>
                          <p className="text-xs mt-1">
                            Silahkan datang sesuai jadwal. Kami menantikan kedatangan Anda!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">Tidak Ada Booking Aktif</h4>
            <p className="text-gray-500 text-center max-w-md">
              Saat ini Anda tidak memiliki booking yang sedang aktif. Booking aktif akan muncul di sini ketika Anda
              membuat reservasi baru.
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-700">
              <AlertCircle className="w-4 h-4 mr-2" />
              Booking yang menunggu konfirmasi, terkonfirmasi, atau ditolak akan ditampilkan di sini
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { AlertCircle } from 'lucide-react'

export default ActiveBookingsSection