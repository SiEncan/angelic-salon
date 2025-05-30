import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import FeedbackModal from "../components/BookingFeedbackModal";

import character from '../assets/images/LoginCharacter.png';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const role = userDoc.exists() ? userDoc.data().role : "customer";

          if (role === "admin" || role === "owner") {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ambil role dari Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : "customer";

      // Redirect sesuai role
      if (role === "admin" || role === "owner") {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Login Failed");
      setFeedbackModalDescription(
        "There was an error logging in. Please check your email and password."
      );
      setIsFeedbackModalOpen(true);
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-200 to-pink-300 p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden relative">
        {/* Bagian kiri - Form Login */}
        <div className="flex flex-col justify-center p-6 sm:p-10 relative">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-lg text-black hover:text-gray-600 absolute top-4 left-4 sm:static sm:mb-4"
            >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="mt-10 sm:mt-0 flex flex-col items-center sm:items-start">
            <h2 className="text-3xl font-bold">Log In</h2>
            <p className="text-gray-500">Please visit the receptionist to get an account.</p>

            {/* Bagian kanan - Ilustrasi */}
            <div className="md:hidden flex py-4 w-full relative overflow-hidden justify-center items-center">
              <div className="h-[25%] w-full absolute bottom-0 bg-[#C0DBEA] rounded-xl"></div>
              <img src={character} alt="Character" className="relative relative z-10 w-3/5" />
            </div>

            <form onSubmit={handleLogin} className="mt-6 w-full">
              <input
                type="email"
                placeholder="Email"
                value={email} // Menghubungkan input dengan state
                onChange={(e) => setEmail(e.target.value)} // Mengubah email saat input berubah
                className="w-full p-3 border rounded-lg mb-4 bg-blue-100"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password} // Menghubungkan input dengan state
                onChange={(e) => setPassword(e.target.value)} // Mengubah password saat input berubah
                className="w-full p-3 border rounded-lg mb-4 bg-blue-100"
                required
              />
              <motion.button 
                className="w-full font-semibold text-white p-3 hover:scale-105 rounded-lg mt-2 transition-all duration-200"
                style={{
                  background: 'linear-gradient(to right, #ec4899, #f472b6)',
                }}
                whileHover={{
                  background: 'linear-gradient(to right, #db2777,rgb(184, 64, 112))',
                }}
                transition={{ duration: 0.3 }}
                disabled={loading}
                >
                {!loading ? (
                  'LOGIN'
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-white font-semibold">Loading...</span>
                  </div>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Bagian kanan - Ilustrasi pada desktop */}
        <div className="hidden md:flex items-center justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-3/5 h-full bg-[#C0DBEA] rounded-l-3xl"></div>
          <img src={character} alt="Character" className="w-3/4 left-5 py-5 relative z-10" />
        </div>
      </div>
      {/* Feedback Modal */}
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          type={feedbackModalType}
          title={feedbackModalTitle}
          description={feedbackModalDescription}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
    </div>
  );
}

export default Login;