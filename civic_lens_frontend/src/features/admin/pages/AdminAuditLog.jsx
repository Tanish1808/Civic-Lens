import React from 'react';
import { Terminal, Calendar, User, ShieldAlert } from 'lucide-react';

export default function AdminAuditLog() {
  const auditLogs = [
    {
      id: 'L-501',
      timestamp: '2026-07-22 14:15:32',
      actor: 'Anand Kumar (Admin)',
      action: 'Triage Override',
      details: 'Changed Category of #T-104 from Garbage to Pothole. Updated Severity to High.',
    },
    {
      id: 'L-500',
      timestamp: '2026-07-22 13:02:11',
      actor: 'AI Classifier (System)',
      action: 'Auto-Verification',
      details: 'Ticket #T-104 auto-verified. Threshold of 5 reports crossed (geospatial duplicate scan matches).',
    },
    {
      id: 'L-499',
      timestamp: '2026-07-21 11:22:45',
      actor: 'Priya Patel (Citizen)',
      action: 'Report Submitted',
      details: 'New complaint reported at [23.0227, 72.5716]. Photo metadata confirms match.',
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
        <p className="text-sm text-gray-400">Chronological list of all automated AI classifications, manual overrides, and ticket status changes.</p>
      </div>

      {/* Audit Logs Code-panel Container */}
      <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Terminal Header */}
        <div className="bg-[#151B26]/50 px-6 py-4 border-b border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-300 font-mono">
            <Terminal className="w-4 h-4 text-amber-500" />
            <span>sec-log_terminal_z4</span>
          </div>
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800/60 font-mono text-xs text-left">
            <thead className="bg-[#151B26]/10 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Log ID</th>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Change Description Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40 text-gray-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-amber-500">{log.id}</td>
                  <td className="px-6 py-4 text-gray-400 whitespace-nowrap flex items-center gap-1.5 pt-4">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{log.timestamp}</span>
                  </td>
                  <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span>{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.action.includes('Override') 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                        : log.action.includes('System') 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 max-w-sm break-words leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
