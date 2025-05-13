import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { auth, db } from "../../firebase"
import { doc, getDoc, collection, onSnapshot, updateDoc, where, query, orderBy } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import AddBookingButton from "../../components/AddBookingButton"
import StatusDropdown from "../../components/StatusDropdown"
import dayjs from "dayjs"
import "dayjs/locale/id"
import {
  Calendar,
  Users,
  ClipboardList,
  Briefcase,
  PieChart,
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Scissors,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

const Bookings = () => {
  const [loggedName, setLoggedName] = useState("")
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [editedBookings, setEditedBookings] = useState({})
  const [currentPage, setCurrentPage] = useState(dayjs().month())

  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [sortedBookings, setSortedBookings] = useState([])

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const employeesList = ["Yuli", "Isni", "Dini"]
  const [selectedStatus, setSelectedStatus] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Sort state
  const [sortOrder, setSortOrder] = useState("desc")
  const [sortField, setSortField] = useState("date") // Default sort by date

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  })

  useEffect(() => {
    const monthStart = dayjs().month(currentPage).startOf("month").format("YYYY-MM-DD")
    const monthEnd = dayjs().month(currentPage).endOf("month").format("YYYY-MM-DD")

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd),
      orderBy("date", "desc"),
    )

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setBookings(bookingData)
    })

    return () => unsubscribe()
  }, [currentPage])

  // Calculate status counts
  useEffect(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    }

    bookings.forEach((booking) => {
      const status = booking.status?.toLowerCase()
      if (counts[status] !== undefined) {
        counts[status]++
      }
    })

    setStatusCounts(counts)
  }, [bookings])

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings]

    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter((booking) => booking.employeeName === selectedEmployee)
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((booking) => booking.status?.toLowerCase() === selectedStatus.toLowerCase())
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((booking) => booking.date === selectedDate)
    }

    // Filter by search query (customer name or service)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (booking) =>
          booking.customerName?.toLowerCase().includes(query) ||
          booking.services?.some((service) => service.toLowerCase().includes(query)),
      )
    }

    setFilteredBookings(filtered)
  }, [bookings, selectedEmployee, selectedStatus, selectedDate, searchQuery])

  // Sort bookings
  useEffect(() => {
    const sorted = [...filteredBookings].sort((a, b) => {
      if (sortField === "date") {
        const dateTimeA = new Date(`${a.date} ${a.time}`)
        const dateTimeB = new Date(`${b.date} ${b.time}`)
        return sortOrder === "asc" ? dateTimeA - dateTimeB : dateTimeB - dateTimeA
      } else if (sortField === "price") {
        return sortOrder === "asc" ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice
      } else if (sortField === "name") {
        return sortOrder === "asc"
          ? a.customerName?.localeCompare(b.customerName)
          : b.customerName?.localeCompare(a.customerName)
      }
      return 0
    })

    setSortedBookings(sorted)
  }, [filteredBookings, sortOrder, sortField])

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const saveStatusChange = async (bookingId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId)
      await updateDoc(bookingRef, { status: editedBookings[bookingId] })

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: editedBookings[bookingId] } : b)))

      setEditedBookings((prev) => {
        const newState = { ...prev }
        delete newState[bookingId]
        return newState
      })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const cancelEdit = (id) => {
    setEditedBookings((prev) => {
      const updated = { ...prev }
      delete updated[id]
      return updated
    })
  }

  const handleStatusChange = (bookingId, newStatus) => {
    setEditedBookings((prev) => ({
      ...prev,
      [bookingId]: newStatus,
    }))
  }

  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = dayjs(selectedDate).month()
      setCurrentPage(selectedMonth)
    }
  }, [selectedDate])

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY")

  // Reset all filters
  const resetFilters = () => {
    setSelectedEmployee("")
    setSelectedStatus("")
    setSelectedDate("")
    setSearchQuery("")
  }

  // Auth and user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        console.log("User not logged in")
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (userId) {
      const fetchUserName = async () => {
        const userDocRef = doc(db, "users", userId)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          setLoggedName(userDocSnap.data().fullName)
        } else {
          console.log("User not found!")
        }
      }

      fetchUserName()
    }
  }, [userId])

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
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-purple-500 to-pink-500 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}
      >
        <div className="flex items-center justify-center h-20 border-b border-purple-400 bg-purple-600">
          <h1 className="text-xl font-bold text-white">Angelic Salon & Spa</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {[
            { icon: Calendar, label: "Dashboard", path: "/admin-dashboard" },
            { icon: ClipboardList, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: Users, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: Scissors, label: "Manage Services", path: "/admin-dashboard/manage-services" },
            { icon: Briefcase, label: "Manage Employee", path: "/admin-dashboard/manage-employee" },
            { icon: PieChart, label: "Reports", path: "/reports" },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm transition duration-150 font-medium text-white rounded-md no-underline 
                ${location.pathname === item.path ? "bg-white bg-opacity-20" : "hover:bg-white hover:bg-opacity-10"}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-purple-400">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-white font-bold">
              {loggedName?.charAt(0) || "A"}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{loggedName || "Admin"}</p>
              <button
                onClick={() => {
                  auth.signOut()
                  navigate("/login")
                }}
                className="text-xs text-purple-200 hover:text-white"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white md:hidden">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <header className="w-full">
          <div className="relative md:z-auto z-10 items-center justify-between flex h-16 bg-white shadow px-4">
            {/* Left side */}
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="focus:outline-none md:hidden">
                <Menu className="h-6 w-6" />
              </button>

              <h2 className="text-lg sm:text-xl font-bold ml-4 text-gray-700">Booking Management</h2>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-700" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </div>

              <div className="hidden md:flex items-center">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-2">
                  {loggedName?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-medium text-gray-700">{loggedName || "Admin"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200">
          {/* Status summary cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Booking table section */}
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header and filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Bookings - {monthNames}</h2>

                  <div className="flex items-center mt-3 md:mt-0">
                    <div className="relative mr-2">
                      <input
                        type="text"
                        placeholder="Search customer or service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden md:inline">Filters</span>
                    </button>

                    <AddBookingButton className="ml-2" />
                  </div>
                </div>

                {/* Filter panel */}
                {isFilterOpen && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div>
                        <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 mb-1">
                          Employee
                        </label>
                        <select
                          id="employeeSelect"
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        >
                          <option value="">All Employees</option>
                          {employeesList.map((employee, index) => (
                            <option key={index} value={employee}>
                              {employee}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          id="statusSelect"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending Approval</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          id="dateSelect"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        />
                      </div>

                      <button
                        onClick={resetFilters}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mt-2 md:mt-0"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Month navigation */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <span className="text-sm font-medium text-gray-600">
                    Showing {filteredBookings.length} of {bookings.length} bookings
                  </span>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentPage}-${selectedDate}-${selectedEmployee}-${selectedStatus}-${sortOrder}-${searchQuery}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-full"
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
                          {sortedBookings.length > 0 ? (
                            sortedBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                      {booking.customerName?.charAt(0) || "?"}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                                      <div className="text-sm text-gray-500">
                                        {/* Booked {dayjs(booking.createdAt?.toDate()).fromNow()} */}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{booking.phone || "No phone"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {dayjs(booking.date).format("DD MMM YYYY")}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.time} - {booking.endTime}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {booking.services?.join(", ")}
                                  </div>
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
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(booking.status)}`}
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
                                              : booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <StatusDropdown
                                    booking={booking}
                                    editedBookings={editedBookings}
                                    handleStatusChange={handleStatusChange}
                                  />
                                  {editedBookings[booking.id] && (
                                    <div className="flex mt-2 gap-1">
                                      <button
                                        onClick={() => saveStatusChange(booking.id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => cancelEdit(booking.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                No bookings found
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                      {sortedBookings.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {sortedBookings.map((booking) => (
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
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(booking.status)}`}
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

                                <div>
                                  <StatusDropdown
                                    booking={booking}
                                    editedBookings={editedBookings}
                                    handleStatusChange={handleStatusChange}
                                  />
                                  {editedBookings[booking.id] && (
                                    <div className="flex mt-2 gap-1">
                                      <button
                                        onClick={() => saveStatusChange(booking.id)}
                                        className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => cancelEdit(booking.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">No bookings found</div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Bookings
