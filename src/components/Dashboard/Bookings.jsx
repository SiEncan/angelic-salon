import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, BriefcaseIcon, ChartPieIcon, BellIcon, Bars3Icon, ChevronLeftIcon, ChevronRightIcon, ArrowUpIcon, ArrowDownIcon, ScissorsIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, collection, onSnapshot, updateDoc, where, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import AddBookingButton from "./AddBookingButton";
import StatusDropdown from "./StatusDropdown";
import angelicLogo from '../../assets/images/AngelicSalon.jpg';

import dayjs from "dayjs";
import "dayjs/locale/id"; 

const Bookings = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [editedBookings, setEditedBookings] = useState({});
  const [currentPage, setCurrentPage] = useState(dayjs().month()); // Mulai dari bulan saat ini
  
  const [bookings, setBookings] = useState([]);  //// data awal dari database
  const [filteredBookings, setFilteredBookings] = useState([]); /// data yang sudah difilter
  const [sortedBookings, setSortedBookings] = useState([]); /// data (final) yang sudah difilter dan di sort

  //////////////////////// FILTER TABLE
  const [selectedEmployee, setSelectedEmployee] = useState(""); // State untuk menyimpan pilihan employee
  const employeesList = ["Yuli", "Isni", "Dini"];
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  ////////////////////// SORT TABLE
  const [sortOrder, setSortOrder] = useState("desc"); // Default: terbaru dulu

  useEffect(() => {
    const monthStart = dayjs().month(currentPage).startOf("month").format("YYYY-MM-DD");
    const monthEnd = dayjs().month(currentPage).endOf("month").format("YYYY-MM-DD");

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd)
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(bookingData); // Simpan data asli sebelum difilter
    });

    return () => unsubscribe();
  }, [currentPage]); // Hanya fetch ulang jika currentPage berubah

  /////////////////////////////////////// FILTER TABLE
  useEffect(() => {
    const filteredBookings = bookings.filter((booking) => {
      const isEmployeeMatch = selectedEmployee ? booking.employeeName === selectedEmployee : true;
      const isStatusMatch = selectedStatus ? booking.status === selectedStatus : true;
      const isDateMatch = selectedDate ? booking.date === selectedDate : true;
      return isEmployeeMatch && isStatusMatch && isDateMatch;
    });
  
    setFilteredBookings(filteredBookings);
  }, [bookings, selectedEmployee, selectedStatus, selectedDate]); // Hanya filtering jika filter berubah  

  /////////////////////////////////////////////////////// SORT TABLE date sekaligus time
  useEffect(() => {
    const sorted = [...filteredBookings].sort((a, b) => {
      const dateTimeA = new Date(`${a.date} ${a.time}`);
      const dateTimeB = new Date(`${b.date} ${b.time}`);
  
      return sortOrder === "asc" ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
    });
  
    setSortedBookings(sorted);
  }, [filteredBookings, sortOrder]);   // Jalankan ulang sorting jika filteredBookings atau sortOrder berubah

  // Fungsi untuk mengubah urutan sorting
  const handleSortByDate = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
  };
  
  const saveStatusChange = async (bookingId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: editedBookings[bookingId] });
  
      // Perbarui data bookings setelah update
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: editedBookings[bookingId] } : b))
      );
  
      // Hapus dari editedBookings setelah disimpan
      setEditedBookings((prev) => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const cancelEdit = (id) => {
  setEditedBookings((prev) => {
    const updated = { ...prev };
    delete updated[id];
    return updated;
  });
};

  const handleStatusChange = (bookingId, newStatus) => {
    setEditedBookings((prev) => ({
      ...prev,
      [bookingId]: newStatus,
    }));
  };

  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = dayjs(selectedDate).month();
      setCurrentPage(selectedMonth);
    }
  }, [selectedDate]);  

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY");

  ////////////////////////////////////////////// Sidebar ////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
              className={`flex items-center px-2 py-2 text-sm transition duration-150 font-medium text-white hover:text-white rounded-md no-underline 
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

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Booking List</h2>

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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-r from-purple-200 to-pink-200">
          <div className="bg-white shadow-md rounded-lg p-4 min-w-[1400px]">
            <h2 className="text-xl font-bold mb-4">Booking - {monthNames}</h2>
            {/* Filter Dropdown */}
            <div className="mb-4 flex gap-4">
              {/* Filter by Employee */}
              <div>
                <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700">Filter by Employee</label>
                <select
                  id="employeeSelect"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="mt-2 p-2 border rounded-md"
                >
                  <option value="">All Employees</option>
                  {employeesList.map((employee, index) => (
                    <option key={index} value={employee}>{employee}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div>
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700">Filter by Status</label>
                <select
                  id="statusSelect"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-2 p-2 border rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="Booked">Booked</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Filter by Date */}
              <div>
                <label htmlFor="dateSelect" className="block text-sm font-medium text-gray-700">Filter by Date</label>
                <input
                  type="date"
                  id="dateSelect"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-2 p-2 border rounded-md"
                />
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentPage}-${selectedDate}-${selectedEmployee}-${selectedStatus}-${sortOrder}`}
                className="overflow-x-auto min-h-[500px] max-h-[500px]"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                {/* <div className="overflow-x-auto"> */}
                <table className="w-full min-w-[1400px] bg-white border border-gray-200 shadow-sm rounded-md">
                  <thead className="bg-white">
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Phone Number</th>
                      <th className="p-2 text-left min-w-[130px]">Time</th>
                      <th className="p-2 text-left cursor-pointer flex items-center gap-2" onClick={handleSortByDate}>
                        Date
                        {sortOrder === "asc" ? (
                          <ArrowUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4" />
                        )}
                      </th>
                      <th className="p-2 text-left" >Services</th>
                      <th className="p-2 text-left">Employee</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left" style={{ width: '250px' }}>Booked At</th>
                      <th className="p-2 text-left" style={{ width: '300px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBookings.length > 0 ? (
                      sortedBookings.map((booking) => (
                        <tr key={booking.id} className="border-b">
                          <td className="p-2">{booking.customerName}</td>
                          <td className="p-2">{booking.phone}</td>
                          <td className="p-2">{booking.time} - {booking.endTime}</td>
                          <td className="p-2">{dayjs(booking.date).locale("id").format("dddd, D MMMM YYYY")}</td>
                          <td className="p-2">{booking.services.join(", ")}</td>
                          <td className="p-2">{booking.employeeName}</td>
                          <td className="p-2">Rp{Number(booking.totalPrice).toLocaleString('id-ID')}</td>
                          <td className="p-2">
                            {dayjs(booking.createdAt.toDate()).locale("id").format("HH:mm | dddd, D MMMM YYYY")}
                          </td>
                          <td className="py-2 flex items-center relative">
                            <StatusDropdown
                              booking={booking}
                              editedBookings={editedBookings}
                              handleStatusChange={handleStatusChange}
                            />
                            {/* Tombol Save & Cancel */}
                            {editedBookings[booking.id] && (
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex mr-4 gap-1">
                                <button
                                  onClick={() => saveStatusChange(booking.id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm shadow-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => cancelEdit(booking.id)}
                                  className="bg-red-500 text-white px-3 py-1 rounded-full text-sm shadow-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-2 text-center text-gray-500">No Booking</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            </AnimatePresence>
            {/* Pagination */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-pink-400 hover:bg-pink-500 active:bg-pink-600 transition text-white px-3 py-2 rounded flex items-center gap-2"
                >
                <ChevronLeftIcon className="h-6 w-6" />Previous Month
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-pink-400 hover:bg-pink-500 active:bg-pink-600 transition text-white px-3 py-2 rounded flex items-center gap-2"
                >
                Next Month <ChevronRightIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="mt-3 mr-3 flex justify-end">
            <AddBookingButton/>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bookings;