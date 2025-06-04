// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

const LoadingModal = ({ isOpen, title = "Loading...", description = "Please wait...", type = "loading" }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />
      case "error":
        return <AlertCircle className="w-8 h-8 text-red-500" />
      case "loading":
      default:
        return <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          gradient: "from-green-500 to-emerald-500",
          bg: "bg-green-50",
          text: "text-green-700",
        }
      case "error":
        return {
          gradient: "from-red-500 to-rose-500",
          bg: "bg-red-50",
          text: "text-red-700",
        }
      case "loading":
      default:
        return {
          gradient: "from-purple-500 to-pink-500",
          bg: "bg-purple-50",
          text: "text-purple-700",
        }
    }
  }

  const colors = getColors()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${colors.gradient} h-2`} />

              {/* Content */}
              <div className="p-8 text-center">
                {/* Icon */}
                <div className={`${colors.bg} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  {getIcon()}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>

                {/* Description */}
                <p className="text-gray-600 mb-6">{description}</p>

                {/* Loading animation for loading type */}
                {type === "loading" && (
                  <div className="flex justify-center">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-500 rounded-full"
                          animate={{
                            y: [0, -8, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress steps for loading */}
                {type === "loading" && (
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Validating data</span>
                      <span>Verifying</span>
                      <span>Finalizing</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <motion.div
                        className={`bg-gradient-to-r ${colors.gradient} h-1 rounded-full`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default LoadingModal
