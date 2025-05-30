import { useState, useEffect, useCallback } from "react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"
import { auth, db } from "../../firebase"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import Sidebar from "./Sidebar"
import Header from "./Header"

const DashboardLayout = () => {
  const [userData, setUserData] = useState({
    loggedName: "",
    role: "",
  })
  const [userId, setUserId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get the current page title based on the path
  const getPageTitle = () => {
    const path = location.pathname
    if (path === "/admin-dashboard") return "Dashboard"
    if (path === "/admin-dashboard/bookings") return "Bookings"
    if (path === "/admin-dashboard/manage-customers") return "Manage Customers"
    if (path === "/admin-dashboard/add-customer") return "Add Customer"
    if (path === "/admin-dashboard/manage-services") return "Manage Services"
    if (path === "/admin-dashboard/manage-employee") return "Manage Employee"
    return "Dashboard"
  }

  // Memoize the sidebar toggle function
  const toggleSidebar = useCallback((value) => {
    setIsSidebarOpen(value !== undefined ? value : (prev) => !prev)
  }, [])

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
      } else {
        console.log("User not logged in")
        navigate("/login")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  // Fetch user data only once when userId changes
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, "users", userId)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            setUserData({
              loggedName: data.fullName || "",
              role: data.role || "",
            })
          } else {
            console.log("User not found!")
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      }

      fetchUserData()
    }
  }, [userId])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={toggleSidebar}
        loggedName={userData.loggedName}
        role={userData.role}
      />

      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={toggleSidebar}
          loggedName={userData.loggedName}
          pageTitle={getPageTitle()}
        />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
