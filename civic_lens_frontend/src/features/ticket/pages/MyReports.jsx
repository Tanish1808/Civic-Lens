import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, MapPin } from 'lucide-react';

export default function MyReports() {
  const reports = [
    {
      id: 'r1',
      ticketId: 't1',
      category: 'Pothole',
      location: 'MG Road Highway',
      status: 'acknowledged',
      date: '2026-07-20',
      description: 'Dangerous pothole in left lane'
    },
    {
      id: 'r2',
      ticketId: 't2',
      category: 'Garbage',
      location: 'Sector 2 Market',
      status: 'resolved',
      date: '2026-07-15',
      description: 'Illegal plastic dumping near stores'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Submissions</h1>
          <p className="text-sm text-text-secondary">Track the live progress of civic issues you have reported.</p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-button bg-primary text-white hover:bg-primary/95 transition-colors shadow-sm"
        >
          Report New Issue
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {reports.map((report) => (
            <li key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-text-primary text-md">{report.category}</h2>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      report.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'acknowledged'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{report.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{report.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{report.date}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/ticket/${report.ticketId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 .5 py-2 border border-gray-300 text-xs font-semibold rounded-button bg-white text-text-primary hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Ticket</span>
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
