import { Clock, Calendar } from "lucide-react"

interface BookingTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  activeBookings: any[]
  historyBookings: any[]
}

const BookingTabs = ({ activeTab, setActiveTab, activeBookings, historyBookings }: BookingTabsProps) => {
  return (
    <div className="flex border-b">
      <button
        onClick={() => setActiveTab("active")}
        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${
          activeTab === "active" ? "border-b-2 border-purple-500 text-purple-700" : "text-gray-500 hover:text-gray-700"
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
          activeTab === "history" ? "border-b-2 border-purple-500 text-purple-700" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        <Calendar className="w-4 h-4" />
        Booking History
        {historyBookings.length > 0 && (
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{historyBookings.length}</span>
        )}
      </button>
    </div>
  )
}

export default BookingTabs
