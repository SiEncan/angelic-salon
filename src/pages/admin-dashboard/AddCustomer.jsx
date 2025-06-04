import { useState } from "react"
import { useNavigate } from "react-router-dom"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { ArrowLeft, UserPlus, Users } from "lucide-react"
import CustomerForm from "../../components/add-customer/CustomerForm"
import LoadingModal from "../../components/LoadingModal"
import FeedbackModal from "../../components/BookingFeedbackModal"

const AddCustomer = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")

  const handleRegister = async (customerData) => {
    setIsLoading(true)

    try {
      const response = await fetch("https://backend-angelic-salon.onrender.com/createCustomer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        setIsLoading(false)
        setFeedbackModalType("success")
        setFeedbackModalTitle("Customer Added Successfully")
        setFeedbackModalDescription(
          `${customerData.firstName} ${customerData.lastName} has been successfully added to the customer database.`,
        )
        setIsFeedbackModalOpen(true)
      } else {
        setIsLoading(false)
        const errorData = await response.json()
        setFeedbackModalType("failed")
        setFeedbackModalTitle(errorData.message || "Registration Failed")
        setFeedbackModalDescription(errorData.error || "An error occurred while registering the customer.")
        setIsFeedbackModalOpen(true)
      }
    } catch (error) {
      console.error("Error registering customer:", error)
      setFeedbackModalType("failed")
      setFeedbackModalTitle("Network Error")
      setFeedbackModalDescription("Unable to connect to the server. Please check your connection and try again.")
      setIsLoading(false)
      setIsFeedbackModalOpen(true)
    }
  }

  const handleCancel = () => {
    navigate("/admin-dashboard/manage-customers")
  }

  const handleSuccess = () => {
    setIsFeedbackModalOpen(false)
    navigate("/admin-dashboard/manage-customers")
  }

  return (
    <>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
              >
              <ArrowLeft className="w-3 h-3" />
              <span className="font-medium text-xs">Back to Customers</span>
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Customer Registration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Fill in the customer information below to create a new account. All fields marked with * are required.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
              <p className="text-sm text-gray-600 mt-1">Enter the customer's personal and contact details</p>
            </div>

            <div className="p-6">
              <CustomerForm onSubmit={handleRegister} onCancel={handleCancel} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <LoadingModal
        isOpen={isLoading}
        title="Creating Customer Account"
        description="Please wait while we register the new customer..."
      />

      <FeedbackModal
        type={feedbackModalType}
        title={feedbackModalTitle}
        description={feedbackModalDescription}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSuccess={feedbackModalType === "success" ? handleSuccess : undefined}
      />
    </>
  )
}

export default AddCustomer
