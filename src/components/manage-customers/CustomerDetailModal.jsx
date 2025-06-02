import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { XMarkIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline"
import dayjs from "dayjs"
import CustomerRank from "./CustomerRank"

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!customer) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex justify-between items-start">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 mt-4">
                    Customer Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="mt-6">
                  <div className="flex items-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold mr-4">
                      {customer.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900">{customer.fullName}</h4>
                      <div className="mt-1">
                        <CustomerRank totalBooks={customer.bookingCount || 0} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{customer.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">{customer.phone || "—"}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Registered On</p>
                        <p className="text-gray-800">
                          {customer.createdAt ? dayjs(customer.createdAt.toDate()).format("DD MMMM YYYY") : "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-800">{customer.address || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {customer.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Notes</p>
                      <p className="text-gray-800">{customer.notes}</p>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="text-2xl font-bold text-purple-600">{customer.bookingCount || 0}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Last Visit</p>
                      <p className="text-blue-600 font-medium">
                        {customer.lastVisit ? dayjs(customer.lastVisit).format("DD MMM YYYY") : "Never"}
                      </p>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default CustomerDetailModal
