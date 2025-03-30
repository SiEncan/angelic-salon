import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom";  // Menggunakan useLocation untuk memeriksa route aktif
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Memantau status autentikasi
import angelicLogo from '../../assets/images/AngelicSalon.jpg';

const ManageCustomers = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Menggunakan useLocation untuk memeriksa halaman yang sedang aktif

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [customers, setCustomers] = useState([]);

  // Fetch customers with role 'customer'
  useEffect(() => {
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const customersData = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === "customer") {
          customersData.push({ id: doc.id, ...userData });
        }
      });
      
      setCustomers(customersData);
    };

    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    navigate("/admin-dashboard/add-customer"); // Halaman untuk registrasi customer baru
  };

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
            { icon: DocumentIcon, label: "Documents", path: "/documents" },
            { icon: ChartPieIcon, label: "Reports", path: "/reports" }].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-2 py-2 text-sm font-medium text-white hover:text-white hover:bg-pink-500 rounded-md no-underline ${
                location.pathname === item.path ? "bg-pink-600" : ""
              }`}  // Menambahkan kelas bg-pink-600 untuk halaman yang aktif
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

            <h2 className="text-2xl font-bold mt-1 ml-8 text-gray-700">Manage Customers</h2>

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
                  navigate("/"); // Redirect ke halaman utama setelah logout
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
          {/* Tabel Daftar Customer */}
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-200">
                  <th className="py-2 px-4 text-left">Name</th>
                  <th className="py-2 px-4 text-left">Email</th>
                  <th className="py-2 px-4 text-left">Phone</th>
                  <th className="py-2 px-4 text-left">address</th>
                  <th className="py-2 px-4 text-left">city</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-t">
                    <td className="py-2 px-4">{customer.fullName}</td>
                    <td className="py-2 px-4">{customer.email}</td>
                    <td className="py-2 px-4">{customer.phone}</td>
                    <td className="py-2 px-4">{customer.address}</td>
                    <td className="py-2 px-4">{customer.city}</td>
                    <td className="py-2 px-4">
                      {/* Tindakan yang dapat dilakukan pada baris data */}
                      <button className="text-blue-500 hover:text-blue-700">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tombol untuk registrasi customer baru */}
          <div className="mt-4">
            <button
              onClick={handleAddCustomer}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Add New Customer
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageCustomers;
