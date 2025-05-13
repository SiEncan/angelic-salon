// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"

const FeedbackModal = ({ isOpen, type, title, description, onClose, onSuccess }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 flex justify-center items-center z-50 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
              <div className="text-center">
                <div
                  className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
                    type === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {type === "success" ? (
                    <Check className="w-8 h-8 text-green-600" />
                  ) : (
                    <X className="w-8 h-8 text-red-600" />
                  )}
                </div>

                <h3 className={`text-xl font-bold mb-2 ${type === "success" ? "text-green-700" : "text-red-700"}`}>
                  {title}
                </h3>

                <p className="text-gray-600 mb-6">{description}</p>

                <button
                  onClick={() => {
                    onClose()
                    if (type === "success" && onSuccess) {
                      onSuccess()
                    }
                  }}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    type === "success"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  {type === "success" ? "Oke!" : "Coba Lagi"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FeedbackModal
