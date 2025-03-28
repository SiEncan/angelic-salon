import React, { useEffect, useState } from "react";
import { db } from "../../firebase"; // Ganti dengan path yang benar
import { collection, getDocs } from "firebase/firestore";

const employeesList = ["Yuli", "Lusi", "Via"];

const EmployeeSelection = ({ date, services, time, endTime, selectedEmployee, setSelectedEmployee }) => {
  const [existingBookings, setExistingBookings] = useState([]);

  useEffect(() => {
    // Fungsi untuk mengambil data dari Firestore
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookings = querySnapshot.docs.map(doc => doc.data());
        setExistingBookings(bookings);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
      }
    };

    fetchBookings();
  }, []); // Efek berjalan sekali saat komponen pertama kali dimuat

  if (!date || !time || services.length === 0) return null;

  const availableEmployees = employeesList.filter((employee) => {
    return !existingBookings.some((booking) =>
      booking.employeeName === employee &&
      booking.date === date &&
      (
        (time >= booking.time && time < booking.endTime) ||  // Waktu mulai bentrok
        (endTime > booking.time && endTime <= booking.endTime) ||  // Waktu selesai bentrok
        (time <= booking.time && endTime >= booking.endTime) // Booking baru mencakup booking lama
      )
    );
  });

  return (
    <div className="mt-2">
      <h3 className="text-xl font-semibold">Select Employee:</h3>
      <div className="flex flex-wrap gap-2 mt-1">
        {employeesList.map((employee) => (
          <button
            key={employee}
            onClick={() => setSelectedEmployee(employee)}
            className={`px-3 py-1 border rounded ${
              selectedEmployee === employee
                ? "bg-blue-500 text-white"
                : availableEmployees.includes(employee)
                ? "bg-gray-200"
                : "bg-pink-400 text-white cursor-not-allowed"
            }`}
            disabled={!availableEmployees.includes(employee)}
          >
            {employee} {!availableEmployees.includes(employee) && "(Not Available)"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelection;
