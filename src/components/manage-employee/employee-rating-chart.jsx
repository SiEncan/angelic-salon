import { useState, useEffect } from "react"
import { Star } from 'lucide-react'
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import dayjs from "dayjs"

const EmployeeRatingChart = ({ employeeName, month, year, metrics }) => {
  const [ratings, setRatings] = useState({
    average: 0,
    count: 0,
    distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)

  // Process metrics data instead of generating random data
  useEffect(() => {
    setIsLoading(true)
    
    // Short timeout to show loading state for better UX
    const timer = setTimeout(() => {
      if (metrics) {
        // Use actual metrics data
        const distribution = metrics.ratingDistribution || {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        }
        
        // Safely handle the average rating - ensure it's a number before using toFixed
        let averageRating = "0.0";
        if (metrics.averageRating !== undefined && metrics.averageRating !== null) {
          const numericRating = Number(metrics.averageRating);
          if (!isNaN(numericRating)) {
            averageRating = numericRating.toFixed(1);
          }
        }
        
        setRatings({
          average: averageRating,
          count: metrics.ratingCount || 0,
          distribution: distribution,
        })
      }
      
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [metrics, employeeName, month, year])

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = []
    const ratingValue = Number(rating) || 0
    const roundedRating = Math.round(ratingValue * 2) / 2 // Round to nearest 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)
      } else if (i - 0.5 === roundedRating) {
        stars.push(
          <div key={i} className="relative w-5 h-5">
            <Star className="absolute w-5 h-5 text-gray-300" />
            <div className="absolute overflow-hidden w-2.5 h-5">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>,
        )
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />)
      }
    }

    return <div className="flex items-center gap-1">{stars}</div>
  }

  // Calculate the highest count for scaling the bars
  const maxCount = Math.max(...Object.values(ratings.distribution), 1)

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">{employeeName}</h4>
          <p className="text-sm text-gray-500">
            Rating for {dayjs().month(month).format("MMMM")} {year}
          </p>
        </div>

        <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
          <div className="flex items-center gap-2">
            {renderStarRating(ratings.average)}
            <span className="text-2xl font-bold text-gray-800">{ratings.average}</span>
          </div>
          <p className="text-sm text-gray-500">{ratings.count} reviews</p>
        </div>
      </div>

      {/* Rating distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} className="flex items-center gap-2">
            <div className="w-3 text-gray-600 font-medium">{rating}</div>
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(ratings.distribution[rating] / maxCount) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${rating >= 4 ? "bg-green-500" : rating >= 3 ? "bg-yellow-500" : "bg-red-500"}`}
              />
            </div>
            <div className="w-8 text-right text-sm text-gray-600">{ratings.distribution[rating]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployeeRatingChart