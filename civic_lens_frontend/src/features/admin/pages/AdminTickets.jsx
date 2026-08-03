import React from 'react';
import { Eye, Edit3, Trash2 } from 'lucide-react';

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
      location: 'Main Market Market Square',
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
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tickets</h1>
          <p className="text-sm text-gray-500">Search, filter, and action active civic tickets.</p>
        </div>
        
        {/* Bulk action buttons */}
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-button transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 rounded-button transition-colors">
            Bulk Status Update
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-card shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-4 items-center flex-wrap">
          {/* Quick Filters */}
          <select className="border border-gray-300 rounded-button px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
          </select>

          <select className="border border-gray-300 rounded-button px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select className="border border-gray-300 rounded-button px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-amber-500">
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
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
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{t.id}</td>
                <td className="px-6 py-4 font-semibold">{t.category}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    t.severity === 'high'
                      ? 'bg-red-100 text-red-800'
                      : t.severity === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {t.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{t.location}</td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900">{t.reports}</td>
                <td className="px-6 py-4 text-center font-semibold text-gray-900">{t.votes}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    t.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : t.status === 'in_progress'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors inline-flex">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50 transition-colors inline-flex">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors inline-flex">
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
