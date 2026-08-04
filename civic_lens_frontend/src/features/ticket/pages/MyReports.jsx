import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, MapPin, Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.get('/my-reports')
      .then((response) => {
        const fetched = (response.data.data.reports || []).map((r) => {
          const lat = r.location?.coordinates?.[1];
          const lng = r.location?.coordinates?.[0];
          const displayCategory = r.ml_category
            ? r.ml_category.charAt(0).toUpperCase() + r.ml_category.slice(1)
            : 'Unclassified Issue';
          
          return {
            id: r.report_id,
            ticketId: r.ticket_id,
            category: displayCategory,
            location: lat && lng ? `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` : 'Ahmedabad Grid',
            status: r.status.replace('_', ' '),
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            description: r.description || 'Active citizen submission awaiting validation review.',
            imageUrl: r.photo_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80',
          };
        });
        setReports(fetched);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading user reports:', err);
        setError('Failed to load your submissions. Please make sure you are signed in.');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#FAFBFD] space-y-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider animate-pulse">Syncing Submission Log...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD] min-h-[calc(100vh-64px)]">
      
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

      {error ? (
        <div className="flex flex-col justify-center items-center py-12 space-y-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-text-secondary">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-card p-12 border border-gray-150 text-center space-y-4 shadow-sm">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">No Submissions Found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">You haven't submitted any civic issue reports yet. Help improve Ahmedabad by reporting your first issue!</p>
          </div>
          <Link
            to="/report"
            className="inline-flex px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-button hover:bg-primary/95 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <span>Report First Issue</span>
          </Link>
        </div>
      ) : (
        /* Reports Checklist */
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id} 
              className="bg-white rounded-card p-5 border border-gray-100 shadow-lg shadow-gray-200/30 hover:shadow-gray-200/50 hover:border-gray-200/50 transition-all duration-300 flex flex-col sm:flex-row gap-5 items-start sm:items-center"
            >
              {/* Left Image Thumbnail */}
              <div className="w-full sm:w-24 h-24 rounded-card overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center">
                <img src={report.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
              </div>

              {/* Middle Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-bold text-text-primary text-base">{report.category}</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                    report.status === 'resolved'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : report.status === 'acknowledged'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-yellow-50 text-yellow-750 border-yellow-200'
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
                {report.ticketId ? (
                  <Link
                    to={`/ticket/${report.ticketId}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-primary/15 text-xs font-bold rounded-button bg-primary/5 text-primary hover:bg-primary hover:text-white hover:border-transparent transition-all duration-300 shadow-sm active:scale-97 hover:scale-[1.02] hover:shadow-md hover:shadow-primary/10 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-current" />
                    <span>Track Ticket</span>
                  </Link>
                ) : (
                  <div className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded font-bold uppercase tracking-wider text-center select-none">
                    Awaiting Triage
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
