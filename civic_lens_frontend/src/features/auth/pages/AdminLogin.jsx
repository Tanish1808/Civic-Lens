import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    api.post('/auth/login', { email, password })
      .then((response) => {
        setIsLoading(false);
        const { access_token, role } = response.data.data;

        if (role !== 'admin') {
          setAuthError('Access Denied. You do not have administrator permissions.');
          return;
        }

        sessionStorage.setItem('token', access_token);
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('userName', 'Admin Staff');

        window.dispatchEvent(new Event('auth-change'));
        navigate('/admin/overview');
      })
      .catch((error) => {
        setIsLoading(false);
        if (error.response && error.response.data) {
          setAuthError(error.response.data.message || 'Invalid administrator credentials.');
        } else {
          setAuthError('Unable to connect to the server. Please check your connection.');
        }
      });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#070A11] text-white relative overflow-hidden select-none font-sans">
      
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10 animate-fade-in">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center bg-amber-600 text-white w-12 h-12 rounded-card shadow-lg shadow-amber-600/10 mb-5">
            <Shield className="w-6 h-6" />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#070A11] animate-ping" />
          </div>
          <h2 className="text-center text-2xl font-black tracking-tight text-white uppercase">
            Staff Portal
          </h2>
          <p className="mt-1 text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Municipal Command Center
          </p>
        </div>

        {/* Dark Login Card */}
        <div className="bg-[#111622]/80 backdrop-blur-lg py-8 px-6 sm:px-10 shadow-2xl rounded-card border border-gray-800 space-y-6">
          
          {authError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 text-red-200 border border-red-900/60 rounded-card text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-400 mt-0.5" />
              <p className="font-semibold">{authError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAdminLogin}>
            
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Staff Email
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoFocus
                  placeholder="name@civiclens.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-800 rounded-button bg-[#070A11] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all duration-300 placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Access Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-800 rounded-button bg-[#070A11] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all duration-300 placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-button shadow-lg text-sm font-bold text-[#070A11] bg-amber-500 hover:bg-amber-600 active:scale-98 transition-all duration-300 disabled:bg-gray-800 disabled:text-gray-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <span>Authenticate Access</span>
              )}
            </button>

          </form>

          {/* Quick info notes for presentation preview */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-card text-[11px] text-amber-500 leading-relaxed font-semibold">
            <span className="font-bold">Staff Login Info:</span> admin@civiclens.gov / admin123
          </div>

        </div>

        {/* Back to Citizen Homepage link */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Portal</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
