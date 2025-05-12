import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import Carousel from "./components/Carousel";
import Login from "./components/Login";
import MainDashboard from "./pages/Dashboard/MainDashboard";
import Bookings from "./pages/Dashboard/Bookings";
import ManageCustomers from "./pages/Dashboard/ManageCustomers";
import ManageServices from "./pages/Dashboard/ManageServices";
import AddCustomer from "./pages/Dashboard/AddCustomer";
import ProtectedRoute from './ProtectedRoute';
import ManageEmployee from "./pages/Dashboard/ManageEmployee";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama */}
        <Route
          path="/"
          element={
            <>
              <HomePage/>
            </>
          }
        />
        
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Halaman dashboard admin */}
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<MainDashboard />} />} />
        <Route path="/admin-dashboard/bookings" element={<ProtectedRoute element={<Bookings />} />}  />
        <Route path="/admin-dashboard/manage-customers" element={<ProtectedRoute element={<ManageCustomers />} />}  />
        <Route path="/admin-dashboard/add-customer" element={<ProtectedRoute element={<AddCustomer />} />}  />
        <Route path="/admin-dashboard/manage-services" element={<ProtectedRoute element={<ManageServices />} />}  />
        <Route path="/admin-dashboard/manage-employee" element={<ProtectedRoute element={<ManageEmployee />} />}  />
      </Routes>
    </Router>
  );
}

export default App;