import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion"
const CategoryServiceList = ({ categorizedServices, selectedServices, onServiceChange }) => {
  const [expandedCategories, setExpandedCategories] = useState({})

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Services</label>

      {categorizedServices.map((category) => (
        <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Category Header */}
          <button
            onClick={() => toggleCategory(category.id)}
            className={`w-full p-3 text-left bg-gradient-to-r ${category.color} text-white hover:opacity-90 transition-opacity flex items-center justify-between`}
          >
            <div>
              <h3 className="font-semibold text-sm">{category.title}</h3>
              <p className="text-xs opacity-90 mt-1">{category.description}</p>
            </div>
            {expandedCategories[category.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Services List */}
          <AnimatePresence>
            {expandedCategories[category.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-white space-y-2">
                  {category.services.map((service) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedServices.includes(service.name)
                          ? `border-2 bg-gradient-to-r ${category.color} bg-opacity-10 border-opacity-50`
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => onServiceChange(service.name)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={`font-medium text-sm ${selectedServices.includes(service.name) ? `text-white`: "text-gray-900"}`}>{service.name}</h4>
                          {service.description && <p className={`text-xs mt-1 ${selectedServices.includes(service.name) ? `text-white`: "text-gray-500" }`}>{service.description}</p>}
                        </div>
                        <div className="text-right ml-3">
                          <p className={`font-semibold text-sm ${selectedServices.includes(service.name) ? `text-white`: "text-purple-600 "}`}>
                            Rp{Number(service.price).toLocaleString("id-ID")}
                          </p>
                          <p className={`text-xs mt-1 ${selectedServices.includes(service.name) ? `text-gray-100`: "text-gray-500" }`}>{service.duration} min</p>
                        </div>
                      </div>

                      {selectedServices.includes(service.name) && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 flex justify-end">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
export default CategoryServiceList;