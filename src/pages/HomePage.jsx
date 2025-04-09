import { useNavigate, Link } from "react-router-dom";  // Menggunakan useLocation untuk memeriksa route aktif
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavigationBar from "../components/Navbar";
import { auth } from "../firebase"; // Pastikan path sesuai dengan lokasi firebase.js
import { signOut, onAuthStateChanged } from "firebase/auth";

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

return (
  <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300">
    <div className="max-w-screen-2xl mx-auto">
      {/* Header / Navbar */}
      <header className="w-full py-4 px-6 flex justify-between items-center max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-200 bg-clip-text text-transparent">
          Angelic Salon & Spa
        </h1>

        {/* Hamburger Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
          {/* Menu icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 items-center ">
          <a href="#home" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Home</a>
          <a href="#about" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">About</a>
          <a href="#services" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Services</a>
          <a href="#contact" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Contact</a>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-purple-500 hover:bg-purple-700 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
              >
              Logout
            </button>
            ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-pink-400 hover:bg-pink-600 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
              >
              Login
            </button>
          )}
        </nav>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden px-6"
            >
            <div className="flex flex-col space-y-4 mb-2">
              <a href="#home" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Home</a>
              <a href="#about" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">About</a>
              <a href="#services" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Services</a>
              <a href="#contact" className="text-gray-700 font-medium transition duration-150 hover:text-pink-500 no-underline">Contact</a>
              {user ? (
              <button
                onClick={handleLogout}
                className="bg-purple-500 hover:bg-purple-700 transition duration-150 text-white py-2 px-4 rounded-full text-sm font-medium"
                >
                Logout
              </button>
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
      
      <div className="grid grid-cols-2 md:grid-cols-2 grid-rows-1 gap-4 py-4 px-4">
        <div className="flex flex-col justify-center">
          <div className="font-extrabold text-xl md:text-4xl lg:text-5xl xl:text-7xl leading-tight mb-4 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
            <div>PERCAYA</div>
            <div>DIRI DATANG</div>
            <div className="md:hidden text-md bg-gradient-to-br from-purple-400 to-purple-300 text-white shadow-lg rounded-xl p-2 mt-2 w-fit">Dari Kamu!</div>
            <div className="hidden md:flex text-4xl lg:text-5xl bg-gradient-to-br from-purple-400 to-purple-300 text-white shadow-lg rounded-xl p-3 mt-2 w-fit">Dari Kamu!</div>
          </div>
          <p className="font-normal md:mt-4 text-xs lg:text-base xl:text-xl max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl text-slate-600">Temukan keindahan sejati dengan sentuhan ahli dari Angelic Salon & Spa.
          	Wujudkan rambut impianmu dengan perawatan terbaik yang dirancang khusus untuk memancarkan pesonamu.</p>
          <button className="md:hidden w-fit bg-[#171A31] hover:bg-opacity-80 transition duration-200 text-xs sm:text-sm font-semibold shadow-lg rounded-lg px-3 py-2 text-white">Book an Appointment</button>
          <button className="hidden md:flex w-fit bg-[#171A31] hover:bg-opacity-80 transition duration-200 font-semibold shadow-lg rounded-lg px-5 py-3 mt-2 text-white">Book an Appointment</button>
        </div>

        {/* SMALL */}
        <div className="flex h-[50%] w-full relative justify-center items-center md:hidden">
          <div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
          <img src='/images/hero-image.png' className="w-full bottom-4 relative z-10" />
        </div>

				
        {/* L laptop - 1024P */}
				<div className="flex w-full relative justify-center items-end hidden md:flex xl:hidden"> {/* ubah items-center jadi items-end */}
					<div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
					<img src='/images/hero-image.png' className="w-full relative z-10" /> {/* hapus bottom-0 di sini */}
				</div>

        {/* XL laptopL = 1440P */}
        <div className="flex w-full relative justify-center items-center hidden xl:flex">
          <div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
          <img src='/images/hero-image.png' className="relative z-10" />
        </div>
      </div>
        
      <section className="text-center py-20 bg-purple-200 bg-opacity-50 rounded-3xl shadow-md w-full mx-4 mt-16">
        <h2 className="text-4xl font-bold mb-2">Find Your Inner Glow</h2>
        <p className="text-lg text-gray-600 mb-16">
        Relax. Refresh. Rejuvenate at Angelic Salon & Spa.
        </p>
        <a href="#services" className="bg-pink-500 text-white px-16 py-3 rounded-full hover:bg-pink-600 transition no-underline">
        Our Location
        </a>
      </section>

      {/* About Section */}
      <section id="about" className="py-16">
        <h3 className="text-3xl font-bold mb-4 text-center">About Us</h3>
        <p className="text-gray-700 text-center max-w-2xl mx-auto">
        Angelic Salon & Spa is your sanctuary of serenity. We offer a full range of beauty and wellness treatments in a peaceful environment, designed to pamper and revitalize you.
        </p>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <h3 className="text-3xl font-bold mb-8 text-center">Our Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <ServiceCard title="Hair Styling" desc="Trendy and elegant cuts and styles." />
          <ServiceCard title="Facials" desc="Deep cleansing and glowing skin treatments." />
          <ServiceCard title="Massage Therapy" desc="Relaxing full-body massage sessions." />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <h3 className="text-3xl font-bold mb-4 text-center">Contact Us</h3>
        <p className="text-center text-gray-600 mb-6">Visit our salon or get in touch for appointments.</p>
        <div className="text-center">
          <p>📍 Jl. Anggun No. 10, Jakarta</p>
          <p>📞 0812-3456-7890</p>
          <p>📧 angelic@salonspa.com</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-6 text-sm border-t mt-12">
        © 2025 Angelic Salon & Spa. All rights reserved.
      </footer>
    </div>
  </div>
  );
}
    
function ServiceCard({ title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg p-6 transition">
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

export default HomePage;