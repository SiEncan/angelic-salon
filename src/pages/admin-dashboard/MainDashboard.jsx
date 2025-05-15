"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { auth, db } from "../../firebase"
import { doc, getDoc, onSnapshot, collection, where, query, getDocs } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import dayjs from "dayjs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  Home,
  Users,
  ClipboardList,
  Bell,
  Menu,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  BarChart,
  LogOut,
  X,
} from "lucide-react"

const MainDashboard = () => {
  const [loggedName, setLoggedName] = useState("")
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(dayjs().month())
  const [chartData, setChartData] = useState([])
  const [serviceData, setServiceData] = useState([])
  const [allServices, setAllServices] = useState([])

  const [customerCount, setCustomerCount] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [confirmedRevenue, setConfirmedRevenue] = useState(0)
  const [totalBookings, setTotalBookings] = useState(0)
  const [completedBookings, setCompletedBookings] = useState(0)
  const [bookedBookings, setBookedBookings] = useState(0)
  const [inProgressBookings, setInProgressBookings] = useState(0)
  const [cancelledBookings, setCancelledBookings] = useState(0)
  const [recentBookings, setRecentBookings] = useState([])

  // Colors for the pie chart
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4de6c",
    "#d0ed57",
    "#83a6ed",
    "#8dd1e1",
  ]

  // Fetch all services first
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"))
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setAllServices(servicesData)
      } catch (error) {
        console.error("Error fetching services: ", error)
      }
    }

    fetchServices()
  }, [])

  // Fetch bookings data for the current month
  useEffect(() => {
    const monthStart = dayjs().month(currentPage).startOf("month").format("YYYY-MM-DD")
    const monthEnd = dayjs().month(currentPage).endOf("month").format("YYYY-MM-DD")

    const unsubscribeBookings = onSnapshot(
      query(collection(db, "bookings"), where("date", ">=", monthStart), where("date", "<=", monthEnd)),
      (querySnapshot) => {
        const bookings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Process bookings for line chart
        const daysInMonth = Array.from({ length: dayjs().month(currentPage).daysInMonth() }, (_, i) =>
          dayjs().month(currentPage).startOf("month").add(i, "day").format("YYYY-MM-DD"),
        )

        const dayCounts = daysInMonth.reduce((acc, date) => ({ ...acc, [date]: { bookings: 0, revenue: 0 } }), {})

        let totalRevenueSum = 0
        let confirmedRevenueSum = 0
        let totalBookingsCount = 0
        let completedBookingsCount = 0
        let inProgressBookingsCount = 0
        let bookedBookingsCount = 0
        let cancelledBookingsCount = 0

        // Process service data for pie chart
        const serviceCount = {}

        bookings.forEach((booking) => {
          const bookingDate = booking.date
          if (dayCounts[bookingDate]) {
            dayCounts[bookingDate].bookings += 1

            // Process revenue
            if (booking.status?.toLowerCase() !== "cancelled") {
              totalRevenueSum += booking.totalPrice || 0
            }

            // Count bookings by status
            if (booking.status?.toLowerCase() === "completed") {
              confirmedRevenueSum += booking.totalPrice || 0
              completedBookingsCount += 1
              dayCounts[bookingDate].revenue += booking.totalPrice || 0
            } else if (booking.status?.toLowerCase() === "in progress" || booking.status?.toLowerCase() === "pending") {
              inProgressBookingsCount += 1
            } else if (booking.status?.toLowerCase() === "confirmed" || booking.status?.toLowerCase() === "booked") {
              bookedBookingsCount += 1
            } else if (booking.status?.toLowerCase() === "cancelled") {
              cancelledBookingsCount += 1
            }

            totalBookingsCount += 1
          }

          // Count services for pie chart
          if (Array.isArray(booking.services)) {
            booking.services.forEach((service) => {
              serviceCount[service] = (serviceCount[service] || 0) + 1
            })
          }
        })

        // Format data for line chart
        const formattedData = daysInMonth.map((date) => ({
          date,
          bookings: dayCounts[date].bookings,
          dailyRevenue: dayCounts[date].revenue,
        }))

        // Format data for pie chart
        const formattedServiceData = Object.keys(serviceCount).map((service) => ({
          name: service,
          value: serviceCount[service],
        }))

        // Sort services by count (descending)
        formattedServiceData.sort((a, b) => b.value - a.value)

        // Update state with processed data
        setChartData(formattedData)
        setServiceData(formattedServiceData)
        setConfirmedRevenue(confirmedRevenueSum)
        setTotalRevenue(totalRevenueSum)
        setTotalBookings(totalBookingsCount)
        setBookedBookings(bookedBookingsCount)
        setInProgressBookings(inProgressBookingsCount)
        setCompletedBookings(completedBookingsCount)
        setCancelledBookings(cancelledBookingsCount)

        // Get recent bookings (last 5)
        const sortedBookings = [...bookings].sort((a, b) => {
          const dateA = new Date(`${a.date} ${a.time || "00:00"}`)
          const dateB = new Date(`${b.date} ${b.time || "00:00"}`)
          return dateB - dateA
        })

        setRecentBookings(sortedBookings.slice(0, 5))
      },
      (error) => console.error("Error fetching bookings: ", error),
    )

    return () => {
      unsubscribeBookings()
    }
  }, [currentPage])

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY")

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

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-medium text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage:{" "}
            <span className="font-medium">
              {((payload[0].value / serviceData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )
    }
    return null
  }

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Pending"

    const statusLower = status.toLowerCase()
    if (statusLower === "completed") return "Completed"
    if (statusLower === "confirmed") return "Confirmed"
    if (statusLower === "pending") return "Pending"
    if (statusLower === "cancelled") return "Cancelled"
    if (statusLower === "in progress") return "In Progress"
    if (statusLower === "booked") return "Booked"
    return status
  }

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return "text-yellow-600"

    const statusLower = status.toLowerCase()
    if (statusLower === "completed") return "text-green-600"
    if (statusLower === "confirmed") return "text-blue-600"
    if (statusLower === "pending") return "text-yellow-600"
    if (statusLower === "cancelled") return "text-red-600"
    if (statusLower === "in progress") return "text-purple-600"
    if (statusLower === "booked") return "text-blue-600"
    return "text-gray-600"
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-purple-600 to-pink-500 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}
      >
        <div className="flex items-center justify-center h-20 border-b border-purple-400 bg-purple-700">
          <h1 className="text-xl font-bold text-white">Angelic Salon & Spa</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {[
            { icon: Home, label: "Dashboard", path: "/admin-dashboard" },
            { icon: ClipboardList, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: Users, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: Scissors, label: "Manage Services", path: "/admin-dashboard/manage-services" },
            { icon: Briefcase, label: "Manage Employee", path: "/admin-dashboard/manage-employee" },
            { icon: BarChart, label: "Reports", path: "/reports" },
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
                className="text-xs text-purple-200 hover:text-white flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" /> Sign out
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

              <h2 className="text-lg sm:text-xl font-bold ml-4 text-gray-700">Dashboard Overview</h2>
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
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-800">{totalBookings}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedBookings}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{bookedBookings + inProgressBookings}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
              <div className="rounded-full bg-pink-100 p-3 mr-4">
                <DollarSign className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-pink-600">Rp{confirmedRevenue.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Line Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Booking Trends - {monthNames}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickFormatter={(tick) => dayjs(tick).format("D")} stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value, name) => [value, "Bookings"]}
                      labelFormatter={(label) => `${dayjs(label).format("DD MMM YYYY")}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution - {monthNames}</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Booking Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-gray-500 text-sm mb-1">Total</div>
              <div className="text-2xl font-bold text-gray-800">{totalBookings}</div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                <div className="h-1 bg-gray-500 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-blue-500 text-sm mb-1">Confirmed</div>
              <div className="text-2xl font-bold text-blue-600">{bookedBookings}</div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-blue-500 rounded-full"
                  style={{ width: `${totalBookings ? (bookedBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-purple-500 text-sm mb-1">In Progress</div>
              <div className="text-2xl font-bold text-purple-600">{inProgressBookings}</div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-purple-500 rounded-full"
                  style={{ width: `${totalBookings ? (inProgressBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-green-500 text-sm mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-green-500 rounded-full"
                  style={{ width: `${totalBookings ? (completedBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 text-center">
              <div className="text-red-500 text-sm mb-1">Cancelled</div>
              <div className="text-2xl font-bold text-red-600">{cancelledBookings}</div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
                <div
                  className="h-1 bg-red-500 rounded-full"
                  style={{ width: `${totalBookings ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Revenue Overview</h3>
                <p className="text-sm text-gray-500">Monthly financial summary</p>
              </div>

              <div className="mt-4 md:mt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Confirmed Revenue</p>
                  <p className="text-2xl font-bold text-green-700">Rp{confirmedRevenue.toLocaleString("id-ID")}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Pending Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">Rp{totalRevenue.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Services
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <tr key={booking.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                              {booking.customerName?.charAt(0) || "?"}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                              <div className="text-sm text-gray-500">{booking.phone || "No phone"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {Array.isArray(booking.services) ? booking.services.join(", ") : booking.service || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {booking.date ? dayjs(booking.date).format("DD MMM YYYY") : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">{booking.time || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Rp{(booking.totalPrice || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                          >
                            {formatStatus(booking.status)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent bookings found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainDashboard
