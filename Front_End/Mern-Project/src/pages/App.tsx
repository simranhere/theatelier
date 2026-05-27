import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Signup from "./Signup";

import CustomerDashboard from "./CustomerDashboard";
import CustomerProfile from "./CustomerProfile";
import FindTailor from "./FindTailor";
import ReviewTailor from "./ReviewTailor";

import TailorDashboard from "./TailorDashboard";
import TailorProfile from "./TailorProfile";

import ProtectedRoute from "./ProtectedRoute";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default → Signup */}
       <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ── CUSTOMER ROUTES ── */}
        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute role="Customer">
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-profile"
          element={
            <ProtectedRoute role="Customer">
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-tailor"
          element={
            <ProtectedRoute role="Customer">
              <FindTailor />
            </ProtectedRoute>
          }
        />
        {/*  Navbar links to "/reviews" */}
        <Route
          path="/reviews"
          element={
            <ProtectedRoute role="Customer">
              <ReviewTailor />
            </ProtectedRoute>
          }
        />

        {/* ── TAILOR ROUTES ── */}
        <Route
          path="/tailor-dashboard"
          element={
            <ProtectedRoute role="Tailor">
              <TailorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tailor-profile"
          element={
            <ProtectedRoute role="Tailor">
              <TailorProfile />
            </ProtectedRoute>
          }
        />

      {/* catch-all */}
<Route path="*" element={<Navigate to="/signup" replace />} />

      </Routes>
    </BrowserRouter>
  );
}