import { X, CheckCircle, XCircle } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"

const FeedbackModal = ({ isOpen, type, title, description, onClose, onSuccess }) => {
  return (
    <>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              duration: 0.3,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div
                className={`bg-gradient-to-r ${
                  type === "success" ? "from-green-500 to-teal-500" : "from-red-500 to-pink-500"
                } p-4 flex justify-between items-center`}
              >
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <button
                  onClick={() => {
                    onClose();
                    if (type === "success" && onSuccess) {
                      onSuccess();
                    }
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="h-6 w-6 hover:cursor-pointer hover:text-gray-300 transition-colors" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      type === "success" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {type === "success" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </div>

                <p className="text-center text-gray-600 mb-6">{description}</p>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      onClose();
                      if (type === "success" && onSuccess) {
                        onSuccess();
                      }
                    }}
                    className={`px-4 py-2 text-white rounded-lg ${type === "success" ? "bg-teal-500 hover:bg-teal-600" : "bg-red-500 hover:bg-red-600"} transition-colors duration-200 font-medium`}
                  >
                    Okay!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
};

export default FeedbackModal