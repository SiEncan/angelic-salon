import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentIcon, ChartPieIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboard = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const data = [
    { day: "Mon", bookings: 5 },
    { day: "Tue", bookings: 8 },
    { day: "Wed", bookings: 12 },
    { day: "Thu", bookings: 7 },
    { day: "Fri", bookings: 10 },
    { day: "Sat", bookings: 15 },
    { day: "Sun", bookings: 6 },
  ];

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
            { icon: UsersIcon, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: ClipboardDocumentListIcon, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: CalendarIcon, label: "Calendar", path: "/calendar" },
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
          <div className="relative md:z-auto z-10 flex-shrink-0 flex h-16 bg-white shadow">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="ml-4 focus:outline-none md:hidden"
            >
              <Bars3Icon className="h-6 w-6 mar" />
            </button>

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
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="bg-white shadow rounded-lg p-4 mb-6 overflow-x-auto">
            <div className="w-[600px] md:w-full">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Booking Statistics (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="linear" dataKey="bookings" stroke="#6366F1" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Total Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">567</p>
            </div>
            <div className="bg-white p-4 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-700">Revenue</h3>
              <p className="text-2xl font-bold text-gray-900">$12,345</p>
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
