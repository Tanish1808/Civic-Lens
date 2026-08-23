import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Camera, Map, FileText, LogIn, LogOut, Shield, Menu, X, Bell, User, Trophy, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('isLoggedIn') === 'true');
  const [userRole, setUserRole] = useState(sessionStorage.getItem('userRole') || 'citizen');
  const [userName, setUserName] = useState(sessionStorage.getItem('userName') || 'Logged In');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('theme-change'));
  };

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(sessionStorage.getItem('isLoggedIn') === 'true');
      setUserRole(sessionStorage.getItem('userRole') || 'citizen');
      setUserName(sessionStorage.getItem('userName') || 'Logged In');
    };
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleSignOut = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  const activeStyle = ({ isActive }) =>
    `relative flex items-center gap-2 px-4 py-2.5 rounded-button text-sm font-semibold tracking-wide transition-all duration-300 ${
      isActive
        ? 'bg-primary/10 text-primary dark:text-amber-500 shadow-inner shadow-primary/5 dark:bg-amber-500/10'
        : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/45'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white/70 dark:bg-[#0E131F]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-850/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Brand Logo Container */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center bg-primary dark:bg-amber-500 text-white dark:text-black w-9 h-9 rounded-card shadow-md shadow-primary/20 dark:shadow-amber-500/15 group-hover:scale-105 transition-transform duration-300">
                <Camera className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent dark:bg-white rounded-full border-2 border-white dark:border-amber-500 animate-pulse"></span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-text-primary dark:text-white group-hover:text-primary dark:group-hover:text-amber-500 transition-colors duration-300">
                Civic<span className="text-primary dark:text-amber-500 font-normal">Lens</span>
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
              <NavLink to="/leaderboard" className={activeStyle}>
                {({ isActive }) => (
                  <>
                    <Trophy className="w-4 h-4" />
                    <span>Leaderboard</span>
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
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>
            {isLoggedIn ? (
              <>
                {/* Logged in Username pill */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-full select-none">
                  <User className="w-3.5 h-3.5 text-primary dark:text-amber-500 animate-pulse" />
                  <span>{userName}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-2 px-5 py-2 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-button bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:text-text-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-sm font-bold shadow-sm active:scale-97 hover:scale-[1.02] cursor-pointer"
                >
                  <User className="w-4 h-4 text-primary dark:text-amber-500" />
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold rounded-button bg-primary dark:bg-amber-500 text-white dark:text-black hover:bg-primary/95 dark:hover:bg-amber-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-amber-500/10 active:scale-95 hover:scale-[1.02] cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded-full transition-colors cursor-pointer border-0 bg-transparent"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-button text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40 hover:text-text-primary dark:hover:text-white transition-colors border-0 bg-transparent"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-primary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
          >
            <Map className="w-5 h-5 text-primary dark:text-amber-500" />
            <span>Map Dashboard</span>
          </NavLink>
          <NavLink
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-primary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
          >
            <Camera className="w-5 h-5 text-primary dark:text-amber-500" />
            <span>Report Issue</span>
          </NavLink>
          <NavLink
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-primary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
          >
            <Trophy className="w-5 h-5 text-primary dark:text-amber-500" />
            <span>Leaderboard</span>
          </NavLink>
          {isLoggedIn && (
            <NavLink
              to="/my-reports"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-primary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/40"
            >
              <FileText className="w-5 h-5 text-primary dark:text-amber-500" />
              <span>My Reports</span>
            </NavLink>
          )}
          
          <div className="border-t border-gray-200 dark:border-gray-800 my-2 pt-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-secondary dark:text-gray-400 select-none">
                  <User className="w-5 h-5 text-primary dark:text-amber-500 animate-pulse" />
                  <span>{userName}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-button text-sm font-semibold text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/40 text-left border-0 bg-transparent"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 px-4 py-3 rounded-button text-sm font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-primary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 mb-2 transition-all active:scale-97 cursor-pointer"
                >
                  <User className="w-5 h-5 text-primary dark:text-amber-500" />
                  <span>Sign Up</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 px-4 py-3 rounded-button text-sm font-bold bg-primary dark:bg-amber-500 text-white dark:text-black hover:bg-primary/95 dark:hover:bg-amber-600 transition-all active:scale-97 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
