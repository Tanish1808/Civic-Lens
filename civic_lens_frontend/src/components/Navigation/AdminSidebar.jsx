/**
 * ==============================================================================
 * CIVIC LENS — ADMIN NAVIGATION SIDEBAR
 * ==============================================================================
 * DESIGN SYSTEM ALIGNMENT:
 * - Base surface: Deep municipal 'ink' (#10263A) with 'ink-line' border (#D8D2C2)
 * - Brand emblem: Official Civic Lens Camera icon with Signal Amber 'accent' (#E8A33D)
 * - Active State: Left amber border accent, subtle paper-highlight background
 * - User Profile Capsule: Interactive dropdown popover with "View Profile", "Security Keys", and "Exit Session".
 * - Confirmation Modal: High-security modal portal on session exit.
 * ==============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, LayoutDashboard, ListChecks, FileClock, 
  ShieldAlert, LogOut, User, Mail, Map, Camera, LockKeyhole,
  ChevronUp, ChevronDown, ShieldCheck, KeyRound, ExternalLink,
  CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const dropdownRef = useRef(null);

  const confirmSignOut = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    setShowSignOutModal(false);
    navigate('/admin/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeStyle = ({ isActive }) =>
    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-button text-xs font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-accent/15 text-accent font-bold shadow-sm border-l-4 border-accent pl-2.5'
        : 'text-paper/70 hover:text-paper hover:bg-ink-muted/50 border-l-4 border-transparent'
    }`;

  const userName = sessionStorage.getItem('userName') || 'Admin Staff';
  const userEmail = sessionStorage.getItem('userEmail') || 'admin@civiclens.gov';

  return (
    <>
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

          {/* User profile capsule with Interactive Popover Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`w-full flex items-center justify-between gap-2.5 p-3 rounded-card transition-all duration-200 cursor-pointer border text-left ${
                profileDropdownOpen
                  ? 'bg-accent/15 border-accent shadow-lg shadow-accent/15 ring-1 ring-accent/30'
                  : 'bg-ink-muted/30 border-ink-line/25 hover:border-accent/40 hover:bg-ink-muted/50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center border border-accent/40 flex-shrink-0 shadow-inner">
                  <User className="w-4 h-4 text-accent stroke-[1.75]" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="text-sm font-bold text-paper tracking-tight truncate leading-tight">{userName}</h4>
                  <p className="font-mono text-[11px] text-sky-300/80 truncate tracking-tight">{userEmail}</p>
                </div>
              </div>
              
              <div className="text-paper/40 hover:text-accent transition-colors flex-shrink-0">
                {profileDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-accent" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {/* Floating Profile Dropdown Popover */}
            {profileDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0E1B29] border border-ink-line/30 rounded-card shadow-2xl z-50 p-2 space-y-1 animate-fade-in text-xs font-sans backdrop-blur-xl">
                
                {/* Profile Header pill */}
                <div className="px-3 py-2 border-b border-ink-line/15 font-mono text-[10px] text-paper/50 flex items-center justify-between">
                  <span>OFFICER CLEARANCE</span>
                  <span className="text-accent font-bold px-1.5 py-0.2 rounded bg-accent/10 border border-accent/25">LVL 4</span>
                </div>

                {/* Option 1: View Profile */}
                <Link
                  to="/admin/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-paper hover:text-accent hover:bg-ink-muted/80 transition-all font-semibold"
                >
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>View Officer Profile</span>
                </Link>

                {/* Option 2: Audit Activity */}
                <Link
                  to="/admin/audit-log"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-paper/80 hover:text-paper hover:bg-ink-muted/80 transition-all font-semibold"
                >
                  <FileClock className="w-3.5 h-3.5 text-paper/50" />
                  <span>My Audit Activity</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-ink-line/15 my-1" />

                {/* Option 3: Exit Session (Triggers Confirmation Modal) */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-severity-high hover:bg-severity-high/15 transition-all font-bold text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>

              </div>
            )}
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
            onClick={() => setShowSignOutModal(true)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-button text-xs font-bold text-severity-high/90 hover:text-severity-high bg-severity-high/10 hover:bg-severity-high/20 border border-severity-high/20 transition-all duration-200 w-full text-left cursor-pointer active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit Session</span>
          </button>
        </div>

      </aside>

      {/* ── HIGH-SECURITY CONFIRMATION MODAL (PORTAL) ── */}
      {showSignOutModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowSignOutModal(false)}
        >
          <div 
            className="relative bg-[#0E1B29] border border-ink-line/30 rounded-card shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-5 text-left mx-auto transform transition-all animate-in zoom-in-95 duration-200 text-paper"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Reticle Accents */}
            <div className="absolute top-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┌</div>
            <div className="absolute top-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┐</div>
            <div className="absolute bottom-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">└</div>
            <div className="absolute bottom-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┘</div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-card bg-severity-high/15 text-severity-high border border-severity-high/30 flex items-center justify-center flex-shrink-0 shadow-inner">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">
                  // SECURITY CONFIRMATION
                </span>
                <h3 className="font-display text-lg font-bold text-paper leading-tight">
                  Exit Administrative Session?
                </h3>
              </div>
            </div>

            <p className="text-xs text-paper/70 font-sans leading-relaxed">
              Are you sure you want to end your current session? You will need to re-authenticate with your administrator credentials to access municipal triage dockets.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-line/15 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 bg-ink-muted/80 hover:bg-ink-muted text-paper border border-ink-line/30 rounded-button font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="px-5 py-2 bg-severity-high hover:bg-red-700 text-white font-bold tracking-wider rounded-button transition-colors cursor-pointer border-0 shadow-md active:scale-95"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
