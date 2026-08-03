import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // Interactive mouse position for background parallax depth
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Track mouse coordinates for subtle interactive background movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 45,
        y: (e.clientY - window.innerHeight / 2) / 45,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Real-time inline email validation
  const validateEmail = (value) => {
    setEmail(value);
    setAuthError('');
    if (!value) {
      setEmailError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Real-time inline password validation
  const validatePassword = (value) => {
    setPassword(value);
    setAuthError('');
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Error Shake trigger helper
  const triggerErrorShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      triggerErrorShake();
      return;
    }

    setIsLoading(true);
    setAuthError('');

    // Simulate auth latency
    setTimeout(() => {
      setIsLoading(false);

      if (email === 'error@civiclens.gov') {
        setAuthError('Invalid email address or password. Please verify your credentials.');
        triggerErrorShake();
      } else {
        navigate('/dashboard');
      }
    }, 1500);
  };

  // Dynamic background orb classes based on form validation state
  let orbLeftColor = "bg-primary/5";
  let orbRightColor = "bg-accent/5";

  if (authError || emailError || passwordError) {
    orbLeftColor = "bg-red-500/10";
    orbRightColor = "bg-red-500/5";
  } else if (email && password && !emailError && !passwordError) {
    orbLeftColor = "bg-green-500/10";
    orbRightColor = "bg-green-500/5";
  }

  return (
    <main className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFBFD] overflow-hidden text-text-primary animate-fade-in select-none">
      
      {/* 1. Dynamic Parallax Background Orbs */}
      <div 
        className={`absolute top-1/4 left-1/4 w-[450px] h-[450px] ${orbLeftColor} rounded-full blur-[80px] -z-10 pointer-events-none transition-all duration-700 ease-out`} 
        style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      />
      <div 
        className={`absolute bottom-1/4 right-1/4 w-[450px] h-[450px] ${orbRightColor} rounded-full blur-[80px] -z-10 pointer-events-none transition-all duration-700 ease-out`} 
        style={{ transform: `translate(${-mousePos.x}px, ${-mousePos.y}px)` }}
      />
      <div 
        className="absolute top-10 right-1/3 w-32 h-32 rounded-full border border-gray-200/50 bg-white/20 backdrop-blur-sm -z-10 pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)` }}
      />
      <div 
        className="absolute bottom-20 left-1/3 w-20 h-20 rounded-full border border-gray-200/50 bg-white/20 backdrop-blur-sm -z-10 pointer-events-none transition-transform duration-500 ease-out"
        style={{ transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)` }}
      />

      {/* Main Form Center Container */}
      <div className="w-full max-w-md space-y-8 z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 group mb-6">
            <div className="relative flex items-center justify-center bg-primary text-white w-11 h-11 rounded-card shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Camera className={`w-6 h-6 transition-transform duration-500 ${isFocused ? 'scale-110 rotate-[15deg]' : ''}`} />
              <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-[#FAFBFD] transition-all duration-300 ${isFocused ? 'scale-125 animate-ping' : 'animate-pulse'}`}></span>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-text-primary group-hover:text-primary transition-colors duration-300">
              Civic<span className="text-primary font-normal">Lens</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black tracking-tight leading-tight text-text-primary">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {/* Premium Glassmorphic Card Overlay */}
        <div 
          className={`bg-white/40 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-card border border-white/60 space-y-6 transition-all duration-300 ${
            isShaking ? 'animate-shake border-red-300' : ''
          }`}
        >
          
          {/* Action Failure alert notification banner */}
          {authError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-950 border border-red-200 rounded-card text-xs leading-relaxed animate-in fade-in zoom-in-95 duration-200">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="font-semibold">{authError}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Address */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="email" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Email Address
                </label>
                {emailError && <span className="text-[10px] font-bold text-red-500 animate-in fade-in duration-200">{emailError}</span>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400 ${
                    emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-primary'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                {passwordError && <span className="text-[10px] font-bold text-red-500 animate-in fade-in duration-200">{passwordError}</span>}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isLoading}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-button bg-white/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-sm shadow-sm transition-all duration-300 placeholder-gray-400 ${
                    passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="rounded border-gray-300 focus:ring-primary text-primary h-4 w-4"
                />
                <span>Remember this browser</span>
              </label>
              <Link to="#" className="text-primary hover:text-primary/90 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !!emailError || !!passwordError}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 hover:shadow-primary/10 transition-all duration-300 active:scale-98 disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Verifying account...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

          </form>

          {/* Social connection options */}
          <div className="space-y-6">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-gray-200/50"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
              <div className="flex-grow border-t border-gray-200/50"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 rounded-button bg-white hover:bg-gray-50 text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook Button */}
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-gray-200 rounded-button bg-white hover:bg-gray-50 text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Account redirect signup */}
          <p className="pt-2 text-center text-xs text-text-secondary font-bold">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-primary hover:underline transition-all">
              Sign up
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}
