import React from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, AlertOctagon, TrendingUp, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function AdminOverview() {
  const kpis = [
    { label: 'Total Tickets', value: '1,248', icon: ListChecks, color: 'text-blue-500 border-blue-500/20 shadow-blue-500/5', bg: 'bg-blue-500/10', trend: '+12% this week' },
    { label: 'Unresolved Count', value: '87', icon: AlertOctagon, color: 'text-red-500 border-red-500/20 shadow-red-500/5', bg: 'bg-red-500/10', trend: '-3% this week' },
    { label: 'Avg Resolution Speed', value: '4.2 Days', icon: Clock, color: 'text-green-500 border-green-500/20 shadow-green-500/5', bg: 'bg-green-500/10', trend: '-18% from last month' },
    { label: 'Top Issue Category', value: 'Pothole (62%)', icon: TrendingUp, color: 'text-amber-500 border-amber-500/20 shadow-amber-500/5', bg: 'bg-amber-500/10', trend: 'Seasonal rise' },
    { label: 'Most Affected Area', value: 'Sector 4, MG Road', icon: MapPin, color: 'text-purple-500 border-purple-500/20 shadow-purple-500/5', bg: 'bg-purple-500/10', trend: 'Road erosion reported' },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-400">Real-time status summaries and system-wide metrics of your city zone.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              className={`bg-[#151B26]/60 backdrop-blur-lg border rounded-card p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#151B26] ${kpi.color}`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</span>
                <span className={`${kpi.bg} p-2 rounded-card`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-black text-white leading-none">{kpi.value}</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-wide">{kpi.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Manage Tickets block */}
        <div className="bg-[#151B26]/40 backdrop-blur-lg border border-gray-800/80 rounded-card p-6 flex flex-col justify-between h-48 hover:border-amber-500/20 transition-all duration-300">
          <div>
            <h2 className="text-lg font-extrabold text-white">Manage Tickets</h2>
            <p className="text-sm text-gray-400 mt-2">Filter, sort, and process active reports. Review upvote count updates and bulk change ticket states.</p>
          </div>
          <Link 
            to="/admin/tickets" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors mt-4"
          >
            <span>Open ticket tables</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Manual Review Queue block */}
        <div className="bg-[#151B26]/40 backdrop-blur-lg border border-gray-800/80 rounded-card p-6 flex flex-col justify-between h-48 hover:border-amber-500/20 transition-all duration-300">
          <div>
            <h2 className="text-lg font-extrabold text-white">Low-Confidence Queue</h2>
            <p className="text-sm text-gray-400 mt-2">Access reports where the ML model category/severity confidence falls below threshold. Manually resolve coordinates and details.</p>
          </div>
          <Link 
            to="/admin/review-queue" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors mt-4"
          >
            <span>Resolve manual reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
