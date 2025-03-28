import { useState, useEffect } from "react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, CalendarIcon, DocumentIcon, ChartPieIcon, BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from "react-router-dom"; // Import useLocation
import { auth, db } from "../../firebase";  // Impor auth dan db dari file firebase Anda
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Impor untuk memantau status autentikasi
import angelicLogo from '../../assets/images/AngelicSalon.jpg';

const SuccessModal = ({ name, isOpen, setIsOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
        <div className="flex justify-center">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
        <h2 className="text-xl font-semibold mt-4">Account Created Successfully</h2>
        <p className="text-gray-500 mt-2">
          User <strong>{name}</strong> has been added to the Customer List
        </p>
        <button
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
          onClick={() => setIsOpen(false)}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const AddCustomer = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [zipCode, setZipCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setAddress("");
    setCity("");
    setProvince("");
    setZipCode("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword || !phone || !address || !city || !province || !zipCode) {
      alert("All fields are required");
      return;
    }
    
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/createCustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          address,
          city,
          province,
          zipCode,
        }),
      });

      if (response.ok) {
        setIsModalOpen(true);
      } else {
        const errorData = await response.json();
        alert(`Error registering customer: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); 
      } else {
        console.log("User not logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserName = async () => {
        const userDocRef = doc(db, "users", userId);
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

  const handleCancel = () => {
    navigate("/admin-dashboard/manage-customers");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-pink-400 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}>
        <div className="flex items-center justify-center h-20">
          <img src={angelicLogo} alt="Logo" className="h-16 w-16" />
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
              className={`flex items-center px-2 py-2 text-sm font-medium text-white hover:text-white rounded-md no-underline ${'/admin-dashboard/manage-customers' === item.path ? 'bg-pink-600' : 'hover:bg-pink-500'}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white md:hidden">
          <span className="text-3xl">&times;</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <header className="w-full">
          <div className="relative md:z-auto z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="ml-4 focus:outline-none md:hidden">
              <Bars3Icon className="h-6 w-6 mar" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center mr-3">
              <button className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <p className="mt-3 text-sm font-medium text-gray-700">{loggedName || "Loading..."}</p>

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
          <div className="flex max-w-7xl items-start mx-auto p-8 rounded-lg">
            <div className="flex-1">
              <h2 className="text-xl font-bold mr-5">Customer Registration</h2>
            </div>
            <div className="bg-white p-10 rounded-lg shadow-sm max-w-5xl w-full">
              <form onSubmit={handleRegister} className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 col-span-2 gap-6">
                  <input type="text" placeholder="First Name" value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)} 
                    className="w-full p-3 border rounded-lg" 
                  />
                  <input type="text" placeholder="Last Name" value={lastName} 
                    onChange={(e) => setLastName(e.target.value)} 
                    className="w-full p-3 border rounded-lg" 
                  />
                </div>

                {/* Email Address */}
                <input type="email" placeholder="Email Address" value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 border rounded-lg col-span-2" 
                />

                {/* Street Address */}
                <input type="text" placeholder="Street Address" value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  className="w-full p-3 border rounded-lg col-span-2" 
                />

                {/* City, Province, ZIP */}
                <div className="grid grid-cols-3 gap-6 col-span-2">
                  <input type="text" placeholder="City" value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    className="w-full p-3 border rounded-lg" 
                  />
                  <input type="text" placeholder="State / Province" value={province} 
                    onChange={(e) => setProvince(e.target.value)} 
                    className="w-full p-3 border rounded-lg" 
                  />
                  <input type="text" placeholder="ZIP / Postal Code" value={zipCode} 
                    onChange={(e) => setZipCode(e.target.value)} 
                    className="w-full p-3 border rounded-lg" 
                  />
                </div>

                {/* Phone Number */}
                <input type="text" placeholder="Phone Number" value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="w-full p-3 border rounded-lg col-span-2" 
                />

                {/* Password */}
                <div className="relative col-span-2">
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-full p-3 border rounded-lg pr-10" 
                  />
                  <button type="button" className="absolute right-3 top-4 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative col-span-2">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full p-3 border rounded-lg pr-10" 
                  />
                  <button type="button" className="absolute right-3 top-4 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Buttons */}
                <div className="col-span-2 flex justify-end gap-2">
                  <button onClick={handleCancel} type="button" className="px-6 py-3 text-black font-bold hover:bg-blue-200 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold shadow-sm rounded-lg hover:bg-blue-700">Register</button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <SuccessModal name={`${firstName} ${lastName}`} isOpen={isModalOpen} setIsOpen={() => {
          setIsModalOpen(false);
          resetForm();
        }} />
      </div>
    </div>
  );
};

export default AddCustomer;
