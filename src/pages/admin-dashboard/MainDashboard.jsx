import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { db } from "../../firebase";
import {
  onSnapshot,
  collection,
  where,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import dayjs from "dayjs";
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
} from "recharts";
import {
  Scissors,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";

const MainDashboard = () => {
  const isMobile = window.innerWidth < 768;
  const chartContainerRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(dayjs().month());
  const [chartData, setChartData] = useState([]);
  const [serviceData, setServiceData] = useState([]);

  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [confirmedRevenue, setConfirmedRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [confirmedBookings, setConfirmedBookings] = useState(0);
  const [rejectedBookings, setRejectedBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);
  const [todaysBookings, setTodaysBookings] = useState([]);

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
  ];

  useEffect(() => {
  const fetchTodayBookings = async () => {
    try {
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", "==", todayString),
        orderBy("time", "desc"),
        limit(5)
      );

      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const todaysBookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTodaysBookings(todaysBookingsData);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching Today's bookings:", error);
    }
  };

  fetchTodayBookings();
}, []);

  // Fetch bookings data for the current month
  useEffect(() => {
    const monthStart = dayjs()
      .month(currentPage)
      .startOf("month")
      .format("YYYY-MM-DD");
    const monthEnd = dayjs()
      .month(currentPage)
      .endOf("month")
      .format("YYYY-MM-DD");

    const unsubscribeBookings = onSnapshot(
      query(
        collection(db, "bookings"),
        where("date", ">=", monthStart),
        where("date", "<=", monthEnd)
      ),
      (querySnapshot) => {
        const bookings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Process bookings for line chart
        const daysInMonth = Array.from(
          { length: dayjs().month(currentPage).daysInMonth() },
          (_, i) =>
            dayjs()
              .month(currentPage)
              .startOf("month")
              .add(i, "day")
              .format("YYYY-MM-DD")
        );

        const dayCounts = daysInMonth.reduce(
          (acc, date) => ({ ...acc, [date]: { bookings: 0, revenue: 0 } }),
          {}
        );

        let pendingRevenueSum = 0;
        let confirmedRevenueSum = 0;
        let totalBookingsCount = 0;
        let completedBookingsCount = 0;
        let pendingBookingsCount = 0;
        let confirmedBookingsCount = 0;
        let cancelledBookingsCount = 0;
        let rejectedBookingsCount = 0;

        // Process service data for pie chart
        const serviceCount = {};

        bookings.forEach((booking) => {
          const bookingDate = booking.date;
          if (dayCounts[bookingDate]) {
            dayCounts[bookingDate].bookings += 1;
            
            // Count bookings by status
            if (booking.status?.toLowerCase() === "completed") {

              dayCounts[bookingDate].revenue += booking.totalPrice || 0;
              
              confirmedRevenueSum += booking.totalPrice || 0;
              completedBookingsCount += 1;
            } else if (booking.status?.toLowerCase() === "pending") {
              pendingRevenueSum += booking.totalPrice || 0;
              pendingBookingsCount += 1;
            } else if (booking.status?.toLowerCase() === "confirmed") {
              confirmedBookingsCount += 1;
              pendingRevenueSum += booking.totalPrice || 0;
            } else if (booking.status?.toLowerCase() === "cancelled") {
              cancelledBookingsCount += 1;
            } else if (booking.status?.toLowerCase() === "rejected") {
              rejectedBookingsCount += 1;
            }
            totalBookingsCount += 1;
          }

          // Count services for pie chart
          if (Array.isArray(booking.services)) {
            booking.services.forEach((service) => {
              serviceCount[service] = (serviceCount[service] || 0) + 1;
            });
          }
        });

        // Format data for line chart
        const formattedData = daysInMonth.map((date) => ({
          date,
          bookings: dayCounts[date].bookings,
          revenue: dayCounts[date].revenue,
        }));

        // Format data for pie chart
        const formattedServiceData = Object.keys(serviceCount).map(
          (service) => ({
            name: service,
            value: serviceCount[service],
          })
        );

        // Sort services by count (descending)
        formattedServiceData.sort((a, b) => b.value - a.value);

        // Update state with processed data
        setChartData(formattedData);
        setServiceData(formattedServiceData);
        setConfirmedRevenue(confirmedRevenueSum);
        setPendingRevenue(pendingRevenueSum);
        setTotalBookings(totalBookingsCount);
        setConfirmedBookings(confirmedBookingsCount);
        setPendingBookings(pendingBookingsCount);
        setCompletedBookings(completedBookingsCount);
        setCancelledBookings(cancelledBookingsCount);
        setRejectedBookings(rejectedBookingsCount);
      },
      (error) => console.error("Error fetching bookings: ", error)
    );

    return () => {
      unsubscribeBookings();
    };
  }, [currentPage]);

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY");

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
              {(
                (payload[0].value /
                  serviceData.reduce((sum, item) => sum + item.value, 0)) *
                100
              ).toFixed(1)}
              %
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for the line chart
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-md border border-gray-200">
          <p className="font-medium text-gray-800">
            {dayjs(label).format("DD MMM YYYY")}
          </p>
          <p className="text-sm text-gray-600">
            Revenue:{" "}
            <span className="font-medium">
              Rp{payload[0].value.toLocaleString("id-ID")}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Bookings:{" "}
            <span className="font-medium">{payload[0].payload.bookings}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Pending";

    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "Completed";
    if (statusLower === "confirmed") return "Confirmed";
    if (statusLower === "rejected") return "Rejected";
    if (statusLower === "pending") return "Pending";
    if (statusLower === "cancelled") return "Cancelled";
    if (statusLower === "in progress") return "In Progress";
    return status;
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return "text-yellow-600";

    const statusLower = status.toLowerCase();
    if (statusLower === "completed") return "text-green-600 bg-green-100";
    if (statusLower === "confirmed") return "text-blue-600 bg-blue-100";
    if (statusLower === "rejected") return "text-red-600 bg-red-100";
    if (statusLower === "pending") return "text-yellow-600 bg-yellow-100";
    if (statusLower === "cancelled") return "text-red-600 bg-red-100";
    if (statusLower === "in progress") return "text-purple-600 bg-purple-100";
    return "text-gray-600";
  };

  // Render pie chart labels conditionally based on screen size
  const renderPieChartLabel = ({ name, percent }) => {
    if (window.innerWidth > 1440) {
      return `${name} (${(percent * 100).toFixed(1)}%)`;
    }
  };

  return (
    <div className="mx-auto">
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
            <p className="text-2xl font-bold text-green-600">
              {completedBookings}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming</p>
            <p className="text-2xl font-bold text-blue-600">
              {confirmedBookings + pendingBookings}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
          <div className="rounded-full bg-green-100 p-3 mr-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex flex-col 2xl:flex-row w-full">
            <div>
              <p className="text-sm mb-0 text-gray-500">Confirmed Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                Rp{confirmedRevenue.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="border-t lg:border-l border-gray-300 my-2 mt-0 2xl:mx-6" />
            <div>
              <p className="text-sm mb-0 mt-0 text-gray-500">Pending Revenue</p>
              <p className="text-2xl font-bold text-pink-600">
                Rp{pendingRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Revenue Trends - {monthNames}
            </h3>
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

          {/* Make chart container scrollable on mobile */}
          <div className="overflow-x-auto">
            {chartData.some((item) => item.revenue > 0 || item.bookings > 0) ? (
              <div
                ref={chartContainerRef}
                className="h-80"
                style={{ minWidth: isMobile ? "800px" : "100%" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(tick) => dayjs(tick).format("D")}
                      stroke="#9ca3af"
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={(value) =>
                        `Rp${value.toLocaleString("id-ID")}`
                      }
                      width={100}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                      activeDot={{
                        r: 6,
                        fill: "#8b5cf6",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center">
                <div className="rounded-full bg-pink-100 p-4 mb-4">
                  <DollarSign className="h-8 w-8 text-pink-500" />
                </div>
                <p className="text-gray-500 text-center">
                  No revenue data available for {monthNames}
                </p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Try selecting a different month or check back later
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Service Distribution - {monthNames}
          </h3>
          <div className="h-80">
            {serviceData.length > 0 ? (
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
                    label={renderPieChartLabel}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="rounded-full bg-purple-100 p-4 mb-4">
                  <Scissors className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-gray-500 text-center">
                  No service data available for {monthNames}
                </p>
                <p className="text-sm text-gray-400 text-center mt-2">
                  Try selecting a different month or check back later
                </p>
              </div>
            )}
          </div>

          {/* Mobile-friendly service breakdown - only show if there's data */}
          {serviceData.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Service Breakdown:
              </h4>
              <div className="space-y-2">
                {serviceData.slice(0, 5).map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-xs text-gray-700 truncate max-w-[150px]">
                        {service.name}
                      </span>
                    </div>
                    <span className="text-xs font-medium">
                      {(
                        (service.value /
                          serviceData.reduce(
                            (sum, item) => sum + item.value,
                            0
                          )) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-800">
            {totalBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-gray-500 rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-purple-500 text-sm mb-1">Pending Approval</div>
          <div className="text-2xl font-bold text-purple-600">
            {pendingBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-purple-500 rounded-full"
              style={{
                width: `${
                  totalBookings ? (pendingBookings / totalBookings) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-blue-500 text-sm mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-blue-600">
            {confirmedBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-blue-500 rounded-full"
              style={{
                width: `${
                  totalBookings ? (confirmedBookings / totalBookings) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-red-500 text-sm mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {rejectedBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-red-500 rounded-full"
              style={{
                width: `${
                  totalBookings ? (rejectedBookings / totalBookings) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-green-500 text-sm mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {completedBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{
                width: `${
                  totalBookings ? (completedBookings / totalBookings) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 text-center">
          <div className="text-red-500 text-sm mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">
            {cancelledBookings}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded-full">
            <div
              className="h-1 bg-red-500 rounded-full"
              style={{
                width: `${
                  totalBookings ? (cancelledBookings / totalBookings) * 100 : 0
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Revenue Card */}
      {/* <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Revenue Overview
                </h3>
                <p className="text-sm text-gray-500">
                  Monthly financial summary
                </p>
              </div>

              <div className="mt-4 md:mt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Confirmed Revenue</p>
                  <p className="text-2xl font-bold text-green-700">
                    Rp{confirmedRevenue.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600">Pending Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">
                    Rp{pendingRevenue.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

      {/* Today's Bookings Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Today's Bookings
          </h3>
          <Link
            to="/admin-dashboard/bookings"
            className="bg-purple-100 hover:bg-purple-200 no-underline text-xs font-medium md:text-base text-purple-700 px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            <span>View All</span>
          </Link>
        </div>
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
              {todaysBookings.length > 0 ? (
                todaysBookings.map((booking, index) => (
                  <tr key={booking.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          {booking.customerName?.charAt(0) || "?"}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.customerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.phone || "No phone"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {Array.isArray(booking.services)
                          ? booking.services.join(", ")
                          : booking.service || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {booking.date
                          ? dayjs(booking.date).format("DD MMM YYYY")
                          : "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp{(booking.totalPrice || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No today's bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
