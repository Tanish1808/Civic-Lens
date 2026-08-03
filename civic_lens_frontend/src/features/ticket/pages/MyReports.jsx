import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, MapPin, Plus, FileText } from 'lucide-react';

export default function MyReports() {
  const reports = [
    {
      id: 'r1',
      ticketId: 't1',
      category: 'Pothole',
      location: 'Sector 4, MG Road Highway',
      status: 'acknowledged',
      date: 'Jul 20, 2026',
      description: 'Large pothole on highway middle lane, causes commutors to swerve dangerously.',
      imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 'r2',
      ticketId: 't2',
      category: 'Garbage Dumping',
      location: 'Sector 2 Market Square',
      status: 'resolved',
      date: 'Jul 15, 2026',
      description: 'Illegal plastic and wet waste dumping behind market stores, emits heavy odor.',
      imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      
      {/* Header section */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">My Submissions</h1>
          <p className="text-sm text-text-secondary">Track the resolution lifecycle of issues you have reported.</p>
        </div>
        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 shadow-md shadow-primary/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Reports Checklist */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="bg-white rounded-card p-5 border border-gray-100 shadow-lg shadow-gray-200/30 hover:shadow-gray-200/50 hover:border-gray-200/50 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
          >
            {/* Left Image Thumbnail */}
            <div className="w-full sm:w-24 h-24 rounded-card overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
              <img src={report.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>

            {/* Middle Details */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-bold text-text-primary text-base">{report.category}</h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  report.status === 'resolved'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : report.status === 'acknowledged'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}>
                  {report.status}
                </span>
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">{report.description}</p>
              
              {/* Metadata tags */}
              <div className="flex items-center gap-4 text-xs text-text-secondary flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{report.location}</span>
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{report.date}</span>
                </span>
              </div>
            </div>

            {/* Right button action */}
            <div className="w-full sm:w-auto flex-shrink-0">
              <Link
                to={`/ticket/${report.ticketId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary/15 text-xs font-bold rounded-button bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300 shadow-sm active:scale-97 hover:scale-[1.02] hover:shadow-md hover:shadow-primary/10 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-current" />
                <span>Track Ticket</span>
              </Link>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
