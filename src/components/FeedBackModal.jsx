import { CheckCircle, XCircle } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const modalAnimation = {
  hidden: { opacity: 0, scale: 0.8 }, // Mulai dengan opacity 0 dan scale kecil
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: {
      duration: 0.2, 
      type: "spring", // Gunakan spring untuk memberikan efek bouncy
      damping: 10, // Mengontrol seberapa banyak getaran yang terjadi
      stiffness: 300, // Menyesuaikan kecepatan untuk mendapatkan efek yang lebih responsif
    },
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    transition: { duration: 0.2}, // Transisi keluar dengan efek mengecil
  },
};

// Animasi untuk background opacity yang hanya fade in dan fade out
const backgroundAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.5, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const FeedbackModal = ({ type, title, description, isOpen, setIsOpen }) => {
  const isSuccess = type === "success";
  const iconColor = isSuccess ? "text-green-500" : "text-red-500";
  const bgColor = isSuccess ? "bg-green-100" : "bg-red-100";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backgroundAnimation}
          />

          {/* Modal dengan animasi bouncy */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalAnimation}
            >
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96 text-center relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
              <div className="flex justify-center">
                <div className={`${bgColor} p-3 rounded-full`}>
                  {isSuccess ? (
                    <CheckCircle className={iconColor} size={32} />
                  ) : (
                    <XCircle className={iconColor} size={32} />
                  )}
                </div>
              </div>
              <h2 className="text-xl font-semibold mt-4">{title}</h2>
              <p className="text-gray-500 mt-2">{description}</p>
              <button
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg w-full"
                onClick={() => setIsOpen(false)}
              >
                Continue
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;