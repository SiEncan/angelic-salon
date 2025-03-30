import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, getDocs, collection, where, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

const AdminDashboard = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [chartData, setChartData] = useState([]);
  const [customerCount, setCustomerCount] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Ambil awal dan akhir bulan ini
        const firstDay = dayjs().startOf("month").format("YYYY-MM-DD");
        const lastDay = dayjs().endOf("month").format("YYYY-MM-DD");

        // Query hanya booking dalam bulan ini
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("date", ">=", firstDay),
          where("date", "<=", lastDay)
        );

        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = querySnapshot.docs.map((doc) => doc.data());

        // Generate array tanggal dalam bulan ini
        const daysInMonth = Array.from(
          { length: dayjs().daysInMonth() },
          (_, i) => dayjs().startOf("month").add(i, "day").format("YYYY-MM-DD")
        );

        // Inisialisasi data booking dengan 0
        const dayCounts = daysInMonth.reduce((acc, date) => ({ ...acc, [date]: { bookings: 0, revenue: 0 } }), {});
        let totalRevenueSum = 0;
        let totalBookingsCount = 0;

        // Hitung jumlah booking dan total revenue
        bookings.forEach((booking) => {
          const bookingDate = dayjs(booking.date).format("YYYY-MM-DD");
          if (dayCounts[bookingDate]) {
            dayCounts[bookingDate].bookings += 1;
            if (booking.status == "Completed") {
              totalRevenueSum += booking.totalPrice || 0;
              dayCounts[bookingDate].revenue += booking.totalPrice || 0;
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
        setTotalRevenue(totalRevenueSum.toLocaleString("id-ID"));
        setTotalBookings(totalBookingsCount);
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
  }, []);

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
            src="src/assets/images/AngelicSalon.jpg"
            alt="Logo"
            className="h-16 w-16"
          />
        </div>
        <nav className="flex-1 px-2 py-4 space-y-3">
          {[{ icon: HomeIcon, label: "Dashboard", path: "/admin-dashboard" },
            { icon: ClipboardDocumentListIcon, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: UsersIcon, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: ScissorsIcon, label: "Manage Services", path: "/admin-dashboard/manage-services" },
            { icon: DocumentIcon, label: "Documents", path: "/documents" },
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

            <h2 className="text-2xl font-bold mt-1 ml-8 text-gray-700">Main Dashboard</h2>

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
                  navigate("/"); // Arahkan ke halaman login
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
          <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
            <div className="w-[600px] md:w-full">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Booking Statistics (This Month)</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">{customerCount}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Total Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">Rp{totalRevenue}</p>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
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
                  <td className="border border-gray-200 px-4 py-2">John Doe</td>
                  <td className="border border-gray-200 px-4 py-2">Haircut</td>
                  <td className="border border-gray-200 px-4 py-2">March 27, 2025</td>
                  <td className="border border-gray-200 px-4 py-2 text-green-600">Completed</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Jane Smith</td>
                  <td className="border border-gray-200 px-4 py-2">Hair Coloring</td>
                  <td className="border border-gray-200 px-4 py-2">March 26, 2025</td>
                  <td className="border border-gray-200 px-4 py-2 text-yellow-600">Pending</td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
