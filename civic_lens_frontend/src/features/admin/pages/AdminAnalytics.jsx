import React from 'react';
import { Calendar, Download } from 'lucide-react';

export default function AdminAnalytics() {
  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Charts</h1>
          <p className="text-sm text-gray-500">Visual breakdowns of incident distributions and response metrics.</p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 border border-gray-300 rounded-button bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Last 30 Days</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-button shadow-sm transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns for small charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category breakdown (Donut chart mock) */}
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-200 h-80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Category Breakdown</h3>
            <p className="text-xs text-gray-400">Aggregated division of reported issue types.</p>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-card mt-4 border border-dashed border-gray-200">
            <span className="text-xs text-gray-400 font-semibold">[ Category Donut Chart (Recharts) ]</span>
          </div>
        </div>

        {/* Severity distribution (Bar chart mock) */}
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-200 h-80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Severity Distribution</h3>
            <p className="text-xs text-gray-400">Volume distribution matching high, medium, and low levels.</p>
          </div>
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-card mt-4 border border-dashed border-gray-200">
            <span className="text-xs text-gray-400 font-semibold">[ Severity Bar Chart (Recharts) ]</span>
          </div>
        </div>

      </div>

      {/* Resolution Trend (Full-width line chart mock) */}
      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-200 h-96 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Resolution Speed & Volume Trend</h3>
          <p className="text-xs text-gray-400">Weekly comparison between newly reported and successfully resolved tickets.</p>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-card mt-4 border border-dashed border-gray-200">
          <span className="text-xs text-gray-400 font-semibold">[ Monthly Resolution Trend Line Chart (Recharts) ]</span>
        </div>
      </div>
    </div>
  );
}
