import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import HeroSection from "./components/HeroSection";
import Carousel from "./components/Carousel";
import Login from "./components/Login";
import MainDashboard from "./components/Dashboard/MainDashboard";
import Bookings from "./components/Dashboard/Bookings";
import ManageCustomers from "./components/Dashboard/ManageCustomers";
import ManageServices from "./components/Dashboard/ManageServices";
import AddCustomer from "./components/Dashboard/AddCustomer";
import ProtectedRoute from './ProtectedRoute';
import ManageEmployee from "./components/Dashboard/ManageEmployee";
import HomePage from "./pages/HomePage";

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
              {/* <HeroSection />
              <Carousel />
              <BookingList /> */}
            </>
          }
        />
        
        <Route path="/login" element={<Login />} />

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