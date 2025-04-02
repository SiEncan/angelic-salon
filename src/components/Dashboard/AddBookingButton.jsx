import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { collection, getDocs, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase";
import dayjs from "dayjs";

import FeedbackModal from "../FeedBackModal";
import EmployeeSelection from "./EmployeeSelection";

const AddBookingButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");  // "success" or "failed"
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  const [nameInput, setNameInput] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [services, setServices] = useState([]);

  const [totalPrice, setTotalPrice] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [serviceOptions, setServiceOptions] = useState([]);

  const [existingBookings, setExistingBookings] = useState([]);

  const handleDateChange = (e) => {
    const selectedDate = dayjs(e.target.value).format("YYYY-MM-DD");
    setDate(selectedDate);
    setSelectedEmployee(null);
    fetchBookings(selectedDate);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "services"));
        const servicesData = querySnapshot.docs.map((doc) => ({
          id: doc.id, // Simpan ID dari Firestore
          ...doc.data(), // Ambil semua field dari Firestore
        }));

        setServiceOptions(servicesData);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchServices();
  }, []);

  const fetchBookings = async (date) => {
    console.log('fetch!')
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "bookings"), where("date", "==", date))
      );
      const bookings = querySnapshot.docs.map((doc) => doc.data());
      console.log(bookings)
      setExistingBookings(bookings);
    } catch (error) {
      console.error("Error fetching bookings: ", error);
    }
  };

  const handleSaveBooking = async () => {
    if ( !date || !time || services.length === 0 || !selectedEmployee) {
      setFeedbackModalType("failed");
      setFeedbackModalTitle("All fields are required");
      setFeedbackModalDescription("Oops! It looks like you missed some required fields.");      
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
        employeeName: selectedEmployee,
        status: "Booked", // Status awal
        createdAt: Timestamp.now(), // Waktu pembuatan booking
      };
  
      // Simpan ke Firestore
      await addDoc(collection(db, "bookings"), bookingData);

      setFeedbackModalType("success");
      setFeedbackModalTitle("Booking successfully saved!");
      setFeedbackModalDescription("The appointment is now scheduled for the customer.");      
      setIsFeedbackModalOpen(true);
  
      setIsOpen(false); // Tutup modal setelah berhasil
    } catch (error) {
      console.error("Error saving booking:", error);
      setFeedbackModalType("failed");
      setFeedbackModalTitle("Failed to save booking.");
      setFeedbackModalDescription("Oops! Something went wrong while saving the booking. Please try again later.");      
      setIsFeedbackModalOpen(true);
    }
  };  

  const handleSearchCustomer = async () => {
    if (nameInput.trim() === "") {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true); // Menandai bahwa pencarian sedang dilakukan

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
    setIsSearching(false); // Reset pencarian setelah user dipilih
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
  }, [time, services, serviceOptions]); // Akan dijalankan setiap kali `time` atau `services` berubah  

  const handleServiceChange = (service) => {
    setSelectedEmployee(null);
    setServices((prev) => {
      const updatedServices = prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service];
  
      // Hitung total price
      const totalPrice = updatedServices.reduce((sum, s) => {
        const serviceObj = serviceOptions.find((opt) => opt.name === s);
        return sum + (serviceObj ? serviceObj.price : 0);
      }, 0);
      
      setTotalPrice(totalPrice);
  
      return updatedServices;
    });
  };  
  

  return (
    <>
      {/* Button untuk membuka modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-500 hover:bg-purple-600 active:bg-purple-700 transition text-white px-4 py-2 rounded"
      >
        + Add Booking
      </button>

      {/* Modal Floating */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay dengan animasi yang lebih smooth */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-50"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-0 flex justify-center items-center"
              >
                <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
                  <h2 className="text-xl font-bold mb-4">Add Booking</h2>

                  {/* Input Nama dengan Auto-Suggest */}
                  <div className="relative w-full">
                    <input
                    type="text"
                    placeholder="Type name..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                        handleSearchCustomer(); // Jalankan pencarian saat Enter ditekan
                        }
                    }}
                    className="p-2 w-full pr-12 border rounded shadow-sm outline-none"
                    />
                    <button
                    onClick={handleSearchCustomer}
                    
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                    >
                    <MagnifyingGlassIcon className="h-6 w-4" />
                    </button>

                    {/* Floating Daftar Sugesti */}
                    {suggestions.length > 0 ? (
                        <ul className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded max-h-40 overflow-auto z-50 p-0">
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
                        isSearching && suggestions.length === 0 && (
                          <div className="absolute left-0 top-full mt-1 w-full bg-white border shadow-lg rounded p-2 text-gray-500">
                          No Results...
                          </div>
                        )
                    )}
                  </div>

                  {/* Input Nomor HP */}
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border p-2 w-full mt-2 rounded shadow-sm"
                  />

                  {/* Input Date */}
                  <input
                    type="date"
                    value={date}
                    onChange={handleDateChange}
                    className="border p-2 w-full mt-2 rounded shadow-sm"
                  />

                  {/* Input Time */}
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setSelectedEmployee(null);
                      setTime(e.target.value)} // Tambahkan handler untuk time
                    } 
                    className="border p-2 w-full mt-2 rounded shadow-sm"
                  />

                  {/* Pilihan Services */}
                  
                  <div className="mt-2">
                  <h3 className="text-xl font-semibold">Services:</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {serviceOptions.map((service) => (
                    <button
                        key={service.name}
                        onClick={() => handleServiceChange(service.name)}
                        className={`px-3 w-full text-left py-1 border rounded ${
                        services.includes(service.name) ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                        style={{height: '40px' }}
                    >
                      <div className="flex justify-between items-center">
                        <span>{service.name}</span>
                        <span>Rp{Number(service.price).toLocaleString('id-ID')}</span>
                      </div>
                    </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <h3 className="text-lg font-semibold mb-0">Total Price:</h3>
                  <p className="text-md font-semibold text-grey-200">
                    Rp{Number(totalPrice).toLocaleString('id-ID')}
                  </p>
                </div>

                {/* Employee Selection */}
                {date && time && services.length > 0 && (
                <EmployeeSelection 
                    date={date} 
                    services={services} 
                    time={time} 
                    existingBookings={existingBookings}
                    endTime={endTime} 
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                />
                )}

                {/* Tombol Simpan */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false); 
                      setNameInput("");
                      setPhone("");
                      setDate("");
                      setTime("");
                      setEndTime("");
                      setServices([]);
                      setSelectedUser(null);
                      setSelectedEmployee(null);
                      setTotalPrice(0);
                      }
                    }
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveBooking} 
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Save Booking
                  </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <FeedbackModal 
        type={feedbackModalType} 
        title={feedbackModalTitle} 
        description={feedbackModalDescription} 
        isOpen={isFeedbackModalOpen} 
        setIsOpen={() => {
          setIsFeedbackModalOpen(false);
          if (feedbackModalType == 'success') {
            setNameInput("");
            setPhone("");
            setDate("");
            setTime("");
            setEndTime("");
            setServices([]);
            setSelectedUser(null);
            setSelectedEmployee(null);
            setTotalPrice(0);
          }
        }} 
      />
    </>
  );
};

export default AddBookingButton;