import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Map, ShieldAlert, Award, ArrowRight, Eye, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-[#FAFBFD] min-h-[calc(100vh-64px)] flex flex-col justify-between overflow-x-hidden">
      {/* Mesh Gradient Hero Section */}
      <div className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        
        {/* Soft Background Mesh Blobs */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-1/4 translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Pulsing Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>AI-Powered Civic Accountability</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
              Make Your Civic Issues <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Visible & Actionable</span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
              OPopaque municipal systems are a thing of the past. Report infrastructure issues with a simple photo + geotag. Civic Lens uses machine learning to categorize reports and merge duplicate complaints in real-time, placing transparent pressure on municipal resolutions.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report"
                className="flex items-center gap-2.5 px-8 py-4 text-sm font-extrabold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Report an Issue</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-8 py-4 text-sm font-extrabold rounded-button bg-white text-text-primary border border-gray-200 hover:bg-gray-50/80 transition-all duration-300 shadow-sm active:scale-95"
              >
                <Map className="w-4 h-4 text-primary" />
                <span>View Live Heatmap</span>
              </Link>
            </div>
          </div>

          {/* Right Column: AI Simulator Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-card shadow-2xl shadow-gray-200/80 border border-gray-100 p-6 relative overflow-hidden transition-all duration-500 hover:shadow-primary/5 hover:scale-[1.01]">
              {/* Glassmorphic border lines */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              
              {/* Simulator Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Inference Engine</span>
              </div>

              {/* Photo representation */}
              <div className="relative aspect-video bg-gray-900 rounded-card overflow-hidden flex items-center justify-center border border-gray-200/50">
                {/* Simulated scan line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent/80 shadow-md shadow-accent animate-[bounce_3s_infinite]" />
                
                {/* Mock photo contents using CSS shapes */}
                <div className="w-full h-full p-4 flex flex-col justify-between items-center text-gray-500 text-xs">
                  <div className="self-start px-2 py-1 bg-black/60 rounded backdrop-blur-sm text-[10px] text-white flex items-center gap-1 font-mono">
                    <MapPinIcon className="w-3 h-3 text-accent" />
                    <span>23.0225° N, 72.5714° E</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Simulated Photo Scan</span>
                  <div className="self-end px-2 py-1 bg-black/60 rounded backdrop-blur-sm text-[10px] text-white font-mono">
                    <span>98.6% MATCH</span>
                  </div>
                </div>
              </div>

              {/* Prediction details */}
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Classified Category:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                    <span>Pothole</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Assigned Severity:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-red-100 text-red-800 tracking-wider">
                    High Priority
                  </span>
                </div>

                {/* Simulated Duplicate Search */}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Duplicate Scanner:</span>
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Merged to Ticket #12</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Feature Pillar Cards */}
      <div className="border-t border-gray-200/60 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">How Civic Lens Works</h2>
            <p className="text-sm text-text-secondary mt-2">A three-stage automated process turning report photos into resolved actions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group bg-[#FAFBFD] p-8 rounded-card border border-gray-200/50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-blue-50 text-primary rounded-card shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Camera className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-md mt-6">1. AI Image Classification</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Fine-tuned deep learning models parse uploaded photographs to instantly categorize the issue type and assign visual severity levels.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-[#FAFBFD] p-8 rounded-card border border-gray-200/50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-amber-50 text-accent rounded-card shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Layers className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-md mt-6">2. Geospatial Duplicate Merging</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                MongoDB `2dsphere` query scans coordinates of nearby issues; visual similarity indexes confirm duplicates to merge reports under a single ticket.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-[#FAFBFD] p-8 rounded-card border border-gray-200/50 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-green-50 text-green-600 rounded-card shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Award className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-md mt-6">3. Community Verification</h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Citizens upvote existing locality tickets or report closures, shifting priority ranks and notifying administrators of critical pain points.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Local helper icon for MapPin
function MapPinIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
