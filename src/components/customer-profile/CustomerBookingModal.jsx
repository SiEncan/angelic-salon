import { useState, useEffect, useRef } from "react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, AlertCircle, Crown, Star, Gift, Zap } from "lucide-react"
import { collection, getDocs, query, where, addDoc, Timestamp, updateDoc, doc, increment } from "firebase/firestore"
import { db } from "../../firebase"
import dayjs from "dayjs"

import EmployeeSelection from "../EmployeeSelection"
import FeedbackModal from "../BookingFeedbackModal"
import CategoryServiceList from "../CategoryServiceList"
// import ServiceList from "../ServiceList"

const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
const thresholds = [0, 10, 25, 50, 100]

const getRank = (bookingCount) => {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (bookingCount >= thresholds[i]) {
      return ranks[i]
    }
  }
  return "Bronze"
}

const getRankColor = (rank) => {
  switch (rank) {
    case "Bronze":
      return "from-amber-600 to-amber-800"
    case "Silver":
      return "from-gray-400 to-gray-600"
    case "Gold":
      return "from-yellow-500 to-yellow-600"
    case "Platinum":
      return "from-slate-400 to-slate-500"
    case "Diamond":
      return "from-blue-400 to-purple-600"
    default:
      return "from-amber-600 to-amber-800"
  }
}

const getProgressColor = (rank) => {
  switch (rank) {
    case "Bronze":
      return "bg-amber-800"
    case "Silver":
      return "bg-gray-600"
    case "Gold":
      return "bg-yellow-600"
    case "Platinum":
      return "bg-slate-500"
    case "Diamond":
      return "bg-purple-600"
    default:
      return "bg-amber-800"
  }
}

const getRankIcon = (rank) => {
  switch (rank) {
    case "Bronze":
      return <Star className="w-6 h-6" />
    case "Silver":
      return <Star className="w-4 h-4" />
    case "Gold":
      return <Crown className="w-4 h-4" />
    case "Platinum":
      return <Crown className="w-4 h-4" />
    case "Diamond":
      return <Zap className="w-4 h-4" />
    default:
      return <Star className="w-4 h-4" />
  }
}

const getNextRankInfo = (currentRank, bookingCount) => {
  const currentIndex = ranks.indexOf(currentRank)
  if (currentIndex === ranks.length - 1) {
    return null // Already at highest rank
  }

  const nextRank = ranks[currentIndex + 1]
  const nextThreshold = thresholds[currentIndex + 1]
  const bookingsNeeded = nextThreshold - bookingCount

  return { nextRank, bookingsNeeded, nextThreshold }
}

const CustomerBookingButton = ({ userId, profile, isOpen, setIsOpen, onBookingSuccess }) => {
  const currentRank = getRank(profile?.bookingCount || 0)
  const nextRankInfo = getNextRankInfo(currentRank, profile?.bookingCount || 0)

  const rankBenefits = {
    Bronze: "5% off on first service",
    Silver: "5% discount on weekdays (Mon-Fri)",
    Gold: "5% weekday discount + 5% on selected services",
    Platinum: "10% discount on all services",
    Diamond: "15% discount + VIP treatment",
  }

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")

  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [services, setServices] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [categorizedServices, setCategorizedServices] = useState([])
  const [serviceOptions, setServiceOptions] = useState([])
  const [existingBookings, setExistingBookings] = useState([])
  const [employeeList, setEmployeeList] = useState([])

  const today = new Date().toISOString().split("T")[0]

  const employeeSectionRef = useRef(null)

  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, "serviceCategories"))
        const categories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, "services"))
        const services = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Group services by category and sort alphabetically
        const categorizedData = categories
          .map((category) => ({
            ...category,
            services: services
              .filter((service) => service.categoryId === category.id)
              .sort((a, b) => a.name.localeCompare(b.name)), // Sort services alphabetically
          }))
          .filter((category) => category.services.length > 0) // Only show categories with services
          .sort((a, b) => a.title.localeCompare(b.title)) // Sort categories alphabetically

        setCategorizedServices(categorizedData)
        setServiceOptions(services) // Keep flat array for calculations
      } catch (error) {
        console.error("Error fetching services and categories: ", error)
      }
    }

    if (isOpen) {
      fetchServicesAndCategories()
    }
  }, [isOpen])

  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value).format("YYYY-MM-DD")
    setDate(selectedDate)
    setSelectedEmployee(null)
    fetchBookings(selectedDate)
  }

  const fetchBookings = async (selectedDate) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "bookings"),
          where("date", "==", selectedDate),
          where("status", "in", ["pending", "in progress", "confirmed"])
        )
      )
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

      const employees = employeeSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          name: data.fullName,
          isActive: data.isActive ?? false,
        }
      })
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

  // Calculate discount based on rank and conditions
  const calculateDiscount = (services, originalPrice, rank, date, isFirstBooking = false) => {
    let discount = 0

    switch (rank) {
      case "Bronze":
        if (isFirstBooking || (profile?.bookingCount || 0) === 0) {
          discount = originalPrice * 0.05
        }
        break

      case "Silver":
        if (date) {
          const dayOfWeek = dayjs(date).day()
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            discount = originalPrice * 0.05
          }
        }
        break

      case "Gold": {
        let goldDiscount = 0

        if (date) {
          const dayOfWeek = dayjs(date).day()
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            goldDiscount += originalPrice * 0.05
          }
        }

        const goldSelectedServices = ["Menicure", "Pedicure"]
        const eligibleServices = services.filter((service) => goldSelectedServices.includes(service))
        if (eligibleServices.length > 0) {
          const eligiblePrice = eligibleServices.reduce((sum, service) => {
            const serviceObj = serviceOptions.find((opt) => opt.name === service)
            return sum + (serviceObj ? serviceObj.price : 0)
          }, 0)
          goldDiscount += eligiblePrice * 0.05
        }

        discount = goldDiscount
        break
      }

      case "Platinum":
        discount = originalPrice * 0.1
        break

      case "Diamond":
        discount = originalPrice * 0.15
        break

      default:
        discount = 0
    }

    return Math.round(discount)
  }

  const handleServiceChange = (service) => {
    setSelectedEmployee(null)
    setServices((prev) => {
      const updatedServices = prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]

      // Calculate original price
      const originalPrice = updatedServices.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s)
        return sum + (serviceObj ? serviceObj.price : 0)
      }, 0)

      // Calculate discount
      const discount = calculateDiscount(
        updatedServices,
        originalPrice,
        currentRank,
        date,
        (profile?.bookingCount || 0) === 0,
      )

      // Calculate final price
      const finalPrice = originalPrice - discount

      setOriginalPrice(originalPrice)
      setDiscountAmount(discount)
      setTotalPrice(finalPrice)

      return updatedServices
    })
  }

  // Recalculate discount when date changes (for Silver rank weekday discount)
  useEffect(() => {
    if (services.length > 0 && originalPrice > 0) {
      const discount = calculateDiscount(services, originalPrice, currentRank, date, (profile?.bookingCount || 0) === 0)
      const finalPrice = originalPrice - discount
      setDiscountAmount(discount)
      setTotalPrice(finalPrice)
    }
  }, [date, currentRank, services, originalPrice, profile?.bookingCount, serviceOptions])

  const handleSaveBooking = async () => {
    if (!date || !time || services.length === 0 || !selectedEmployee) {
      setFeedbackModalType("failed")
      setFeedbackModalTitle("All fields are required")
      setFeedbackModalDescription("Tolong pilih tanggal, waktu, layanan, dan karyawan yang tersedia.")
      setIsFeedbackModalOpen(true)
      return
    }

    if (!isTimeInRange(time, services)) {
      setFeedbackModalType("failed")
      setFeedbackModalTitle("Gagal Memilih Waktu")
      setFeedbackModalDescription("Waktu booking hanya tersedia antara jam 09:00 - 17:00")
      setIsFeedbackModalOpen(true)
      return
    }

    try {
      const bookingData = {
        customerName: profile.fullName,
        customerId: userId,
        phone: profile?.phone || "",
        date,
        time,
        endTime,
        services,
        totalPrice,
        employeeName: selectedEmployee,
        status: "pending",
        createdAt: Timestamp.now(),
      }

      await addDoc(collection(db, "bookings"), bookingData)

      const userRef = doc(db, "users", userId)
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
    setOriginalPrice(0)
    setDiscountAmount(0)
  }

  const isTimeInRange = (startTime, services) => {
    if (!startTime || services.length === 0) return false

    const totalDuration = services.reduce((sum, s) => {
      const serviceObj = serviceOptions.find((opt) => opt.name === s)
      return sum + (serviceObj ? serviceObj.duration : 0)
    }, 0)

    const [hours, minutes] = startTime.split(":").map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + totalDuration

    const minMinutes = 9 * 60
    const maxMinutes = 17 * 60

    return startMinutes >= minMinutes && endMinutes <= maxMinutes
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
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 flex justify-center items-center z-10 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden">
                {/* Rank Display - Above Modal */}
                <div className="sticky top-0 z-20">
                  <div className={`bg-gradient-to-r ${getRankColor(currentRank)} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRankIcon(currentRank)}
                        <div>
                          <h3 className="font-bold text-lg">{currentRank} Member</h3>
                          <p className="text-xs opacity-90">{profile?.bookingCount || 0} bookings completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Gift className="w-5 h-5 mx-auto mb-1" />
                        <p className="text-xs font-medium">Rank Benefits</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mt-2 bg-gray-100 bg-opacity-20 rounded-lg p-2">
                      <p className="text-xs font-medium mb-1">Current Benefits:</p>
                      <p className="text-xs">{rankBenefits[currentRank]}</p>
                    </div>

                    {/* Progress to Next Rank */}
                    {nextRankInfo && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>
                            {nextRankInfo.bookingsNeeded} more bookings to {nextRankInfo.nextRank}
                          </span>
                          <span>
                            {profile?.bookingCount || 0}/{nextRankInfo.nextThreshold}
                          </span>
                        </div>
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1.5">
                          <div
                            className={`${getProgressColor(currentRank)} h-1.5 rounded-full transition-all duration-300`}
                            style={{
                              width: `${Math.min(((profile?.bookingCount || 0) / nextRankInfo.nextThreshold) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-y-auto p-4 flex-grow">
                  {/* Booking Process Info */}
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 flex items-start gap-2">
                    <AlertCircle className="text-blue-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-700">Proses Booking</h3>
                      <p className="text-xs text-blue-600 mt-1">
                        Booking Anda akan diproses oleh admin untuk konfirmasi. Silakan cek status booking di halaman
                        profil Anda.
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">Your Information</h3>

                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-purple-500 w-4 h-4" />
                      <input
                        type="text"
                        value={profile.fullName}
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700 text-sm"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="text-purple-500 w-4 h-4" />
                      <input
                        type="text"
                        value={profile?.phone || "No phone number"}
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700 text-sm"
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
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => {
                            const selectedTime = e.target.value
                            setSelectedEmployee(null)
                            setTime(selectedTime)
                          }}
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>

                    <CategoryServiceList
                      categorizedServices={categorizedServices}
                      selectedServices={services}
                      onServiceChange={handleServiceChange}
                    />

                    {totalPrice > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {discountAmount > 0 && (
                          <div className="space-y-1 mb-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Original Price:</span>
                              <span className="text-gray-600 line-through">
                                Rp{Number(originalPrice).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-green-600">{currentRank} Discount:</span>
                              <span className="text-green-600">
                                -Rp{Number(discountAmount).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 text-sm font-medium">
                            {discountAmount > 0 ? "Final Price:" : "Total Price:"}
                          </span>
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
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBooking}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium text-sm"
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
