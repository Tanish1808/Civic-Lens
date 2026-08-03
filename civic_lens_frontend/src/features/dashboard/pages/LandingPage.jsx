import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Map, ShieldAlert, Award } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-bg-light min-h-[calc(100vh-64px)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
          Make Your Civic Issues <br />
          <span className="text-primary">Visible & Actionable</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-secondary leading-relaxed">
          Civic Lens is an AI-powered transparency platform. Submit geotagged photos of infrastructure problems, automatically cluster duplicate reports, and verify actions taken by your local municipal body.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/report"
            className="flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            <Camera className="w-5 h-5" />
            <span>Report an Issue</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-8 py-4 text-base font-bold rounded-button bg-white text-text-primary border border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Map className="w-5 h-5 text-primary" />
            <span>View Heatmap</span>
          </Link>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="border-t border-gray-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="flex items-start gap-4">
            <span className="p-3 bg-blue-50 text-primary rounded-card">
              <Camera className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-text-primary text-md">AI Image Categorization</h3>
              <p className="text-sm text-text-secondary mt-1">Computer vision models automatically analyze report photos to map category and severity flags.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="p-3 bg-amber-50 text-amber-500 rounded-card">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-text-primary text-md">Duplicate Merging</h3>
              <p className="text-sm text-text-secondary mt-1">Geospatial and visual similarity scans group overlapping citizen complaints into single actionable tickets.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="p-3 bg-green-50 text-green-600 rounded-card">
              <Award className="w-6 h-6" />
            </span>
            <div>
              <h3 className="font-bold text-text-primary text-md">Community Verified</h3>
              <p className="text-sm text-text-secondary mt-1">Upvote existing neighborhood tickets to increase repair priority and corroboration weight.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
