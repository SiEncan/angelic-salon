import { useState } from "react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Check, MessageSquare } from 'lucide-react'
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"

const FeedbackReviewModal = ({ isOpen, onClose, booking, onReviewSubmitted, bookingCount }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!booking) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) return
    
    setIsSubmitting(true)
    
    try {
      // Update the booking document with review data
      await updateDoc(doc(db, "bookings", booking.id), {
        review: {
          rating,
          comment,
          createdAt: new Date()
        },
        bookingCount: bookingCount
      })
      
      setIsSuccess(true)
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setRating(0)
        setComment("")
        setIsSuccess(false)
        onClose()
      }, 2000)
      
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      onReviewSubmitted()
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white relative">
                <button 
                  onClick={onClose}
                  className="absolute right-4 top-4 text-white hover:text-pink-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Review Your Experience
                </h3>
                <p className="text-pink-100 mt-1 text-sm">
                  {booking.service || booking.serviceName || booking.services?.join(", ")} with {booking.employeeName}
                </p>
              </div>
              
              {/* Content */}
              {isSuccess ? (
                <div className="p-6 flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Thank You!</h4>
                  <p className="text-gray-600 text-center">
                    Your review has been submitted successfully. We appreciate your feedback!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6">
                  {/* Rating Stars */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How would you rate your experience?
                    </label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star 
                            className={`w-8 h-8 ${
                              (hoverRating || rating) >= star 
                                ? "fill-yellow-400 stroke-yellow-400" 
                                : "stroke-gray-300"
                            } transition-colors`} 
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <div className="text-center mt-2 text-sm font-medium text-gray-700">
                        {rating === 5 ? "Excellent!" : 
                         rating === 4 ? "Very Good" :
                         rating === 3 ? "Good" :
                         rating === 2 ? "Fair" : "Poor"}
                      </div>
                    )}
                  </div>
                  
                  {/* Comment */}
                  <div className="mb-6">
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Share your experience (optional)
                    </label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={rating === 0 || isSubmitting}
                      className={`px-4 py-2 rounded-md text-white font-medium flex items-center gap-2 ${
                        rating === 0 || isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Submitting...
                        </>
                      ) : (
                        <>Submit Review</>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FeedbackReviewModal