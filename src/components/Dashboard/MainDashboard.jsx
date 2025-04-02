import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, getDocs, collection, where, query } from "firebase/firestore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

import angelicLogo from '../../assets/images/AngelicSalon.jpg';

const MainDashboard = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(dayjs().format("MMMM YYYY"));
  const [chartData, setChartData] = useState([]);
  
  const [customerCount, setCustomerCount] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [confirmedRevenue, setConfirmedRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [bookedBookings, setBookedBookings] = useState(0);
  const [inProgressBookings, setInProgressBookings] = useState(0);
  const [cancelledBookings, setCancelledBookings] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Ambil awal dan akhir bulan
        const firstDay = dayjs(currentMonth, "MMMM YYYY").startOf("month").format("YYYY-MM-DD");
        const lastDay = dayjs(currentMonth, "MMMM YYYY").endOf("month").format("YYYY-MM-DD");

        // Query hanya booking dalam bulan
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("date", ">=", firstDay),
          where("date", "<=", lastDay)
        );

        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = querySnapshot.docs.map((doc) => doc.data());

        // Generate array tanggal dalam bulan
        const daysInMonth = Array.from(
          { length: dayjs(currentMonth, "MMMM YYYY").daysInMonth() },
          (_, i) =>
            dayjs(currentMonth, "MMMM YYYY").startOf("month").add(i, "day").format("YYYY-MM-DD")
        );        

        // Inisialisasi data booking dengan 0
        const dayCounts = daysInMonth.reduce((acc, date) => ({ ...acc, [date]: { bookings: 0, revenue: 0 } }), {});
        let totalRevenueSum = 0;
        let confirmedRevenueSum = 0;
        let totalBookingsCount = 0;
        let completedBookingsCount = 0;
        let inProgressBookingsCount = 0;
        let bookedBookingsCount = 0;
        let cancelledBookingsCount = 0;

        // Hitung jumlah booking dan total revenue
        bookings.forEach((booking) => {
          const bookingDate = dayjs(booking.date).format("YYYY-MM-DD");
          if (dayCounts[bookingDate]) {
            dayCounts[bookingDate].bookings += 1;
            if (booking.status != "Cancelled" && booking.status != "Completed") {
              totalRevenueSum += booking.totalPrice || 0;
            }
            if (booking.status == "Completed") {
              confirmedRevenueSum += booking.totalPrice || 0;
              completedBookingsCount += 1;
              dayCounts[bookingDate].revenue += booking.totalPrice || 0;
            } else if (booking.status == "In Progress") {
              inProgressBookingsCount += 1;
            } else if (booking.status == "Booked") {
              bookedBookingsCount += 1;
            } else if (booking.status == "Cancelled") {
              cancelledBookingsCount += 1;
            }
            totalBookingsCount += 1;
          }
        });

        // Format data untuk grafik
        const formattedData = daysInMonth.map((date) => ({
          date,
          bookings: dayCounts[date].bookings,
          dailyRevenue: dayCounts[date].revenue,
        }));

        setChartData(formattedData);
        setConfirmedRevenue(confirmedRevenueSum.toLocaleString("id-ID"));
        setTotalRevenue(totalRevenueSum.toLocaleString("id-ID"));
        setTotalBookings(totalBookingsCount);
        setBookedBookings(bookedBookingsCount);
        setInProgressBookings(inProgressBookingsCount);
        setCompletedBookings(completedBookingsCount);
        setCancelledBookings(cancelledBookingsCount);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      }
    };

    const fetchCustomers = async () => {
      try {
        // Query hanya untuk user dengan role "customer"
        const customersQuery = query(
          collection(db, "users"),
          where("role", "==", "customer")
        );

        const querySnapshot = await getDocs(customersQuery);
        setCustomerCount(querySnapshot.size); // Menghitung jumlah dokumen dengan role "customer"
      } catch (error) {
        console.error("Error fetching customers: ", error);
      }
    };

    fetchCustomers();
    fetchBookings();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth, "MMMM YYYY").subtract(1, "month").format("MMMM YYYY"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth, "MMMM YYYY").add(1, "month").format("MMMM YYYY"));
  };

  useEffect(() => {
    // Memantau perubahan status autentikasi
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Simpan UID pengguna yang sedang login
      } else {
        console.log("User not logged in");
      }
    });

    // Hapus listener ketika komponen dibersihkan
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Ambil nama pengguna setelah userId tersedia
    if (userId) {
      const fetchUserName = async () => {
        const userDocRef = doc(db, "users", userId); // Akses dokumen berdasarkan userId
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setLoggedName(userDocSnap.data().fullName);
        } else {
          console.log("User not found!");
        }
      };

      fetchUserName();
    }
  }, [userId]); // Dependensi ke userId untuk memicu fetch data

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-pink-400 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}
      >
        <div className="flex items-center justify-center h-20">
          <img
            src={angelicLogo}
            alt="Logo"
            className="h-16 w-16"
          />
        </div>
        <nav className="flex-1 px-2 py-4 space-y-3">
          {[{ icon: HomeIcon, label: "Dashboard", path: "/admin-dashboard" },
            { icon: ClipboardDocumentListIcon, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: UsersIcon, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: ScissorsIcon, label: "Manage Services", path: "/admin-dashboard/manage-services" },
            { icon: BriefcaseIcon, label: "Manage Employee", path: "/admin-dashboard/manage-employee" },
            { icon: ChartPieIcon, label: "Reports", path: "/reports" }].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-2 py-2 text-sm font-medium text-white hover:text-white rounded-md no-underline 
                ${location.pathname === item.path ? 'bg-pink-600' : 'hover:bg-pink-500'}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setIsSidebarOpen(false)} // Menutup sidebar
          className="absolute top-4 right-4 text-white md:hidden" // Posisi di kanan atas sidebar
        >
          <span className="text-3xl">&times;</span> {/* Karakter 'X' sebagai tombol close */}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <header className="w-full">
         <div className="relative md:z-auto z-10 items-center justify-center flex-shrink-0 flex h-16 bg-white shadow">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="ml-4 focus:outline-none md:hidden"
            >
              <Bars3Icon className="h-6 w-6 mar" />
            </button>

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Main Dashboard</h2>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Notifications & Profile */}
            <div className="flex items-center mr-3">
              <button className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <p className="mt-3 text-sm font-medium text-gray-700">{loggedName || "Loading..."}</p>

              {/* Logout Button */}
              <button
                onClick={() => {
                  auth.signOut(); // Fungsi untuk logout
                  navigate("/login"); // Arahkan ke halaman login
                }}
                className="ml-4 bg-red-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white shadow-md min-w-[750px] md:w-full rounded-lg overflow-hidden">
            <div className="relative flex items-center">
    
              {/* Tombol Navigasi Bulan (Tetap di dalam div) */}
              <ChevronDoubleLeftIcon
                onClick={handlePrevMonth}
                className="absolute left-0 top-0 h-full w-8 text-white bg-pink-500 bg-opacity-30 hover:bg-opacity-70 transition duration-300 flex items-center justify-center rounded-l-lg"
              >
              </ChevronDoubleLeftIcon>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMonth}
                  className="flex-1 py-4 px-12"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "100%" }}
                  exit={{ opacity: 0, height: 0 }}
                  layout
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                  <div className="bg-white shadow-[0_2px_30px_rgba(0,0,0,0.3)] rounded-lg p-4 mb-6 overflow-x-auto">
                    <div className="w-[600px] md:w-full">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">
                      Booking Statistics ({currentMonth === dayjs().format("MMMM YYYY") ? "This Month" : currentMonth})
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(tick) => dayjs(tick).format("D")} />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name, props) => {
                            const revenue = props.payload?.dailyRevenue || 0;
                            return [`Rp${revenue.toLocaleString("id-ID")}`, `${value} Bookings`];
                          }}
                          labelFormatter={(label) => `${dayjs(label).format("DD MMM YYYY")}`}
                        />
                        <Line type="linear" dataKey="bookings" stroke="#3B82F6" dot={{ r: 2 }} strokeWidth={2.5} />
                      </LineChart>
                    </ResponsiveContainer>
                    </div>
                  </div>
                  {/* Stats Section */}
                  <div className="grid w-[650px] md:w-full grid-cols-1 lg:grid-cols-[3fr_1fr] gap-4">
                    {/* Total Bookings (3/4) */}
                    <div className="bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.2)] rounded-lg">
                      <h3 className="text-lg font-medium text-gray-700">Total Bookings</h3>
                      
                      {/* Grid untuk Total, Booked, Completed */}
                      <div className="grid grid-cols-5 gap-4 mt-2 text-center">
                        <div className="bg-gray-300 opacity-70 rounded-lg pt-2">
                          <p className="text-gray-500 text-sm">Total</p>
                          <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                        </div>
                        <div className="bg-blue-200 opacity-80 rounded-lg pt-2">
                          <p className="text-blue-500 text-sm">Booked</p>
                          <p className="text-2xl font-bold text-blue-800">{bookedBookings}</p>
                        </div>
                        <div className="bg-yellow-200 opacity-80 rounded-lg pt-2">
                          <p className="text-yellow-600 text-sm">In Progress</p>
                          <p className="text-2xl font-bold text-yellow-600">{inProgressBookings}</p>
                        </div>
                        <div className="bg-green-200 opacity-80 rounded-lg pt-2">
                          <p className="text-green-500 text-sm">Completed</p>
                          <p className="text-2xl font-bold text-green-600">{completedBookings}</p>
                        </div>
                        <div className="bg-red-200 opacity-80 rounded-lg pt-2">
                          <p className="text-red-500 text-sm">Cancelled</p>
                          <p className="text-2xl font-bold text-red-600">{cancelledBookings}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white px-5 shadow-[0_8px_20px_rgba(0,0,0,0.2)] rounded-lg flex flex-col h-[200px]">

                      <div className="flex-1 flex flex-col justify-center items-center">
                        <p className="text-gray-500 text-md mb-2">Confirmed Revenue</p>
                        <p className="text-3xl font-bold mb-0 mt-0 pb-0 pt-0 text-green-600">Rp {confirmedRevenue.toLocaleString('id-ID')}</p>
                      </div>

                      <div className="border-t border-gray-300"></div>
                      
                      <div className="flex-[0.5] flex flex-col justify-center mt-2 items-center">
                        <p className="text-gray-500 mt-1 mb-0 text-sm">Pending Revenue</p>
                        <p className="text-lg font-bold text-gray-500">Rp {totalRevenue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>   
                  </div>
                </motion.div>
              </AnimatePresence>
              <ChevronDoubleRightIcon
                onClick={handleNextMonth}
                className="absolute right-0 top-0 h-full w-8 text-white bg-pink-500 bg-opacity-30 hover:bg-opacity-70 transition duration-300 flex items-center justify-center rounded-r-lg"
                >
              </ChevronDoubleRightIcon>
            </div>
          </div>

            {/* Recent Bookings Table */}
            <div className="bg-white min-w-[750px] shadow rounded-lg p-4 mt-4 overflow-x-auto">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Bookings</h3>
              <table className="w-full min-w-[600px] border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">Customer</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Service</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Cyntia Angelica</td>
                    <td className="border border-gray-200 px-4 py-2">Haircut</td>
                    <td className="border border-gray-200 px-4 py-2">Minggu, 30 Maret 2025</td>
                    <td className="border border-gray-200 px-4 py-2 text-green-600">Completed</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Jane Smith</td>
                    <td className="border border-gray-200 px-4 py-2">Hair Coloring</td>
                    <td className="border border-gray-200 px-4 py-2">Minggu, 30 Maret 2025</td>
                    <td className="border border-gray-200 px-4 py-2 text-blue-600">Booked</td>
                  </tr>
                </tbody>
              </table>
            </div>
          {/* </div> */}
        </main>
      </div>
    </div>
  );
};

export default MainDashboard;