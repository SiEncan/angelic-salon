import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentIcon, ChartPieIcon, BellIcon, Bars3Icon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, collection, onSnapshot, updateDoc } from "firebase/firestore";
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
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(dayjs().month()); // Mulai dari bulan saat ini

  const [selectedEmployee, setSelectedEmployee] = useState(""); // State untuk menyimpan pilihan employee
  const employeesList = ["Yuli", "Lusi", "Via"];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Filter berdasarkan bulan yang sedang dipilih dan employee yang dipilih
      const filteredBookings = bookingData.filter((booking) => {
        const bookingDate = dayjs(
          booking.date.toDate ? booking.date.toDate() : booking.date
        );
        const isSameMonth = bookingDate.month() === currentPage;

        // Jika selectedEmployee kosong, tampilkan semua booking. Jika tidak, hanya tampilkan yang sesuai dengan employee
        const isEmployeeMatch = selectedEmployee ? booking.employeeName === selectedEmployee : true;

        return isSameMonth && isEmployeeMatch;
      });
  
      setBookings(filteredBookings);
    });
  
    // Bersihkan listener saat komponen unmount
    return () => unsubscribe();
  }, [currentPage, selectedEmployee]); // Tambahkan selectedEmployee ke dependensi

  // Fungsi untuk menangani perubahan pada dropdown
  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
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
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Booking - {monthNames}</h2>
            {/* Employee Filter Dropdown */}
            <div className="mb-4">
              <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700">Filter by Employee</label>
              <select
                id="employeeSelect"
                value={selectedEmployee}
                onChange={handleEmployeeChange}
                className="mt-2 p-2 border rounded-md"
              >
                <option value="">All Employees</option>
                {employeesList.map((employee, index) => (
                  <option key={index} value={employee}>{employee}</option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] bg-white border border-gray-200 shadow-sm rounded-md">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Phone Number</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left" >Date</th>
                    <th className="p-2 text-left" >Services</th>
                    <th className="p-2 text-left">Employee</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left" style={{ width: '250px' }}>Booked At</th> {/* Set width for Booked At */}
                    <th className="p-2 text-left" style={{ width: '300px' }}>Status</th> {/* Set a wider width for Status */}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-2">{booking.customerName}</td>
                        <td className="p-2">{booking.phone}</td>
                        <td className="p-2">{booking.time} - {booking.endTime}</td>
                        <td className="p-2">{dayjs(booking.date).locale("id").format("dddd, D MMMM YYYY")}</td>
                        <td className="p-2">{booking.services.join(", ")}</td>
                        <td className="p-2">{booking.employeeName}</td>
                        <td className="p-2">Rp{Number(booking.totalPrice).toLocaleString('id-ID')}</td>
                        <td className="p-2">
                          {dayjs(booking.createdAt.toDate()).locale("id").format("HH:MM | dddd, D MMMM YYYY")}
                        </td>
                        <td className="py-2 flex items-center relative">
                          <StatusDropdown
                            booking={booking}
                            editedBookings={editedBookings}
                            handleStatusChange={handleStatusChange}
                          />
                          {/* Tombol Save & Cancel */}
                          <div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 flex mr-4 gap-1 transition-opacity duration-200 ${
                              editedBookings[booking.id] ? "opacity-100 visible" : "opacity-0 invisible"
                            }`}
                          >
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
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-2 text-center text-gray-500">No Booking</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                className="bg-pink-400 text-white px-3 py-2 rounded flex items-center gap-2"
                >
                <ChevronLeftIcon className="h-6 w-6" />Previous Month
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="bg-pink-400 text-white px-3 py-2 rounded flex items-center gap-2"
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