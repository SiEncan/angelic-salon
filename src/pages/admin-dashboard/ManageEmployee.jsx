import { useState, useEffect, useRef } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { db } from "../../firebase"
import {
  onSnapshot,
  collection,
  where,
  query,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import dayjs from "dayjs"

const ManageEmployee = () => {
  // Status filters
  const statuses = ["completed", "confirmed", "in progress", "cancelled"]
  const [selectedStatuses, setSelectedStatuses] = useState(["completed"])

  // Employee management state
  const [employees, setEmployees] = useState([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    workingHours: "09:00-17:00",
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Performance tracking state
  const [currentPage, setCurrentPage] = useState(dayjs().month())
  const [employeeData, setEmployeeData] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Modal refs for click outside
  const addModalRef = useRef(null)
  const editModalRef = useRef(null)
  const deleteModalRef = useRef(null)

  // Status styling
  const statusColors = {
    completed: "bg-green-500 text-white",
    confirmed: "bg-blue-500 text-white",
    "in progress": "bg-purple-500 text-white",
    cancelled: "bg-red-500 text-white",
  }

  const statusIcons = {
    completed: CheckCircleIcon,
    confirmed: CalendarIcon,
    "in progress": ClockIcon,
    cancelled: XCircleIcon,
  }

  // Fetch employees and their booking data
  useEffect(() => {
    setIsLoading(true)
    const monthStart = dayjs().month(currentPage).startOf("month").format("YYYY-MM-DD")
    const monthEnd = dayjs().month(currentPage).endOf("month").format("YYYY-MM-DD")

    const daysInMonth = Array.from({ length: dayjs().month(currentPage).daysInMonth() }, (_, i) =>
      dayjs().month(currentPage).startOf("month").add(i, "day").format("YYYY-MM-DD"),
    )

    const usersQuery = query(collection(db, "users"), where("role", "==", "employee"))

    const unsubscribeUsers = onSnapshot(usersQuery, (usersSnapshot) => {
      const employeesList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setEmployees(employeesList)

      const employeeStats = {}
      employeesList.forEach((employee) => {
        employeeStats[employee.fullName] = {}
        daysInMonth.forEach((date) => {
          employeeStats[employee.fullName][date] = {
            completed: 0,
            confirmed: 0,
            "in progress": 0,
            cancelled: 0,
          }
        })
      })

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", ">=", monthStart),
        where("date", "<=", monthEnd),
      )

      const unsubscribeBookings = onSnapshot(bookingsQuery, (querySnapshot) => {
        const bookings = querySnapshot.docs.map((doc) => doc.data())

        // Populate employee stats with booking data
        bookings.forEach((booking) => {
          const { employeeName, date, status } = booking
          const lowerCaseStatus = status?.toLowerCase()
          if (!employeeName || !lowerCaseStatus) return

          const bookingDate = dayjs(date).isValid()
            ? dayjs(date).format("YYYY-MM-DD")
            : date.toDate
              ? dayjs(date.toDate()).format("YYYY-MM-DD")
              : null

          if (
            bookingDate &&
            employeeStats[employeeName] &&
            employeeStats[employeeName][bookingDate] &&
            employeeStats[employeeName][bookingDate][lowerCaseStatus] !== undefined
          ) {
            employeeStats[employeeName][bookingDate][lowerCaseStatus] += 1
          }
        })

        setEmployeeData(employeeStats)
        setIsLoading(false)
      })

      return () => unsubscribeBookings()
    })

    return () => unsubscribeUsers()
  }, [currentPage])

  // Handle click outside modals
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAddModalOpen && addModalRef.current && !addModalRef.current.contains(event.target)) {
        setIsAddModalOpen(false)
      }
      if (isEditModalOpen && editModalRef.current && !editModalRef.current.contains(event.target)) {
        setIsEditModalOpen(false)
      }
      if (isDeleteModalOpen && deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        setIsDeleteModalOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isAddModalOpen, isEditModalOpen, isDeleteModalOpen])

  // Toggle status filter
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  // Calculate employee performance metrics
  const calculateEmployeeMetrics = () => {
    const metrics = {}

    Object.entries(employeeData).forEach(([name, data]) => {
      let totalBookings = 0
      let completedBookings = 0
      let confirmedBookings = 0
      let inProgressBookings = 0
      let cancelledBookings = 0

      Object.values(data).forEach((statusObj) => {
        completedBookings += statusObj.completed || 0
        confirmedBookings += statusObj.confirmed || 0
        inProgressBookings += statusObj["in progress"] || 0
        cancelledBookings += statusObj.cancelled || 0
        totalBookings += Object.values(statusObj).reduce((sum, count) => sum + count, 0)
      })

      metrics[name] = {
        totalBookings,
        completedBookings,
        confirmedBookings,
        inProgressBookings,
        cancelledBookings,
      }
    })

    return metrics
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Open add employee modal
  const openAddModal = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      workingHours: "09:00-17:00",
      isActive: true,
    })
    setFormError("")
    setIsAddModalOpen(true)
  }

  // Open edit employee modal
  const openEditModal = (employee) => {
    setCurrentEmployee(employee)
    setFormData({
      fullName: employee.fullName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      specialization: employee.specialization || "",
      workingHours: employee.workingHours || "09:00-17:00",
      isActive: employee.isActive !== false, // Default to true if not specified
    })
    setFormError("")
    setIsEditModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (employee) => {
    setCurrentEmployee(employee)
    setIsDeleteModalOpen(true)
  }

  // Add new employee
  const handleAddEmployee = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email) {
      setFormError("Name and email are required")
      return
    }

    setIsSubmitting(true)
    setFormError("")

    try {
      await addDoc(collection(db, "users"), {
        ...formData,
        role: "employee",
        createdAt: serverTimestamp(),
      })

      setIsAddModalOpen(false)
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        specialization: "",
        workingHours: "09:00-17:00",
        isActive: true,
      })
    } catch (error) {
      console.error("Error adding employee:", error)
      setFormError("Failed to add employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update employee
  const handleUpdateEmployee = async (e) => {
    e.preventDefault()

    if (!formData.fullName || !formData.email) {
      setFormError("Name and email are required")
      return
    }

    setIsSubmitting(true)
    setFormError("")

    try {
      const employeeRef = doc(db, "users", currentEmployee.id)
      await updateDoc(employeeRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      })

      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating employee:", error)
      setFormError("Failed to update employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete employee
  const handleDeleteEmployee = async () => {
    setIsSubmitting(true)

    try {
      const employeeRef = doc(db, "users", currentEmployee.id)
      await deleteDoc(employeeRef)

      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting employee:", error)
      setFormError("Failed to delete employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY")
  const employeeMetrics = calculateEmployeeMetrics()

  return (
    <div className="mx-auto">
      {/* Header with month navigation */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Employee Management</h2>
            <p className="text-gray-500">Manage employees and track their performance</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium text-gray-700">{monthNames}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Employee management section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Employee List</h3>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <PlusIcon className="h-5 w-5" />
            Add New Employee
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                          {employee.fullName?.charAt(0) || "?"}
                        </div>
                        <div className="text-sm font-medium text-gray-900 ml-3">{employee.fullName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.specialization ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {employee.specialization}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.workingHours || "09:00-17:00"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {employee.isActive !== false ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(employee)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(employee)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Filter by Status</h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => {
            const StatusIcon = statusIcons[status]
            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  selectedStatuses.includes(status)
                    ? statusColors[status]
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <StatusIcon className="h-5 w-5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Employee performance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Object.entries(employeeMetrics).map(([name, metrics]) => (
          <div
            key={name}
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
                  <p className="text-sm text-gray-500">
                    {employees.find((e) => e.fullName === name)?.specialization || "Employee"}
                  </p>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee booking table */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Booking Summary</h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : Object.keys(employeeData).length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employee data available</h3>
            <p className="text-gray-500">There are no employees or bookings for the selected month.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-x-auto"
            >
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 z-10 border-b border-gray-200">
                      Employee
                    </th>
                    {Object.keys(employeeData).length > 0 &&
                      Object.keys(employeeData[Object.keys(employeeData)[0]]).map((date, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                            dayjs(date).day() === 0 || dayjs(date).day() === 6 ? "bg-pink-50" : "bg-gray-50"
                          }`}
                        >
                          <div>{dayjs(date).format("D")}</div>
                          <div className="text-[10px] font-normal">{dayjs(date).format("ddd")}</div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(employeeData).map(([name, data], rowIndex) => (
                    <tr key={name} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 z-10 border-r border-gray-100 bg-inherit">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                            {name.charAt(0)}
                          </div>
                          {name}
                        </div>
                      </td>
                      {Object.entries(data).map(([date, statusObj], i) => {
                        const dayTotal = selectedStatuses.reduce((sum, status) => sum + (statusObj[status] || 0), 0)
                        const isWeekend = dayjs(date).day() === 0 || dayjs(date).day() === 6
                        return (
                          <td
                            key={i}
                            className={`px-4 py-4 whitespace-nowrap text-sm text-center ${
                              isWeekend ? "bg-pink-50" : ""
                            }`}
                          >
                            {dayTotal > 0 ? (
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                  dayTotal > 3
                                    ? "bg-green-100 text-green-800"
                                    : dayTotal > 1
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {dayTotal}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                ref={addModalRef}
                className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Add New Employee</h3>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{formError}</div>
                  )}

                  <form onSubmit={handleAddEmployee}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. Hair Stylist, Nail Technician"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                        <input
                          type="text"
                          name="workingHours"
                          value={formData.workingHours}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. 09:00-17:00"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div
                            className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 
                                      peer-checked:bg-green-600 peer-checked:after:translate-x-full 
                                      peer-checked:after:border-white after:content-[''] after:absolute 
                                      after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 
                                      after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          ></div>
                          <span className="ml-3 text-sm text-gray-700">Active Employee</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          "Add Employee"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                ref={editModalRef}
                className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Edit Employee</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {formError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{formError}</div>
                  )}

                  <form onSubmit={handleUpdateEmployee}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. Hair Stylist, Nail Technician"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                        <input
                          type="text"
                          name="workingHours"
                          value={formData.workingHours}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g. 09:00-17:00"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            id="editIsActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="sr-only peer" // Hide the checkbox but keep it functional
                          />
                          <div
                            className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-300 
                                      peer-checked:bg-green-500 peer-checked:after:translate-x-full 
                                      peer-checked:after:border-white after:content-[''] after:absolute 
                                      after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 
                                      after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          ></div>
                          <span className="ml-3 text-sm text-gray-700">Active Employee</span>
                        </label>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Updating...
                          </>
                        ) : (
                          "Update Employee"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
            duration: 0.3,
          }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div ref={deleteModalRef} className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Confirm Delete</h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <TrashIcon className="h-8 w-8 text-red-600" />
                    </div>
                  </div>

                  <p className="text-center text-gray-700 mb-6">
                    Are you sure you want to delete employee{" "}
                    <span className="font-bold">{currentEmployee?.fullName}</span>? <br /> This action cannot be undone.
                  </p>

                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteEmployee}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors flex items-center justify-center disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete Employee"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageEmployee
