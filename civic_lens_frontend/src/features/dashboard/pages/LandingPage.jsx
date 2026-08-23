/**
 * ==============================================================================
 * CIVIC LENS — LANDING PAGE (PAGE 1 OF 14 REDESIGN WITH SCROLL REVEALS)
 * ==============================================================================
 * DESIGN METAPHOR: Field-Survey / Site-Inspection Document Brought to Life
 * 
 * ANIMATION ENHANCEMENTS:
 * 1. IntersectionObserver Scroll Reveals: Every section and card dynamically enters
 *    with a smooth cubic-bezier fade & slide effect as the user scrolls down or up.
 * 2. Cascading Stagger Delays: Grid items (Checkpoints, Defect Categories, Resolution
 *    Snippets, FAQ items) appear with choreographed 100ms-150ms incremental offsets.
 * 3. Animated Live Ledger Counters: Numbers in the stats section smoothly count up
 *    using easeOutExpo easing when scrolled into view.
 * 4. Micro-Interactions & Hover Dynamics: Interactive Viewfinder scan pulses, card
 *    hover lifts, and reactive radar telemetry.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Camera, Map, MapPin, CheckCircle2, AlertTriangle, 
  Layers, ChevronDown, ChevronUp, Github, X, Loader2, 
  Crosshair, Compass, Activity, ShieldCheck, Droplets, 
  Trash2, Lightbulb, AlertOctagon, ArrowUpRight, TrendingUp
} from 'lucide-react';
import api from '../../../services/api';
import potholeSurveyImg from '../../../assets/pothole_field_survey.jpg';

/**
 * Reusable Scroll Reveal Wrapper with Intersection Observer
 */
function Reveal({ children, className = '', delay = 0, variant = 'fade-up', threshold = 0.15 }) {
  const [ref, setRef] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          // Re-trigger reveal on reverse scrolling for continuous dynamic feel
          setIsVisible(false);
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  const getVariantStyles = () => {
    if (variant === 'scale') {
      return isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8';
    }
    if (variant === 'slide-left') {
      return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10';
    }
    if (variant === 'slide-right') {
      return isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10';
    }
    return isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8';
  };

  return (
    <div
      ref={setRef}
      style={{ 
        transitionDuration: '750ms',
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' 
      }}
      className={`transition-all will-change-transform ${getVariantStyles()} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Animated Number Counter for Live Stats
 */
function AnimatedCounter({ target, decimals = 0, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    let animationFrame = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo function
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * target);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, [inView, target, duration]);

  return (
    <span ref={setRef}>
      {decimals > 0 
        ? count.toFixed(decimals) 
        : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  // Form states for support portal
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMunicipality, setContactMunicipality] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState('');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError('');

    api.post('/support-requests', {
      name: contactName,
      email: contactEmail,
      municipality: contactMunicipality,
      details: contactDetails
    })
      .then(() => {
        setIsSubmittingContact(false);
        setContactSubmitted(true);
        // Reset inputs
        setContactName('');
        setContactEmail('');
        setContactMunicipality('');
        setContactDetails('');
      })
      .catch((err) => {
        console.error('Contact submission failed:', err);
        setIsSubmittingContact(false);
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit request. Please try again.';
        setContactError(errMsg);
      });
  };

  const faqs = [
    {
      q: "How does the AI duplicate detector work?",
      a: "When you upload an issue, Civic Lens queries the database for active reports within a 20-meter radius using MongoDB 2dsphere indexing. It then compares image features via a 64-bit perceptual hash and embedding vectors. If they match the same physical defect, they are merged into one dossier to avoid spamming the ward engineer."
    },
    {
      q: "How do you prevent spam or false reports?",
      a: "The system runs three verification layers: active mobile GPS cross-checks, AI image validity analysis (verifying genuine on-site photos and discarding screen captures or web downloads), and community verification where neighboring residents upvote and corroborate the case."
    },
    {
      q: "Who is responsible for fixing the reported issues?",
      a: "Civic Lens automatically routes verified tickets to the designated municipal department (e.g. Roads & Buildings for potholes, Electrical/Lighting Division for streetlights, Solid Waste for illegal dumps) under the Ahmedabad Municipal grid."
    },
    {
      q: "Is there any charge for citizens to report issues?",
      a: "No. Civic Lens is an open, free civic utility designed to give citizens direct transparency and verifiable accountability over their neighborhood infrastructure."
    }
  ];

  return (
    <div className="bg-paper dark:bg-[#0E131F] min-h-screen flex flex-col justify-between overflow-x-hidden text-ink dark:text-gray-200 transition-colors duration-300 font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — Field-Survey Blueprint & Viewfinder
      ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center survey-grid">
        
        {/* Technical survey corner markings */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-ink/40 dark:text-gray-600 hidden sm:block">
          + GRID REF: 23.0225°N, 72.5714°E // AHMEDABAD SECTOR SURVEY
        </div>
        <div className="absolute top-4 right-4 font-mono text-[10px] text-ink/40 dark:text-gray-600 hidden sm:block">
          SURVEY SPEC: AMC-REV-2026.08 +
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Headline & Action CTAs */}
          <Reveal className="lg:col-span-7 text-left space-y-6" variant="fade-up" delay={50}>
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-card dark:bg-amber-950/20 border border-ink/20 dark:border-amber-500/30 rounded-button font-mono text-[11px] font-bold uppercase tracking-widest text-ink/80 dark:text-amber-400">
              <Crosshair className="w-3.5 h-3.5 text-accent" />
              <span>FIELD SURVEY & CIVIC ACCOUNTABILITY</span>
            </div>

            {/* Space Grotesk Display Headline in Sentence Case */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-ink dark:text-white">
              Photograph, classify, and track local infrastructure defect resolution.
            </h1>

            {/* Subheadline in Citizen POV */}
            <p className="text-base sm:text-lg text-ink/80 dark:text-gray-300 leading-relaxed max-w-2xl font-normal">
              Turn road craters, waterlogging, illegal dumps, and broken streetlights into public, tracked inspection dossiers. Machine learning classifies the issue and clusters duplicate neighborhood reports into one high-priority municipal work order.
            </p>

            {/* Action Buttons: Solid Stamp + Sharp Field Secondary Button */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-7 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-button bg-accent text-ink hover:bg-amber-400 active:scale-97 transition-all shadow-md shadow-accent/20 border border-amber-600/30 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>File a report</span>
              </Link>
              
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 px-7 py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-button border-2 border-ink dark:border-gray-600 bg-paper-sheet dark:bg-[#151B26] text-ink dark:text-white hover:border-accent dark:hover:border-accent hover:bg-paper-card dark:hover:bg-[#1C2436] transition-all active:scale-97 shadow-md cursor-pointer group"
              >
                <Map className="w-4 h-4 text-primary dark:text-amber-400 group-hover:scale-110 transition-transform" />
                <span>View the map</span>
              </Link>
            </div>

            {/* Micro Telemetry Footer Strip */}
            <div className="pt-3 border-t border-ink-line dark:border-gray-800 flex flex-wrap items-center gap-4 text-[11px] font-mono text-ink/60 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-severity-low animate-pulse" />
                <span>AHMEDABAD MUNICIPAL GRID ACTIVE</span>
              </span>
              <span>•</span>
              <span>ZERO CITIZEN FEES</span>
              <span>•</span>
              <span>OPEN AUDIT TRAIL</span>
            </div>

          </Reveal>

          {/* Right Column: Signature Viewfinder & Telemetry Scanner */}
          <Reveal className="lg:col-span-5 flex justify-center" variant="scale" delay={150}>
            <div className="w-full max-w-md bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-accent hover:shadow-accent/10">
              
              {/* Header Strip */}
              <div className="flex justify-between items-center border-b-2 border-ink/20 dark:border-gray-800 pb-3 mb-3 font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-severity-high animate-ping" />
                  <span className="text-[11px] font-bold tracking-wider text-ink dark:text-amber-400 uppercase">INSPECTION INSTRUMENT</span>
                </div>
                <span className="text-[10px] text-ink/50 dark:text-gray-500 font-bold">CASE #AMD-2026-0891</span>
              </div>

              {/* Viewfinder Capture Screen */}
              <div className="relative aspect-[4/3] bg-gray-950 rounded-card overflow-hidden border border-ink/30 dark:border-gray-700 flex items-center justify-center group">
                
                {/* Background Defect Image */}
                <img 
                  src={potholeSurveyImg} 
                  alt="On-site pothole field survey defect measurement" 
                  className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-700" 
                />

                {/* Viewfinder Target Reticle / Corner Crop Marks */}
                <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
                  <div className="flex justify-between text-accent font-mono text-xs">
                    <span>┌</span>
                    <span>┐</span>
                  </div>
                  <div className="self-center flex items-center justify-center w-12 h-12 rounded-full border border-dashed border-accent/60 animate-pulse">
                    <Crosshair className="w-6 h-6 text-accent/90" />
                  </div>
                  <div className="flex justify-between text-accent font-mono text-xs">
                    <span>└</span>
                    <span>┘</span>
                  </div>
                </div>

                {/* Laser Scanning Line */}
                <div className="absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_12px_2px_#E8A33D] ai-scan-line pointer-events-none" />

                {/* HUD Geotag Overlays */}
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[9px] font-mono text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>23.0225° N, 72.5714° E</span>
                </div>

                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[9px] font-mono text-green-400 border border-green-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-green-400" />
                  <span>98.4% CONFIDENCE</span>
                </div>
              </div>

              {/* Classification Telemetry Readout */}
              <div className="mt-4 space-y-2.5 font-mono text-xs">
                
                {/* Defect Class */}
                <div className="flex justify-between items-center bg-paper dark:bg-gray-900/60 px-3 py-2 rounded border border-ink-line dark:border-gray-800">
                  <span className="text-ink/60 dark:text-gray-400 uppercase text-[10px] font-bold">Defect Class:</span>
                  <span className="font-bold text-ink dark:text-white flex items-center gap-1 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                    <span>POTHOLE & SURFACE COLLAPSE</span>
                  </span>
                </div>

                {/* Severity Stamp */}
                <div className="flex justify-between items-center bg-paper dark:bg-gray-900/60 px-3 py-2 rounded border border-ink-line dark:border-gray-800">
                  <span className="text-ink/60 dark:text-gray-400 uppercase text-[10px] font-bold">Severity Rating:</span>
                  <span className="px-2 py-0.5 rounded font-black text-[10px] bg-red-100 dark:bg-red-950/60 text-severity-high border border-severity-high/40 uppercase tracking-widest">
                    HIGH PRIORITY
                  </span>
                </div>

                {/* Deduplication Cluster */}
                <div className="flex justify-between items-center bg-paper dark:bg-gray-900/60 px-3 py-2 rounded border border-ink-line dark:border-gray-800">
                  <span className="text-ink/60 dark:text-gray-400 uppercase text-[10px] font-bold">Spatial Cluster:</span>
                  <span className="font-bold text-severity-low flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>MERGED INTO CASE #104</span>
                  </span>
                </div>

              </div>

              {/* Official Seal Footnote */}
              <div className="mt-3 pt-2 border-t border-dashed border-ink/30 dark:border-gray-800 flex justify-between items-center text-[9px] font-mono text-ink/50 dark:text-gray-500">
                <span>SEAL: VERIFIED AUDIT SPEC</span>
                <span className="font-bold text-accent uppercase">AMC PILOT DEPLOYED</span>
              </div>

            </div>
          </Reveal>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW IT WORKS — CASE-FILE CHECKPOINTS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t-2 border-ink dark:border-gray-800">
        
        {/* Section Header */}
        <Reveal className="text-left max-w-2xl mb-14 space-y-2">
          <div className="font-mono text-xs font-bold text-accent uppercase tracking-widest">
            // THREE-STAGE FIELD INSPECTION WORKFLOW
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink dark:text-white tracking-tight">
            From field capture to pavement repair
          </h2>
          <p className="text-sm sm:text-base text-ink/80 dark:text-gray-300">
            How your mobile snapshot transforms into an authenticated municipal work order in three systematic checkpoints.
          </p>
        </Reveal>

        {/* 3 Checkpoint Cards with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Checkpoint 01 */}
          <Reveal delay={0} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-6 flex flex-col justify-between space-y-6 hover:border-accent transition-all h-full shadow-md">
              <div className="space-y-4">
                <div className="flex justify-between items-start font-mono">
                  <span className="px-2.5 py-1 bg-ink text-paper dark:bg-amber-500 dark:text-black font-bold text-xs rounded-button">
                    CHECKPOINT 01
                  </span>
                  <span className="text-[10px] text-ink/50 dark:text-gray-400 font-bold uppercase">CAPTURE</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white leading-snug">
                  Photograph & Geotag on Site
                </h3>
                <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed">
                  Capture the infrastructure defect. The platform locks your precise GPS coordinates, ensuring municipal engineers know the exact physical coordinates on the city grid.
                </p>
              </div>
              
              <div className="pt-4 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-amber-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-accent" />
                <span>INPUT: IMAGE + 2DSPHERE GEOTAG</span>
              </div>
            </div>
          </Reveal>

          {/* Checkpoint 02 */}
          <Reveal delay={120} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-6 flex flex-col justify-between space-y-6 hover:border-accent transition-all h-full shadow-md">
              <div className="space-y-4">
                <div className="flex justify-between items-start font-mono">
                  <span className="px-2.5 py-1 bg-ink text-paper dark:bg-amber-500 dark:text-black font-bold text-xs rounded-button">
                    CHECKPOINT 02
                  </span>
                  <span className="text-[10px] text-ink/50 dark:text-gray-400 font-bold uppercase">CLASSIFY</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white leading-snug">
                  AI Telemetry & Deduplication
                </h3>
                <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed">
                  Neural vision models classify the issue category and score severity. Reports within a 20-meter radius automatically merge into a single consolidated ticket.
                </p>
              </div>
              
              <div className="pt-4 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span>TECH: 64-BIT AHASH + EMBEDDINGS</span>
              </div>
            </div>
          </Reveal>

          {/* Checkpoint 03 */}
          <Reveal delay={240} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-6 flex flex-col justify-between space-y-6 hover:border-accent transition-all h-full shadow-md">
              <div className="space-y-4">
                <div className="flex justify-between items-start font-mono">
                  <span className="px-2.5 py-1 bg-ink text-paper dark:bg-amber-500 dark:text-black font-bold text-xs rounded-button">
                    CHECKPOINT 03
                  </span>
                  <span className="text-[10px] text-ink/50 dark:text-gray-400 font-bold uppercase">RESOLVE</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white leading-snug">
                  Ward Dispatch & Citizen Sign-Off
                </h3>
                <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed">
                  The consolidated work order routes to the ward engineer. Once repairs conclude, local citizens verify the fix with resolution sign-offs to close the audit trail.
                </p>
              </div>
              
              <div className="pt-4 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-severity-low" />
                <span>OUTCOME: VERIFIED PHYSICAL FIX</span>
              </div>
            </div>
          </Reveal>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ISSUE CATEGORIES SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t-2 border-ink dark:border-gray-800 bg-paper-sheet dark:bg-[#0B0F19]">
        
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-accent uppercase tracking-widest">// CLASSIFICATION PROTOCOLS</span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink dark:text-white tracking-tight">
              Reportable defect categories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ink/70 dark:text-gray-400 max-w-md">
            Clear technical criteria on what qualifies for an immediate municipal field investigation.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Category 1: Pothole */}
          <Reveal delay={0}>
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-4 hover:border-ink dark:hover:border-amber-400 transition-colors h-full shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-button bg-red-500/10 border border-red-500/30 flex items-center justify-center text-severity-high">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  TARGET: 4 DAYS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">Pothole & Surface Collapse</h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Asphalt craters, road cave-ins, deep trench depressions, and cracked bitumen causing vehicular hazards or pedestrian injury risk.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ROUTED: ROADS & BUILDINGS DEPT
              </div>
            </div>
          </Reveal>

          {/* Category 2: Waterlogging */}
          <Reveal delay={80}>
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-4 hover:border-ink dark:hover:border-amber-400 transition-colors h-full shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-button bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-primary dark:text-blue-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  TARGET: 48 HOURS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">Waterlogging & Drainage Failure</h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Submerged underpasses, blocked storm culverts, persistent rainwater ponding on transit corridors, and overflowing municipal sewer lines.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ROUTED: DRAINAGE & SEWERAGE WING
              </div>
            </div>
          </Reveal>

          {/* Category 3: Streetlight */}
          <Reveal delay={160}>
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-4 hover:border-ink dark:hover:border-amber-400 transition-colors h-full shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-button bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-accent">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  TARGET: 48 HOURS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">Streetlight & Electrical Fault</h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Non-functioning sodium/LED poles, unlit public walkways, dangling wiring hazards, broken fixtures, and damaged feeder pillars.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ROUTED: ELECTRICAL DIVISION
              </div>
            </div>
          </Reveal>

          {/* Category 4: Garbage */}
          <Reveal delay={240}>
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-4 hover:border-ink dark:hover:border-amber-400 transition-colors h-full shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-button bg-green-500/10 border border-green-500/30 flex items-center justify-center text-severity-low">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  TARGET: 24 HOURS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">Garbage & Illegal Dumping</h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Overflowing municipal bins, uncollected curbside waste heaps, unauthorized commercial construction debris dumps, and vacant plot littering.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ROUTED: SOLID WASTE MANAGEMENT
              </div>
            </div>
          </Reveal>

          {/* Category 5: Other Public Hazards */}
          <Reveal delay={320} className="sm:col-span-2 lg:col-span-2">
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink-line dark:border-gray-800 p-6 rounded-card space-y-4 hover:border-ink dark:hover:border-amber-400 transition-colors h-full shadow-sm">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-button bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300">
                  TARGET: 3 DAYS
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">Other Public Safety Hazards</h3>
              <p className="text-xs text-ink/80 dark:text-gray-300 leading-relaxed">
                Missing manhole covers, hazardous fallen branches obstructing roadways, broken safety railings on bridges, damaged traffic signage, and dangerous footpath encroachments.
              </p>
              <div className="font-mono text-[10px] text-ink/50 dark:text-gray-500 uppercase pt-2 border-t border-dashed border-ink-line dark:border-gray-800">
                ROUTED: ZONAL EMERGENCY OPERATIONS
              </div>
            </div>
          </Reveal>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. LIVE IMPACT / STATS BAND (ANIMATED RECORD SO FAR)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-paper-card dark:bg-[#131A26] border-y-2 border-ink dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <Reveal className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ink-line dark:border-gray-800 font-mono text-xs">
            <span className="font-bold text-ink dark:text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-accent" />
              <span>THE MUNICIPAL RECORD SO FAR // REAL RESOLUTION TELEMETRY</span>
            </span>
            <span className="text-ink/60 dark:text-gray-400 text-[11px]">
              DATA AGGREGATED FROM 48 AHMEDABAD MUNICIPAL WARDS
            </span>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-left">
            
            <Reveal delay={0}>
              <div className="p-4 bg-paper dark:bg-gray-900/50 border border-ink-line dark:border-gray-800 rounded-card space-y-1 shadow-sm">
                <div className="font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">Cases Filed</div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-amber-400">
                  <AnimatedCounter target={45280} suffix="+" />
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">Citizen inspection reports</p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="p-4 bg-paper dark:bg-gray-900/50 border border-ink-line dark:border-gray-800 rounded-card space-y-1 shadow-sm">
                <div className="font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">Resolution Rate</div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-severity-low">
                  <AnimatedCounter target={86.4} decimals={1} suffix="%" />
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">Closed with field sign-off</p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="p-4 bg-paper dark:bg-gray-900/50 border border-ink-line dark:border-gray-800 rounded-card space-y-1 shadow-sm">
                <div className="font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">Avg Turnaround</div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-amber-400">
                  <AnimatedCounter target={4.2} decimals={1} suffix=" Days" />
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">From photo to physical fix</p>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="p-4 bg-paper dark:bg-gray-900/50 border border-ink-line dark:border-gray-800 rounded-card space-y-1 shadow-sm">
                <div className="font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">Wards Covered</div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-amber-400">
                  <AnimatedCounter target={48} suffix=" / 48" />
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">City-wide grid integration</p>
              </div>
            </Reveal>

            <Reveal delay={320} className="col-span-2 md:col-span-1">
              <div className="p-4 bg-paper dark:bg-gray-900/50 border border-ink-line dark:border-gray-800 rounded-card space-y-1 shadow-sm h-full">
                <div className="font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest flex items-center gap-1 text-accent">
                  <TrendingUp className="w-3 h-3" />
                  <span>Top Ward</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink dark:text-white">Zone 03</h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">Navrangpura (+38% velocity)</p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. COMMUNITY VOICES / RECENT RESOLUTIONS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <Reveal className="text-left max-w-xl mb-12 space-y-2">
          <div className="font-mono text-xs font-bold text-accent uppercase tracking-widest">
            // VERIFIED FIELD OUTCOMES
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink dark:text-white tracking-tight">
            Recent case resolutions
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300">
            Real field reports filed by neighborhood citizens and confirmed repaired by the municipal ward engineer.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Resolution Snippet 1 */}
          <Reveal delay={0} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-5 space-y-3 flex flex-col justify-between hover:border-accent transition-all h-full shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-ink/60 dark:text-gray-400 pb-2 border-b border-ink-line dark:border-gray-800">
                  <span>#AMD-8412</span>
                  <span className="px-1.5 py-0.5 rounded bg-severity-low/10 text-severity-low font-bold">FIXED IN 6D</span>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-primary dark:text-blue-400 uppercase">
                  WATERLOGGING // ZONE 01 (CENTRAL)
                </span>
                <p className="text-xs text-ink/90 dark:text-gray-200 leading-relaxed italic">
                  "Reported a heavily flooded underpass near MG Road after the first monsoon shower. Drainage team cleared the choked culvert in 6 days."
                </p>
              </div>
              <div className="pt-2 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-gray-400">
                Sign-off: 14 Neighbors Verified
              </div>
            </div>
          </Reveal>

          {/* Resolution Snippet 2 */}
          <Reveal delay={100} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-5 space-y-3 flex flex-col justify-between hover:border-accent transition-all h-full shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-ink/60 dark:text-gray-400 pb-2 border-b border-ink-line dark:border-gray-800">
                  <span>#AMD-7933</span>
                  <span className="px-1.5 py-0.5 rounded bg-severity-low/10 text-severity-low font-bold">FIXED IN 3D</span>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-severity-high uppercase">
                  ROAD CRATER // ZONE 07 (WEST)
                </span>
                <p className="text-xs text-ink/90 dark:text-gray-200 leading-relaxed italic">
                  "Dangerous 8-inch pothole near SG Highway service lane. Upvoted by 18 commuters and patched within 72 hours."
                </p>
              </div>
              <div className="pt-2 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-gray-400">
                Sign-off: R&B Road Crew Batch #9
              </div>
            </div>
          </Reveal>

          {/* Resolution Snippet 3 */}
          <Reveal delay={200} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-5 space-y-3 flex flex-col justify-between hover:border-accent transition-all h-full shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-ink/60 dark:text-gray-400 pb-2 border-b border-ink-line dark:border-gray-800">
                  <span>#AMD-8045</span>
                  <span className="px-1.5 py-0.5 rounded bg-severity-low/10 text-severity-low font-bold">FIXED IN 48H</span>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-accent uppercase">
                  STREETLIGHT // ZONE 04 (NORTH-WEST)
                </span>
                <p className="text-xs text-ink/90 dark:text-gray-200 leading-relaxed italic">
                  "Four continuous dark street poles in Vastrapur Colony made the street unsafe at night. Replaced and illuminated in 48 hours."
                </p>
              </div>
              <div className="pt-2 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-gray-400">
                Sign-off: Ward Electric Unit
              </div>
            </div>
          </Reveal>

          {/* Resolution Snippet 4 */}
          <Reveal delay={300} className="h-full">
            <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-5 space-y-3 flex flex-col justify-between hover:border-accent transition-all h-full shadow-sm">
              <div className="space-y-2">
                <div className="flex justify-between items-center font-mono text-[10px] text-ink/60 dark:text-gray-400 pb-2 border-b border-ink-line dark:border-gray-800">
                  <span>#AMD-8201</span>
                  <span className="px-1.5 py-0.5 rounded bg-severity-low/10 text-severity-low font-bold">FIXED IN 4D</span>
                </div>
                <span className="inline-block text-[10px] font-mono font-bold text-severity-low uppercase">
                  GARBAGE DUMP // ZONE 02 (EAST)
                </span>
                <p className="text-xs text-ink/90 dark:text-gray-200 leading-relaxed italic">
                  "Unregulated commercial debris heap accumulating near Sabarmati riverfront sector. Cleared completely by solid waste trucks."
                </p>
              </div>
              <div className="pt-2 border-t border-dashed border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/60 dark:text-gray-400">
                Sign-off: SWM Clean Squad
              </div>
            </div>
          </Reveal>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. MAP PREVIEW TEASER
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-paper-sheet dark:bg-[#0B0F19] border-t-2 border-ink dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Reveal variant="scale">
            <div className="bg-paper dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card p-6 sm:p-10 relative overflow-hidden shadow-xl">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Details */}
                <div className="lg:col-span-6 space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-card dark:bg-amber-950/20 border border-ink/20 dark:border-amber-500/30 rounded-button font-mono text-[11px] font-bold uppercase tracking-widest text-ink/80 dark:text-amber-400">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>GEOSPATIAL DEFECT HEATMAP</span>
                  </div>
                  
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
                    Explore active defect cases across the city grid
                  </h2>

                  <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed">
                    Every reported issue is plotted on our live Leaflet heatmap. Filter by issue severity, verify active repairs in your sector, and track municipal work orders as they move from Reported to Resolved.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-button bg-accent text-ink hover:bg-amber-400 transition-all shadow-md active:scale-97 cursor-pointer"
                    >
                      <Map className="w-4 h-4" />
                      <span>Open live heatmap</span>
                    </Link>
                    <Link
                      to="/report"
                      className="inline-flex items-center gap-2 px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider rounded-button border border-ink-line dark:border-gray-700 bg-paper-card dark:bg-gray-800 text-ink dark:text-gray-200 hover:bg-paper-sheet dark:hover:bg-gray-700 transition-all cursor-pointer"
                    >
                      <span>Submit new geotag</span>
                    </Link>
                  </div>
                </div>

                {/* Right Teaser Map Mockup */}
                <div className="lg:col-span-6">
                  <div className="relative aspect-[16/10] bg-gray-900 rounded-card overflow-hidden border-2 border-ink dark:border-gray-700 shadow-inner group">
                    
                    {/* Stylized Map Vector Background */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]" />
                    
                    {/* Grid Lines */}
                    <svg className="absolute inset-0 w-full h-full stroke-gray-700/40" xmlns="http://www.w3.org/2000/svg">
                      <line x1="20%" y1="0" x2="20%" y2="100%" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="1" />
                      <line x1="80%" y1="0" x2="80%" y2="100%" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="30%" x2="100%" y2="30%" strokeWidth="1" strokeDasharray="4 4" />
                      <line x1="0" y1="65%" x2="100%" y2="65%" strokeWidth="1" />
                    </svg>

                    {/* Sample Pins on Map Preview */}
                    <div className="absolute top-[28%] left-[25%] flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-severity-high/30 animate-ping" />
                      <span className="relative w-3 h-3 rounded-full bg-severity-high border border-white shadow" />
                    </div>

                    <div className="absolute top-[55%] left-[60%] flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-accent/30 animate-ping" />
                      <span className="relative w-3 h-3 rounded-full bg-accent border border-white shadow" />
                    </div>

                    <div className="absolute top-[40%] left-[78%] flex items-center justify-center">
                      <span className="absolute w-6 h-6 rounded-full bg-severity-low/30 animate-ping" />
                      <span className="relative w-3 h-3 rounded-full bg-severity-low border border-white shadow" />
                    </div>

                    {/* Teaser Popup Card Overlay */}
                    <div className="absolute top-[20%] right-[10%] sm:right-[15%] max-w-[200px] bg-black/85 backdrop-blur-md p-3 rounded-card border border-gray-700 font-mono text-[10px] text-white shadow-xl">
                      <div className="flex justify-between items-center text-[9px] text-amber-400 font-bold mb-1">
                        <span>CASE #104</span>
                        <span className="text-red-400">HIGH</span>
                      </div>
                      <p className="font-bold text-white text-[11px] truncate">Pothole on SG Road</p>
                      <div className="flex justify-between items-center text-gray-400 text-[9px] mt-1 pt-1 border-t border-gray-800">
                        <span>12 Upvotes</span>
                        <span className="text-green-400">In Progress</span>
                      </div>
                    </div>

                    {/* Bottom Map Status Strip */}
                    <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded font-mono text-[10px] text-gray-300 flex justify-between items-center border border-gray-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span>AHMEDABAD LIVE FEED: 142 ACTIVE PINS</span>
                      </span>
                      <Link to="/dashboard" className="text-amber-400 hover:underline flex items-center gap-0.5">
                        <span>ENTER MAP</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </Reveal>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. PUBLIC UTILITY STATEMENT & MUNICIPAL INTEGRATION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-paper dark:bg-[#131A26] border-y-2 border-ink dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          
          <Reveal variant="fade-up" className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-button bg-severity-low/10 text-severity-low border border-severity-low/30 font-mono text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>FREE CIVIC UTILITY SPECIFICATION</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-bold text-ink dark:text-white tracking-tight">
              Zero citizen fees. 100% open governance.
            </h2>

            <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Civic Lens operates as an open-access public service framework. Citizens pay nothing to photograph or track issues. Municipal admin portals integrate freely to optimize ward resource allocation and maintain civic trust.
            </p>
          </Reveal>

          <Reveal delay={120} variant="scale">
            <div className="bg-paper-card dark:bg-[#151B26] p-6 rounded-card border-2 border-dashed border-ink/40 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-left max-w-2xl mx-auto mt-4 shadow-md">
              <div>
                <h4 className="font-bold text-sm text-ink dark:text-white font-mono uppercase">PILOT CIVIC LENS IN YOUR MUNICIPAL ZONE?</h4>
                <p className="text-xs text-ink/70 dark:text-gray-400 mt-0.5">Request custom ward dashboards, live API integration, and audit modules.</p>
              </div>
              <button 
                onClick={() => { setShowContactModal(true); setContactSubmitted(false); }}
                className="px-5 py-3 bg-ink text-paper dark:bg-amber-500 dark:text-black font-mono font-bold uppercase text-xs rounded-button hover:bg-ink-muted dark:hover:bg-amber-400 transition-colors whitespace-nowrap active:scale-95 border-0 cursor-pointer shadow-sm"
              >
                Contact Admin Support
              </button>
            </div>
          </Reveal>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full space-y-8">
        
        <Reveal className="text-left space-y-2">
          <div className="font-mono text-xs font-bold text-accent uppercase tracking-widest">
            // SPECIFICATION FAQ
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-400">
            Details on machine learning classification, data retention, and municipal workflows.
          </p>
        </Reveal>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 80}>
              <div 
                className="bg-paper-card dark:bg-[#151B26] rounded-card border-2 border-ink/20 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:border-ink dark:hover:border-gray-700 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-ink dark:text-white hover:bg-paper-sheet/50 dark:hover:bg-gray-800/30 transition-colors border-0 bg-transparent cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-accent shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-ink/40 dark:text-gray-500 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-ink/80 dark:text-gray-300 leading-relaxed border-t border-dashed border-ink-line dark:border-gray-800 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FINAL CALL TO ACTION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative py-20 bg-ink dark:bg-[#070A11] text-paper overflow-hidden text-center border-t-2 border-ink dark:border-gray-800">
        <Reveal variant="scale" className="max-w-3xl mx-auto px-4 space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-button bg-accent/20 text-accent font-mono text-[10px] font-bold uppercase tracking-widest">
            <span>GET INVOLVED // REPORT A DEFECT</span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Ready to inspect and improve your neighborhood?
          </h2>
          
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of active citizens mapping infrastructure defects, voting on urgent repairs, and demanding accountability across Ahmedabad.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider rounded-button bg-accent text-ink hover:bg-amber-400 transition-all shadow-lg active:scale-97 cursor-pointer border-0"
            >
              <Camera className="w-4 h-4" />
              <span>File a report now</span>
            </Link>
            
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 font-mono text-xs font-bold uppercase tracking-wider rounded-button bg-gray-900 hover:bg-gray-800 text-white border border-gray-700 transition-colors cursor-pointer"
            >
              <span>Create citizen account</span>
            </Link>
          </div>

        </Reveal>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. FOOTER SECTION — Municipal Registry
      ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A1826] dark:bg-[#05080E] py-12 text-gray-400 text-xs border-t border-gray-900 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800/80 pb-8 text-left">
          
          {/* Logo brand footer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-accent text-ink p-2 rounded-card">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tight text-white">
                Civic<span className="text-accent font-normal">Lens</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-xs">
              AI-driven field survey platform converting visual complaint photos into immediate municipal solutions.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Citizen Portal</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/dashboard" className="hover:text-amber-400 transition-colors">Map Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-amber-400 transition-colors">File Report</Link></li>
              <li><Link to="/my-reports" className="hover:text-amber-400 transition-colors">My Submissions</Link></li>
              <li><Link to="/leaderboard" className="hover:text-amber-400 transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Civic Resources</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setShowGuidelinesModal(true)} 
                  className="hover:text-amber-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-gray-400 font-mono text-xs"
                >
                  Reporting Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setShowContactModal(true); setContactSubmitted(false); }} 
                  className="hover:text-amber-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-gray-400 font-mono text-xs"
                >
                  Contact Support Portal
                </button>
              </li>
              <li><a href="https://data.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">National Open Data</a></li>
              <li className="text-gray-400 font-semibold text-[11px] select-none">AMC Helpline: 155303</li>
            </ul>
          </div>

          {/* Social / Info */}
          <div className="space-y-3 font-mono">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Project Repository</h4>
            <div className="flex gap-3">
              <a 
                href="https://github.com/Tanish1808/Civic-Lens" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-gray-900 rounded-button hover:bg-gray-800 hover:text-amber-400 transition-colors inline-flex border border-gray-800"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
            <p className="text-gray-500 text-[11px]">Ahmedabad Municipal Pilot Project.</p>
          </div>

        </div>

        {/* Copyright Tag */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 font-mono text-[11px]">
          <p>© 2026 Civic Lens. Open-source under MIT Licence.</p>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          11. MUNICIPALITY SUPPORT PORTAL MODAL OVERLAY
      ───────────────────────────────────────────────────────────── */}
      {showContactModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowContactModal(false)}
          />
          
          {/* Modal Card with Permit Stamp Aesthetic */}
          <div className="bg-paper-card dark:bg-[#151B26] rounded-card shadow-2xl border-2 border-ink dark:border-gray-700 p-6 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-ink/60 dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!contactSubmitted ? (
              <form 
                onSubmit={handleContactSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                    // MUNICIPAL INTAKE FORM
                  </div>
                  <h3 className="font-display text-2xl font-bold text-ink dark:text-white">
                    Contact Admin Support
                  </h3>
                  <p className="text-xs text-ink/70 dark:text-gray-400">
                    Request custom ward dashboards, direct API keys, or pilot integration details.
                  </p>
                </div>

                {contactError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-severity-high/40 rounded-button text-severity-high text-xs font-semibold">
                    {contactError}
                  </div>
                )}

                <div className="space-y-3 font-mono">
                  <div>
                    <label className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Rohan Sharma" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-ink-line dark:border-gray-700 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-paper dark:bg-gray-900 text-ink dark:text-gray-200" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Official Email
                    </label>
                    <input 
                      required 
                      type="email" 
                      placeholder="rohan@ahmedabadmunicipal.gov.in" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full border border-ink-line dark:border-gray-700 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-paper dark:bg-gray-900 text-ink dark:text-gray-200" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Municipality / City Zone
                    </label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ahmedabad Municipal Corporation" 
                      value={contactMunicipality}
                      onChange={(e) => setContactMunicipality(e.target.value)}
                      className="w-full border border-ink-line dark:border-gray-700 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-paper dark:bg-gray-900 text-ink dark:text-gray-200" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-ink/80 dark:text-gray-400 uppercase tracking-wider mb-1">
                      Inquiry Details
                    </label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="We would like to request a demo of the municipal dashboard for our city ward..." 
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      className="w-full border border-ink-line dark:border-gray-700 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent bg-paper dark:bg-gray-900 text-ink dark:text-gray-200 font-sans" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 py-2.5 border border-ink-line dark:border-gray-700 text-xs font-bold text-ink dark:text-gray-300 rounded-button bg-paper dark:bg-gray-800 hover:bg-paper-sheet dark:hover:bg-gray-700 transition-colors text-center cursor-pointer"
                    disabled={isSubmittingContact}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-accent text-ink hover:bg-amber-400 text-xs font-bold uppercase rounded-button shadow-md transition-colors text-center flex items-center justify-center gap-1.5 border-0 cursor-pointer"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/40 text-severity-low rounded-full flex items-center justify-center mx-auto border border-severity-low/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-ink dark:text-white">
                    Request Logged!
                  </h3>
                  <p className="text-xs text-ink/70 dark:text-gray-300 max-w-xs mx-auto leading-relaxed">
                    Thank you. Our administration support team will review your ward credentials and reply within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-6 py-2.5 bg-accent text-ink font-mono text-xs font-bold uppercase rounded-button shadow-md hover:bg-amber-400 transition-colors border-0 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          12. REPORTING GUIDELINES MODAL OVERLAY
      ───────────────────────────────────────────────────────────── */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
            onClick={() => setShowGuidelinesModal(false)}
          />
          
          {/* Modal Card */}
          <div className="bg-paper-card dark:bg-[#151B26] rounded-card shadow-2xl border-2 border-ink dark:border-gray-700 p-6 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setShowGuidelinesModal(false)}
              className="absolute top-4 right-4 text-ink/60 dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                  // FIELD COMPLIANCE
                </div>
                <h3 className="font-display text-2xl font-bold text-ink dark:text-white">
                  Reporting Guidelines
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-400">
                  Follow these steps to ensure swift ML classification and municipal dispatch.
                </p>
              </div>

              <div className="border-t border-dashed border-ink-line dark:border-gray-800 pt-3 space-y-3.5 text-xs text-ink dark:text-gray-300">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-button bg-accent text-ink flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-ink dark:text-white font-mono uppercase text-[11px]">Capture a Clear, Direct Photo</h4>
                    <p className="text-ink/70 dark:text-gray-400 text-[11px] leading-relaxed">
                      Take a well-lit picture of the physical street defect. Do not photograph computer screens, printed paper, or unrelated objects.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-button bg-accent text-ink flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-ink dark:text-white font-mono uppercase text-[11px]">Enable Accurate GPS Location</h4>
                    <p className="text-ink/70 dark:text-gray-400 text-[11px] leading-relaxed">
                      Allow browser GPS permissions while standing near the defect. High-precision geotags are required for 20m radial deduplication.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-button bg-accent text-ink flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-ink dark:text-white font-mono uppercase text-[11px]">Verify The Defect Category</h4>
                    <p className="text-ink/70 dark:text-gray-400 text-[11px] leading-relaxed">
                      Select the closest category (Pothole, Waterlogging, Streetlight, Garbage). The ML classifier will cross-verify your selection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-ink-line dark:border-gray-800 pt-4 flex">
                <button
                  onClick={() => setShowGuidelinesModal(false)}
                  className="w-full py-2.5 bg-accent text-ink font-mono text-xs font-bold uppercase rounded-button shadow-md hover:bg-amber-400 transition-colors text-center border-0 cursor-pointer"
                >
                  Understood // Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
