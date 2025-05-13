import { useState, useEffect, useRef } from "react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, AlertCircle } from "lucide-react"
import { collection, getDocs, query, where, addDoc, Timestamp, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "../firebase"
import dayjs from "dayjs"

import EmployeeSelection from "./EmployeeSelection"
import FeedbackModal from "./BookingFeedbackModal"
import ServiceList from "./ServiceList"

const CustomerBookingButton = ({ user, profile, isOpen, setIsOpen, onBookingSuccess }) => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [services, setServices] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [serviceOptions, setServiceOptions] = useState([])
  const [existingBookings, setExistingBookings] = useState([])
  const [employeeList, setEmployeeList] = useState([])

  const today = new Date().toISOString().split("T")[0]

  const employeeSectionRef = useRef(null)
  useEffect(() => {
    if (date && time && services.length > 0 && employeeSectionRef.current) {
      employeeSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [date, time, services])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"))
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setServiceOptions(servicesData)
      } catch (error) {
        console.error("Error fetching services: ", error)
      }
    }

    fetchServices()
  }, [])

  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value).format("YYYY-MM-DD")
    setDate(selectedDate)
    setSelectedEmployee(null)
    fetchBookings(selectedDate)
  }

  const fetchBookings = async (selectedDate) => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "bookings"), where("date", "==", selectedDate)))
      const bookings = querySnapshot.docs.map((doc) => doc.data())
      setExistingBookings(bookings)

      fetchAvailableEmployees()
    } catch (error) {
      console.error("Error fetching bookings: ", error)
    }
  }

  const fetchAvailableEmployees = async () => {
    try {
      const employeeQuery = query(collection(db, "users"), where("role", "==", "employee"))
      const employeeSnapshot = await getDocs(employeeQuery)
      const employees = employeeSnapshot.docs.map((doc) => doc.data().fullName)
      setEmployeeList(employees)
    } catch (error) {
      console.error("Error fetching employees: ", error)
    }
  }

  const calculateEndTime = (startTime, totalDuration) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    const endDate = new Date()
    endDate.setHours(hours)
    endDate.setMinutes(minutes + totalDuration)

    return endDate.toTimeString().slice(0, 5)
  }

  useEffect(() => {
    if (time && services.length > 0) {
      const totalDuration = services.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s)
        return sum + (serviceObj ? serviceObj.duration : 0)
      }, 0)

      const calculatedEndTime = calculateEndTime(time, totalDuration)
      setEndTime(calculatedEndTime)
    }
  }, [time, services, serviceOptions])

  const handleServiceChange = (service) => {
    setSelectedEmployee(null)
    setServices((prev) => {
      const updatedServices = prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]

      const totalPrice = updatedServices.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s)
        return sum + (serviceObj ? serviceObj.price : 0)
      }, 0)

      setTotalPrice(totalPrice)

      return updatedServices
    })
  }

  const handleSaveBooking = async () => {
    if (!date || !time || services.length === 0 || !selectedEmployee) {
      setFeedbackModalType("failed")
      setFeedbackModalTitle("All fields are required")
      setFeedbackModalDescription("Tolong pilih tanggal, waktu, layanan, dan karyawan yang tersedia.")
      setIsFeedbackModalOpen(true)
      return
    }

    if (!isTimeInRange(time)) {
      setFeedbackModalType("failed")
      setFeedbackModalTitle("Gagal Memilih Waktu")
      setFeedbackModalDescription("Waktu booking hanya tersedia antara jam 09:00 - 17:00")
      setIsFeedbackModalOpen(true)
      return
    }

    try {
      const bookingData = {
        customerName: profile.fullName,
        customerId: user.uid,
        phone: profile?.phone || "",
        date,
        time,
        endTime,
        services,
        totalPrice,
        employeeName: selectedEmployee,
        status: "pending", // Initial status is pending, waiting for admin approval
        createdAt: Timestamp.now(),
      }

      await addDoc(collection(db, "bookings"), bookingData)

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        bookingCount: increment(1),
      })

      setFeedbackModalType("success")
      setFeedbackModalTitle("Booking Berhasil Dibuat!")
      setFeedbackModalDescription(
        "Booking Anda telah berhasil dibuat dan sedang menunggu konfirmasi dari admin. Silakan cek halaman profil Anda untuk melihat status booking.",
      )
      setIsFeedbackModalOpen(true)

      setIsOpen(false)

      if (onBookingSuccess) {
        onBookingSuccess()
      }
    } catch (error) {
      console.error("Error saving booking:", error)
      setFeedbackModalType("failed")
      setFeedbackModalTitle("Booking Failed")
      setFeedbackModalDescription("Terjadi kesalahan saat booking. Silakan coba lagi nanti.")
      setIsFeedbackModalOpen(true)
    }
  }

  const resetForm = () => {
    setDate("")
    setTime("")
    setEndTime("")
    setServices([])
    setSelectedEmployee(null)
    setTotalPrice(0)
  }

  const isTimeInRange = (time) => {
    if (!time) return false
    const [hour, minute] = time.split(":").map(Number)
    const totalMinutes = hour * 60 + minute
    const minMinutes = 9 * 60
    const maxMinutes = 17 * 60
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 flex justify-center items-center z-50 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden">
                <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-purple-700">Book Your Appointment</h2>
                </div>

                <div className="overflow-y-auto p-6 pt-4 flex-grow">
                  {/* Booking Process Info */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start gap-2">
                    <AlertCircle className="text-blue-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-700">Proses Booking</h3>
                      <p className="text-xs text-blue-600 mt-1">
                        Booking Anda akan diproses oleh admin untuk konfirmasi. Silakan cek status booking di halaman
                        profil Anda.
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Your Information</h3>

                    <div className="flex items-center gap-3 mb-2">
                      <User className="text-purple-500 w-5 h-5" />
                      <input
                        type="text"
                        value={profile.fullName}
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="text-purple-500 w-5 h-5" />
                      <input
                        type="text"
                        value={profile?.phone || "No phone number"}
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          min={today}
                          value={date}
                          onChange={handleDateChange}
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const selectedTime = e.target.value
                            if (!isTimeInRange(selectedTime)) {
                              setFeedbackModalType("failed")
                              setFeedbackModalTitle("Gagal Memilih Waktu")
                              setFeedbackModalDescription("Waktu booking hanya tersedia antara jam 09:00 - 17:00")
                              setIsFeedbackModalOpen(true)
                              return
                            }

                            setSelectedEmployee(null)
                            setTime(selectedTime)
                          }}
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <ServiceList
                      serviceOptions={serviceOptions}
                      services={services}
                      handleServiceChange={handleServiceChange}
                    />

                    {totalPrice > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Total Price:</span>
                          <span className="text-lg font-bold text-purple-700">
                            Rp{Number(totalPrice).toLocaleString("id-ID")}
                          </span>
                        </div>
                        {endTime && (
                          <div className="text-sm text-gray-500 mt-1">
                            Duration: {time} - {endTime}
                          </div>
                        )}
                      </div>
                    )}

                    {date && time && services.length > 0 && (
                      <div ref={employeeSectionRef}>
                      <EmployeeSelection
                        employeeList={employeeList}
                        date={date}
                        time={time}
                        endTime={endTime}
                        services={services}
                        existingBookings={existingBookings}
                        selectedEmployee={selectedEmployee}
                        setSelectedEmployee={setSelectedEmployee}
                      />
                    </div>
                    )}
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white p-4 border-t mt-auto flex justify-between">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      resetForm()
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBooking}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Submit Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        type={feedbackModalType}
        title={feedbackModalTitle}
        description={feedbackModalDescription}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccess={feedbackModalType === "success" ? resetForm : undefined}
      />
    </>
  )
}

export default CustomerBookingButton
