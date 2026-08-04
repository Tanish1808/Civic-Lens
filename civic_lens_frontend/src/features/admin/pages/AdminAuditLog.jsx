import React, { useState, useEffect } from 'react';
import { Terminal, Calendar, User, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = () => {
    setIsLoading(true);
    setError(null);
    api.get('/admin/audit-logs')
      .then((response) => {
        setLogs(response.data.data.logs || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin audit logs:', err);
        setError('Failed to fetch system audit logs. Verify you are logged in as an administrator.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadgeClass = (action) => {
    if (action.includes('status')) return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    if (action.includes('override') || action.includes('category')) return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    if (action.includes('spam')) return 'bg-red-500/10 text-red-400 border border-red-500/20';
    return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  };

  const formatDetails = (log) => {
    const ticketRef = log.target_ticket_id ? `#${log.target_ticket_id.slice(-6).toUpperCase()}` : '';
    if (log.action_type === 'status_change') {
      const fromStatus = log.before_value?.status || 'unknown';
      const toStatus = log.after_value?.status || 'unknown';
      return `Changed Ticket ${ticketRef} status from "${fromStatus}" to "${toStatus}".`;
    }
    if (log.action_type === 'category_override') {
      const cat = log.after_value?.category || '';
      const sev = log.after_value?.severity || '';
      return `Overrode Ticket ${ticketRef} classification to Category: ${cat.toUpperCase()}, Severity: ${sev.toUpperCase()}.`;
    }
    if (log.action_type === 'flag_spam') {
      return `Flagged Ticket ${ticketRef} as malicious spam activity. Removed from active maps.`;
    }
    
    // General fallback summary
    const values = [];
    if (log.before_value) values.push(`Before: ${JSON.stringify(log.before_value)}`);
    if (log.after_value) values.push(`After: ${JSON.stringify(log.after_value)}`);
    return `Action "${log.action_type}" logged on ticket ${ticketRef}. ${values.join(', ')}`;
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">System Audit Logs</h1>
        <p className="text-sm text-gray-400">Chronological list of all automated AI classifications, manual overrides, and ticket status changes.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Streaming console logs...</p>
        </div>
      ) : error ? (
        <div className="bg-[#151B26]/30 border border-red-500/20 p-6 rounded-card text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm text-gray-400">{error}</p>
          <button 
            onClick={fetchLogs} 
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-button hover:bg-amber-400 transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : (
        /* Audit Logs Code-panel Container */
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
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-semibold">
                      No system events have been logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-amber-500">{log.id ? log.id.slice(-6).toUpperCase() : 'EVENT'}</td>
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-primary" />
                          <span>{log.actor_id ? `Admin #${log.actor_id.slice(-4).toUpperCase()}` : 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeClass(log.action_type)}`}>
                          {log.action_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 max-w-sm break-words leading-relaxed">{formatDetails(log)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
