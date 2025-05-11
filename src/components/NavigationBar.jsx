import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase"; // Pastikan db diimpor dari file firebase.js
import { doc, getDoc } from "firebase/firestore";

function NavigationBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Mengambil role dari Firestore collection 'users'
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || null);
        } else {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
  };

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-200 bg-clip-text text-transparent">
        Angelic Salon & Spa
      </h1>

      {/* Hamburger Button */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6 items-center">
        <a href="#home" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Home</a>
        <a href="#about" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">About</a>
        <a href="#services" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Services</a>
        <a href="#contact" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Contact</a>
        {user ? (
          <>
            {userRole === "customer" && (
              <Link to="/profile" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Profile</Link>
            )}
            {userRole === "admin" && (
              <Link to="/admin-dashboard" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Admin Dashboard</Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-purple-500 hover:bg-purple-700 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-pink-400 hover:bg-pink-600 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
          >
            Login
          </button>
        )}
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden px-6 absolute top-16 left-0 right-0 bg-white"
          >
            <div className="flex flex-col space-y-4 mb-2">
              <a href="#home" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Home</a>
              <a href="#about" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">About</a>
              <a href="#services" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Services</a>
              <a href="#contact" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Contact</a>
              {user ? (
                <>
                  {userRole === "customer" && (
                    <Link to="/profile" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Profile</Link>
                  )}
                  {userRole === "admin" && (
                    <Link to="/admin-dashboard" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Admin Dashboard</Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="bg-purple-500 hover:bg-purple-700 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-pink-400 hover:bg-pink-600 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default NavigationBar;