import React from 'react';
import { Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import AdminSidebar from '../components/Navigation/AdminSidebar';

// Citizen Pages
import LandingPage from '../features/dashboard/pages/LandingPage';
import MapDashboard from '../features/dashboard/pages/MapDashboard';
import SubmitReport from '../features/report/pages/SubmitReport';
import TicketDetail from '../features/ticket/pages/TicketDetail';
import MyReports from '../features/ticket/pages/MyReports';
import Login from '../features/auth/pages/Login';
import Signup from '../features/auth/pages/Signup';
import AdminLogin from '../features/auth/pages/AdminLogin';

// Admin Pages
import AdminOverview from '../features/admin/pages/AdminOverview';
import AdminTickets from '../features/admin/pages/AdminTickets';
import AdminAnalytics from '../features/admin/pages/AdminAnalytics';
import ManualReviewQueue from '../features/admin/pages/ManualReviewQueue';
import AdminAuditLog from '../features/admin/pages/AdminAuditLog';

// Route protection wrapper
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login, preserving the location they wanted to access
    return (
      <Navigate 
        to="/login" 
        state={{ from: location, message: 'Please sign in to access that page.' }} 
        replace 
      />
    );
  }

  return children;
}

// Layout for Citizen views
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// Layout for Admin views
function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-white overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public/Citizen routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<MapDashboard />} />
        <Route path="/ticket/:id" element={<TicketDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected citizen routes */}
        <Route path="/report" element={<ProtectedRoute><SubmitReport /></ProtectedRoute>} />
        <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
      </Route>

      {/* Standalone Admin Login route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/review-queue" element={<ManualReviewQueue />} />
        <Route path="/admin/audit-log" element={<AdminAuditLog />} />
      </Route>
    </Routes>
  );
}
