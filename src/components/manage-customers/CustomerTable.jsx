import dayjs from "dayjs"
import SortableHeader from "./SortableHeader"
import CustomerRank from "./CustomerRank"
import CustomerActions from "./CustomerActions"
import { PhoneIcon, EnvelopeIcon, CalendarIcon, BookmarkIcon } from "@heroicons/react/24/outline"

const CustomerTable = ({ customers, sortOrder, handleSort, onEdit, onDelete, onView }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader
              display="Name"
              label="fullName"
              onSort={handleSort}
              sortOrder={sortOrder.column === "fullName" ? sortOrder.order : null}
            />
            <SortableHeader
              display="Email"
              label="email"
              onSort={handleSort}
              sortOrder={sortOrder.column === "email" ? sortOrder.order : null}
            />
            <th className="px-4 py-3 text-left text-gray-600 font-medium">Phone</th>
            <SortableHeader
              display="Registered"
              label="createdAt"
              onSort={handleSort}
              sortOrder={sortOrder.column === "createdAt" ? sortOrder.order : null}
            />
            <SortableHeader
              display="Bookings"
              label="bookingCount"
              onSort={handleSort}
              sortOrder={sortOrder.column === "bookingCount" ? sortOrder.order : null}
            />
            <th className="px-4 py-3 text-left text-gray-600 min-w-[165px] font-medium">Rank</th>
            <th className="px-4 py-3 text-right text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length > 0 ? (
            customers.map((customer, index) => (
              <tr
                key={customer.id}
                className={`border-t border-gray-200 hover:bg-purple-50/30 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                      {customer.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.fullName}</div>
                      {customer.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{customer.notes}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate max-w-[150px]">{customer.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.phone || "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.createdAt ? dayjs(customer.createdAt.toDate()).format("DD MMM YYYY") : "—"}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center text-gray-600">
                    <BookmarkIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {customer.bookingCount || 0}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <CustomerRank totalBooks={customer.bookingCount || 0} />
                </td>
                <td className="px-4 py-3 text-right">
                  <CustomerActions customer={customer} onEdit={onEdit} onDelete={onDelete} onView={onView} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                No customers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default CustomerTable
