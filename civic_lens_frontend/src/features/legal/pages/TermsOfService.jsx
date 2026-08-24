/**
 * ==============================================================================
 * CIVIC LENS — TERMS OF SERVICE & CITIZEN CHARTER
 * ==============================================================================
 * 
 * Formal Terms of Service, Civic Reporting Guidelines, and Data Protocols
 * for the Ahmedabad Civic Intelligence Grid.
 * ==============================================================================
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, FileText, ArrowLeft, CheckCircle2, 
  Crosshair, Lock, Scale, AlertTriangle, Building2, Sparkles 
} from 'lucide-react';

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0E131F] text-ink dark:text-gray-200 font-sans transition-colors duration-300 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-ink-line dark:border-gray-800 font-mono text-xs">
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 text-ink/70 dark:text-gray-400 hover:text-accent font-bold uppercase transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Registration</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase">
            <Crosshair className="w-3.5 h-3.5 text-accent" />
            <span>LEGAL CHARTER // REV 2026.08</span>
          </div>
        </div>

        {/* Header Title Card */}
        <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 sm:p-8 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
            <Scale className="w-3 h-3 text-accent" />
            <span>OFFICIAL CITIZEN TERMS & CIVIC CHARTER</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
            Civic Lens Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-ink/70 dark:text-gray-400 font-sans leading-relaxed">
            Effective Date: August 2026 · Operational Scope: Ahmedabad Municipal Corporation (AMC) Civic Reporting Grid.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase tracking-wider">
              <span>01 //</span>
              <span>Purpose & Civic Mandate</span>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Civic Lens is an open municipal technology platform that connects citizens with municipal departments to report, track, and resolve urban infrastructure defects across Ahmedabad (including potholes, road hazards, streetlights, garbage dumps, and waterlogging).
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase tracking-wider">
              <span>02 //</span>
              <span>Authentic Evidence & Telemetry Integrity</span>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              By submitting an issue, you warrant that all photographs, descriptions, and GPS locations represent genuine, on-site civic conditions. Intentionally submitting fabricated media, spoofed GPS coordinates, or off-topic imagery is strictly prohibited and leads to account suspension.
            </p>
            <div className="p-3 bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 rounded font-mono text-[11px] text-ink/70 dark:text-gray-400 space-y-1">
              <div>• Spatial Clustering: Reports within 50 meters of existing issues are automatically de-duplicated.</div>
              <div>• AI Vision Triage: Computer vision models classify severity and defect categories automatically.</div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase tracking-wider">
              <span>03 //</span>
              <span>Data Rights & Public Telemetry</span>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Photographs and geolocation coordinates uploaded to Civic Lens are made available to municipal engineers, field contractors, and the public dashboard to facilitate resolution tracking. Personal identifiers (passwords, phone numbers) remain private and encrypted.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase tracking-wider">
              <span>04 //</span>
              <span>Civic Karma & Community Verification</span>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Citizens earn Karma XP for verified reports, community upvotes, and post-repair resolution confirmations. Fraudulent upvote rings or spam submissions will result in forfeiture of civic reputation and tier standing.
            </p>
          </div>

          {/* Section 5 */}
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 shadow-md space-y-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent uppercase tracking-wider">
              <span>05 //</span>
              <span>Municipal SLA & Limitation of Liability</span>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Civic Lens operates as a reporting and dispatch intelligence platform. Repair timelines, municipal budgets, and work order execution are managed by the designated municipal zone authorities. Civic Lens is not liable for indirect municipal scheduling delays.
            </p>
          </div>

        </div>

        {/* Footer Accept & Return */}
        <div className="p-6 bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs shadow-xl">
          <span className="text-ink/60 dark:text-gray-400">
            QUESTIONS REGARDING CIVIC CHARTER? CONTACT CIVIC LENS AMC DESK.
          </span>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-ink hover:bg-amber-400 font-bold uppercase tracking-wider rounded-button shadow transition-all"
          >
            <span>Return to Sign Up</span>
            <CheckCircle2 className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
