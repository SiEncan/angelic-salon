import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  where,
  query,
  orderBy,
  Timestamp,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  Calendar,
  Bell,
  Menu,
  ArrowUp,
  ArrowDown,
  Scissors,
  Search,
  Filter,
  X,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Phone,
} from "lucide-react";
import { HomeIcon, UsersIcon, ClipboardDocumentListIcon, BriefcaseIcon, ChartPieIcon, BellIcon, Bars3Icon, ScissorsIcon } from "@heroicons/react/24/outline";

import angelicLogo from '../../assets/images/AngelicSalon.jpg';
import FeedbackModal from "../../components/BookingFeedbackModal";
import BookingActions from "../../components/BookingActions";
import MonthNavigation from "../../components/MonthNavigation";

const Bookings = () => {
  const [loggedName, setLoggedName] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(dayjs().month());

  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [sortedBookings, setSortedBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("active"); // "active" or "history"

  // Filter states
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const employeesList = ["Yuli", "Isni", "Dini"];
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Sort state
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("date"); // Default sort by date

  // Status counts
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
    inProgress: 0,
  });

  // Add Booking Modal states
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  // Add Booking form states
  const [nameInput, setNameInput] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [services, setServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBookingEmployee, setSelectedBookingEmployee] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);

  // Fetch bookings for the current month
  useEffect(() => {
    const monthStart = dayjs()
      .month(currentPage)
      .startOf("month")
      .format("YYYY-MM-DD");
    const monthEnd = dayjs()
      .month(currentPage)
      .endOf("month")
      .format("YYYY-MM-DD");

    const bookingsQuery = query(
      collection(db, "bookings"),
      where("date", ">=", monthStart),
      where("date", "<=", monthEnd),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBookings(bookingData);
    });

    return () => unsubscribe();
  }, [currentPage]);

  // Calculate status counts
  useEffect(() => {
    const counts = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0,
    };

    bookings.forEach((booking) => {
      const status = booking.status?.toLowerCase();
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    setStatusCounts(counts);
  }, [bookings]);

  // Filter bookings
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter(
        (booking) => booking.employeeName === selectedEmployee
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter(
        (booking) =>
          booking.status?.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((booking) => booking.date === selectedDate);
    }

    // Filter by search query (customer name or service)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.customerName?.toLowerCase().includes(query) ||
          booking.services?.some((service) =>
            service.toLowerCase().includes(query)
          )
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, selectedEmployee, selectedStatus, selectedDate, searchQuery]);

  // Sort bookings
  useEffect(() => {
    const sorted = [...filteredBookings].sort((a, b) => {
      if (sortField === "date") {
        const dateTimeA = new Date(`${a.date} ${a.time}`);
        const dateTimeB = new Date(`${b.date} ${b.time}`);
        return sortOrder === "asc"
          ? dateTimeA - dateTimeB
          : dateTimeB - dateTimeA;
      } else if (sortField === "price") {
        return sortOrder === "asc"
          ? a.totalPrice - b.totalPrice
          : b.totalPrice - a.totalPrice;
      } else if (sortField === "name") {
        return sortOrder === "asc"
          ? a.customerName?.localeCompare(b.customerName)
          : b.customerName?.localeCompare(a.customerName);
      }
      return 0;
    });

    setSortedBookings(sorted);
  }, [filteredBookings, sortOrder, sortField]);

  // Separate active and history bookings
  useEffect(() => {
    const active = [];
    const history = [];

    sortedBookings.forEach((booking) => {
      const status = booking.status?.toLowerCase();
      if (
        status === "pending" ||
        status === "confirmed" ||
        status === "rejected" ||
        status === "inprogress"
      ) {
        active.push(booking);
      } else if (status === "completed" || status === "cancelled") {
        history.push(booking);
      }
    });

    setActiveBookings(active);
    setHistoryBookings(history);
  }, [sortedBookings]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const saveStatusChange = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: Timestamp.now(),
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );

      setFeedbackModalType("success");
      setFeedbackModalTitle("Status Updated");
      setFeedbackModalDescription(
        "The booking status has been successfully updated."
      );
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error("Error updating status:", error);
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Update Failed");
      setFeedbackModalDescription(
        "There was an error updating the booking status. Please try again."
      );
      setIsFeedbackModalOpen(true);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));

      setFeedbackModalType("success");
      setFeedbackModalTitle("Booking Deleted");
      setFeedbackModalDescription("The booking has been successfully deleted.");
      setIsFeedbackModalOpen(true);
    } catch (error) {
      console.error("Error deleting booking:", error);
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Delete Failed");
      setFeedbackModalDescription(
        "There was an error deleting the booking. Please try again."
      );
      setIsFeedbackModalOpen(true);
    }
  };

  const handleViewDetails = (bookingId) => {
    // Implement view details functionality
    console.log("View details for booking:", bookingId);
    // You could navigate to a details page or open a modal
  };

  useEffect(() => {
    if (selectedDate) {
      const selectedMonth = dayjs(selectedDate).month();
      setCurrentPage(selectedMonth);
    }
  }, [selectedDate]);

  const monthNames = dayjs().month(currentPage).format("MMMM YYYY");

  // Reset all filters
  const resetFilters = () => {
    setSelectedEmployee("");
    setSelectedStatus("");
    setSelectedDate("");
    setSearchQuery("");
  };

  // Auth and user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.log("User not logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserName = async () => {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setLoggedName(userDocSnap.data().fullName);
        } else {
          console.log("User not found!");
        }
      };

      fetchUserName();
    }
  }, [userId]);

  // Get status badge style
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "inprogress":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "inprogress":
        return <Scissors className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Add Booking Functions
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setServiceOptions(servicesData);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchServices();
  }, []);

  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value).format("YYYY-MM-DD");
    setDate(selectedDate);
    setSelectedBookingEmployee(null);
    fetchBookingsForDate(selectedDate);
  };

  const fetchBookingsForDate = async (selectedDate) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "bookings"), where("date", "==", selectedDate))
      );
      const bookings = querySnapshot.docs.map((doc) => doc.data());
      setExistingBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings: ", error);
    }
  };

  const handleSearchCustomer = async () => {
    if (nameInput.trim() === "") {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const q = query(
        collection(db, "users"),
        where("fullName", ">=", nameInput),
        where("fullName", "<=", nameInput + "\uf8ff")
      );

      const querySnapshot = await getDocs(q);
      const fetchedCustomers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSuggestions(fetchedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      setNameInput(selectedUser.fullName);
      setPhone(selectedUser.phone || "No phone number");
    }
  }, [selectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSuggestions([]);
    setIsSearching(false);
  };

  const calculateEndTime = (startTime, totalDuration) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours);
    endDate.setMinutes(minutes + totalDuration);

    return endDate.toTimeString().slice(0, 5);
  };

  useEffect(() => {
    if (time && services.length > 0) {
      const totalDuration = services.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s);
        return sum + (serviceObj ? serviceObj.duration : 0);
      }, 0);

      const calculatedEndTime = calculateEndTime(time, totalDuration);
      setEndTime(calculatedEndTime);
    }
  }, [time, services, serviceOptions]);

  const handleServiceChange = (service) => {
    setSelectedBookingEmployee(null);
    setServices((prev) => {
      const updatedServices = prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service];

      const totalPrice = updatedServices.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s);
        return sum + (serviceObj ? serviceObj.price : 0);
      }, 0);

      setTotalPrice(totalPrice);

      return updatedServices;
    });
  };

  const handleSaveBooking = async () => {
    if (!date || !time || services.length === 0 || !selectedBookingEmployee) {
      setFeedbackModalType("failed");
      setFeedbackModalTitle("All fields are required");
      setFeedbackModalDescription(
        "Please fill in all required fields to create a booking."
      );
      setIsFeedbackModalOpen(true);
      return;
    }

    try {
      const bookingData = {
        customerName: selectedUser?.fullName ?? nameInput,
        phone: selectedUser?.phone ?? phone,
        date,
        time,
        endTime,
        services,
        totalPrice,
        employeeName: selectedBookingEmployee,
        status: "pending",
        createdAt: Timestamp.now(),
      };

      // Add userId only if selectedUser exists
      if (selectedUser) {
        bookingData.customerId = selectedUser.id;
      }

      await addDoc(collection(db, "bookings"), bookingData);

      setFeedbackModalType("success");
      setFeedbackModalTitle("Booking successfully created!");
      setFeedbackModalDescription(
        "The appointment has been scheduled and is pending approval."
      );
      setIsFeedbackModalOpen(true);

      setIsAddBookingOpen(false);
      resetBookingForm();
    } catch (error) {
      console.error("Error saving booking:", error);
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Failed to save booking");
      setFeedbackModalDescription(
        "There was an error creating the booking. Please try again."
      );
      setIsFeedbackModalOpen(true);
    }
  };

  const resetBookingForm = () => {
    setNameInput("");
    setPhone("");
    setDate("");
    setTime("");
    setEndTime("");
    setServices([]);
    setSelectedUser(null);
    setSelectedBookingEmployee(null);
    setTotalPrice(0);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-pink-400 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-200 ease-in-out z-20`}>
        <div className="flex items-center justify-center h-20">
          <img src={angelicLogo} alt="Logo" className="h-16 w-16" />
        </div>
        <nav className="flex-1 px-2 py-4 space-y-3">
          {[{ icon: HomeIcon, label: "Dashboard", path: "/admin-dashboard" },
            { icon: ClipboardDocumentListIcon, label: "Bookings", path: "/admin-dashboard/bookings" },
            { icon: UsersIcon, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
            { icon: ScissorsIcon, label: "Manage Services", path: "/admin-dashboard/manage-services" },
            { icon: BriefcaseIcon, label: "Manage Employee", path: "/admin-dashboard/manage-employee" },
            { icon: ChartPieIcon, label: "Reports", path: "/reports" }].map((item, index) => (
            <Link
              key={index}
              
              to={item.path}
              className={`flex items-center px-2 py-2 text-sm transition duration-150 font-medium text-white hover:text-white rounded-md no-underline 
                ${'/admin-dashboard/bookings' === item.path ? 'bg-pink-600' : 'hover:bg-pink-500'}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-white md:hidden">
          <span className="text-3xl">&times;</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <header className="w-full">
         <div className="relative md:z-auto z-10 items-center justify-center flex-shrink-0 flex h-16 bg-white shadow">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="ml-4 focus:outline-none md:hidden"
            >
              <Bars3Icon className="h-6 w-6 mar" />
            </button>

            <h2 className="text-sm sm:text-2xl font-bold mt-1 ml-8 text-gray-700">Manage Bookings</h2>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Notifications & Profile */}
            <div className="flex items-center mr-3">
              <button className="bg-white p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="h-6 w-6" />
              </button>
              <p className="mt-3 text-sm font-medium text-gray-700">{loggedName || "Loading..."}</p>

              {/* Logout Button */}
              <button
                onClick={() => {
                  auth.signOut(); // Fungsi untuk logout
                  navigate("/login"); // Arahkan ke halaman login
                }}
                className="ml-4 bg-red-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 pb-16">
          {/* Status summary cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statusCounts.pending}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {statusCounts.confirmed}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {statusCounts.rejected}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-gray-600">
                  {statusCounts.cancelled}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-5 w-5 text-gray-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statusCounts.completed}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Booking table section */}
          <div className="p-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Header and filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Bookings - {monthNames}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
                    <div className="relative flex-grow md:flex-grow-0 md:w-64">
                      <input
                        type="text"
                        placeholder="Search customer or service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden md:inline">Filters</span>
                    </button>

                    <button
                      onClick={() => setIsAddBookingOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Booking</span>
                    </button>
                  </div>
                </div>

                {/* Filter panel */}
                {isFilterOpen && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                      <div>
                        <label
                          htmlFor="employeeSelect"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Employee
                        </label>
                        <select
                          id="employeeSelect"
                          value={selectedEmployee}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        >
                          <option value="">All Employees</option>
                          {employeesList.map((employee, index) => (
                            <option key={index} value={employee}>
                              {employee}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="statusSelect"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Status
                        </label>
                        <select
                          id="statusSelect"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        >
                          <option value="">All Status</option>
                          <option value="pending">Pending Approval</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rejected">Rejected</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="dateSelect"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Date
                        </label>
                        <input
                          type="date"
                          id="dateSelect"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="p-2 border rounded-md w-full md:w-40"
                        />
                      </div>

                      <button
                        onClick={resetFilters}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 mt-2 md:mt-0"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab navigation */}
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                    activeTab === "active"
                      ? "border-b-2 border-purple-500 text-purple-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Active Bookings
                  {activeBookings.length > 0 && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                      {activeBookings.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
                    activeTab === "history"
                      ? "border-b-2 border-purple-500 text-purple-700"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Booking History
                  {historyBookings.length > 0 && (
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                      {historyBookings.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeTab}-${currentPage}-${selectedDate}-${selectedEmployee}-${selectedStatus}-${sortOrder}-${searchQuery}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="min-w-full"
                    style={{
                      maxHeight: "calc(100vh - 300px)",
                      overflowY: "auto",
                    }}
                  >
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("name")}
                            >
                              <div className="flex items-center">
                                Customer
                                {sortField === "name" &&
                                  (sortOrder === "asc" ? (
                                    <ArrowUp className="ml-1 h-4 w-4" />
                                  ) : (
                                    <ArrowDown className="ml-1 h-4 w-4" />
                                  ))}
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Contact
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("date")}
                            >
                              <div className="flex items-center">
                                Date & Time
                                {sortField === "date" &&
                                  (sortOrder === "asc" ? (
                                    <ArrowUp className="ml-1 h-4 w-4" />
                                  ) : (
                                    <ArrowDown className="ml-1 h-4 w-4" />
                                  ))}
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Services
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Employee
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort("price")}
                            >
                              <div className="flex items-center">
                                Price
                                {sortField === "price" &&
                                  (sortOrder === "asc" ? (
                                    <ArrowUp className="ml-1 h-4 w-4" />
                                  ) : (
                                    <ArrowDown className="ml-1 h-4 w-4" />
                                  ))}
                              </div>
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activeTab === "active" ? (
                            activeBookings.length > 0 ? (
                              activeBookings.map((booking) => (
                                <tr
                                  key={booking.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                        {booking.customerName?.charAt(0) || "?"}
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {booking.customerName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {dayjs(booking.date).format(
                                            "DD MMM YYYY"
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {booking.phone || "No phone"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {dayjs(booking.date).format(
                                        "DD MMM YYYY"
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {booking.time} - {booking.endTime}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 max-w-xs truncate">
                                      {booking.services?.join(", ")}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                                      {booking.employeeName}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    Rp
                                    {Number(booking.totalPrice).toLocaleString(
                                      "id-ID"
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                                        booking.status
                                      )}`}
                                    >
                                      {getStatusIcon(booking.status)}
                                      {booking.status === "pending"
                                        ? "Pending Approval"
                                        : booking.status === "confirmed"
                                        ? "Confirmed"
                                        : booking.status === "rejected"
                                        ? "Rejected"
                                        : booking.status === "cancelled"
                                        ? "Cancelled"
                                        : booking.status === "inProgress"
                                        ? "In Progress"
                                        : booking.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <BookingActions
                                      booking={booking}
                                      handleStatusChange={saveStatusChange}
                                      handleViewDetails={handleViewDetails}
                                      handleDeleteBooking={handleDeleteBooking}
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="8"
                                  className="px-6 py-10 text-center"
                                >
                                  <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                                      <Clock className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-700 mb-2">
                                      No Active Bookings
                                    </h4>
                                    <p className="text-gray-500 text-center max-w-md">
                                      There are currently no active bookings
                                      that require attention.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            )
                          ) : historyBookings.length > 0 ? (
                            historyBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                      {booking.customerName?.charAt(0) || "?"}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {booking.customerName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {dayjs(booking.date).format(
                                          "DD MMM YYYY"
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {booking.phone || "No phone"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {dayjs(booking.date).format("DD MMM YYYY")}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {booking.time} - {booking.endTime}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 max-w-xs truncate">
                                    {booking.services?.join(", ")}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {booking.employeeName}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Rp
                                  {Number(booking.totalPrice).toLocaleString(
                                    "id-ID"
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                                      booking.status
                                    )}`}
                                  >
                                    {getStatusIcon(booking.status)}
                                    {booking.status === "pending"
                                      ? "Pending Approval"
                                      : booking.status === "confirmed"
                                      ? "Confirmed"
                                      : booking.status === "rejected"
                                      ? "Rejected"
                                      : booking.status === "cancelled"
                                      ? "Cancelled"
                                      : booking.status === "completed"
                                      ? "Completed"
                                      : booking.status === "inProgress"
                                      ? "In Progress"
                                      : booking.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <BookingActions
                                    booking={booking}
                                    handleStatusChange={saveStatusChange}
                                    handleViewDetails={handleViewDetails}
                                    handleDeleteBooking={handleDeleteBooking}
                                  />
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="8"
                                className="px-6 py-10 text-center"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                                    No Booking History
                                  </h4>
                                  <p className="text-gray-500 text-center max-w-md">
                                    There are no completed or cancelled bookings
                                    in the history.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden">
                      {activeTab === "active" ? (
                        activeBookings.length > 0 ? (
                          <div className="divide-y divide-gray-200">
                            {activeBookings.map((booking) => (
                              <div key={booking.id} className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                      {booking.customerName?.charAt(0) || "?"}
                                    </div>
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">
                                        {booking.customerName}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {booking.phone || "No phone"}
                                      </div>
                                    </div>
                                  </div>
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                                      booking.status
                                    )}`}
                                  >
                                    {getStatusIcon(booking.status)}
                                    {booking.status === "pending"
                                      ? "Pending Approval"
                                      : booking.status === "confirmed"
                                      ? "Confirmed"
                                      : booking.status === "rejected"
                                      ? "Rejected"
                                      : booking.status === "cancelled"
                                      ? "Cancelled"
                                      : booking.status === "completed"
                                      ? "Completed"
                                      : booking.status === "inprogress"
                                      ? "In Progress"
                                      : booking.status}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                      Date & Time
                                    </div>
                                    <div className="text-sm font-medium">
                                      {dayjs(booking.date).format(
                                        "DD MMM YYYY"
                                      )}
                                    </div>
                                    <div className="text-xs">
                                      {booking.time} - {booking.endTime}
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-2 rounded">
                                    <div className="text-xs text-gray-500">
                                      Employee
                                    </div>
                                    <div className="text-sm font-medium">
                                      {booking.employeeName}
                                    </div>
                                    <div className="text-xs text-pink-600">
                                      Stylist
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-2 rounded mb-3">
                                  <div className="text-xs text-gray-500">
                                    Services
                                  </div>
                                  <div className="text-sm">
                                    {booking.services?.join(", ")}
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      Price
                                    </div>
                                    <div className="text-sm font-bold">
                                      Rp
                                      {Number(
                                        booking.totalPrice
                                      ).toLocaleString("id-ID")}
                                    </div>
                                  </div>

                                  <BookingActions
                                    booking={booking}
                                    handleStatusChange={saveStatusChange}
                                    handleViewDetails={handleViewDetails}
                                    handleDeleteBooking={handleDeleteBooking}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-10 flex flex-col items-center justify-center p-4">
                            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                              <Clock className="h-8 w-8 text-purple-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-700 mb-2">
                              No Active Bookings
                            </h4>
                            <p className="text-gray-500 text-center">
                              There are currently no active bookings that
                              require attention.
                            </p>
                          </div>
                        )
                      ) : historyBookings.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {historyBookings.map((booking) => (
                            <div key={booking.id} className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                    {booking.customerName?.charAt(0) || "?"}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {booking.customerName}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {booking.phone || "No phone"}
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeStyle(
                                    booking.status
                                  )}`}
                                >
                                  {getStatusIcon(booking.status)}
                                  {booking.status === "rejected"
                                    ? "Rejected"
                                    : booking.status === "cancelled"
                                    ? "Cancelled"
                                    : booking.status === "completed"
                                    ? "Completed"
                                    : booking.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500">
                                    Date & Time
                                  </div>
                                  <div className="text-sm font-medium">
                                    {dayjs(booking.date).format("DD MMM YYYY")}
                                  </div>
                                  <div className="text-xs">
                                    {booking.time} - {booking.endTime}
                                  </div>
                                </div>

                                <div className="bg-gray-50 p-2 rounded">
                                  <div className="text-xs text-gray-500">
                                    Employee
                                  </div>
                                  <div className="text-sm font-medium">
                                    {booking.employeeName}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    Stylist
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-2 rounded mb-3">
                                <div className="text-xs text-gray-500">
                                  Services
                                </div>
                                <div className="text-sm">
                                  {booking.services?.join(", ")}
                                </div>
                              </div>

                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-xs text-gray-500">
                                    Price
                                  </div>
                                  <div className="text-sm font-bold">
                                    Rp
                                    {Number(booking.totalPrice).toLocaleString(
                                      "id-ID"
                                    )}
                                  </div>
                                </div>

                                <BookingActions
                                  booking={booking}
                                  handleStatusChange={saveStatusChange}
                                  handleViewDetails={handleViewDetails}
                                  handleDeleteBooking={handleDeleteBooking}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center p-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-700 mb-2">
                            No Booking History
                          </h4>
                          <p className="text-gray-500 text-center">
                            There are no completed or cancelled bookings in the
                            history.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Month Navigation - Fixed at bottom of screen */}
          <MonthNavigation
            monthNames={monthNames}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            activeTab={activeTab}
            activeBookings={activeBookings}
            historyBookings={historyBookings}
            bookings={bookings}
          />

          {/* Add Booking Modal */}
          <AnimatePresence>
            {isAddBookingOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40"
                  onClick={() => setIsAddBookingOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="fixed inset-0 flex justify-center items-center z-50 px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden">
                    <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b">
                      <h2 className="text-2xl font-bold text-purple-700">
                        Add New Booking
                      </h2>
                    </div>

                    <div className="overflow-y-auto p-6 pt-4 flex-grow">
                      <div className="relative w-full mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Type customer name..."
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSearchCustomer();
                              }
                            }}
                            className="p-2 w-full pr-12 border rounded-lg shadow-sm outline-none"
                          />
                          <button
                            onClick={handleSearchCustomer}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                          >
                            <Search className="h-4 w-4" />
                          </button>
                        </div>

                        {suggestions.length > 0 ? (
                          <ul className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded-lg max-h-40 overflow-auto z-50 p-0">
                            {suggestions.map((user) => (
                              <li
                                key={user.id}
                                onClick={() => handleSelectUser(user)}
                                className="p-2 cursor-pointer hover:bg-gray-200"
                              >
                                {user.fullName}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          isSearching &&
                          suggestions.length === 0 && (
                            <div className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded-lg p-2 text-gray-500">
                              No Results...
                            </div>
                          )
                        )}
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-10 border p-2 w-full rounded-lg shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={date}
                            onChange={handleDateChange}
                            className="border p-2 w-full rounded-lg shadow-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                          </label>
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => {
                              setSelectedBookingEmployee(null);
                              setTime(e.target.value);
                            }}
                            className="border p-2 w-full rounded-lg shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Services
                        </label>
                        <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 relative border border-gray-200 rounded-lg p-2">
                          {/* Gradient fade at bottom to indicate scrollable content */}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

                          {serviceOptions.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleServiceChange(service.name)}
                              className={`px-3 w-full text-left py-2 border rounded-lg ${
                                services.includes(service.name)
                                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>{service.name}</span>
                                <span>
                                  Rp
                                  {Number(service.price).toLocaleString(
                                    "id-ID"
                                  )}
                                </span>
                              </div>
                              {service.duration && (
                                <div className="text-xs mt-1 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{service.duration} min</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {totalPrice > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-700">Total Price:</span>
                            <span className="text-lg font-bold text-purple-700">
                              Rp{Number(totalPrice).toLocaleString("id-ID")}
                            </span>
                          </div>
                          {endTime && (
                            <div className="text-sm text-gray-500 mt-1">
                              Duration: {time} - {endTime}
                            </div>
                          )}
                        </div>
                      )}

                      {date && time && services.length > 0 && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Employee
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {employeesList.map((employee) => {
                              const isAvailable = !existingBookings.some(
                                (booking) =>
                                  booking.employeeName === employee &&
                                  ((time >= booking.time &&
                                    time < booking.endTime) || // Start time conflict
                                    (endTime > booking.time &&
                                      endTime <= booking.endTime) || // End time conflict
                                    (time <= booking.time &&
                                      endTime >= booking.endTime)) // New booking encompasses old booking
                              );

                              return (
                                <button
                                  key={employee}
                                  onClick={() =>
                                    isAvailable &&
                                    setSelectedBookingEmployee(employee)
                                  }
                                  disabled={!isAvailable}
                                  className={`p-2 rounded-lg border text-center transition-all
                                  ${
                                    selectedBookingEmployee === employee
                                      ? "bg-purple-300 border-purple-500 text-purple-700"
                                      : isAvailable
                                      ? "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                                      : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  <span className="font-bold">{employee}</span>
                                  <div className="text-xs mt-1 font-medium">
                                    {isAvailable ? (
                                      <span className="text-green-600">
                                        Available
                                      </span>
                                    ) : (
                                      <span className="text-red-500">
                                        Unavailable
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="sticky bottom-0 bg-white p-4 border-t mt-auto flex justify-between">
                      <button
                        onClick={() => {
                          setIsAddBookingOpen(false);
                          resetBookingForm();
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveBooking}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        Save Booking
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={isFeedbackModalOpen}
            type={feedbackModalType}
            title={feedbackModalTitle}
            description={feedbackModalDescription}
            onClose={() => setIsFeedbackModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
};

export default Bookings;
