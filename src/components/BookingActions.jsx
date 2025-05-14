import { useState, useRef, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  X,
  ChevronRight,
  Eye,
  Trash2,
  Scissors
} from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";

const BookingActions = ({
  booking,
  handleStatusChange,
  handleViewDetails,
  handleDeleteBooking,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showStatusOptions, setShowStatusOptions] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    type: "",
    status: "",
    message: "",
  });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending Approval",
      icon: <Clock className="w-4 h-4" />,
      color: "text-yellow-500",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "text-green-500",
    },
    {
      value: "rejected",
      label: "Rejected",
      icon: <XCircle className="w-4 h-4" />,
      color: "text-red-500",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: <X className="w-4 h-4" />,
      color: "text-gray-500",
    },
    {
      value: "completed",
      label: "Completed",
      icon: <CheckCircle className="w-4 h-4" />,
      color: "text-blue-500",
    },
    {
      value: "inprogress",
      label: "In Progress",
      icon: <Scissors className="w-4 h-4" />,
      color: "text-purple-500",
    },
  ];

  const isFinalState =
    booking.status?.toLowerCase() === "completed" ||
    booking.status?.toLowerCase() === "cancelled";

  const handleConfirm = () => {
    if (confirmAction.type === "status") {
      handleStatusChange(booking.id, confirmAction.status);
    } else if (confirmAction.type === "delete") {
      handleDeleteBooking(booking.id);
    }
    setShowConfirmDialog(false);
    setIsOpen(false);
  };

  const confirmStatusChange = (status) => {
    setConfirmAction({
      type: "status",
      status: status,
      message: `Are you sure you want to change the status to "${
        statusOptions.find((opt) => opt.value === status)?.label
      }"?`,
    });
    setShowConfirmDialog(true);
  };

  const confirmDelete = () => {
    setConfirmAction({
      type: "delete",
      message:
        "Are you sure you want to delete this booking? This action cannot be undone.",
    });
    setShowConfirmDialog(true);
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      const dropdownHeight = showStatusOptions ? 400 : 200; // estimation

      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom;

      const showAbove = spaceBelow < dropdownHeight;

      const topPosition = showAbove
        ? showStatusOptions
          ? rect.top + scrollY - dropdownHeight + 50
          : booking.status?.toLowerCase() === "pending" || booking.status?.toLowerCase() === "inProgress" || booking.status?.toLowerCase() === "confirmed"
          ? rect.top + scrollY - dropdownHeight + 70
          : rect.top + scrollY - dropdownHeight + 100
        : rect.bottom + scrollY + 4;

      const leftPosition = rect.right + scrollX - 192;

      setDropdownPosition({
        top: Math.max(8, topPosition),
        left: leftPosition,
      });
    }
  }, [isOpen, showStatusOptions]);

  return (
    <div ref={buttonRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Booking actions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[200]"
            onClick={() => {
              setIsOpen(false);
              setShowStatusOptions(false);
            }}
          />

          <div
            className="fixed z-[201] w-48 max-w-[90vw] bg-white rounded-md shadow-lg py-1 border border-gray-200"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            <button
              onClick={() => {
                handleViewDetails(booking.id);
                setIsOpen(false);
              }}
              className="w-full text-left text-xs md:text-sm px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>

            {!isFinalState && (
              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={() => setShowStatusOptions(!showStatusOptions)}
                  className="w-full text-left px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Change Status
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      showStatusOptions ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showStatusOptions && (
                  <div className="pl-4 pr-2 py-1 bg-gray-50">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          if (
                            booking.status?.toLowerCase() !== option.value
                          ) {
                            confirmStatusChange(option.value);
                          }
                        }}
                        className={`w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-gray-100 flex items-center gap-2 rounded ${
                          option.color
                        } ${
                          booking.status?.toLowerCase() === option.value
                            ? "bg-gray-100"
                            : ""
                        }`}
                        disabled={
                          booking.status?.toLowerCase() === option.value
                        }
                      >
                        {option.icon}
                        {option.label}
                        {booking.status?.toLowerCase() === option.value && (
                          <span className="ml-auto">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-1 mt-1">
              <button
                onClick={confirmDelete}
                className="w-full text-left px-4 py-2 text-xs md:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
            </div>
          </div>
        </>
      )}

      {showConfirmDialog && (
        <ConfirmationDialog
          message={confirmAction.message}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </div>
  );
};

export default BookingActions;
