import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Calendar, User, X, Check, XCircle, Scissors } from "lucide-react"
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "../../firebase"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import ConfirmationDialog from "../ConfirmationDialog";
import FeedbackModal from "../../components/BookingFeedbackModal"

dayjs.extend(relativeTime)

const Header = ({ isSidebarOpen, setIsSidebarOpen, loggedName, pageTitle }) => {
  const navigate = useNavigate()

  // State for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: "",
    status: "",
    bookingId: "",
    message: "",
  });

  // State for feedbac modal
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")

  const [pendingBookings, setPendingBookings] = useState([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [processingBookings, setProcessingBookings] = useState(new Set())
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const audioRef = useRef(null)
  const notificationRef = useRef(null) 
  const dialogRef = useRef(null); // Ref for ConfirmationDialog
  const modalRef = useRef(null); // Ref for FeedbackModal

  // Initialize audio for notifications
  useEffect(() => {
    // Create audio element for notification sound
    const audio = new Audio("/notification-sound.mp3")
    audio.volume = 0.5
    audioRef.current = audio

    // Add error handler for audio
    const handleAudioError = () => {
      audioRef.current = null
    }

    if (audioRef.current) {
      audioRef.current.addEventListener("error", handleAudioError)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("error", handleAudioError)
      }
    }
  }, [])

  // Listen for pending bookings
  useEffect(() => {
    const pendingBookingsQuery = query(
      collection(db, "bookings"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(pendingBookingsQuery, (snapshot) => {
      const bookings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Play notification sound if new bookings arrived
      if (bookings.length > lastNotificationCount && lastNotificationCount > 0) {
        playNotificationSound()
      }

      setPendingBookings(bookings)
      setLastNotificationCount(bookings.length)
    })

    return () => unsubscribe()
  }, [lastNotificationCount])

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideNotification = notificationRef.current && !notificationRef.current.contains(event.target);
      const isDialogRendered = showConfirmDialog && dialogRef.current;
      const isModalRendered = isFeedbackModalOpen && modalRef.current;
      const isOutsideDialog = isDialogRendered ? !dialogRef.current.contains(event.target) : true;
      const isOutsideModal = isModalRendered ? !modalRef.current.contains(event.target) : true;

      if (isOutsideNotification && isOutsideDialog && isOutsideModal) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen, showConfirmDialog, isFeedbackModalOpen]);

  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {
          // Fallback to Web Audio API beep
          createBeepSound()
        })
      } else {
        createBeepSound()
      }
    } catch (error) {
      console.log("Could not play notification sound:", error)
    }
  }

  const createBeepSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create a pleasant notification sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } catch (error) {
      console.log("Could not create notification sound:", error)
    }
  }

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now"

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return dayjs(date).fromNow()
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return "Just now"
    }
  }

  const handleBookingAction = async (bookingId, newStatus) => {
    if (processingBookings.has(bookingId)) return

    setProcessingBookings((prev) => new Set([...prev, bookingId]))

    try {
      const bookingRef = doc(db, "bookings", bookingId)
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      })

      // Remove from pending bookings
      setPendingBookings((prev) => prev.filter((booking) => booking.id !== bookingId))

    } catch (error) {
      console.error(`Error updating booking status:`, error)
    } finally {

      setShowConfirmDialog(false)
      showFeedbackModal("success", "Status Updated", `Booking status updated to "${(newStatus.charAt(0).toUpperCase() + newStatus.slice(1))}".`)

      setProcessingBookings((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  const confirmStatusChange = (bookingId, status, display) => {
    setConfirmAction({
      type: "status",
      status: status,
      bookingId: bookingId,
      message: `Are you sure you want to "${
        display
      }" this booking?`,
    });
    setShowConfirmDialog(true);
  };

  const showFeedbackModal = (type, title, description) => {
    setFeedbackModalType(type)
    setFeedbackModalTitle(title)
    setFeedbackModalDescription(description)
    setIsFeedbackModalOpen(true)
  }

  const handleViewAllBookings = () => {
    setIsNotificationOpen(false)
    navigate("/admin-dashboard/bookings")
  }

  return (
    <header className="w-full">
      <div className="relative md:z-auto z-10 items-center justify-between flex h-16 bg-white shadow px-4">
        {/* Left side */}
        <div className="flex">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="focus:outline-none md:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>

          <h2 className="text-lg sm:text-xl font-bold ml-4 mt-1.5 text-gray-700">{pageTitle}</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <BellIcon className="h-6 w-6 text-gray-500 hover:text-gray-700" />

              {/* Notification Badge */}
              {pendingBookings.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                >
                  {pendingBookings.length > 99 ? "99+" : pendingBookings.length}
                </motion.span>
              )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg mb-0">Pending Bookings</h3>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div
                    className="max-h-96 overflow-y-auto"
                    style={{
                      scrollbarWidth: "none" /* Firefox */,
                      msOverflowStyle: "none" /* Internet Explorer 10+ */,
                    }}
                  >
                    {pendingBookings.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <BellIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No pending bookings</p>
                        <p className="text-gray-400 text-sm mt-1">All caught up! 🎉</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {pendingBookings.map((booking, index) => (
                          <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-yellow-400"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* Customer Info */}
                                <div className="flex items-center gap-2 mb-2 bg-purple-50 p-2 rounded-lg">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div className="m-0 p-0">
                                    <p className="font-semibold text-gray-900 text-sm mb-2">{booking.customerName}</p>
                                    <p className="text-xs text-gray-500 mt-0 mb-0">{formatTimeAgo(booking.createdAt)}</p>
                                  </div>
                                </div>

                                {/* Booking Details */}
                                <div className="flex gap-2 text-sm mb-0">
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Calendar className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <p className="text-xs font-medium text-gray-800 mt-1 mb-0">
                                    {dayjs(booking.date).format("ddd, D MMM YYYY")}
                                  </p>

                                  <p className="text-xs font-bold text-gray-500 mt-1">·</p>
                                  
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <Clock className="h-3 w-3 text-green-600" />
                                  </div>
                                  <p className="text-xs font-medium text-gray-800 mt-1 mb-0">
                                    {booking.time}
                                  </p>
                                </div>

                                <div className="flex gap-2 text-sm">
                                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                                    <User className="h-3 w-3 text-pink-600" />
                                  </div>
                                  <p className="font-medium text-xs mt-1 items-center justift-center text-gray-800">{booking.employeeName}</p>
                                </div>

                                {/* Services count */}
                                {booking.services && booking.services.length > 0 && (
                                  <div className="flex items-center justify-start gap-2 text-sm mb-2">
                                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                                      <Scissors className="h-3 w-3 text-orange-600" />
                                    </div>
                                      <div className="flex flex-wrap gap-1">
                                        {booking.services.map((service, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                          >
                                            {service}
                                          </span>
                                        ))}
                                      </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => confirmStatusChange(booking.id, 'confirmed', 'Confirm')}
                                disabled={processingBookings.has(booking.id)}
                                className="flex-1 bg-gradient-to-r transition-all duration-200 from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingBookings.has(booking.id) ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Confirm
                              </button>

                              <button
                                onClick={() => confirmStatusChange(booking.id, 'rejected', 'Reject')}
                                disabled={processingBookings.has(booking.id)}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingBookings.has(booking.id) ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                Reject
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {pendingBookings.length > 0 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={handleViewAllBookings}
                        className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      >
                        View All Bookings
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="hidden md:flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-2">
              {loggedName?.charAt(0) || "A"}
            </div>
            <span className="text-sm font-medium text-gray-700">{loggedName}</span>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div ref={dialogRef}>
          <ConfirmationDialog
            message={confirmAction.message}
            onConfirm={() => handleBookingAction(confirmAction.bookingId, confirmAction.status)}
            onCancel={() => setShowConfirmDialog(false)}
            condition={confirmAction.type}
          />
        </div>
      )}

      {/* Feedback Modal */}
      <div ref={modalRef}>
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          type={feedbackModalType}
          title={feedbackModalTitle}
          description={feedbackModalDescription}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      </div>

    </header>
  )
}

export default Header