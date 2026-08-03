import React, { useState } from 'react';
import { Filter, Search, RotateCcw, AlertCircle } from 'lucide-react';

export default function MapDashboard() {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-bg-light">
      {/* Side Filter Bar */}
      <div
        className={`bg-white border-r border-gray-200 z-10 flex flex-col justify-between transition-all duration-300 ${
          showFilters ? 'w-80 shadow-lg' : 'w-0 overflow-hidden border-none'
        }`}
      >
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Filters</h2>
            <button className="text-text-secondary hover:text-text-primary p-1">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search locations..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-button text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Categories Checklist */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Issue Category</h3>
            <div className="space-y-1.5">
              {['Pothole', 'Waterlogging', 'Broken Streetlight', 'Illegal Dumping'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity Checklist */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Severity Level</h3>
            <div className="space-y-1.5">
              {['Low', 'Medium', 'High'].map((sev) => (
                <label key={sev} className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span>{sev} Priority</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Checklist */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Ticket Status</h3>
            <div className="space-y-1.5">
              {['Reported', 'Verified', 'Acknowledged', 'In Progress', 'Resolved'].map((stat) => (
                <label key={stat} className="flex items-center gap-2.5 text-sm text-text-secondary cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span>{stat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2.5 items-start text-xs text-text-secondary">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-primary" />
            <p>Maps refresh automatically every 60 seconds to optimize performance.</p>
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 h-full">
        {/* Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute left-4 top-4 z-20 bg-white p-2.5 rounded-button shadow-md border border-gray-200 text-text-primary hover:bg-gray-50 transition-all flex items-center gap-2 font-semibold text-sm"
        >
          <Filter className="w-4 h-4 text-primary" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Map placeholder */}
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-text-secondary">
          <div className="text-center space-y-2">
            <div className="text-4xl">🗺️</div>
            <p className="font-semibold">Map Viewport Area</p>
            <p className="text-xs max-w-sm">Leaflet.js interactive maps and heatmaps will render here with severity-colored clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
