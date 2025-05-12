import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, Phone, Check, X } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";

import EmployeeSelection from "./EmployeeSelection";

const CustomerBookingButton = ({ user, profile, onBookingSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [services, setServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [existingBookings, setExistingBookings] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);

  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0];

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
    setSelectedEmployee(null);
    fetchBookings(selectedDate);
  };

  const fetchBookings = async (selectedDate) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "bookings"), where("date", "==", selectedDate))
      );
      const bookings = querySnapshot.docs.map((doc) => doc.data());
      setExistingBookings(bookings);

      // Also fetch employees for this date
      fetchAvailableEmployees();
    } catch (error) {
      console.error("Error fetching bookings: ", error);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const employeeQuery = query(
        collection(db, "users"),
        where("role", "==", "employee")
      );
      const employeeSnapshot = await getDocs(employeeQuery);
      const employees = employeeSnapshot.docs.map((doc) => doc.data().fullName);
      setEmployeeList(employees);
    } catch (error) {
      console.error("Error fetching employees: ", error);
    }
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
    setSelectedEmployee(null);
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
    if (!date || !time || services.length === 0 || !selectedEmployee) {
      setFeedbackModalType("failed");
      setFeedbackModalTitle("All fields are required");
      setFeedbackModalDescription(
        "Tolong pilih tanggal, waktu, layanan, dan karyawan yang tersedia."
      );
      setIsFeedbackModalOpen(true);
      return;
    }

    if (!isTimeInRange(time)) {
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Gagal Memilih Waktu");
      setFeedbackModalDescription(
        "Waktu booking hanya tersedia antara jam 09:00 - 17:00"
      );
      setIsFeedbackModalOpen(true);
      return;
    }

    try {
      const bookingData = {
        customerName: profile?.displayName || user.displayName || user.email,
        customerId: user.uid,
        phone: profile?.phone || "",
        date,
        time,
        endTime,
        services,
        totalPrice,
        employeeName: selectedEmployee,
        status: "pending",
        createdAt: Timestamp.now(),
      };

      // Add the booking
      await addDoc(collection(db, "bookings"), bookingData);

      // Update the user's booking count
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        bookingCount: increment(1),
      });

      setFeedbackModalType("success");
      setFeedbackModalTitle("Booking Confirmed!");
      setFeedbackModalDescription(
        "Booking Anda telah berhasil dibuat. Silakan cek WhatsApp Anda secara berkala atau kembali ke halaman ini untuk melihat status booking Anda."
      );
      setIsFeedbackModalOpen(true);

      // Reset form and close modal
      setIsOpen(false);

      // Trigger refresh of parent component if provided
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Booking Failed");
      setFeedbackModalDescription(
        "Terjadi kesalahan saat booking. Silakan coba lagi nanti."
      );
      setIsFeedbackModalOpen(true);
    }
  };

  const resetForm = () => {
    setDate("");
    setTime("");
    setEndTime("");
    setServices([]);
    setSelectedEmployee(null);
    setTotalPrice(0);
  };

  const isTimeInRange = (time) => {
    if (!time) return false;
    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;
    const minMinutes = 9 * 60; // 10:00
    const maxMinutes = 17 * 60; // 18:00
    return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
        >
        <Calendar className="w-5 h-5" />
        Book an Appointment
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsOpen(false)}
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
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 p-6 pb-4 border-b">
                  <h2 className="text-2xl font-bold text-purple-700">
                    Book Your Appointment
                  </h2>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 pt-4 flex-grow">
                  {/* Customer Info Section - Read Only */}
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium text-purple-700 mb-2">
                      Your Information
                    </h3>

                    <div className="flex items-center gap-3 mb-2">
                      <User className="text-purple-500 w-5 h-5" />
                      <input
                        type="text"
                        value={
                          profile?.displayName || user.displayName || user.email
                        }
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="text-purple-500 w-5 h-5" />
                      <input
                        type="text"
                        value={profile?.phone || "No phone number"}
                        disabled
                        className="bg-gray-100 p-2 w-full rounded border border-purple-200 text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={date}
                          onChange={handleDateChange}
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                            const selectedTime = e.target.value;
                            if (!isTimeInRange(selectedTime)) {
                              setFeedbackModalType("failed");
                              setFeedbackModalTitle("Gagal Memilih Waktu");
                              setFeedbackModalDescription(
                                "Waktu booking hanya tersedia antara jam 09:00 - 17:00"
                              );
                              setIsFeedbackModalOpen(true);
                              return;
                            }

                            setSelectedEmployee(null);
                            setTime(selectedTime);
                          }}
                          className="border border-gray-300 p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Services
                      </label>
                      <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2 relative">
                        {/* Gradient fade at bottom to indicate scrollable content */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>

                        {serviceOptions.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleServiceChange(service.name)}
                            className={`px-4 py-3 w-full text-left rounded-lg transition-all ${
                              services.includes(service.name)
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {services.includes(service.name) && (
                                  <Check className="w-4 h-4" />
                                )}
                                <span>{service.name}</span>
                              </div>
                              <span className="font-medium">
                                Rp
                                {Number(service.price).toLocaleString("id-ID")}
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
                      <div className="bg-gray-50 p-3 rounded-lg">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Employee
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {employeeList.map((employee) => {
                            const isAvailable = !existingBookings.some(
                              (booking) =>
                                booking.employeeName === employee &&
                                ((time >= booking.time &&
                                  time < booking.endTime) ||
                                  (endTime > booking.time &&
                                    endTime <= booking.endTime) ||
                                  (time <= booking.time &&
                                    endTime >= booking.endTime))
                            );

                            return (
                              <button
                                key={employee}
                                onClick={() =>
                                  isAvailable && setSelectedEmployee(employee)
                                }
                                disabled={!isAvailable}
                                className={`p-2 rounded-lg border text-center transition-all
                    ${
                      selectedEmployee === employee
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
                </div>

                {/* Fixed Footer */}
                <div className="sticky bottom-0 bg-white p-4 border-t mt-auto flex justify-between">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      resetForm();
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveBooking}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsFeedbackModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 flex justify-center items-center z-50 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm relative">
                <div className="text-center">
                  <div
                    className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full mb-4 ${
                      feedbackModalType === "success"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {feedbackModalType === "success" ? (
                      <Check className={`w-8 h-8 text-green-600`} />
                    ) : (
                      <X className={`w-8 h-8 text-red-600`} />
                    )}
                  </div>

                  <h3
                    className={`text-xl font-bold mb-2 ${
                      feedbackModalType === "success"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {feedbackModalTitle}
                  </h3>

                  <p className="text-gray-600 mb-6">
                    {feedbackModalDescription}
                  </p>

                  <button
                    onClick={() => {
                      setIsFeedbackModalOpen(false);
                      if (feedbackModalType === "success") {
                        resetForm();
                      }
                    }}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      feedbackModalType === "success"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {feedbackModalType === "success" ? "Great!" : "Coba Lagi"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerBookingButton;
