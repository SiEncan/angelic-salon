import { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { db } from "../../firebase";
import { onSnapshot, collection, where, query } from "firebase/firestore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

const ManageEmployee = () => {
  const statuses = ["completed", "confirmed", "in progress", "cancelled"];
  const [selectedStatuses, setSelectedStatuses] = useState(["completed"]);

  // Fungsi untuk toggle pilihan status
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const statusColors = {
    completed: "bg-green-500 text-white",
    confirmed: "bg-blue-500 text-white",
    "in progress": "bg-purple-500 text-white",
    cancelled: "bg-red-500 text-white",
  };

  const statusIcons = {
    completed: CheckCircleIcon,
    confirmed: CalendarIcon,
    "in progress": ClockIcon,
    cancelled: XCircleIcon,
  };

  const [currentPage, setCurrentPage] = useState(dayjs().month());
  const [employeeData, setEmployeeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const monthStart = dayjs()
      .month(currentPage)
      .startOf("month")
      .format("YYYY-MM-DD");
    const monthEnd = dayjs()
      .month(currentPage)
      .endOf("month")
      .format("YYYY-MM-DD");

    const daysInMonth = Array.from(
      { length: dayjs().month(currentPage).daysInMonth() },
      (_, i) =>
        dayjs()
          .month(currentPage)
          .startOf("month")
          .add(i, "day")
          .format("YYYY-MM-DD")
    );

    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "employee")
    );

    const unsubscribeUsers = onSnapshot(usersQuery, (usersSnapshot) => {
      const employees = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().fullName,
      }));

      const employeeStats = {};
      employees.forEach((employee) => {
        employeeStats[employee.name] = {};
        daysInMonth.forEach((date) => {
          employeeStats[employee.name][date] = {
            completed: 0,
            confirmed: 0,
            "in progress": 0,
            cancelled: 0,
          };
        });
      });

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("date", ">=", monthStart),
        where("date", "<=", monthEnd)
      );

      const unsubscribeBookings = onSnapshot(
        bookingsQuery,
        (querySnapshot) => {
          const bookings = querySnapshot.docs.map((doc) => doc.data());

          // Memasukkan data dari bookings ke dalam employeeStats
          bookings.forEach((booking) => {
            const { employeeName, date, status } = booking;
            const lowerCaseStatus = status.toLowerCase();
            if (!employeeName) return; // Skip if no employee assigned

            const bookingDate = dayjs(date).isValid()
              ? dayjs(date).format("YYYY-MM-DD")
              : dayjs(date.toDate()).format("YYYY-MM-DD");

            if (
              employeeStats[employeeName] &&
              employeeStats[employeeName][bookingDate]
            ) {
              employeeStats[employeeName][bookingDate][lowerCaseStatus] += 1;
            }
          });

          setEmployeeData(employeeStats);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error fetching bookings:", error);
          setIsLoading(false);
        }
      );

      return () => unsubscribeBookings();
    });

    return () => unsubscribeUsers();
  }, [currentPage]);

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY");

  // Calculate employee performance metrics
  const calculateEmployeeMetrics = () => {
    const metrics = {};

    Object.entries(employeeData).forEach(([name, data]) => {
      let totalBookings = 0;
      let completedBookings = 0;
      let confirmedBookings = 0;
      let inProgressBookings = 0;
      let cancelledBookings = 0;

      Object.values(data).forEach((statusObj) => {
        completedBookings += statusObj.completed || 0;
        confirmedBookings += statusObj.confirmed || 0;
        inProgressBookings += statusObj["in progress"] || 0;
        cancelledBookings += statusObj.cancelled || 0;
        totalBookings += Object.values(statusObj).reduce(
          (sum, count) => sum + count,
          0
        );
      });

      metrics[name] = {
        totalBookings,
        completedBookings,
        confirmedBookings,
        inProgressBookings,
        cancelledBookings,
        completionRate:
          totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      };
    });

    return metrics;
  };

  const employeeMetrics = calculateEmployeeMetrics();

  return (
    <div className="mx-auto">
      {/* Header with month navigation */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Employee Performance
            </h2>
            <p className="text-gray-500">
              Track employee bookings and performance metrics
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium text-gray-700">
              {monthNames}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Filter by Status
        </h3>
        <div className="flex flex-wrap gap-3">
          {statuses.map((status) => {
            const StatusIcon = statusIcons[status];
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
            );
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
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                  {name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{name}</h3>
                  <p className="text-sm text-gray-500">Employee</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />{" "}
                    Completed
                  </span>
                  <span className="font-semibold text-green-600">
                    {metrics.completedBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <CalendarIcon className="h-4 w-4 text-blue-500 mr-1" />{" "}
                    Confirmed
                  </span>
                  <span className="font-semibold text-blue-600">
                    {metrics.confirmedBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <ClockIcon className="h-4 w-4 text-purple-500 mr-1" /> In
                    Progress
                  </span>
                  <span className="font-semibold text-purple-600">
                    {metrics.inProgressBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center">
                    <XCircleIcon className="h-4 w-4 text-red-500 mr-1" />{" "}
                    Cancelled
                  </span>
                  <span className="font-semibold text-red-600">
                    {metrics.cancelledBookings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Employee booking table */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Daily Booking Summary
        </h3>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : Object.keys(employeeData).length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No employee data available
            </h3>
            <p className="text-gray-500">
              There are no employees or bookings for the selected month.
            </p>
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
                      Object.keys(
                        employeeData[Object.keys(employeeData)[0]]
                      ).map((date, i) => (
                        <th
                          key={i}
                          className={`px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                            dayjs(date).day() === 0 || dayjs(date).day() === 6
                              ? "bg-pink-50"
                              : "bg-gray-50"
                          }`}
                        >
                          <div>{dayjs(date).format("D")}</div>
                          <div className="text-[10px] font-normal">
                            {dayjs(date).format("ddd")}
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(employeeData).map(
                    ([name, data], rowIndex) => (
                      <tr
                        key={name}
                        className={
                          rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 z-10 border-r border-gray-100 bg-inherit">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold mr-3">
                              {name.charAt(0)}
                            </div>
                            {name}
                          </div>
                        </td>
                        {Object.entries(data).map(([date, statusObj], i) => {
                          const dayTotal = selectedStatuses.reduce(
                            (sum, status) => sum + (statusObj[status] || 0),
                            0
                          );
                          const isWeekend =
                            dayjs(date).day() === 0 || dayjs(date).day() === 6;
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
                          );
                        })}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ManageEmployee;
