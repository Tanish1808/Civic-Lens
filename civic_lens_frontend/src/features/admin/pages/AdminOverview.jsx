import React from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, AlertOctagon, TrendingUp, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function AdminOverview() {
  const kpis = [
    { label: 'Total Tickets', value: '1,248', icon: ListChecks, color: 'bg-blue-500', trend: '+12% this week' },
    { label: 'Unresolved Count', value: '87', icon: AlertOctagon, color: 'bg-red-500', trend: '-3% this week' },
    { label: 'Avg Resolution Speed', value: '4.2 Days', icon: Clock, color: 'bg-green-500', trend: '-18% from last month' },
    { label: 'Top Issue Category', value: 'Pothole (62%)', icon: TrendingUp, color: 'bg-amber-500', trend: 'Seasonal rise' },
    { label: 'Most Affected Area', value: 'Sector 4, MG Road', icon: MapPin, color: 'bg-purple-500', trend: 'Road erosion reported' },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-gray-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Real-time status summaries and system-wide metrics of your city zone.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-card p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <span className={`${kpi.color} p-2 rounded-card text-white`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                <p className="text-xs text-gray-400 font-semibold mt-1">{kpi.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Quick Links Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ticket Management navigation */}
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-48">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Manage Tickets</h2>
            <p className="text-sm text-gray-400 mt-2">Filter, sort, and process active reports. Review upvote count escalations and bulk update ticket states.</p>
          </div>
          <Link to="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors mt-4">
            <span>Open ticket tables</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Manual Review Queue navigation */}
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-48">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Low-Confidence Queue</h2>
            <p className="text-sm text-gray-400 mt-2">Access reports where the ML model category/severity confidence falls below threshold. Manually categorize items to generate tickets.</p>
          </div>
          <Link to="/admin/review-queue" className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors mt-4">
            <span>Resolve manual reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
