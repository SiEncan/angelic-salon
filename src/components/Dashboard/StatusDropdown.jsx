import { useState } from "react";

const statusOptions = [
  { value: "Booked", label: "Booked", bg: "bg-blue-500", text: "text-blue-500", hover: "hover:bg-blue-500 hover:text-white" },
  { value: "In Progress", label: "In Progress", bg: "bg-yellow-500", text: "text-yellow-500", hover: "hover:bg-yellow-500 hover:text-white" },
  { value: "Completed", label: "Completed", bg: "bg-green-500", text: "text-green-500", hover: "hover:bg-green-500 hover:text-white" },
  { value: "Cancelled", label: "Cancelled", bg: "bg-red-500", text: "text-red-500", hover: "hover:bg-red-500 hover:text-white" },
];

const StatusDropdown = ({ booking, editedBookings, handleStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStatus =
    statusOptions.find(
      (option) => option.value === (editedBookings[booking.id] || booking.status)
    ) || statusOptions[0];

  return (
    <div className="relative">
      {/* Button utama tetap berwarna sesuai status */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-32 flex justify-between items-center px-2 py-2 text-white ${currentStatus.bg} rounded-lg shadow`}
      >
        {currentStatus.label} <span>▼</span>
      </button>

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 top-[110%] w-full bg-white border shadow-lg rounded-md z-50">
          {statusOptions.map((option, index) => (
            <div
              key={option.value}
              onClick={() => {
                handleStatusChange(booking.id, option.value);
                setIsOpen(false);
              }}
              className={`pr-2 pl-2 py-2 cursor-pointer flex justify-between border ${option.text} ${option.hover} transition ${
                index === 0 ? "rounded-t-md" : ""
              } ${index === statusOptions.length - 1 ? "rounded-b-md" : ""}`}
            >
              {option.label}
              {option.value === booking.status && " ✔"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
