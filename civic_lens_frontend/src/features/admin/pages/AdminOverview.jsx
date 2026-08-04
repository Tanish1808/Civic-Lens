import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListChecks, AlertOctagon, TrendingUp, Clock, MapPin, 
  ArrowRight, Activity, ShieldAlert, Cpu, Sparkles, RefreshCw 
} from 'lucide-react';

export default function AdminOverview() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);

  const kpis = [
    { label: 'Total Tickets', value: '1,248', icon: ListChecks, color: 'text-blue-500 border-blue-500/20 shadow-blue-500/5', bg: 'bg-blue-500/10', trend: '+12% this week' },
    { label: 'Unresolved Count', value: '87', icon: AlertOctagon, color: 'text-red-500 border-red-500/20 shadow-red-500/5', bg: 'bg-red-500/10', trend: '-3% this week' },
    { label: 'Avg Resolution Speed', value: '4.2 Days', icon: Clock, color: 'text-green-500 border-green-500/20 shadow-green-500/5', bg: 'bg-green-500/10', trend: '-18% from last month' },
    { label: 'Top Issue Category', value: 'Pothole (62%)', icon: TrendingUp, color: 'text-amber-500 border-amber-500/20 shadow-amber-500/5', bg: 'bg-amber-500/10', trend: 'Seasonal rise' },
    { label: 'Most Affected Area', value: 'Sector 4, MG Road', icon: MapPin, color: 'text-purple-500 border-purple-500/20 shadow-purple-500/5', bg: 'bg-purple-500/10', trend: 'Road erosion reported' },
  ];

  const recentIncidents = [
    { id: 1, type: 'auto_merge', msg: 'Duplicate waterlogging reports detected near Subhash subway.', detail: 'Merged 4 tickets into single master ticket #t3', time: '2 min ago', typeLabel: 'Auto Merged', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
    { id: 2, type: 'ml_alert', msg: 'ML model flagged low categorization confidence on ticket #t12.', detail: 'Routed to Low-Confidence Manual Queue for coordinate resolve', time: '14 min ago', typeLabel: 'ML Manual Route', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
    { id: 3, type: 'verified', msg: 'Pothole on CG Road crossed auto-verification threshold.', detail: 'Auto-updated status to Verified (12 upvotes logged)', time: '32 min ago', typeLabel: 'Auto Verified', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
    { id: 4, type: 'citizen_resolved', msg: 'Citizen Rohan Sharma verified resolution for Streetlight #t4.', detail: 'Verification counter updated to 4 confirmations', time: '1 hr ago', typeLabel: 'Citizen Verify', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  ];

  const wardStats = [
    { ward: 'Ward 4 - Navrangpura', active: 28, solved: '94%', color: 'w-[94%] bg-green-500', status: 'Stable' },
    { ward: 'Ward 9 - Kalupur', active: 45, solved: '81%', color: 'w-[81%] bg-green-500', status: 'Stable' },
    { ward: 'Ward 2 - Satellite', active: 18, solved: '62%', color: 'w-[62%] bg-amber-500', status: 'Warning' },
    { ward: 'Ward 11 - Paldi', active: 34, solved: '45%', color: 'w-[45%] bg-red-500', status: 'Critical' },
  ];

  const handleSyncMap = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const handleDeduplicate = () => {
    setIsDeduplicating(true);
    setTimeout(() => setIsDeduplicating(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Municipal Command Center</h1>
          </div>
          <p className="text-sm text-gray-400">Real-time status summaries, duplicate metrics, and automated review queues.</p>
        </div>
        
        <div className="flex items-center gap-2.5 text-xs text-gray-400 bg-[#151B26] px-3.5 py-2 border border-gray-800 rounded-card font-mono">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span>SERVER STABLE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div 
              key={kpi.label} 
              className={`bg-[#151B26]/60 backdrop-blur-lg border border-gray-800/80 rounded-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#151B26] ${kpi.color}`}
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

      {/* Main Multi-Column Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Incidents Feed & Ward performance tables (8 Cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Live Incident Triage Feed */}
          <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4.5 h-4.5 text-primary" />
                <span>Live Triage & Event Logs</span>
              </h2>
              <span className="text-[10px] font-mono text-gray-400 bg-gray-800 px-2 py-0.5 rounded">
                Real-Time Updates
              </span>
            </div>

            <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="flex items-start gap-4 p-3.5 bg-[#151B26]/30 border border-gray-800/40 rounded-card hover:bg-[#151B26]/60 transition-colors duration-200">
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${incident.color} flex-shrink-0 mt-0.5`}>
                    {incident.typeLabel}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-white truncate">{incident.msg}</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{incident.detail}</p>
                  </div>
                  <span className="text-[9px] font-mono text-gray-500 whitespace-nowrap">{incident.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ward Performance Breakdown Table */}
          <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white border-b border-gray-800 pb-3">
              Ward-wise Ticket Clearance Rate
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-gray-400 font-bold border-b border-gray-800/80 pb-2">
                    <th className="pb-3">Ward Name</th>
                    <th className="pb-3 text-center">Active Complaints</th>
                    <th className="pb-3">Resolution Progress</th>
                    <th className="pb-3 text-right">Zone Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {wardStats.map((item) => (
                    <tr key={item.ward} className="hover:bg-[#151B26]/20 transition-colors">
                      <td className="py-3.5 font-bold text-white">{item.ward}</td>
                      <td className="py-3.5 text-center font-mono text-gray-300">{item.active}</td>
                      <td className="py-3.5 w-1/3">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.color}`} />
                          </div>
                          <span className="font-bold font-mono text-[10px] text-gray-300 w-8">{item.solved}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          item.status === 'Stable' ? 'bg-green-500/10 text-green-400' :
                          item.status === 'Warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Diagnostics, quick controls & navigation (4 Cols) */}
        <div className="xl:col-span-4 space-y-6">

          {/* ML Diagnostic Dashboard Panel */}
          <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Cpu className="w-4.5 h-4.5 text-amber-500" />
              <span>ML Diagnostics</span>
            </h2>

            <div className="space-y-4.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Classifier Model</span>
                <span className="font-bold text-white bg-primary/20 px-2 py-0.5 rounded border border-primary/20 text-[10px]">
                  CivicNet-v2.4
                </span>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Categorization Accuracy</span>
                  <span className="font-bold font-mono text-green-400">94.2%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full w-[94.2%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Confidence Threshold</span>
                  <span className="font-bold font-mono text-gray-300">85.0%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[85%]" />
                </div>
              </div>

              <div className="border-t border-gray-800/80 pt-3.5 grid grid-cols-2 gap-4 text-center">
                <div className="bg-[#151B26]/30 p-2 border border-gray-800/50 rounded-card">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Auto Merged</p>
                  <p className="text-base font-black text-white mt-1">142</p>
                </div>
                <div className="bg-[#151B26]/30 p-2 border border-gray-800/50 rounded-card">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Confidence Guard</p>
                  <p className="text-base font-black text-white mt-1">96.8%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operations Controls */}
          <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              <span>Quick Controls</span>
            </h2>

            <div className="space-y-3">
              <button 
                onClick={handleDeduplicate}
                className="w-full flex items-center justify-between p-3 bg-[#151B26]/30 hover:bg-[#151B26] border border-gray-800/55 text-xs font-bold text-gray-300 rounded-button transition-all duration-200 active:scale-97 cursor-pointer"
              >
                <span>Run Duplicate Deduplication</span>
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${isDeduplicating ? 'animate-spin' : ''}`} />
              </button>

              <button 
                onClick={handleSyncMap}
                className="w-full flex items-center justify-between p-3 bg-[#151B26]/30 hover:bg-[#151B26] border border-gray-800/55 text-xs font-bold text-gray-300 rounded-button transition-all duration-200 active:scale-97 cursor-pointer"
              >
                <span>Force Sync Leaflet Map</span>
                <RefreshCw className={`w-3.5 h-3.5 text-primary ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Compact Admin Action Links Stack */}
          <div className="space-y-4">
            <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-5 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Manage Tickets</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Review upvotes, search areas, and modify details.</p>
                </div>
                <Link to="/admin/tickets" className="p-2 bg-gray-800/50 hover:bg-primary/20 text-gray-400 hover:text-white rounded-card transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-5 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Low-Confidence Queue</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Resolve machine learning categorizations manually.</p>
                </div>
                <Link to="/admin/review-queue" className="p-2 bg-gray-800/50 hover:bg-primary/20 text-gray-400 hover:text-white rounded-card transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-5 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">System Analytics</h3>
                  <p className="text-[11px] text-gray-400 mt-1">Audit resolution metrics and ward-level charts.</p>
                </div>
                <Link to="/admin/analytics" className="p-2 bg-gray-800/50 hover:bg-primary/20 text-gray-400 hover:text-white rounded-card transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-[#151B26]/40 border border-gray-800/80 rounded-card p-5 hover:border-primary/40 transition-all duration-300 group">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">System Audit Logs</h3>
                  <p className="text-[11px] text-gray-400 mt-1">View immutable logs and coordinate changes.</p>
                </div>
                <Link to="/admin/audit-log" className="p-2 bg-gray-800/50 hover:bg-primary/20 text-gray-400 hover:text-white rounded-card transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
