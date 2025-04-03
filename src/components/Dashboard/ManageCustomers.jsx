import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon, BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom";  // Menggunakan useLocation untuk memeriksa route aktif
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, where, endBefore, limitToLast, collection, query, onSnapshot, orderBy, limit, startAfter } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Memantau status autentikasi
import angelicLogo from '../../assets/images/AngelicSalon.jpg';

import dayjs from "dayjs";

const UserCard = ({ totalBooks }) => {
  
  const rankClasses = {
    Bronze: "bg-amber-600 text-gray-900",
    Silver: "bg-gray-300 text-gray-700",
    Gold: "bg-yellow-300 text-yellow-700",
    Platinum: "bg-blue-100 text-blue-700",
    Diamond: "bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white shadow-lg transform scale-105",
  };
  
  const rank = totalBooks >= 50
    ? "Diamond"
    : totalBooks >= 20
    ? "Platinum"
    : totalBooks >= 10
    ? "Gold"
    : totalBooks >= 5
    ? "Silver"
    : "Bronze";

  return (
    <td className="p-3">
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${rankClasses[rank] || "bg-gray-100 text-gray-700"}`}
      >
        {rank} Member
      </span>
    </td>
  );
};

const SortableHeader = ({ display, label, onSort, sortOrder }) => {
  const toggleSort = () => {
    onSort(label); 
  };

  return (
    <th className="px-3 py-2 text-left cursor-pointer" onClick={toggleSort}>
      <div className="flex items-center text-gray-600 font-normal space-x-1">
        <span>{display}</span>
        {sortOrder === "asc" ? (
          <ChevronUpIcon className="w-4 h-4 text-black" />
        ) : sortOrder === "desc" ? (
          <ChevronDownIcon className="w-4 h-4 text-black" />
        ) : (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </th>
  );
};

const ManageCustomers = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Menggunakan useLocation untuk memeriksa halaman yang sedang aktif

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [customers, setCustomers] = useState([]);

  const [sortedCustomers, setSortedCustomers] = useState([]);
  const [sortOrder, setSortOrder] = useState({ createdAt: "desc" });

  const [currentPage, setCurrentPage] = useState(1);  // Halaman saat ini
  const [lastVisible, setLastVisible] = useState(null);  // Dokumen terakhir yang terlihat untuk navigasi
  const customersPerPage = 5;  // Jumlah data per halaman

  const [historyPages, setHistoryPages] = useState([]);
  const [firstVisible, setFirstVisible] = useState(null);

  const handleSort = (column) => {
    const currentOrder = sortOrder.column === column && sortOrder.order === "asc" ? "desc" : "asc";
    setSortOrder({ column, order: currentOrder });
  };

  useEffect(() => {
    let customersQuery;
  
    if (firstVisible && currentPage < historyPages.length + 1) {
      // Jika mundur, gunakan `endBefore(firstVisible)`
      customersQuery = query(
        collection(db, "users"),
        where("role", "==", "customer"),
        orderBy("createdAt", "desc"),
        endBefore(firstVisible),
        limitToLast(customersPerPage)
      );
    } else if (lastVisible) {
      // Jika maju, gunakan `startAfter(lastVisible)`
      customersQuery = query(
        collection(db, "users"),
        where("role", "==", "customer"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(customersPerPage)
      );
    } else {
      // Jika halaman pertama
      customersQuery = query(
        collection(db, "users"),
        where("role", "==", "customer"),
        orderBy("createdAt", "desc"),
        limit(customersPerPage)
      );
    }
  
    const unsubscribe = onSnapshot(customersQuery, (snapshot) => {
      if (!snapshot.empty) {
        const customerData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        setCustomers(customerData);
        setFirstVisible(snapshot.docs[0]); // Simpan firstVisible
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // Simpan lastVisible
      }
    });
  
    return () => unsubscribe();
  }, [currentPage]);  

  const nextPage = () => {
    if (currentPage < 200) { 
      setHistoryPages((prev) => [...prev, { first: firstVisible, last: lastVisible }]); 
      setCurrentPage((prev) => prev + 1);
    }
  };  

  const prevPage = () => {
    if (currentPage > 1) {
      const prevPageData = historyPages[historyPages.length - 1]; // Ambil halaman sebelumnya
      setHistoryPages((prev) => prev.slice(0, -1)); // Hapus halaman sebelumnya dari history
      setLastVisible(prevPageData.last); // Kembalikan lastVisible
      setFirstVisible(prevPageData.first); // Kembalikan firstVisible
      setCurrentPage((prev) => prev - 1);
    }
  };
  

  useEffect(() => {
    const sortedData = [...customers].sort((a, b) => {
      const aValue = a[sortOrder.column];
      const bValue = b[sortOrder.column];
  
      if (aValue < bValue) return sortOrder.order === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder.order === "asc" ? 1 : -1;
      return 0;
    });
  
    setSortedCustomers(sortedData);  // Menyimpan data yang sudah disortir
  }, [customers, sortOrder]);

  const handleAddCustomer = () => {
    navigate("/admin-dashboard/add-customer");
  };

  ////////////////////////////////////////// navbar ///////////////////////////////

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
  }, [userId]);

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

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Manage Customers</h2>

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
                  auth.signOut(); // Logout
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
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-r from-pink-200 to-purple-200">
          {/* Tabel Daftar Customer */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Customer List</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 text-left">
                  <tr>
                    <SortableHeader
                      display='Name'
                      label="fullName"
                      onSort={handleSort}
                      sortOrder={sortOrder.column === "fullName" ? sortOrder.order : null}
                    />
                    <SortableHeader
                      display='Email'
                      label="email"
                      onSort={handleSort}
                      sortOrder={sortOrder.column === "email" ? sortOrder.order : null}
                    />
                    <th className="px-3 py-2 text-gray-600 font-normal">Phone Number</th>
                    <SortableHeader
                      display='Register Date'
                      label="createdAt"
                      onSort={handleSort}
                      sortOrder={sortOrder.column === "createdAt" ? sortOrder.order : null}
                    />
                    <SortableHeader
                      display='Booking Count'
                      label="bookingCount"
                      onSort={handleSort}
                      sortOrder={sortOrder.column === "bookingCount" ? sortOrder.order : null}
                    />
                    <th className="px-3 py-2">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCustomers.map((customer, index) => (
                    <tr key={index} className={`border-b ${index % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                      <td className="p-3 font-medium">{customer.fullName}</td>
                      <td className="p-3 text-gray-600">{customer.email}</td>
                      <td className="p-3 text-gray-600">{customer.phone}</td>
                      <td className="p-3 text-gray-600">{dayjs(customer.createdAt.toDate()).format("DD-MM-YYYY")}</td>
                      <td className="p-3 text-gray-600">{customer.bookingCount}</td>
                      <UserCard totalBooks={customer.bookingCount} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button 
                onClick={prevPage} 
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>

              <span className="text-gray-600">Page {currentPage} of </span>

              <button 
                onClick={nextPage} 
                className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageCustomers;