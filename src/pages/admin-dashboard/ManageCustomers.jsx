import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { db } from "../../firebase"
import { collection, query, onSnapshot, where, doc, updateDoc, getDocs, orderBy } from "firebase/firestore"
import { UserPlusIcon } from "@heroicons/react/24/outline"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"

// Import components
import CustomerTable from "../../components/manage-customers/CustomerTable";
import CustomerPagination from "../../components/manage-customers/CustomerPagination"
import CustomerFilters from "../../components/manage-customers/CustomerFilters"
import CustomerDetailModal from "../../components/manage-customers/CustomerDetailModal"
import CustomerEditModal from "../../components/manage-customers/CustomerEditModal"
import CustomerDeleteModal from "../../components/manage-customers/CustomerDeleteModal"
import FeedbackModal from "../../components/BookingFeedbackModal"

const ManageCustomers = () => {
  const navigate = useNavigate()

  // Data state
  const [allCustomers, setAllCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [displayedCustomers, setDisplayedCustomers] = useState([])

  // Sorting and pagination state
  const [sortOrder, setSortOrder] = useState({
    column: "fullName",
    order: "asc",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 10

  // Modals state
  const [viewCustomer, setViewCustomer] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [deleteCustomer, setDeleteCustomer] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    description: "",
  })

  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all customers
  useEffect(() => {
    setIsLoading(true)

    const customersQuery = query(collection(db, "users"), where("role", "==", "customer"))

    const unsubscribe = onSnapshot(customersQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const customerData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Get last visit for each customer
        const customersWithLastVisit = await Promise.all(
          customerData.map(async (customer) => {
            try {
              const bookingsQuery = query(
                collection(db, "bookings"),
                where("customerId", "==", customer.id),
                orderBy("date", "desc"),
              )

              const bookingsSnapshot = await getDocs(bookingsQuery)
              const lastVisit = bookingsSnapshot.docs[0]?.data()?.date || null

              return {
                ...customer,
                lastVisit,
              }
            } catch (error) {
              console.error("Error fetching bookings for customer:", customer.id, error)
              return {
                ...customer,
                lastVisit: null,
              }
            }
          }),
        )

        setAllCustomers(customersWithLastVisit)
        setFilteredCustomers(customersWithLastVisit)
      } else {
        setAllCustomers([])
        setFilteredCustomers([])
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Handle sorting
  const handleSort = (column) => {
    const currentOrder = sortOrder.column === column && sortOrder.order === "asc" ? "desc" : "asc"
    setSortOrder({ column, order: currentOrder })
    setCurrentPage(1) // Reset to first page when sorting
  }

  // Apply sorting to filtered customers
  useEffect(() => {
    const sorted = [...filteredCustomers].sort((a, b) => {
      let aValue = a[sortOrder.column]
      let bValue = b[sortOrder.column]

      // Handle different data types
      if (sortOrder.column === "createdAt") {
        aValue = aValue ? new Date(aValue.toDate()) : new Date(0)
        bValue = bValue ? new Date(bValue.toDate()) : new Date(0)
      } else if (sortOrder.column === "bookingCount") {
        aValue = aValue || 0
        bValue = bValue || 0
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue ? bValue.toLowerCase() : ""
      }

      if (sortOrder.order === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    // Apply pagination
    const startIndex = (currentPage - 1) * customersPerPage
    const endIndex = startIndex + customersPerPage
    setDisplayedCustomers(sorted.slice(startIndex, endIndex))
  }, [filteredCustomers, sortOrder, currentPage])

  // Handle search
  const handleSearch = (term) => {
    if (term) {
      const filtered = allCustomers.filter(
        (customer) =>
          customer.fullName?.toLowerCase().includes(term.toLowerCase()) ||
          customer.email?.toLowerCase().includes(term.toLowerCase()) ||
          customer.phone?.includes(term),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(allCustomers)
    }
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle filters
  const handleFilter = (filters) => {
    let filtered = [...allCustomers]

    if (filters.rank) {
      filtered = filtered.filter((customer) => {
        const bookingCount = customer.bookingCount || 0
        if (filters.rank === "Diamond") return bookingCount >= 100
        if (filters.rank === "Platinum") return bookingCount >= 50 && bookingCount < 100
        if (filters.rank === "Gold") return bookingCount >= 25 && bookingCount < 50
        if (filters.rank === "Silver") return bookingCount >= 10 && bookingCount < 25
        if (filters.rank === "Bronze") return bookingCount < 10
        return true
      })
    }

    if (filters.minBookings) {
      filtered = filtered.filter((customer) => (customer.bookingCount || 0) >= Number.parseInt(filters.minBookings))
    }

    if (filters.maxBookings) {
      filtered = filtered.filter((customer) => (customer.bookingCount || 0) <= Number.parseInt(filters.maxBookings))
    }

    setFilteredCustomers(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  // Pagination handlers
  const nextPage = () => {
    if (!isLastPage) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const prevPage = () => {
    if (!isFirstPage) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Customer action handlers
  const handleViewCustomer = (customer) => {
    setViewCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer)
    setIsEditModalOpen(true)
  }

  const handleDeleteCustomer = (customer) => {
    setDeleteCustomer(customer)
    setIsDeleteModalOpen(true)
  }

  const handleSaveCustomer = async (updatedCustomer) => {
    try {
      await updateDoc(doc(db, "users", updatedCustomer.id), {
        fullName: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        notes: updatedCustomer.notes,
      })

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Customer Updated",
        description: `${updatedCustomer.fullName} has been successfully updated.`,
      })

      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Error updating customer:", error)

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        description: "There was an error updating the customer. Please try again.",
      })
    }
  }

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async (uid, name) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`https://backend-angelic-salon.onrender.com/deleteCustomer/${uid}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (res.ok) {
        // Tampilkan feedback modal
        setFeedbackModal({
          isOpen: true,
          type: "success",
          title: "Customer Deleted",
          description: `Customer ${name} has been successfully deleted.`,
        });
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      console.error("Delete failed:", err);
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        description: err.message || "Failed to delete customer.",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };


  const handleAddCustomer = () => {
    navigate("/admin-dashboard/add-customer")
  }

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <>
      <div className="mx-auto">
        {/* Header with stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Management</h2>
              <p className="text-gray-500">Manage salon's customer data and relationships</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-100 p-3 rounded-lg shadow-md">
                  <p className="text-sm text-purple-400 font-medium">Total Customers</p>
                  <p className="text-xl font-bold text-purple-600">{allCustomers.length}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-100 p-3 rounded-lg shadow-md">
                  <p className="text-sm text-blue-400 font-medium">Active This Month</p>
                  <p className="text-xl font-bold text-blue-600">
                    {
                      allCustomers.filter(
                        (c) => c.lastVisit && new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ).length
                    }
                  </p>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-100 p-3 rounded-lg shadow-md">
                  <p className="text-sm text-yellow-500 font-medium">New This Month</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {
                      allCustomers.filter(
                        (c) =>
                          c.createdAt &&
                          new Date(c.createdAt.toDate()) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddCustomer}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 flex items-center justify-center gap-2"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <CustomerFilters onSearch={handleSearch} onFilter={handleFilter} />
        </div>

        {/* Customer Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md"
          style={{ overflow: "visible" }}
        >
          <div className="p-6" style={{ overflow: "visible" }}>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <CustomerTable
                  customers={displayedCustomers}
                  sortOrder={sortOrder}
                  handleSort={handleSort}
                  onEdit={handleEditCustomer}
                  onDelete={handleDeleteCustomer}
                  onView={handleViewCustomer}
                />

                <CustomerPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCustomers={filteredCustomers.length}
                  customersPerPage={customersPerPage}
                  prevPage={prevPage}
                  nextPage={nextPage}
                  goToPage={goToPage}
                  isFirstPage={isFirstPage}
                  isLastPage={isLastPage}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <CustomerDetailModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} customer={viewCustomer} />

      <CustomerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={editCustomer}
        onSave={handleSaveCustomer}
      />

      <CustomerDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        customer={deleteCustomer}
        onConfirm={handleConfirmDelete}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        type={feedbackModal.type}
        title={feedbackModal.title}
        description={feedbackModal.description}
        onClose={closeFeedbackModal}
      />
      {/* Loading Modal */}
      <LoadingModal isOpen={isDeleting} />
    </>
  )
}

export default ManageCustomers

import LoadingModal from "../../components/LoadingModal"