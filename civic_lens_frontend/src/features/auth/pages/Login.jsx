import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD] overflow-hidden">
      
      {/* Background soft color meshes */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 group mb-6">
            <div className="relative flex items-center justify-center bg-primary text-white w-11 h-11 rounded-card shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Camera className="w-6 h-6" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-[#FAFBFD] animate-pulse"></span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-text-primary group-hover:text-primary transition-colors duration-300">
              Civic<span className="text-primary font-normal">Lens</span>
            </span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Access your civic accountability dashboard
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl shadow-gray-200/50 rounded-card border border-white/50 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-text-primary transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions checkbox */}
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <span>Remember this browser</span>
              </label>
              <Link to="#" className="text-primary hover:text-primary/90 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-98"
              >
                Sign In to Account
              </button>
            </div>

          </form>

          {/* Toggle link */}
          <p className="mt-6 text-center text-xs text-text-secondary">
            New to Civic Lens?{' '}
            <Link to="/signup" className="font-bold text-primary hover:text-primary/95 transition-colors">
              Create an account
            </Link>
          </p>

          {/* Admin Toggle Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
              <span className="px-3 bg-white/80 rounded-full text-gray-400">Or Access Portal</span>
            </div>
          </div>

          {/* Admin shortcut button */}
          <button
            onClick={() => navigate('/admin/overview')}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-amber-300/30 rounded-button bg-amber-500/10 text-xs font-bold text-amber-700 hover:bg-amber-500/20 transition-all duration-300"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Municipal Administrator Login</span>
          </button>

        </div>
      </div>
    </div>
  );
}
