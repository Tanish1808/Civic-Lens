import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from '../components/Navigation/AdminSidebar';
import AdminLogin from '../features/auth/pages/AdminLogin';
import AdminOverview from '../features/admin/pages/AdminOverview';
import AdminTickets from '../features/admin/pages/AdminTickets';
import AdminAnalytics from '../features/admin/pages/AdminAnalytics';
import ManualReviewQueue from '../features/admin/pages/ManualReviewQueue';
import AdminAuditLog from '../features/admin/pages/AdminAuditLog';
import AdminRequests from '../features/admin/pages/AdminRequests';

// Layout for Admin views
function AdminLayout() {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const role = sessionStorage.getItem('userRole');

  if (!isLoggedIn || role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

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
      {/* Root redirects to admin overview */}
      <Route path="/" element={<Navigate to="/admin/overview" replace />} />

      {/* Standalone Admin Login route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin routes */}
      <Route element={<AdminLayout />}>
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/tickets" element={<AdminTickets />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/review-queue" element={<ManualReviewQueue />} />
        <Route path="/admin/audit-log" element={<AdminAuditLog />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/admin/overview" replace />} />
    </Routes>
  );
}
