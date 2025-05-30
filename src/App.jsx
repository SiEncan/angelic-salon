import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Carousel from "./components/Carousel"
import Login from "./pages/Login"
import MainDashboard from "./pages/admin-dashboard/MainDashboard"
import Bookings from "./pages/admin-dashboard/Bookings"
import ManageCustomers from "./pages/admin-dashboard/ManageCustomers"
import ManageServices from "./pages/admin-dashboard/ManageServices"
import AddCustomer from "./pages/admin-dashboard/AddCustomer"
import ProtectedRoute from './ProtectedRoute'
import ManageEmployee from "./pages/admin-dashboard/ManageEmployee"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import DashboardLayout from "./components/layout/DashboardLayout"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin dashboard with nested routes */}
        <Route 
          path="/admin-dashboard" 
          element={<ProtectedRoute element={<DashboardLayout />} allowedRoles={['admin', 'owner']} />}
          >
          <Route index element={<MainDashboard />} />
          <Route path="bookings" element={<ProtectedRoute element={<Bookings />} allowedRoles={['admin', 'owner']} nestedRoute />} />
          <Route path="manage-customers" element={<ProtectedRoute element={<ManageCustomers />} allowedRoles={['admin', 'owner']} nestedRoute />} />
          <Route path="add-customer" element={<ProtectedRoute element={<AddCustomer />} allowedRoles={['admin', 'owner']} nestedRoute />} />
          <Route path="manage-services" element={<ProtectedRoute element={<ManageServices />} allowedRoles={['owner']} nestedRoute />} />
          <Route path="manage-employee" element={<ProtectedRoute element={<ManageEmployee />} allowedRoles={['owner']} nestedRoute />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
