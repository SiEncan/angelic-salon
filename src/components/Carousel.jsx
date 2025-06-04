import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"

// Import icons
import wellnessCenterIcon from "../assets/icons/wellnesscenter.svg"
import barberSalonIcon from "../assets/icons/barbersalon.svg"
import frisorsalonIcon from "../assets/icons/frisorsalon.svg"
import massageKlinikIcon from "../assets/icons/massageklinik.svg"
import fodterapeutIcon from "../assets/icons/fodterapeut.svg"
import creambath from "../assets/icons/creambath.png"
import handmassage from "../assets/icons/handmassage.png"
import menicure from "../assets/icons/menicure.png"

const services = [
  { id: 1, name: "Cream Bath", icon: creambath, description: "Deep conditioning hair treatment" },
  { id: 2, name: "Hand Massage", icon: handmassage, description: "Relaxing hand therapy" },
  { id: 3, name: "Menicure", icon: menicure, description: "Professional nail care" },
  { id: 5, name: "Wellness Center", icon: wellnessCenterIcon, description: "Complete wellness treatments" },
  { id: 6, name: "Barber Salon", icon: barberSalonIcon, description: "Professional hair cutting" },
  { id: 7, name: "Hair Salon", icon: frisorsalonIcon, description: "Hair styling and treatment" },
  { id: 8, name: "Massage Clinic", icon: massageKlinikIcon, description: "Therapeutic massage" },
  { id: 9, name: "Foot Therapy", icon: fodterapeutIcon, description: "Foot care and treatment" },
]

export default function ServiceCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState(4)
  const containerRef = useRef(null)

  // Calculate max index to prevent over-scrolling
  const maxIndex = Math.max(0, services.length - visibleItems)

  // Responsive handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1)
      } else if (window.innerWidth < 768) {
        setVisibleItems(2)
      } else if (window.innerWidth < 1024) {
        setVisibleItems(3)
      } else {
        setVisibleItems(4)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Reset currentIndex if it exceeds maxIndex when visibleItems changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCurrentIndex(0) // Loop back to start
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    } else {
      setCurrentIndex(maxIndex) // Loop to end
    }
  }

  // Calculate transform percentage based on visible items
  const transformPercentage = (currentIndex * 100) / visibleItems

  return (
    <div className="relative max-w-8xl mx-auto px-4">
      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
        aria-label="Previous services"
      >
        <ChevronLeft className="h-6 w-6 text-purple-600" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
        aria-label="Next services"
      >
        <ChevronRight className="h-6 w-6 text-purple-600" />
      </button>

      {/* Carousel Container */}
      <div className="overflow-hidden min-h-[330px] md:min-h-[400px] lg:min-h-[400px] xl:min-h-[310px] pt-10 items-center z-50 mx-12" ref={containerRef}>
        <motion.div
          className="flex"
          initial={false}
          animate={{ x: `-${transformPercentage}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {services.map((service) => (
            <div key={service.id} className="px-3 flex-shrink-0" style={{ width: `${100 / visibleItems}%` }}>
              <div className="bg-white rounded-2xl shadow-md overflow-x-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                {/* Icon Container */}
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full transform scale-75"></div>
                  <img
                    src={service.icon || "/placeholder.svg"}
                    alt={service.name}
                    className="relative z-10 w-16 h-16 object-contain"
                  />
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800">{service.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-8 space-x-2">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-gradient-to-r from-purple-500 to-pink-500"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
