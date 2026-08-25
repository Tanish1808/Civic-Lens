/**
 * ==============================================================================
 * CIVIC LENS — ADMIN NAVIGATION SIDEBAR
 * ==============================================================================
 * DESIGN SYSTEM ALIGNMENT:
 * - Base surface: Deep municipal 'ink' (#10263A) with 'ink-line' border (#D8D2C2)
 * - Brand emblem: Official Civic Lens Camera icon with Signal Amber 'accent' (#E8A33D)
 * - Active State: Left amber border accent, subtle paper-highlight background
 * - Typography: Space Grotesk for brand, JetBrains Mono for clearance badges, Inter for nav items
 * ==============================================================================
 */

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BarChart3, LayoutDashboard, ListChecks, FileClock, 
  ShieldAlert, LogOut, User, Mail, Map, Camera, LockKeyhole
} from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/admin/login');
  };

  const activeStyle = ({ isActive }) =>
    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-accent/15 text-accent font-bold shadow-sm border-l-4 border-accent pl-2.5'
        : 'text-paper/70 hover:text-paper hover:bg-ink-muted/50 border-l-4 border-transparent'
    }`;

  const userName = sessionStorage.getItem('userName') || 'Anand Kumar';
  const userEmail = sessionStorage.getItem('userEmail') || 'admin@civiclens.gov';

  return (
    <aside className="w-64 bg-ink border-r border-ink-line/15 p-5 flex flex-col justify-between h-screen flex-shrink-0 text-paper select-none font-sans relative z-30">
      
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="bg-accent text-ink p-2 rounded-card shadow-sm flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <div className="font-display text-base font-bold tracking-tight text-paper leading-tight">
              Civic<span className="text-accent font-normal">Lens</span>
            </div>
            <div className="inline-flex items-center gap-1 font-mono text-[9px] font-bold text-accent uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span>ZONE ADMIN // AMC</span>
            </div>
          </div>
        </div>

        {/* User profile capsule */}
        <div className="flex items-center gap-3 bg-ink-muted/40 border border-ink-line/20 p-3 rounded-card">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center border border-accent/30 flex-shrink-0">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-xs font-bold text-paper truncate">{userName}</h4>
            <p className="font-mono text-[10px] text-paper/50 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1">
          <NavLink to="/admin/overview" className={activeStyle}>
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Dashboard Overview</span>
          </NavLink>
          
          <NavLink to="/admin/map" className={activeStyle}>
            <Map className="w-4 h-4 flex-shrink-0" />
            <span>Geospatial Map</span>
          </NavLink>
          
          <NavLink to="/admin/tickets" className={activeStyle}>
            <ListChecks className="w-4 h-4 flex-shrink-0" />
            <span>Manage Tickets</span>
          </NavLink>

          <NavLink to="/admin/analytics" className={activeStyle}>
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>Analytics Charts</span>
          </NavLink>

          <NavLink to="/admin/review-queue" className={activeStyle}>
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>Review Queue</span>
          </NavLink>

          <NavLink to="/admin/audit-log" className={activeStyle}>
            <FileClock className="w-4 h-4 flex-shrink-0" />
            <span>Audit Logs</span>
          </NavLink>

          <NavLink to="/admin/requests" className={activeStyle}>
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>Pending Requests</span>
          </NavLink>
        </nav>
      </div>

      {/* Footer Navigation: Logout & Security Status */}
      <div className="pt-4 border-t border-ink-line/15 space-y-3">
        <div className="font-mono text-[9px] text-paper/40 flex items-center justify-between px-1">
          <span>PORT 443 &bull; TLS 1.3</span>
          <span className="text-severity-low font-bold">ONLINE</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-button text-xs font-bold text-severity-high/90 hover:text-severity-high bg-severity-high/10 hover:bg-severity-high/20 border border-severity-high/20 transition-all duration-200 w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>
      </div>

    </aside>
  );
}
