import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
  startAfter,
  endBefore,
  limitToLast,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import CustomerTable from "../../components/manage-customers/CustomerTable";
import CustomerPagination from "../../components/manage-customers/CustomerPagination";
import CustomerFilters from "../../components/manage-customers/CustomerFilters";
import CustomerDetailModal from "../../components/manage-customers/CustomerDetailModal";
import CustomerEditModal from "../../components/manage-customers/CustomerEditModal";
import CustomerDeleteModal from "../../components/manage-customers/CustomerDeleteModal";
import FeedbackModal from "../../components/BookingFeedbackModal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ManageCustomers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [sortOrder, setSortOrder] = useState({
    column: "fullName",
    order: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [firstVisible, setFirstVisible] = useState(null);
  const [historyPages, setHistoryPages] = useState([]);
  const [isLastPage, setIsLastPage] = useState(false);
  const customersPerPage = 10;

  // Modals state
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  // Handle sorting
  const handleSort = (column) => {
    const currentOrder =
      sortOrder.column === column && sortOrder.order === "asc" ? "desc" : "asc";
    setSortOrder({ column, order: currentOrder });
  };

  // Fetch customers with pagination
  useEffect(() => {
    let customersQuery;

    customersQuery = query(
        collection(db, "users"),
        where("role", "==", "customer"),
        orderBy(sortOrder.column, sortOrder.order),
        // limit(customersPerPage)
      );

    // if (firstVisible && currentPage < historyPages.length + 1) {
    //   // If going backward, use endBefore
    //   customersQuery = query(
    //     collection(db, "users"),
    //     where("role", "==", "customer"),
    //     orderBy(sortOrder.column, sortOrder.order),
    //     endBefore(firstVisible),
    //     limitToLast(customersPerPage)
    //   );
    // } else if (lastVisible) {
    //   // If going forward, use startAfter
    //   customersQuery = query(
    //     collection(db, "users"),
    //     where("role", "==", "customer"),
    //     orderBy(sortOrder.column, sortOrder.order),
    //     startAfter(lastVisible),
    //     limit(customersPerPage)
    //   );
    // } else {
    //   // First page
    //   customersQuery = query(
    //     collection(db, "users"),
    //     where("role", "==", "customer"),
    //     orderBy(sortOrder.column, sortOrder.order),
    //     limit(customersPerPage)
    //   );
    // }

    const unsubscribe = onSnapshot(customersQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const customerData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const customersWithLastVisit = await Promise.all(
          customerData.map(async (customer) => {
            const bookingsQuery = query(
              collection(db, "bookings"),
              where("customerId", "==", customer.id),
              orderBy("date", "desc"),
              limit(1)
            );

            const bookingsSnapshot = await getDocs(bookingsQuery);
            const lastVisit = bookingsSnapshot.docs[0]?.data()?.date || null;

            return {
              ...customer,
              lastVisit
            };
          })
        );

        setCustomers(customersWithLastVisit);
        setFilteredCustomers(customersWithLastVisit);
        setFirstVisible(snapshot.docs[0]);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);

        // Check if this is the last page
        if (snapshot.docs.length < customersPerPage) {
          setIsLastPage(true);
        } else {
          setIsLastPage(false);
        }
      } else {
        setCustomers([]);
        setFilteredCustomers([]);
        setIsLastPage(true);
      }
    });

    return () => unsubscribe();
  }, [currentPage, sortOrder.column, sortOrder.order]);

  // Handle search
  const handleSearch = (term) => {
    // setSearchTerm(term)
    if (term) {
      const filtered = customers.filter(
        (customer) =>
          customer.fullName?.toLowerCase().includes(term.toLowerCase()) ||
          customer.email?.toLowerCase().includes(term.toLowerCase()) ||
          customer.phone?.includes(term)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  };

  // Handle filters
  const handleFilter = (filters) => {
    let filtered = [...customers];

    if (filters.rank) {
      filtered = filtered.filter((customer) => {
        const bookingCount = customer.bookingCount || 0;
        if (filters.rank === "Diamond") return bookingCount >= 100;
        if (filters.rank === "Platinum")
          return bookingCount >= 50 && bookingCount < 100;
        if (filters.rank === "Gold")
          return bookingCount >= 25 && bookingCount < 50;
        if (filters.rank === "Silver")
          return bookingCount >= 10 && bookingCount < 25;
        if (filters.rank === "Bronze") return bookingCount < 10;
        return true;
      });
    }

    if (filters.minBookings) {
      filtered = filtered.filter(
        (customer) =>
          (customer.bookingCount || 0) >= Number.parseInt(filters.minBookings)
      );
    }

    if (filters.maxBookings) {
      filtered = filtered.filter(
        (customer) =>
          (customer.bookingCount || 0) <= Number.parseInt(filters.maxBookings)
      );
    }

    setFilteredCustomers(filtered);
  };

  // Pagination handlers
  const nextPage = () => {
    if (!isLastPage) {
      setHistoryPages((prev) => [
        ...prev,
        { first: firstVisible, last: lastVisible },
      ]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      const prevPageData = historyPages[historyPages.length - 1];
      setHistoryPages((prev) => prev.slice(0, -1));
      setLastVisible(prevPageData.last);
      setFirstVisible(prevPageData.first);
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Customer action handlers
  const handleViewCustomer = (customer) => {
    setViewCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleEditCustomer = (customer) => {
    setEditCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDeleteCustomer = (customer) => {
    setDeleteCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  const handleSaveCustomer = async (updatedCustomer) => {
    try {
      await updateDoc(doc(db, "users", updatedCustomer.id), {
        fullName: updatedCustomer.fullName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address,
        notes: updatedCustomer.notes,
      });

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Customer Updated",
        description: `${updatedCustomer.fullName} has been successfully updated.`,
      });

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating customer:", error);

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        description:
          "There was an error updating the customer. Please try again.",
      });
    }
  };

  const handleConfirmDelete = async (customerId) => {
    try {
      const customerToDelete = customers.find((c) => c.id === customerId);
      await deleteDoc(doc(db, "users", customerId));

      setFeedbackModal({
        isOpen: true,
        type: "success",
        title: "Customer Deleted",
        description: `${
          customerToDelete?.fullName || "Customer"
        } has been successfully deleted.`,
      });

      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting customer:", error);

      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Delete Failed",
        description:
          "There was an error deleting the customer. Please try again.",
      });
    }
  };

  const handleAddCustomer = () => {
    navigate("/admin-dashboard/add-customer");
  };

  const closeFeedbackModal = () => {
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <div className="mx-auto">
        {/* Header with stats */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Customer Management
              </h2>
              <p className="text-gray-500">
                Manage your salon's customer database
              </p>
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
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <CustomerTable
            customers={filteredCustomers}
            sortOrder={sortOrder}
            handleSort={handleSort}
            onEdit={handleEditCustomer}
            onDelete={handleDeleteCustomer}
            onView={handleViewCustomer}
          />

          <CustomerPagination
            currentPage={currentPage}
            totalPages={null} // We don't know the total pages with Firestore pagination
            prevPage={prevPage}
            nextPage={nextPage}
            isFirstPage={currentPage === 1}
            isLastPage={isLastPage}
          />
        </motion.div>
      </div>

      {/* Modals */}
      <CustomerDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        customer={viewCustomer}
      />

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
    </>
  );
};

export default ManageCustomers;
