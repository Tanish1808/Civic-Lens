import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Camera, Map, FileText, LogIn, LogOut, Shield, Menu, X, Bell } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Placeholder login state - will be connected to AuthContext later
  const isLoggedIn = true; 
  const userRole = 'admin'; // 'citizen' | 'admin'

  const activeStyle = ({ isActive }) =>
    `relative flex items-center gap-2 px-4 py-2.5 rounded-button text-sm font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? 'bg-primary/10 text-primary shadow-inner shadow-primary/5'
        : 'text-text-secondary hover:text-text-primary hover:bg-gray-100/60'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Brand Logo Container */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center bg-primary text-white w-9 h-9 rounded-card shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Camera className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white animate-pulse"></span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary group-hover:text-primary transition-colors duration-300">
                Civic<span className="text-primary font-normal">Lens</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/dashboard" className={activeStyle}>
                {({ isActive }) => (
                  <>
                    <Map className="w-4 h-4" />
                    <span>Map Dashboard</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
              <NavLink to="/report" className={activeStyle}>
                {({ isActive }) => (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Report Issue</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
              {isLoggedIn && (
                <NavLink to="/my-reports" className={activeStyle}>
                  {({ isActive }) => (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>My Reports</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              )}
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn && (
              <button className="p-2 rounded-full text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {isLoggedIn && userRole === 'admin' && (
              <Link
                to="/admin/overview"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-button text-xs font-bold bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/20 transition-all duration-300"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button text-text-secondary hover:text-text-primary hover:bg-gray-100/60 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button text-text-secondary hover:bg-gray-100 hover:text-text-primary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold hover:bg-gray-100"
          >
            <Map className="w-5 h-5 text-primary" />
            <span>Map Dashboard</span>
          </NavLink>
          <NavLink
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold hover:bg-gray-100"
          >
            <Camera className="w-5 h-5 text-primary" />
            <span>Report Issue</span>
          </NavLink>
          {isLoggedIn && (
            <NavLink
              to="/my-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold hover:bg-gray-100"
            >
              <FileText className="w-5 h-5 text-primary" />
              <span>My Reports</span>
            </NavLink>
          )}
          
          <div className="border-t border-gray-200 my-2 pt-2">
            {isLoggedIn && userRole === 'admin' && (
              <Link
                to="/admin/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 mb-2"
              >
                <Shield className="w-5 h-5" />
                <span>Admin Console</span>
              </Link>
            )}

            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-secondary hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-button text-sm font-bold bg-primary text-white hover:bg-primary/95"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
