import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, LayoutDashboard, ListChecks, FileClock, ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminSidebar() {
  const activeStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold transition-all ${
      isActive
        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col justify-between border-r border-gray-800">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-500 p-2 rounded-card text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-md font-bold tracking-tight">Civic Lens</h2>
            <p className="text-xs text-amber-500 font-semibold">Admin Panel</p>
          </div>
        </div>

        {/* Admin Navigation */}
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin/overview" className={activeStyle}>
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </NavLink>
          
          <NavLink to="/admin/tickets" className={activeStyle}>
            <ListChecks className="w-4 h-4" />
            <span>Manage Tickets</span>
          </NavLink>

          <NavLink to="/admin/analytics" className={activeStyle}>
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Charts</span>
          </NavLink>

          <NavLink to="/admin/review-queue" className={activeStyle}>
            <ShieldAlert className="w-4 h-4" />
            <span>Review Queue</span>
          </NavLink>

          <NavLink to="/admin/audit-log" className={activeStyle}>
            <FileClock className="w-4 h-4" />
            <span>Audit Logs</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer / Back to Citizen site */}
      <div className="p-6 border-t border-gray-800 flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Citizen Portal</span>
        </NavLink>
        
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}
