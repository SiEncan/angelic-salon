import { useState, useEffect } from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { Search, Clock, Crown, Star, Gift, Zap } from "lucide-react"
import dayjs from "dayjs"
import { db } from "../../firebase"
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore"

// Rank configuration
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

const getRankIcon = (rank) => {
  switch (rank) {
    case "Bronze":
      return <Star className="w-4 h-4" />
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

const rankBenefits = {
  Bronze: "5% off on first service",
  Silver: "5% discount on weekdays (Mon-Fri)",
  Gold: "5% weekday discount + 5% on selected services",
  Platinum: "10% discount on all services",
  Diamond: "15% discount + VIP treatment + exclusive offers",
}

const AddBookingModal = ({ isOpen, onClose, onSuccess, employeesList }) => {
  // Form state
  const [nameInput, setNameInput] = useState("")
  const [phone, setPhone] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [services, setServices] = useState([])
  const [originalPrice, setOriginalPrice] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedBookingEmployee, setSelectedBookingEmployee] = useState(null)

  // Search state
  const [suggestions, setSuggestions] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Data state
  const [serviceOptions, setServiceOptions] = useState([])
  const [existingBookings, setExistingBookings] = useState([])

  // Get customer rank if they're registered
  const customerRank = selectedUser?.bookingCount ? getRank(selectedUser.bookingCount) : null

  useEffect(() => {
    if (isOpen) {
      fetchServices()
    } else {
      resetForm()
    }
  }, [isOpen])

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

  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value).format("YYYY-MM-DD")
    setDate(selectedDate)
    setSelectedBookingEmployee(null)
    fetchBookingsForDate(selectedDate)

    // Recalculate discount when date changes (for weekday discounts)
    if (selectedUser && services.length > 0) {
      calculatePriceWithDiscount(services, selectedDate)
    }
  }

  const fetchBookingsForDate = async (selectedDate) => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "bookings"), where("date", "==", selectedDate)))
      const bookings = querySnapshot.docs.map((doc) => doc.data())
      setExistingBookings(bookings)
    } catch (error) {
      console.error("Error fetching bookings: ", error)
    }
  }

  const handleSearchCustomer = async () => {
    if (nameInput.trim() === "") {
      setSuggestions([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    try {
      const q = query(
        collection(db, "users"),
        where("fullName", ">=", nameInput),
        where("fullName", "<=", nameInput + "\uf8ff"),
      )

      const querySnapshot = await getDocs(q)
      const fetchedCustomers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setSuggestions(fetchedCustomers)
    } catch (error) {
      console.error("Error fetching customers:", error)
      setSuggestions([])
    }
  }

  useEffect(() => {
    if (selectedUser) {
      setNameInput(selectedUser.fullName)
      setPhone(selectedUser.phone || "No phone number")

      // Recalculate price with discount when user changes
      if (services.length > 0) {
        calculatePriceWithDiscount(services, date)
      }
    } else {
      // Reset discount if no user selected
      setDiscountAmount(0)
      if (originalPrice > 0) {
        setTotalPrice(originalPrice)
      }
    }
  }, [selectedUser])

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSuggestions([])
    setIsSearching(false)
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

  // Calculate discount based on customer rank
  const calculateDiscount = (
    services,
    originalPrice,
    rank,
    date,
    isFirstBooking = false,
  ) => {
    if (!rank) return 0

    let discount = 0

    switch (rank) {
      case "Bronze":
        // 5% off first service (assuming this means first booking ever)
        if (isFirstBooking || (selectedUser?.bookingCount || 0) === 0) {
          discount = originalPrice * 0.05
        }
        break

      case "Silver":
        // 5% discount on weekdays (Mon-Fri)
        if (date) {
          const dayOfWeek = dayjs(date).day() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            // Monday to Friday
            discount = originalPrice * 0.05
          }
        }
        break

      case "Gold":
        // 5% weekday discount + 5% on selected services
        { let goldDiscount = 0

        // 5% weekday discount
        if (date) {
          const dayOfWeek = dayjs(date).day()
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            goldDiscount += originalPrice * 0.05
          }
        }

        // + 5% discount on selected services
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
        break }

      case "Platinum":
        // 10% discount on all services
        discount = originalPrice * 0.1
        break

      case "Diamond":
        // 15% discount + VIP treatment + exclusive offers
        discount = originalPrice * 0.15
        break

      default:
        discount = 0
    }

    return Math.round(discount)
  }

  const calculatePriceWithDiscount = (selectedServices, selectedDate) => {
    // Calculate original price
    const calculatedOriginalPrice = selectedServices.reduce((sum, s) => {
      const serviceObj = serviceOptions.find((opt) => opt.name === s)
      return sum + (serviceObj ? serviceObj.price : 0)
    }, 0)

    setOriginalPrice(calculatedOriginalPrice)

    // If no registered user, no discount
    if (!selectedUser || !customerRank) {
      setDiscountAmount(0)
      setTotalPrice(calculatedOriginalPrice)
      return
    }

    // Calculate discount based on rank
    const calculatedDiscount = calculateDiscount(
      selectedServices,
      calculatedOriginalPrice,
      customerRank,
      selectedDate,
      (selectedUser?.bookingCount || 0) === 0,
    )

    setDiscountAmount(calculatedDiscount)
    setTotalPrice(calculatedOriginalPrice - calculatedDiscount)
  }

  const handleServiceChange = (service) => {
    setSelectedBookingEmployee(null)
    setServices((prev) => {
      const updatedServices = prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]

      // Calculate price with discount
      calculatePriceWithDiscount(updatedServices, date)

      return updatedServices
    })
  }

  const handleSaveBooking = async () => {
    if (!date || !time || services.length === 0 || !selectedBookingEmployee) {
      onSuccess("failed", "All fields are required", "Please fill in all required fields to create a booking.")
      return
    }

    try {
      const bookingData = {
        customerName: selectedUser?.fullName ?? nameInput,
        phone: selectedUser?.phone ?? phone,
        date,
        time,
        endTime,
        services,
        totalPrice,
        employeeName: selectedBookingEmployee,
        status: "confirmed",
        createdAt: Timestamp.now(),
      }

      // Add customer-specific data if registered
      if (selectedUser) {
        bookingData.customerId = selectedUser.id
        bookingData.customerRank = customerRank
      }

      await addDoc(collection(db, "bookings"), bookingData)

      onSuccess(
        "success",
        "Booking successfully created!",
        "The appointment has been scheduled.",
      )
      onClose()
    } catch (error) {
      console.error("Error saving booking:", error)
      onSuccess("failed", "Failed to save booking", "There was an error creating the booking. Please try again.")
    }
  }

  const resetForm = () => {
    setNameInput("")
    setPhone("")
    setDate("")
    setTime("")
    setEndTime("")
    setServices([])
    setSelectedUser(null)
    setSelectedBookingEmployee(null)
    setTotalPrice(0)
    setOriginalPrice(0)
    setDiscountAmount(0)
    setSuggestions([])
    setIsSearching(false)
  }

  if (!isOpen) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-20"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed inset-0 flex justify-center items-center z-20 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden">
          {/* Customer Rank Display - Only show if a registered customer is selected */}
          {selectedUser && customerRank && (
            <div className={`bg-gradient-to-r ${getRankColor(customerRank)} p-3 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankIcon(customerRank)}
                  <div>
                    <h3 className="font-bold text-sm">{customerRank} Member</h3>
                    <p className="text-xs opacity-90">{selectedUser.bookingCount || 0} bookings completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <Gift className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-xs font-medium">Benefits</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-1 bg-gray-100 bg-opacity-20 rounded-lg px-2 py-2">
                <p className="text-xs m-0">{rankBenefits[customerRank]}</p>
              </div>
            </div>
          )}

          <div className="sticky top-0 bg-white z-20 p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-bold text-purple-600">Add New Booking</h2>
          </div>

          <div className="overflow-y-auto p-6 pt-4 flex-grow">
            <div className="relative w-full mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type customer name..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearchCustomer()
                    }
                  }}
                  className="p-2 w-full pr-12 border rounded-lg shadow-sm outline-none"
                />
                <button
                  onClick={handleSearchCustomer}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {suggestions.length > 0 ? (
                <ul className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded-lg max-h-40 overflow-auto z-50 p-0">
                  {suggestions.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                    >
                      {user.fullName} {user.bookingCount ? `(${getRank(user.bookingCount)} Member)` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                isSearching &&
                suggestions.length === 0 && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded-lg p-2 text-gray-500">
                    No Results...
                  </div>
                )
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 w-full rounded-lg shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="border p-2 w-full rounded-lg shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setSelectedBookingEmployee(null)
                    setTime(e.target.value)
                  }}
                  className="border p-2 w-full rounded-lg shadow-sm"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
              <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 relative border border-gray-200 rounded-lg p-2">
                
                {serviceOptions.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.name)}
                    className={`px-3 w-full text-left py-2 border rounded-lg ${
                      services.includes(service.name)
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{service.name}</span>
                      <span>
                        Rp
                        {Number(service.price).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {service.duration && (
                      <div className="text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration} min</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                {/* Show original price and discount if there's a discount */}
                {discountAmount > 0 && (
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Original Price:</span>
                      <span className="text-gray-600 line-through">
                        Rp{Number(originalPrice).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-green-600">{customerRank} Discount:</span>
                      <span className="text-green-600">-Rp{Number(discountAmount).toLocaleString("id-ID")}</span>
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
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                <div className="grid grid-cols-2 gap-2">
                  {employeesList.map((employee) => {
                    const isAvailable =  employee.isActive && !existingBookings.some(
                      (booking) => booking.employeeName === employee.name &&
                        ((time >= booking.time && time < booking.endTime) || // Start time conflict
                          (endTime > booking.time && endTime <= booking.endTime) || // End time conflict
                          (time <= booking.time && endTime >= booking.endTime)), // New booking encompasses old booking
                    )

                    return (
                      <button
                        key={employee.name}
                        onClick={() => isAvailable && setSelectedBookingEmployee(employee.name)}
                        disabled={!isAvailable}
                        className={`p-2 rounded-lg border text-center transition-all
                          ${
                            selectedBookingEmployee === employee.name
                              ? "bg-purple-300 border-purple-500 text-purple-700"
                              : isAvailable
                                ? "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                                : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                      >
                        <span className="font-bold">{employee.name}</span>
                        <div className="text-xs mt-1 font-medium">
                          {isAvailable ? (
                            <span className="text-green-600">Available</span>
                          ) : (
                            <span className="text-red-500">Unavailable</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white p-4 border-t mt-auto flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBooking}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Save Booking
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default AddBookingModal
