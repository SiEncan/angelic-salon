import { Link, useLocation } from "react-router-dom"
import { auth } from "../../firebase"
import { useNavigate } from "react-router-dom"
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ScissorsIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline"
import angelicLogo from "../../assets/images/AngelicSalon.jpg"
import { X } from "lucide-react"

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, loggedName, role }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const navigationItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/admin-dashboard" },
    { icon: ClipboardDocumentListIcon, label: "Bookings", path: "/admin-dashboard/bookings" },
    { icon: UsersIcon, label: "Manage Customers", path: "/admin-dashboard/manage-customers" },
    { icon: ScissorsIcon, label: "Manage Services", path: "/admin-dashboard/manage-services" },
    { icon: BriefcaseIcon, label: "Manage Employee", path: "/admin-dashboard/manage-employee" },
  ]

  return (
    <div
      className={`bg-gradient-to-b from-purple-600 to-pink-500 text-white w-64 fixed inset-y-0 left-0 top-0 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-200 ease-in-out z-20`}
    >
      <div className="flex items-center justify-center h-20 border-b border-purple-400 bg-purple-700">
        <img src={angelicLogo || "/placeholder.svg"} alt="Logo" className="h-10 w-10 rounded-full object-cover mr-2" />
        <h1 className="text-lg font-bold text-white">Angelic Salon & Spa</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems
          .filter((item) => (role !== "owner" ? item.path !== "/admin-dashboard/manage-services" && item.path !== "/admin-dashboard/manage-employee" : true))
          .map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm transition duration-150 font-medium text-white rounded-md no-underline 
                ${location.pathname === item.path ? "bg-pink-100 bg-opacity-20" : "hover:bg-white hover:bg-opacity-10"}`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
      </nav>

      <div className="p-4 border-t border-purple-400 lg:hidden">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-pink-100 bg-opacity-30 flex items-center justify-center text-white font-bold">
            {loggedName?.charAt(0) || "A"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{loggedName}</p>
            <button
              onClick={() => {
                auth.signOut()
                navigate("/login")
              }}
              className="text-xs text-purple-200 hover:text-white flex items-center gap-1"
              >
              <span className="text-xs font-medium bg-pink-300 bg-opacity-30 rounded-full py-1 px-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
      <div className="pt-4 px-4 border-t border-purple-400 hidden lg:flex">
        <button
          onClick={() => {
            auth.signOut()
            navigate("/login")
          }}
          className="text-xs w-full text-purple-200 hover:text-white flex justify-center items-center gap-1"
          >
          <span className="text-sm font-medium bg-purple-600 bg-opacity-80 hover:bg-opacity-100 hover:bg-purple-700 transition shadow-sm rounded-full w-full py-2.5">Logout</span>
        </button>
      </div>
      
      {isSidebarOpen && (
      <button onClick={() => setIsSidebarOpen(false)} className="absolute top-7 right-[-2.5rem] bg-purple-500 p-1 rounded-full text-white lg:hidden">
        <X className="h-6 w-6" />
      </button>
      )}
    </div>
  )
}

export default Sidebar