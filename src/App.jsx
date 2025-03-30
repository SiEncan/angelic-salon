import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import HeroSection from "./components/HeroSection";
import BookingList from "./components/BookingList";
import Carousel from "./components/Carousel";
import Login from "./components/Login"; // Halaman login admin
import AdminDashboard from "./components/Dashboard/AdminDashboard"; // Halaman dashboard admin
import Bookings from "./components/Dashboard/Bookings"; // Halaman dashboard admin
import ManageCustomers from "./components/Dashboard/ManageCustomers"; // Halaman dashboard admin
import ManageServices from "./components/Dashboard/ManageServices"; // Halaman dashboard admin
import AddCustomer from "./components/Dashboard/AddCustomer"; // Halaman dashboard admin
import ProtectedRoute from './ProtectedRoute'; // Import komponen yang sudah dibuat

function App() {
  return (
    <Router>
      <Routes>
        {/* Halaman utama */}
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Carousel />
              <BookingList />
            </>
          }
        />
        
        <Route path="/login" element={<Login />} />

        {/* Halaman dashboard admin */}
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} />} />
        <Route path="/admin-dashboard/manage-customers" element={<ProtectedRoute element={<ManageCustomers />} />}  />
        <Route path="/admin-dashboard/add-customer" element={<ProtectedRoute element={<AddCustomer />} />}  />
        <Route path="/admin-dashboard/bookings" element={<ProtectedRoute element={<Bookings />} />}  />
        <Route path="/admin-dashboard/manage-services" element={<ProtectedRoute element={<ManageServices />} />}  />
      </Routes>
    </Router>
  );
}

export default App;