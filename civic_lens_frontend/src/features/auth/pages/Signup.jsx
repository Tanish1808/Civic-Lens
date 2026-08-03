import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }
    setConfirmPasswordError('');

    // Save logged in state automatically
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', 'citizen');
    localStorage.setItem('userName', fullName || 'Citizen User');
    window.dispatchEvent(new Event('auth-change'));

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
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Join other citizens to verify infrastructure progress
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl shadow-gray-200/50 rounded-card border border-white/50 sm:px-10">
          <form className="space-y-4.5" onSubmit={handleSignup}>
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Rohan Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mt-4">
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
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="mt-4">
              <label htmlFor="phone" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Phone Number (Optional)
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 9000000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mt-4">
              <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Enter Password
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (confirmPassword && e.target.value !== confirmPassword) {
                      setConfirmPasswordError('Passwords do not match');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
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

            {/* Confirm Password Field */}
            <div className="mt-4">
              <div className="flex justify-between">
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                {confirmPasswordError && (
                  <span className="text-[10px] font-bold text-red-500 animate-in fade-in duration-200">
                    {confirmPasswordError}
                  </span>
                )}
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (password && e.target.value !== password) {
                      setConfirmPasswordError('Passwords do not match');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  className={`appearance-none block w-full pl-10 pr-10 py-2.5 border rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400 ${
                    confirmPasswordError ? 'border-red-300 focus:border-red-500 focus:ring-red-505/10' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-text-primary transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary mt-4">
              <input
                type="checkbox"
                required
                className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
              />
              <span>
                I agree to the{' '}
                <Link to="#" className="text-primary hover:text-primary/90 transition-colors">
                  Terms of Service
                </Link>{' '}
                & privacy guidelines.
              </span>
            </div>

            {/* Submit Button */}
            <div className="mt-5">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-98"
              >
                Create Account
              </button>
            </div>

          </form>

          {/* Toggle link */}
          <p className="mt-6 text-center text-xs text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:text-primary/95 transition-colors">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
