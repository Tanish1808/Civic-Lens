import React from 'react';
import { Eye, Edit3, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminTickets() {
  const tickets = [
    {
      id: 'T-104',
      category: 'Pothole',
      severity: 'high',
      location: 'MG Road, Sector 4',
      reports: 12,
      votes: 8,
      status: 'verified',
      date: '2026-07-20',
    },
    {
      id: 'T-103',
      category: 'Garbage',
      severity: 'medium',
      location: 'Main Market Square',
      reports: 4,
      votes: 2,
      status: 'acknowledged',
      date: '2026-07-19',
    },
    {
      id: 'T-102',
      category: 'Waterlogging',
      severity: 'high',
      location: 'Subhash Marg Subway',
      reports: 28,
      votes: 15,
      status: 'in_progress',
      date: '2026-07-18',
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      
      {/* Table Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Tickets</h1>
          <p className="text-sm text-gray-400">Search, filter, and action active civic tickets.</p>
        </div>
        
        {/* Actions buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-bold bg-[#151B26] hover:bg-[#1C2433] text-gray-300 border border-gray-800/80 rounded-button transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-[#0B0F19] rounded-button transition-colors shadow-lg shadow-amber-500/10">
            Bulk Status Update
          </button>
        </div>
      </div>

      {/* Main Table Grid Card */}
      <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 border-b border-gray-850 bg-[#151B26]/20 flex gap-4 items-center flex-wrap">
          {/* Quick Filters */}
          <select className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
          </select>

          <select className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
          <thead className="bg-[#151B26]/40 text-gray-400 text-xs font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Issue</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-center">Reports</th>
              <th className="px-6 py-4 text-center">Upvotes</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-300">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-gray-800/25 transition-all duration-300">
                <td className="px-6 py-4 font-bold text-white">{t.id}</td>
                <td className="px-6 py-4 font-semibold text-white">{t.category}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    t.severity === 'high'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : t.severity === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                    {t.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{t.location}</td>
                <td className="px-6 py-4 text-center font-bold text-white">{t.reports}</td>
                <td className="px-6 py-4 text-center font-bold text-white">{t.votes}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    t.status === 'resolved'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : t.status === 'in_progress'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                  <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors inline-flex">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-amber-500/10 transition-colors inline-flex">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors inline-flex">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
