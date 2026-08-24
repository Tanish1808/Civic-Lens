/**
 * ==============================================================================
 * CIVIC LENS — CITIZEN SIGNUP (PAGE 3 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Opening a Citizen Case File & Municipal Registry Onboarding
 * 
 * SUMMARY OF CHANGES:
 * 1. Standalone Auth Layout: Removed citizen Navbar in favor of a clean, standalone
 *    top bar featuring the Civic Lens wordmark, theme switcher, and home navigation.
 * 2. Visual System Continuity: Applied 'paper' (#F6F2E9), 'ink' (#10263A), 'ink-line' (#D8D2C2),
 *    'accent' (#E8A33D), and severity tokens with the survey-grid texture background.
 * 3. Typography: Space Grotesk for display headlines (sentence case), Inter for body/inputs,
 *    and JetBrains Mono for telemetry eyebrows, form labels, and section dividers.
 * 4. Grouped & Paced Form Architecture: Organized the 5 input fields into two distinct logical
 *    sections (01: Citizen Identity, 02: Access Credentials) with subtle permit line dividers.
 * 5. Split Terminal Layout:
 *    - Left Panel: "Municipal Participation Framework" briefing with 3 core citizen privileges
 *      (photographic defect reporting, verified resolution voting, open governance access).
 *    - Right Panel: Authenticated Terminal Panel with dark terminal header strip, custom focus rings,
 *      accessible password toggles (with aria-labels), custom checkbox, and restyled .animate-shake.
 * 6. Extended Real Scroll Page: Added "How your citizen account works" 3-checkpoint overview
 *    and condensed municipal ledger band below the fold to eliminate dead empty space.
 * 7. 100% Preserved Functionality: POST /auth/signup endpoint, phone optional handling,
 *    password match validation, loading states, and redirect to /login with state message.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, User, Mail, Phone, Lock, Eye, EyeOff, AlertTriangle, 
  Loader2, ShieldCheck, ArrowLeft, ArrowRight, Sun, Moon,
  FileCheck, Sparkles, CheckCircle2, Scale, X, ExternalLink
} from 'lucide-react';
import api from '../../../services/api';

export default function Signup() {
  const navigate = useNavigate();

  // Inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from document element
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Error Shake trigger helper
  const triggerErrorShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords don't match. Please re-enter.");
      triggerErrorShake();
      return;
    }

    if (password.length < 8) {
      setConfirmPasswordError('Password must be at least 8 characters.');
      triggerErrorShake();
      return;
    }

    setConfirmPasswordError('');
    setIsLoading(true);
    setSignupError('');

    api.post('/auth/signup', {
      email,
      password,
      phone: phone || null,
      full_name: fullName,
    })
      .then(() => {
        setIsLoading(false);
        navigate('/login', {
          state: { message: 'Registration successful! Please sign in with your credentials.' },
        });
      })
      .catch((error) => {
        setIsLoading(false);
        triggerErrorShake();
        if (error.response && error.response.data) {
          const apiError = error.response.data.error?.message || error.response.data.message;
          setSignupError(apiError || 'Registration could not be completed. Check your inputs.');
        } else {
          setSignupError('Unable to connect to the server. Check your connection.');
        }
      });
  };

  return (
    <div className="bg-paper dark:bg-[#0E131F] min-h-screen flex flex-col justify-between text-ink dark:text-gray-200 transition-colors duration-300 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. STANDALONE MINIMAL HEADER (NO CITIZEN NAVBAR)
      ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-ink-line dark:border-gray-800 bg-paper/80 dark:bg-[#0E131F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Wordmark linking to Home */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-accent text-ink p-2 rounded-card shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-4 h-4" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-white">
              Civic<span className="text-accent font-normal">Lens</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 border border-ink-line dark:border-gray-700 font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">
              CITIZEN REGISTRATION
            </span>
          </Link>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-button border border-ink-line dark:border-gray-700 bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors"
              aria-label="Toggle visual theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Back to Home Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink/80 dark:text-gray-300 hover:text-accent dark:hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Overview</span>
            </Link>

          </div>

        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN SIGNUP SECTION — Split Terminal Blueprint
      ───────────────────────────────────────────────────────────── */}
      <main className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full survey-grid flex-1 flex flex-col justify-center">
        
        {/* Technical survey corner markings */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-ink/40 dark:text-gray-600 hidden sm:block">
          + REGISTRATION PROTOCOL: CITIZEN-ONBOARDING // AHMEDABAD
        </div>
        <div className="absolute top-4 right-4 font-mono text-[10px] text-ink/40 dark:text-gray-600 hidden sm:block">
          AUDIT COMPLIANCE: MIT OPEN CIVIC UTILITY +
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
          
          {/* Left Column: Context Briefing & Citizen Privileges */}
          <div className="lg:col-span-5 text-left space-y-6">
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-card dark:bg-amber-950/20 border border-ink/20 dark:border-amber-500/30 rounded-button font-mono text-[11px] font-bold uppercase tracking-widest text-ink/80 dark:text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>CITIZEN INTAKE PROTOCOL</span>
            </div>

            {/* Space Grotesk Headline in Sentence Case */}
            <div className="space-y-3">
              <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-ink dark:text-white">
                Open your citizen file to inspect and improve your city.
              </h1>
              <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed max-w-md font-normal">
                Register as an active citizen surveyor to report potholes, waterlogging, and street defects, vote on repair priority, and track municipal work orders.
              </p>
            </div>

            {/* Citizen Privileges Breakdown Panel */}
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-5 space-y-4 font-mono text-xs shadow-md">
              
              <div className="flex justify-between items-center pb-2.5 border-b border-ink-line dark:border-gray-800">
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span>CITIZEN PARTICIPATION PRIVILEGES</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-severity-low animate-pulse" />
              </div>

              <div className="space-y-3 text-[11px] text-ink/80 dark:text-gray-300">
                <div className="space-y-0.5">
                  <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                    <span className="text-accent">01 //</span>
                    <span>Direct Photographic Defect Filing</span>
                  </div>
                  <p className="text-ink/60 dark:text-gray-400 font-sans text-xs">
                    Lock GPS coordinates and trigger automated ML categorization with 20m duplicate clustering.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                    <span className="text-accent">02 //</span>
                    <span>Verified Resolution Sign-Offs</span>
                  </div>
                  <p className="text-ink/60 dark:text-gray-400 font-sans text-xs">
                    Inspect engineer repair evidence, sign off on completed jobs, and upvote urgent neighborhood fixes.
                  </p>
                </div>

                <div className="space-y-0.5">
                  <div className="font-bold text-ink dark:text-white flex items-center gap-1.5">
                    <span className="text-accent">03 //</span>
                    <span>Leaderboard & Civic Karma</span>
                  </div>
                  <p className="text-ink/60 dark:text-gray-400 font-sans text-xs">
                    Earn verified surveyor badges and rank on the city-wide ward contribution leaderboard.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-ink-line dark:border-gray-800 text-[10px] text-ink/50 dark:text-gray-500 flex justify-between">
                <span>ZERO CITIZEN FEES</span>
                <span className="text-severity-low font-bold">100% OPEN GOVERNANCE</span>
              </div>
            </div>

            {/* Public Map Link */}
            <div className="pt-1">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-primary dark:text-amber-400 hover:underline"
              >
                <span>Explore public defect map without registering</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Right Column: Authenticated Registration Panel */}
          <div className="lg:col-span-7 flex justify-center">
            <div 
              className={`w-full max-w-md bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl overflow-hidden transition-all duration-300 ${
                isShaking ? 'animate-shake border-severity-high' : ''
              }`}
            >
              {/* Terminal Header Bar */}
              <div className="bg-ink text-paper dark:bg-[#090D15] dark:text-gray-300 px-5 py-3 border-b-2 border-ink dark:border-gray-700 flex justify-between items-center font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-bold tracking-wider uppercase">TERMINAL // CITIZEN INTAKE</span>
                </div>
                <span className="text-[10px] text-paper/60 dark:text-gray-500">SPEC: CIT-REG-2026</span>
              </div>

              {/* Form Body */}
              <div className="p-6 sm:p-8 space-y-6 text-left">
                
                {/* Form Headline */}
                <div className="space-y-1">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-white">
                    Open your citizen file
                  </h2>
                  <p className="text-xs text-ink/70 dark:text-gray-400">
                    Enter your verified identity and credentials to unlock full reporting access.
                  </p>
                </div>

                {/* Registration Error Banner */}
                {signupError && (
                  <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 text-severity-high border border-severity-high/40 rounded-button text-xs leading-relaxed animate-in fade-in duration-200 font-mono">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p className="font-semibold">{signupError}</p>
                  </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                  
                  {/* ───────────────────────────────────────────────
                      FIELD GROUP 1: CITIZEN IDENTITY
                  ─────────────────────────────────────────────── */}
                  <div className="space-y-3.5">
                    
                    <div className="flex items-center gap-2 pb-1 border-b border-dashed border-ink-line dark:border-gray-800">
                      <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                        // 01 · CITIZEN IDENTITY
                      </span>
                    </div>

                    {/* Full Name */}
                    <div className="space-y-1.5 font-mono">
                      <label 
                        htmlFor="fullName" 
                        className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 dark:text-gray-500">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="fullName"
                          type="text"
                          required
                          autoFocus
                          placeholder="Rohan Sharma"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          disabled={isLoading}
                          className="block w-full pl-10 pr-3.5 py-2.5 border border-ink-line dark:border-gray-700 rounded-button bg-paper dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs shadow-sm transition-colors text-ink dark:text-gray-200 placeholder-ink/30 dark:placeholder-gray-600"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5 font-mono">
                      <label 
                        htmlFor="email" 
                        className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 dark:text-gray-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="rohan@ahmedabad.gov.in"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="block w-full pl-10 pr-3.5 py-2.5 border border-ink-line dark:border-gray-700 rounded-button bg-paper dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs shadow-sm transition-colors text-ink dark:text-gray-200 placeholder-ink/30 dark:placeholder-gray-600"
                        />
                      </div>
                    </div>

                    {/* Phone Number (Optional) */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between items-center">
                        <label 
                          htmlFor="phone" 
                          className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Phone Number
                        </label>
                        <span className="text-[9px] text-ink/50 dark:text-gray-500 font-semibold">
                          OPTIONAL // SMS ALERTS
                        </span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 dark:text-gray-500">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={isLoading}
                          className="block w-full pl-10 pr-3.5 py-2.5 border border-ink-line dark:border-gray-700 rounded-button bg-paper dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs shadow-sm transition-colors text-ink dark:text-gray-200 placeholder-ink/30 dark:placeholder-gray-600"
                        />
                      </div>
                    </div>

                  </div>

                  {/* ───────────────────────────────────────────────
                      FIELD GROUP 2: ACCESS CREDENTIALS
                  ─────────────────────────────────────────────── */}
                  <div className="space-y-3.5 pt-2">
                    
                    <div className="flex items-center gap-2 pb-1 border-b border-dashed border-ink-line dark:border-gray-800">
                      <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                        // 02 · ACCESS CREDENTIALS
                      </span>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5 font-mono">
                      <label 
                        htmlFor="password" 
                        className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider"
                      >
                        Enter Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 dark:text-gray-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (confirmPassword && e.target.value !== confirmPassword) {
                              setConfirmPasswordError("Passwords don't match.");
                            } else {
                              setConfirmPasswordError('');
                            }
                          }}
                          disabled={isLoading}
                          className="block w-full pl-10 pr-10 py-2.5 border border-ink-line dark:border-gray-700 rounded-button bg-paper dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs shadow-sm transition-colors text-ink dark:text-gray-200 placeholder-ink/30 dark:placeholder-gray-600"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink/40 dark:text-gray-500 hover:text-ink dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5 font-mono">
                      <div className="flex justify-between items-center">
                        <label 
                          htmlFor="confirmPassword" 
                          className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Confirm Password
                        </label>
                        {confirmPasswordError && (
                          <span className="text-[10px] font-bold text-severity-high animate-in fade-in duration-200">
                            {confirmPasswordError}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink/40 dark:text-gray-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          autoComplete="new-password"
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (password && e.target.value !== password) {
                              setConfirmPasswordError("Passwords don't match.");
                            } else {
                              setConfirmPasswordError('');
                            }
                          }}
                          disabled={isLoading}
                          className={`block w-full pl-10 pr-10 py-2.5 border rounded-button bg-paper dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs shadow-sm transition-colors text-ink dark:text-gray-200 placeholder-ink/30 dark:placeholder-gray-600 ${
                            confirmPasswordError ? 'border-severity-high/80' : 'border-ink-line dark:border-gray-700'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                          aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-ink/40 dark:text-gray-500 hover:text-ink dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Terms & Guidelines Checkbox */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none text-ink/80 dark:text-gray-300 font-mono text-[11px] leading-relaxed">
                      <input
                        type="checkbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        disabled={isLoading}
                        className="mt-0.5 rounded border-ink-line dark:border-gray-700 text-accent focus:ring-accent/20 h-4 w-4 bg-paper dark:bg-gray-900"
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setShowTermsModal(true);
                          }}
                          className="font-bold text-primary dark:text-amber-400 hover:text-accent underline inline-flex items-center gap-0.5 bg-transparent border-0 p-0 cursor-pointer text-[11px]"
                        >
                          Terms of Service
                        </button>{' '}
                        and civic reporting guidelines.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button: Solid Signal Amber CTA */}
                  <button
                    type="submit"
                    disabled={isLoading || !agreedToTerms || !!confirmPasswordError}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-button font-mono text-xs font-bold uppercase tracking-wider text-ink bg-accent hover:bg-amber-400 active:scale-97 shadow-md shadow-accent/20 transition-all cursor-pointer border-0 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Opening Citizen File...</span>
                      </>
                    ) : (
                      <span>Open Citizen File</span>
                    )}
                  </button>

                </form>

                {/* Account redirect to login */}
                <div className="pt-2 text-center text-xs font-mono text-ink/70 dark:text-gray-400 border-t border-dashed border-ink-line dark:border-gray-800">
                  <span>Already have an active citizen file? </span>
                  <Link to="/login" className="font-bold text-primary dark:text-amber-400 hover:underline transition-colors">
                    Sign in to your account
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>

      </main>

      {/* ─────────────────────────────────────────────────────────────
          3. BELOW-THE-FOLD SECTION: HOW YOUR CITIZEN ACCOUNT WORKS
      ───────────────────────────────────────────────────────────── */}
      <section className="border-t-2 border-ink dark:border-gray-800 bg-paper-card dark:bg-[#131A26] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-left max-w-xl space-y-2">
            <div className="font-mono text-xs font-bold text-accent uppercase tracking-widest">
              // ONBOARDING GUIDE
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
              How your citizen account functions
            </h2>
            <p className="text-xs sm:text-sm text-ink/70 dark:text-gray-400">
              Three clear steps from registration to verified street repair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-3 text-left hover:border-ink dark:hover:border-amber-400 transition-colors">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-button bg-accent/10 border border-accent/30 flex items-center justify-center text-accent">
                  <Camera className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  STEP 01
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                Capture & Geotag Defect
              </h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Take an on-site photo with browser GPS enabled. AI vision algorithms classify defect category and severity.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ACTION: FILE NEW REPORT
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-3 text-left hover:border-ink dark:hover:border-amber-400 transition-colors">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-button bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-primary dark:text-blue-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  STEP 02
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                Deduplication & Dispatch
              </h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Reports within a 20-meter radius merge into a single work order routed straight to the responsible ward engineer.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                TECH: 2DSPHERE DEDUPLICATION
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-3 text-left hover:border-ink dark:hover:border-amber-400 transition-colors">
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-button bg-green-500/10 border border-green-500/30 flex items-center justify-center text-severity-low">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  STEP 03
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-ink dark:text-white">
                Public Repair Sign-Off
              </h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Inspect physical repairs, verify the resolution with citizen sign-offs, and close the municipal audit record.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                OUTCOME: TRANSPARENT AUDIT
              </div>
            </div>

          </div>

          {/* Condensed Municipal Stats Strip */}
          <div className="border-t border-ink-line dark:border-gray-800 pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left font-mono">
            <div className="p-3 bg-paper dark:bg-gray-900/60 rounded border border-ink-line dark:border-gray-800">
              <div className="text-[10px] text-ink/60 dark:text-gray-500 uppercase">Registered Citizens</div>
              <div className="font-display text-xl font-bold text-ink dark:text-white">12,840+</div>
            </div>
            <div className="p-3 bg-paper dark:bg-gray-900/60 rounded border border-ink-line dark:border-gray-800">
              <div className="text-[10px] text-ink/60 dark:text-gray-500 uppercase">Resolution Rate</div>
              <div className="font-display text-xl font-bold text-severity-low">86.4%</div>
            </div>
            <div className="p-3 bg-paper dark:bg-gray-900/60 rounded border border-ink-line dark:border-gray-800">
              <div className="text-[10px] text-ink/60 dark:text-gray-500 uppercase">Connected Wards</div>
              <div className="font-display text-xl font-bold text-ink dark:text-white">48 / 48</div>
            </div>
            <div className="p-3 bg-paper dark:bg-gray-900/60 rounded border border-ink-line dark:border-gray-800">
              <div className="text-[10px] text-ink/60 dark:text-gray-500 uppercase">Citizen Cost</div>
              <div className="font-display text-xl font-bold text-accent">₹0 (Free Utility)</div>
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. MINIMAL AUTH FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A1826] dark:bg-[#05080E] py-8 text-gray-400 text-xs border-t border-gray-900 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold text-white">CivicLens</span>
            <span className="text-gray-600">·</span>
            <span>Ahmedabad Municipal Civic Infrastructure Framework</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[11px]">
            <span>AMC Helpline: 155303</span>
            <span>·</span>
            <span>© 2026 Open Source (MIT)</span>
          </div>
        </div>
      </footer>

      {/* ── TERMS OF SERVICE MODAL (PORTAL TO BODY) ── */}
      {showTermsModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            className="relative bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] flex flex-col text-left mx-auto transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Corner Reticles */}
            <div className="absolute top-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┌</div>
            <div className="absolute top-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┐</div>
            <div className="absolute bottom-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">└</div>
            <div className="absolute bottom-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┘</div>

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-ink-line dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-card bg-accent/20 text-accent border border-accent/40 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider block">// CITIZEN CHARTER</span>
                  <h3 className="font-display text-lg font-bold text-ink dark:text-white">Civic Lens Terms of Service</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-ink/60 dark:text-gray-400 hover:text-ink dark:hover:text-white p-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Terms Content */}
            <div className="overflow-y-auto py-4 pr-2 space-y-4 text-xs font-sans text-ink/80 dark:text-gray-300 leading-relaxed max-h-[55vh]">
              <div className="p-3 bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 rounded font-mono text-[11px] space-y-1 text-ink/70 dark:text-gray-400">
                <div className="font-bold text-accent">AHMEDABAD MUNICIPAL CIVIC INTELLIGENCE GRID</div>
                <div>Operational Scope: Potholes, Road Hazards, Waterlogging, Lighting & Sanitation</div>
              </div>

              <div className="space-y-1">
                <h4 className="font-mono font-bold text-ink dark:text-white uppercase text-[11px]">01. Authentic Field Reporting</h4>
                <p>All photographs, descriptions, and GPS locations submitted must represent genuine, on-site civic defects. Uploading digitally altered media or spoofed coordinates leads to account deactivation.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-mono font-bold text-ink dark:text-white uppercase text-[11px]">02. Spatial Deduplication & AI Triage</h4>
                <p>Submissions within 50 meters of existing issues are automatically merged into single unified municipal work orders. Computer vision models assist engineers in prioritizing urgent hazards.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-mono font-bold text-ink dark:text-white uppercase text-[11px]">03. Privacy & Telemetry Usage</h4>
                <p>Field photographs and defect coordinates are published to the public tracking dashboard and shared with municipal repair crews. Personal identity credentials remain strictly encrypted.</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-mono font-bold text-ink dark:text-white uppercase text-[11px]">04. Karma & Community Verification</h4>
                <p>Citizens earn Karma XP for verified reports and repair confirmations. Manipulation of community upvotes will result in reputation forfeiture.</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-ink-line dark:border-gray-800 font-mono text-xs">
              <Link
                to="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Read Full Document in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="px-4 py-2 bg-paper dark:bg-gray-800 hover:bg-paper-sheet text-ink dark:text-white border border-ink-line dark:border-gray-700 rounded-button font-bold uppercase transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="px-5 py-2 bg-accent hover:bg-amber-400 text-ink font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer border-0 shadow"
                >
                  I Agree & Accept
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
