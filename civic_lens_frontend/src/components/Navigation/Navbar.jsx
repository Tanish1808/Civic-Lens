import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Camera, Map, FileText, LogIn, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  // Placeholder login state - will be connected to AuthContext later
  const isLoggedIn = true; 
  const userRole = 'citizen'; // 'citizen' | 'admin'

  const activeStyle = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-button text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white'
        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <span className="bg-primary text-white p-1.5 rounded-card">CL</span>
              <span>Civic Lens</span>
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-4">
              <NavLink to="/dashboard" className={activeStyle}>
                <Map className="w-4 h-4" />
                <span>Map Dashboard</span>
              </NavLink>
              <NavLink to="/report" className={activeStyle}>
                <Camera className="w-4 h-4" />
                <span>Report Issue</span>
              </NavLink>
              {isLoggedIn && (
                <NavLink to="/my-reports" className={activeStyle}>
                  <FileText className="w-4 h-4" />
                  <span>My Reports</span>
                </NavLink>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Admin Link if role permits */}
            {isLoggedIn && userRole === 'admin' && (
              <Link
                to="/admin/overview"
                className="flex items-center gap-1.5 px-3 py-2 rounded-button text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}

            {/* Auth Button */}
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button text-text-secondary hover:text-text-primary hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
