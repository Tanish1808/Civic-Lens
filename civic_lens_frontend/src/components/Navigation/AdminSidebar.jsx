import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, LayoutDashboard, ListChecks, FileClock, ShieldAlert, LogOut, ArrowLeft, User, Mail } from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin/login');
  };

  const activeStyle = ({ isActive }) =>
    `relative flex items-center gap-3.5 px-4 py-3 rounded-button text-sm font-semibold transition-all duration-300 ${
      isActive
        ? 'bg-amber-500/10 text-amber-500 shadow-md shadow-amber-500/5 border-l-4 border-amber-500 pl-3'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/40 border-l-4 border-transparent'
    }`;

  const userName = sessionStorage.getItem('userName') || 'Anand Kumar';
  const userEmail = sessionStorage.getItem('userEmail') || 'admin@civiclens.gov';

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-gray-850 p-6 flex flex-col justify-between h-screen flex-shrink-0 text-white select-none">
      
      <div className="space-y-6">
        {/* Brand Info */}
        <div className="flex items-center gap-3 px-1">
          <div className="bg-amber-500 text-black w-8 h-8 rounded flex items-center justify-center font-bold">
            CL
          </div>
          <div>
            <h2 className="text-md font-extrabold tracking-tight">Civic Lens</h2>
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Zone Admin</p>
          </div>
        </div>

        {/* User profile capsule */}
        <div className="flex items-center gap-3 bg-gray-800/20 border border-gray-800/30 p-3 rounded-card">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <User className="w-4 h-4 text-amber-500" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold truncate">{userName}</h4>
            <p className="text-[10px] text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1.5">
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

          <NavLink to="/admin/requests" className={activeStyle}>
            <Mail className="w-4 h-4" />
            <span>Pending Requests</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-gray-800/40 flex flex-col gap-2">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3.5 px-4 py-3 rounded-button text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Citizen Portal</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-3 rounded-button text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/10 transition-all duration-300 w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
