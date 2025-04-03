import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, BriefcaseIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc, updateDoc, addDoc, collection, deleteDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import angelicLogo from '../../assets/images/AngelicSalon.jpg';
import { Dialog } from "@headlessui/react";

const ManageServices = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();  // Dapatkan lokasi saat ini

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);  

  const [services, setServices] = useState([]);
  const [currentService, setCurrentService] = useState({ name: "", price: 0 });
  const [editingService, setEditingService] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [serviceIdToDelete, setServiceIdToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  
    return () => unsubscribe(); // Membersihkan listener saat komponen di-unmount
  }, []);  

  const handleSave = async () => {
    if (editingService) {
      await updateDoc(doc(db, "services", editingService.id), currentService);
    } else {
      await addDoc(collection(db, "services"), currentService);
    }
    setIsOpen(false);
  };

  const confirmDelete = (id) => {
    setServiceIdToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (serviceIdToDelete) {
      await deleteDoc(doc(db, "services", serviceIdToDelete));
      setIsConfirmOpen(false);
    }
  };

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

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Manage Services</h2>

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
          <div className="mx-auto overflow-x-auto p-6 bg-gray-100 rounded-lg shadow-md">
            {/* <h2 className="text-3xl font-bold mb-6 text-gray-700">Manage Services</h2> */}
            <button
              className="bg-purple-500 text-white px-5 py-2 mb-3 rounded-md hover:bg-purple-600 transition duration-300"
              onClick={() => {
                setCurrentService({ name: "", price: "", duration: "" });
                setEditingService(null);
                setIsOpen(true);
              }}
            >
              + Add Service
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] mt-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-pink-400 min-w-[300px] p-5 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                    <p className="text-white font-semibold">Rp {service.price.toLocaleString('id-ID')}</p>
                    <p className="text-white">Duration Time: {service.duration} min</p>
                  </div>
                  <div className="flex space-x-3 mt-3 sm:mt-0 sm:flex-nowrap w-full sm:w-auto">
                    <button
                      className="bg-pink-500 text-white px-4 py-1 rounded-md hover:bg-pink-700 transition duration-200 w-full sm:w-auto"
                      onClick={() => {
                        setCurrentService(service);
                        setEditingService(service);
                        setIsOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-purple-500 text-white px-4 py-1 rounded-md hover:bg-purple-600 transition duration-200 w-full sm:w-auto"
                      onClick={() => confirmDelete(service.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Modal */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-96">
                <Dialog.Title className="text-lg font-bold mb-4 text-gray-700 text-center">{editingService ? "Edit Service" : "Add Service"}</Dialog.Title>
                <input
                  type="text"
                  className="border p-3 w-full rounded-md mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Service Name"
                  value={currentService.name}
                  onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
                />
                <input
                  type="number"
                  className="border p-3 w-full rounded-md mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Price"
                  value={currentService.price}
                  onChange={(e) => setCurrentService({ ...currentService, price: parseInt(e.target.value) || 0 })}
                  />
                <input
                  type="number"
                  className="border p-3 w-full rounded-md mb-3 focus:ring-2 focus:ring-blue-400"
                  placeholder="Estimate Time (minutes)"
                  value={currentService.duration}
                  onChange={(e) => setCurrentService({ ...currentService, duration: e.target.value })}
                />
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setIsOpen(false)} className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-200">Cancel</button>
                  <button onClick={handleSave} className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200">Save</button>
                </div>
              </Dialog.Panel>
            </Dialog>
            {/* Confirmation Dialog */}
            <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-96">
                <Dialog.Title className="text-lg font-bold mb-4 text-gray-700 text-center">Confirm Delete</Dialog.Title>
                <p className="text-gray-600 mb-4">Are you sure you want to delete this service?</p>
                <div className="flex justify-end space-x-3">
                  <button onClick={() => setIsConfirmOpen(false)} className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition duration-200">Cancel</button>
                  <button onClick={handleDelete} className="px-5 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200">Delete</button>
                </div>
              </Dialog.Panel>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageServices;