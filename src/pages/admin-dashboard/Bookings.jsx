import { useState, useEffect } from "react"
import { db } from "../../firebase"
import { doc, collection, onSnapshot, updateDoc, deleteDoc, where, query, orderBy, Timestamp } from "firebase/firestore"
import dayjs from "dayjs"
import "dayjs/locale/id"
import { AnimatePresence } from "framer-motion"

// Components
import StatusSummary from "../../components/manage-bookings/StatusSummary"
import FilterPanel from "../../components/manage-bookings/FilterPanel"
import BookingTabs from "../../components/manage-bookings/BookingTabs"
import BookingTable from "../../components/manage-bookings/BookingTable"
import MonthNavigation from "../../components/MonthNavigation"
import BookingDetailsModal from "../../components/manage-bookings/BookingDetailsModal"
import FeedbackModal from "../../components/BookingFeedbackModal"
import AddBookingModal from "../../components/manage-bookings/AddBookingModal"

const Bookings = () => {
  const [currentPage, setCurrentPage] = useState(dayjs().month())
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [sortedBookings, setSortedBookings] = useState([])
  const [activeBookings, setActiveBookings] = useState([])
  const [historyBookings, setHistoryBookings] = useState([])
  const [activeTab, setActiveTab] = useState("active") // "active" or "history"

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
    "in progress": 0,
  })

  // Modal states
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Fetch bookings for the current month
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
      "in progress": 0,
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

  // Separate active and history bookings
  useEffect(() => {
    const active = []
    const history = []

    sortedBookings.forEach((booking) => {
      const status = booking.status?.toLowerCase()
      if (status === "pending" || status === "confirmed" || status === "in progress") {
        active.push(booking)
      } else if (status === "rejected" || status === "completed" || status === "cancelled") {
        history.push(booking)
      }
    })

    setActiveBookings(active)
    setHistoryBookings(history)
  }, [sortedBookings])

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const saveStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId)
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      })

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)))

      showFeedbackModal("success", "Status Updated", "The booking status has been successfully updated.")
    } catch (error) {
      console.error("Error updating status:", error)
      showFeedbackModal("failed", "Update Failed", "There was an error updating the booking status. Please try again.")
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId)
      await deleteDoc(bookingRef)

      setBookings((prev) => prev.filter((b) => b.id !== bookingId))

      showFeedbackModal("success", "Booking Deleted", "The booking has been successfully deleted.")
    } catch (error) {
      console.error("Error deleting booking:", error)
      showFeedbackModal("failed", "Delete Failed", "There was an error deleting the booking. Please try again.")
    }
  }

  const handleViewDetails = (bookingId) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      setSelectedBooking(booking)
      setIsDetailsModalOpen(true)
    }
  }

  const showFeedbackModal = (type, title, description) => {
    setFeedbackModalType(type)
    setFeedbackModalTitle(title)
    setFeedbackModalDescription(description)
    setIsFeedbackModalOpen(true)
  }

  // Reset all filters
  const resetFilters = () => {
    setSelectedEmployee("")
    setSelectedStatus("")
    setSelectedDate("")
    setSearchQuery("")
  }

  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = dayjs(selectedDate).month()
      setCurrentPage(selectedMonth)
    }
  }, [selectedDate])

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY")

  return (
    <>
      <div className="mx-auto pb-16">
        {/* Status summary cards */}
        <StatusSummary statusCounts={statusCounts} />

        {/* Booking table section */}
        <div className="bg-white rounded-lg mt-4 shadow-md overflow-hidden">
          {/* Header and filters */}
          <FilterPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            resetFilters={resetFilters}
            employeesList={employeesList}
            setIsAddBookingOpen={setIsAddBookingOpen}
            monthNames={monthNames}
          />

          {/* Tab navigation */}
          <BookingTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeBookings={activeBookings}
            historyBookings={historyBookings}
          />

          {/* Table */}
          <BookingTable
            activeTab={activeTab}
            activeBookings={activeBookings}
            historyBookings={historyBookings}
            handleStatusChange={saveStatusChange}
            handleViewDetails={handleViewDetails}
            handleDeleteBooking={handleDeleteBooking}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
            currentPage={currentPage}
            selectedDate={selectedDate}
            selectedEmployee={selectedEmployee}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
          />
        </div>

        {/* Month Navigation - Fixed at bottom of screen */}
        <MonthNavigation
          monthNames={monthNames}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          activeTab={activeTab}
          activeBookings={activeBookings}
          historyBookings={historyBookings}
          bookings={bookings}
        />

        {/* Add Booking Modal */}
        <AnimatePresence>
          {isAddBookingOpen && (
            <AddBookingModal
              isOpen={isAddBookingOpen}
              onClose={() => setIsAddBookingOpen(false)}
              onSuccess={showFeedbackModal}
              employeesList={employeesList}
            />
          )}
        </AnimatePresence>

        {/* Booking Details Modal */}
        <AnimatePresence>
          {isDetailsModalOpen && (
            <BookingDetailsModal
              isOpen={isDetailsModalOpen}
              booking={selectedBooking}
              onClose={() => {
                setIsDetailsModalOpen(false)
                setSelectedBooking(null)
              }}
            />
          )}
        </AnimatePresence>

        {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          type={feedbackModalType}
          title={feedbackModalTitle}
          description={feedbackModalDescription}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>
    </>
  )
}

export default Bookings
