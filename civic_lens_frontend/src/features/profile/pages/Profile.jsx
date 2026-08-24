/**
 * ==============================================================================
 * CIVIC LENS — CITIZEN PROFILE & CIVIC IDENTITY DOSSIER
 * ==============================================================================
 * 
 * FEATURES:
 * - Real-time Profile Management: Fetches live citizen profile via GET /users/me
 *   and supports profile edits (Full Name, Phone) via PATCH /users/me.
 * - Account Security: Secure password updating via POST /users/change-password.
 * - Municipal Grid Telemetry: Operational jurisdiction & sector oversight.
 * - Field Reporting Protocols: Best-practice checklist for high-accuracy citizen intake.
 * - Quick Action Dockets: Direct links to Track My Submissions (/my-reports) and Report Civic Issue (/report).
 * - Design System: Conforms to Deep Survey Ink (#10263A), Warm Paper (#F6F2E9),
 *   Hairline Dividers (#D8D2C2), Civic Blue (#1E5F8C), and Signal Amber (#E8A33D).
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, ShieldCheck, Award, Calendar, 
  Edit3, Check, X, FileText, ArrowRight, Loader2, 
  AlertCircle, LogOut, Crosshair, Sparkles, MapPin, Activity,
  Lock, KeyRound, Eye, EyeOff, Shield, CheckCircle2,
  Building2, Camera, Compass, Info
} from 'lucide-react';
import api from '../../../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Change Password state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Sign out modal state
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchUser = api.get('/users/me');
    const fetchReports = api.get('/my-reports');

    Promise.all([fetchUser, fetchReports])
      .then(([userRes, reportsRes]) => {
        const u = userRes.data?.data || null;
        if (!u) {
          setError('Failed to load user profile data.');
          setIsLoading(false);
          return;
        }

        setProfile(u);
        setFormData({
          full_name: u.full_name || '',
          phone: u.phone || '',
        });

        const reportsList = reportsRes.data?.data?.reports || [];
        setReports(reportsList);

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        setError('Failed to retrieve citizen profile from server.');
        setIsLoading(false);
      });
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    api.patch('/users/me', formData)
      .then((response) => {
        const updated = response.data?.data;
        if (updated) {
          setProfile(updated);
          sessionStorage.setItem('userName', updated.full_name || updated.email.split('@')[0]);
          window.dispatchEvent(new Event('auth-change'));
        }
        setIsSaving(false);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      })
      .catch((err) => {
        console.error('Error updating profile:', err);
        alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
        setIsSaving(false);
      });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    setIsSubmittingPassword(true);
    api.post('/users/change-password', {
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    })
      .then(() => {
        setIsSubmittingPassword(false);
        setPasswordSuccess(true);
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setTimeout(() => {
          setIsChangingPassword(false);
          setPasswordSuccess(false);
        }, 2500);
      })
      .catch((err) => {
        setIsSubmittingPassword(false);
        const errMsg = err.response?.data?.message || 'Failed to change password. Please verify current password.';
        setPasswordError(errMsg);
      });
  };

  const confirmSignOut = () => {
    api.post('/auth/logout').catch(() => {}).finally(() => {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userId');
      window.dispatchEvent(new Event('auth-change'));
      setShowSignOutModal(false);
      navigate('/');
    });
  };

  // Compute live statistics
  const stats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter(r => (r.status || '').toLowerCase().includes('resolved')).length;
    const active = total - resolved;
    return { total, resolved, active };
  }, [reports]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] flex flex-col justify-center items-center py-24 space-y-3 font-mono text-xs text-ink/60 dark:text-gray-400 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="uppercase tracking-widest animate-pulse">Syncing Citizen Dossier…</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] flex flex-col justify-center items-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-card bg-red-500/10 border-2 border-severity-high/40 flex items-center justify-center text-severity-high mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">// CITIZEN AUTH ERROR</span>
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Profile Unavailable</h2>
          <p className="text-xs text-ink/70 dark:text-gray-400 font-sans max-w-sm leading-relaxed">{error || 'Please sign in to view your profile.'}</p>
        </div>
        <Link 
          to="/login" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink text-paper dark:bg-accent dark:text-ink rounded-button font-mono text-xs font-bold uppercase tracking-wider shadow hover:bg-ink-muted transition-all"
        >
          <span>Sign In to Continue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Badge tier mapping based on authentic civic score
  const civicScore = profile.civic_score || 0;
  let badgeTier = "Active Citizen";
  let tierColor = "text-primary border-primary/30 bg-primary/10";
  if (civicScore >= 100) {
    badgeTier = "Civic Sentinel";
    tierColor = "text-accent border-accent/40 bg-accent/15";
  } else if (civicScore >= 50) {
    badgeTier = "Ward Advocate";
    tierColor = "text-severity-low border-severity-low/30 bg-green-500/10";
  } else if (civicScore >= 20) {
    badgeTier = "Community Hero";
    tierColor = "text-blue-600 border-blue-400/30 bg-blue-500/10";
  }

  const userInitial = (profile.full_name || profile.email || 'C').charAt(0).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-ink dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── 1. PROFILE HEADER CARD ── */}
        <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 sm:p-8 shadow-xl space-y-6 text-left relative overflow-hidden">
          
          {/* Header Eyebrow */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/70 dark:text-gray-400">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-accent font-bold uppercase tracking-wider">
              <Crosshair className="w-3 h-3 text-accent flex-shrink-0" />
              <span>CITIZEN PROFILE DOSSIER</span>
            </div>
            <span className="text-ink/60 dark:text-gray-400">
              UID: {profile.user_id?.slice(-8).toUpperCase() || 'REGISTERED'}
            </span>
          </div>

          {/* Profile Identity Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar Initial with Survey Reticle */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-card bg-paper dark:bg-gray-800 border-2 border-ink dark:border-gray-700 flex items-center justify-center font-display font-bold text-2xl sm:text-3xl text-ink dark:text-white flex-shrink-0 shadow-md">
                <span>{userInitial}</span>
                <div className="absolute -top-1 -right-1 font-mono text-[10px] text-accent font-bold select-none">
                  ┐
                </div>
                <div className="absolute -bottom-1 -left-1 font-mono text-[10px] text-accent font-bold select-none">
                  └
                </div>
              </div>

              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white tracking-tight truncate">
                    {profile.full_name || 'Citizen Contributor'}
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${tierColor}`}>
                    <Award className="w-3 h-3 flex-shrink-0" />
                    <span>{badgeTier}</span>
                  </span>
                </div>
                <p className="font-mono text-xs text-ink/70 dark:text-gray-400 truncate">
                  {profile.email}
                </p>
                <div className="flex items-center gap-3 pt-0.5 font-mono text-[10px] text-ink/60 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent" />
                    <span>MEMBER SINCE {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2026'}</span>
                  </span>
                  {profile.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-primary" />
                      <span>{profile.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center flex-shrink-0 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (isChangingPassword) setIsChangingPassword(false);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-button font-bold uppercase tracking-wider border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isEditing
                    ? 'bg-ink text-paper dark:bg-white dark:text-ink border-ink dark:border-white'
                    : 'bg-paper dark:bg-gray-800 text-ink dark:text-white border-ink dark:border-gray-700 hover:border-accent hover:bg-paper-sheet'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  if (isEditing) setIsEditing(false);
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-button font-bold uppercase tracking-wider border-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isChangingPassword
                    ? 'bg-ink text-paper dark:bg-white dark:text-ink border-ink dark:border-white'
                    : 'bg-paper dark:bg-gray-800 text-ink dark:text-white border-ink dark:border-gray-700 hover:border-accent hover:bg-paper-sheet'
                }`}
              >
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{isChangingPassword ? 'Cancel' : 'Security'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSignOutModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-button bg-red-500/10 hover:bg-red-500 hover:text-white text-severity-high border border-severity-high/30 font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                title="Sign out of account"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3.5 bg-green-500/10 border border-severity-low/40 rounded-card font-mono text-xs text-severity-low flex items-center gap-2 animate-in fade-in duration-200">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>Citizen identity updated successfully.</span>
            </div>
          )}

        </div>

        {/* ── 2. EDIT PROFILE FORM (CONDITIONAL) ── */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="bg-paper-card dark:bg-[#131A26] border-2 border-accent rounded-card p-6 sm:p-7 shadow-xl space-y-5 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-ink-line dark:border-gray-800 font-mono text-[10px] text-accent font-bold uppercase">
              <span>// MODIFY CITIZEN DOSSIER CREDENTIALS</span>
              <span>LIVE REGISTRY</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-bold text-ink/70 dark:text-gray-300 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Tanish Patel"
                  className="w-full px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-white font-sans text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-bold text-ink/70 dark:text-gray-300 uppercase tracking-wider">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-white font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-button bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 text-ink/70 dark:text-gray-300 hover:text-ink font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-button bg-accent text-ink hover:bg-amber-400 font-bold uppercase tracking-wider shadow transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── 3. CHANGE PASSWORD FORM (CONDITIONAL) ── */}
        {isChangingPassword && (
          <form onSubmit={handleChangePassword} className="bg-paper-card dark:bg-[#131A26] border-2 border-accent rounded-card p-6 sm:p-7 shadow-xl space-y-5 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-ink-line dark:border-gray-800 font-mono text-[10px] text-accent font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-accent" />
                <span>// UPDATE ACCOUNT PASSWORD & ENCRYPTION</span>
              </span>
              <span>SECURITY PROTOCOL</span>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-severity-high/40 rounded-card font-mono text-xs text-severity-high flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-500/10 border border-severity-low/40 rounded-card font-mono text-xs text-severity-low flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Password changed successfully.</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block font-mono text-[10px] font-bold text-ink/70 dark:text-gray-300 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-white font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-gray-500 hover:text-ink dark:hover:text-white border-0 bg-transparent cursor-pointer p-0"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold text-ink/70 dark:text-gray-300 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-white font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 dark:text-gray-500 hover:text-ink dark:hover:text-white border-0 bg-transparent cursor-pointer p-0"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-mono text-[10px] font-bold text-ink/70 dark:text-gray-300 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-white font-mono text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="px-4 py-2 rounded-button bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 text-ink/70 dark:text-gray-300 hover:text-ink font-bold uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-button bg-accent text-ink hover:bg-amber-400 font-bold uppercase tracking-wider shadow transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                {isSubmittingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password…</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── 4. TELEMETRY & CONTRIBUTION METRICS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 font-mono">
          
          <div className="p-5 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 space-y-2 text-left shadow-lg">
            <div className="flex items-center justify-between text-ink/50 dark:text-gray-400 text-[10px] uppercase font-bold">
              <span>CIVIC SCORE (KARMA)</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white">
              {civicScore} <span className="font-mono text-sm font-normal text-accent">XP</span>
            </div>
            <p className="font-sans text-[11px] text-ink/70 dark:text-gray-400 leading-relaxed">
              Earned by filing verified infrastructure reports and validating municipal repair closures.
            </p>
          </div>

          <div className="p-5 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 space-y-2 text-left shadow-lg">
            <div className="flex items-center justify-between text-ink/50 dark:text-gray-400 text-[10px] uppercase font-bold">
              <span>REPORTS FILED</span>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-primary dark:text-blue-400">
              {stats.total} <span className="font-mono text-sm font-normal text-ink/50 dark:text-gray-400">CASES</span>
            </div>
            <p className="font-sans text-[11px] text-ink/70 dark:text-gray-400 leading-relaxed">
              Total civic defect reports submitted into the Ahmedabad municipal intelligence grid.
            </p>
          </div>

          <div className="p-5 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 space-y-2 text-left shadow-lg">
            <div className="flex items-center justify-between text-ink/50 dark:text-gray-400 text-[10px] uppercase font-bold">
              <span>RESOLVED DEFECTS</span>
              <ShieldCheck className="w-4 h-4 text-severity-low" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-severity-low">
              {stats.resolved} <span className="font-mono text-sm font-normal text-ink/50 dark:text-gray-400">CLOSED</span>
            </div>
            <p className="font-sans text-[11px] text-ink/70 dark:text-gray-400 leading-relaxed">
              Municipal work orders that were successfully repaired and closed out.
            </p>
          </div>

        </div>

        {/* ── 5. MUNICIPAL OVERSIGHT & CITIZEN FIELD PROTOCOLS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          
          {/* Municipal Jurisdiction & Grid Status */}
          <div className="p-6 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-ink-line dark:border-gray-800 font-mono text-xs font-bold text-accent uppercase">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent" />
                <span>MUNICIPAL GRID SECTOR</span>
              </div>
              <span className="text-severity-low text-[10px]">CONNECTED</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800">
                <span className="text-ink/60 dark:text-gray-400">Jurisdiction</span>
                <span className="font-bold text-ink dark:text-white">Ahmedabad Municipal Corp.</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800">
                <span className="text-ink/60 dark:text-gray-400">Reporting Coverage</span>
                <span className="font-bold text-ink dark:text-white">North West · West · Central</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800">
                <span className="text-ink/60 dark:text-gray-400">Citizen Verification Tier</span>
                <span className="font-bold text-accent">{badgeTier}</span>
              </div>
            </div>
          </div>

          {/* Citizen Field Reporting Guidelines */}
          <div className="p-6 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-ink-line dark:border-gray-800 font-mono text-xs font-bold text-accent uppercase">
              <Compass className="w-4 h-4 text-accent" />
              <span>FIELD REPORTING PROTOCOLS</span>
            </div>

            <div className="space-y-2.5 font-sans text-xs text-ink/80 dark:text-gray-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p><strong className="text-ink dark:text-white">Clear Evidence:</strong> Capture on-site defects with visible landmarks for instant AI classification.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p><strong className="text-ink dark:text-white">Auto De-duplication:</strong> Spatial merging automatically links reports within 50 meters to prevent duplicate work orders.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p><strong className="text-ink dark:text-white">Community Confirmation:</strong> Upvote issues or verify completed repairs to boost municipal priority.</p>
              </div>
            </div>
          </div>

        </div>

        {/* ── 6. QUICK ACTION DOCKETS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          
          <Link
            to="/my-reports"
            className="p-6 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 hover:border-accent dark:hover:border-accent transition-all duration-200 shadow-xl space-y-3 group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-accent">
              <span className="uppercase tracking-wider">// CITIZEN CASE DOCKET</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink dark:text-white">
              Track My Submissions
            </h3>
            <p className="text-xs text-ink/75 dark:text-gray-300 font-sans leading-relaxed">
              Inspect the resolution lifecycle, AI vision classifications, and ward work order progress for all {stats.total} issues you have reported.
            </p>
          </Link>

          <Link
            to="/report"
            className="p-6 rounded-card bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 hover:border-accent dark:hover:border-accent transition-all duration-200 shadow-xl space-y-3 group"
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold text-accent">
              <span className="uppercase tracking-wider">// NEW FIELD INSPECTION</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink dark:text-white">
              Report Civic Issue
            </h3>
            <p className="text-xs text-ink/75 dark:text-gray-300 font-sans leading-relaxed">
              Photograph and geotag on-site potholes, waterlogging, broken streetlights, or garbage to earn Karma XP and mobilize municipal crews.
            </p>
          </Link>

        </div>

      </div>

      {/* ── SIGN OUT CONFIRMATION MODAL (PORTAL TO BODY) ── */}
      {showSignOutModal && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSignOutModal(false)}
        >
          <div 
            className="relative bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 text-left mx-auto transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Reticle Accents */}
            <div className="absolute top-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┌</div>
            <div className="absolute top-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┐</div>
            <div className="absolute bottom-2 left-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">└</div>
            <div className="absolute bottom-2 right-2 font-mono text-[10px] text-accent font-bold select-none opacity-40">┘</div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-card bg-red-500/15 text-severity-high border-2 border-severity-high/40 flex items-center justify-center flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">
                  // SESSION TERMINATION
                </span>
                <h3 className="font-display text-lg font-bold text-ink dark:text-white leading-tight">
                  Sign Out of Civic Lens?
                </h3>
              </div>
            </div>

            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Are you sure you want to end your current session? You will need to sign in again to submit reports or post case comments.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink-line dark:border-gray-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2.5 bg-paper dark:bg-gray-800 hover:bg-paper-sheet text-ink dark:text-white border border-ink-line dark:border-gray-700 rounded-button font-bold uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="px-5 py-2.5 bg-severity-high hover:bg-red-600 text-white font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer border-0 shadow-md active:scale-95"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
