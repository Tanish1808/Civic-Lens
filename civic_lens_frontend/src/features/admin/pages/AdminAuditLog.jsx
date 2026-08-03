import React from 'react';

export default function AdminAuditLog() {
  const logs = [
    {
      id: 'a551',
      actor: 'admin_anand@civic.gov',
      action: 'category_override',
      target: 'T-104',
      before: 'Garbage',
      after: 'Pothole',
      date: '2026-08-01 16:42:15',
    },
    {
      id: 'a550',
      actor: 'admin_anand@civic.gov',
      action: 'status_change',
      target: 'T-102',
      before: 'verified',
      after: 'in_progress',
      date: '2026-08-01 15:20:10',
    },
    {
      id: 'a549',
      actor: 'moderator_priya@civic.gov',
      action: 'flag_spam',
      target: 'rep-852',
      before: 'active',
      after: 'spam_hidden',
      date: '2026-08-01 11:05:00',
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Audit Logs</h1>
        <p className="text-sm text-gray-500">Read-only, immutable history of administrative and moderation overrides.</p>
      </div>

      {/* Audit table card */}
      <div className="bg-white rounded-card shadow-sm border border-gray-200 overflow-hidden max-w-6xl">
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Audit ID</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target ID</th>
              <th className="px-6 py-4">Before Value</th>
              <th className="px-6 py-4">After Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">#{log.id}</td>
                <td className="px-6 py-4 text-gray-500 font-sans">{log.date}</td>
                <td className="px-6 py-4 text-gray-900 font-sans font-semibold">{log.actor}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-semibold text-[10px] uppercase">
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-amber-600 font-sans font-bold">{log.target}</td>
                <td className="px-6 py-4 text-red-600 font-sans">{log.before}</td>
                <td className="px-6 py-4 text-green-600 font-sans">{log.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
