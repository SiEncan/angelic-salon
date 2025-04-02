import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon, ChevronLeftIcon, ChevronRightIcon, BriefcaseIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, onSnapshot, collection, where, query } from "firebase/firestore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import dayjs from "dayjs";
import angelicLogo from '../../assets/images/AngelicSalon.jpg';

const ManageEmployee = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const statuses = ["Completed", "Booked", "In Progress", "Cancelled"];
  const [selectedStatuses, setSelectedStatuses] = useState(["Completed"]);

  // Fungsi untuk toggle pilihan status
  const toggleStatus = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  
  const statusColors = {
    Completed: "bg-green-500 text-white",
    Booked: "bg-blue-500 text-white",
    "In Progress": "bg-yellow-500 text-white",
    Cancelled: "bg-red-500 text-white",
  };

  const [currentPage, setCurrentPage] = useState(dayjs().month());
  const [employeeData, setEmployeeData] = useState([]);

  useEffect(() => {
    const monthStart = dayjs().month(currentPage).startOf("month").format("YYYY-MM-DD");
    const monthEnd = dayjs().month(currentPage).endOf("month").format("YYYY-MM-DD");

    const daysInMonth = Array.from(
        { length: dayjs().month(currentPage).daysInMonth() },
        (_, i) => dayjs().month(currentPage).startOf("month").add(i, "day").format("YYYY-MM-DD")
    );

    const usersQuery = query(collection(db, "users"), where("role", "==", "employee"));
    
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
                    Completed: 0,
                    Booked: 0,
                    "In Progress": 0,
                    Cancelled: 0,
                };
            });
        });

        const bookingsQuery = query(
            collection(db, "bookings"),
            where("date", ">=", monthStart),
            where("date", "<=", monthEnd)
        );
        
        const unsubscribeBookings = onSnapshot(bookingsQuery, (querySnapshot) => {
            const bookings = querySnapshot.docs.map((doc) => doc.data());

            // Memasukkan data dari bookings ke dalam employeeStats
            bookings.forEach((booking) => {
                const { employeeName, date, status } = booking;
                const bookingDate = dayjs(date).isValid()
                    ? dayjs(date).format("YYYY-MM-DD")
                    : dayjs(date.toDate()).format("YYYY-MM-DD");
                
                if (employeeStats[employeeName] && employeeStats[employeeName][bookingDate]) {
                    employeeStats[employeeName][bookingDate][status] += 1;
                }
            });
            
            setEmployeeData(employeeStats);
        });
        
        return () => unsubscribeBookings();
    });
    
    return () => unsubscribeUsers();
  }, [currentPage]);

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY");

  ///////////////////////////// navbar

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

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Manage Employees</h2>

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
          <div className="bg-white shadow-md rounded-lg p-4 min-w-[500px]">
            <h2 className="text-xl font-bold mb-4">Employee Summary - {monthNames}</h2>
            {/* Tombol Filter Status */}
            <h1 className="text-lg">Status Filter</h1>
            <div className="mb-4 flex gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3 py-1 border rounded transition-all ${
                    selectedStatuses.includes(status) ? statusColors[status] : "bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "100%" }}
                exit={{ opacity: 0, height: 0 }}
                layout
                transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="px-4 py-2 border sticky left-0 bg-gray-200 z-10">Name\Date</th>
                        {Object.keys(employeeData).length > 0 &&
                          Object.keys(employeeData[Object.keys(employeeData)[0]]).map((date, i) => (
                            <th key={i} className="px-4 py-2 border">{dayjs(date).format("D")}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(employeeData).map(([name, data]) => (
                        <tr key={name} className="border">
                          <td className="px-4 py-2 border sticky left-0 bg-white z-10">{name}</td>
                          {Object.values(data).map((statusObj, i) => (
                            <td key={i} className="px-4 py-2 border text-center">
                              {selectedStatuses.length === 0
                                ? 0 // Jika tidak ada status dipilih, tampilkan 0
                                : selectedStatuses.reduce((sum, status) => sum + (statusObj[status] || 0), 0)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-1 mt-4 md:grid-cols-3 gap-4">
                  {Object.entries(employeeData).map(([employeeName, stats]) => {
                    let completedCount = 0;
                    let bookedCount = 0;

                    Object.values(stats).forEach((dateStats) => {
                      completedCount += dateStats.Completed || 0;
                      bookedCount += dateStats.Booked || 0;
                    });

                    return (
                      <div key={employeeName} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700">{employeeName}</h3>
                        <div className="border-t border-gray-300 my-3"></div>
                        <p className="text-gray-500 mb-1">
                          Customer Served: <span className="font-bold text-green-500 ml-2">{completedCount}</span>
                        </p>
                        <p className="text-gray-500">
                          Scheduled Customers: <span className="font-bold text-blue-500 ml-2">{bookedCount}</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Pagination */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-pink-400 text-white px-3 py-2 rounded flex items-center gap-2 
                          hover:bg-pink-500 active:bg-pink-600 transition"
              >
                <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" />Previous Month
              </button>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-pink-400 text-white px-3 py-2 rounded flex items-center gap-2 
                          hover:bg-pink-500 active:bg-pink-600 transition"
              >
                Next Month <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageEmployee;