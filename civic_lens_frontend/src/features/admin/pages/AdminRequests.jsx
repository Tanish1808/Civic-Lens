import React, { useState, useEffect } from 'react';
import { Mail, Check, Loader2, Calendar, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = () => {
    setIsLoading(true);
    setError(null);
    api.get('/admin/support-requests')
      .then((response) => {
        setRequests(response.data.data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching support requests:', err);
        setError('Failed to fetch support requests. Please verify you are logged in as an admin.');
        setIsLoading(false);
      });
  };

  const handleMarkProcessed = (id) => {
    setProcessingId(id);
    api.post(`/admin/support-requests/${id}/process`)
      .then(() => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'processed' } : req));
        setProcessingId(null);
      })
      .catch((err) => {
        console.error('Error processing request:', err);
        alert('Failed to update status. Please try again.');
        setProcessingId(null);
      });
  };

  const getStatusBadgeClass = (status) => {
    return status === 'processed'
      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
      : 'bg-amber-500/10 text-amber-550 border border-amber-500/20 animate-pulse';
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pending Admin Requests</h1>
        <p className="text-sm text-gray-400">Manage and review integration and custom dashboard inquiries from city zones.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading inquiries...</p>
        </div>
      ) : error ? (
        <div className="bg-[#151B26]/30 border border-red-500/20 p-6 rounded-card text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm text-gray-400">{error}</p>
          <button 
            onClick={fetchRequests} 
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-button hover:bg-amber-400 transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card p-12 text-center max-w-lg mx-auto space-y-4">
          <Mail className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Support Requests</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">There are no pending support portal submissions from municipalities at this time.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {requests.map((req) => (
            <div 
              key={req.id} 
              className={`bg-[#151B26]/30 border rounded-card p-6 shadow-2xl backdrop-blur-md space-y-4 transition-all duration-300 ${
                req.status === 'processed' ? 'border-gray-850 opacity-60' : 'border-gray-800/80 hover:border-gray-700/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-gray-850 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-extrabold text-white">{req.name}</h3>
                  <p className="text-[11px] text-gray-450 font-mono mt-0.5">{req.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(req.status)}`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {/* Card Meta & Details */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-400">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[10px] text-amber-500 font-extrabold uppercase">Municipality:</span>
                    <span className="text-gray-200">{req.municipality}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:justify-end text-[10px] font-semibold font-mono">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-[#0B0F19]/40 border border-gray-850 p-4 rounded-card">
                  <span className="block text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-1.5">Inquiry Details</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-semibold whitespace-pre-wrap">{req.details}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {req.status === 'pending' && (
                <div className="flex justify-end border-t border-gray-850 pt-3">
                  <button
                    onClick={() => handleMarkProcessed(req.id)}
                    disabled={processingId === req.id}
                    className="inline-flex items-center gap-1.5 py-1.5 px-4 bg-green-500 text-[#0B0F19] text-xs font-black rounded-button hover:bg-green-400 active:scale-97 transition-all shadow-md shadow-green-500/10 cursor-pointer disabled:opacity-50"
                  >
                    {processingId === req.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Mark as Processed</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
