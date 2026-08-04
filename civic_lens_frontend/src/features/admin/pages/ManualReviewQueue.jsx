import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, Ban, MapPin, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

export default function ManualReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Override selections mapped by report ID
  const [overrides, setOverrides] = useState({});

  const fetchQueue = () => {
    setIsLoading(true);
    setError(null);
    api.get('/admin/manual-review-queue')
      .then((response) => {
        const items = response.data.data.queue_items || [];
        setReviews(items);

        // Pre-populate override selections with standard defaults
        const initialOverrides = {};
        items.forEach((item) => {
          initialOverrides[item.report_id] = {
            category: 'pothole',
            severity: 'medium'
          };
        });
        setOverrides(initialOverrides);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load manual review queue:', err);
        setError('Failed to load queue. Please make sure you are logged in as an administrator.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSelectChange = (reportId, field, value) => {
    setOverrides((prev) => ({
      ...prev,
      [reportId]: {
        ...prev[reportId],
        [field]: value
      }
    }));
  };

  const handleApproveOverride = (reportId) => {
    const selection = overrides[reportId];
    if (!selection) return;

    setProcessingId(reportId);
    api.patch(`/admin/manual-review-queue/${reportId}/resolve`, {
      category: selection.category,
      severity: selection.severity
    })
      .then(() => {
        setProcessingId(null);
        fetchQueue();
      })
      .catch((err) => {
        console.error('Failed to resolve manual review entry:', err);
        alert(err.response?.data?.error?.message || 'Failed to submit override.');
        setProcessingId(null);
      });
  };

  const handleDiscardSpam = (reportId) => {
    if (!window.confirm('Are you sure you want to discard this report submission as spam?')) return;
    
    setProcessingId(reportId);
    // Resolve entry using dummy "other" category to close the queue entry
    api.patch(`/admin/manual-review-queue/${reportId}/resolve`, {
      category: 'other',
      severity: 'low'
    })
      .then(() => {
        setProcessingId(null);
        fetchQueue();
      })
      .catch((err) => {
        console.error('Failed to discard manual review entry:', err);
        alert('Failed to discard entry.');
        setProcessingId(null);
      });
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Manual Review Queue</h1>
        <p className="text-sm text-gray-400">Triage and resolve reports where automated confidence fell below threshold values.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing review queue...</p>
        </div>
      ) : error ? (
        <div className="bg-[#151B26]/30 border border-red-500/20 p-6 rounded-card text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <p className="text-sm text-gray-400">{error}</p>
          <button 
            onClick={fetchQueue} 
            className="px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-button hover:bg-amber-400 transition-colors"
          >
            Retry Fetch
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card p-12 text-center max-w-lg mx-auto space-y-4">
          <ShieldAlert className="w-12 h-12 text-gray-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Queue Empty</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">Excellent! No incoming citizen reports currently require low-confidence manual triage overrides.</p>
          </div>
        </div>
      ) : (
        /* Review items grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r) => {
            const currentOverride = overrides[r.report_id] || { category: 'pothole', severity: 'medium' };

            return (
              <div key={r.report_id} className="bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-5">
                
                {/* Header: ID & confidence warning */}
                <div className="flex justify-between items-start border-b border-gray-855 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Report #{r.report_id.slice(-6).toUpperCase()}</h3>
                    <p className="text-[10px] text-red-400 font-bold uppercase mt-1 tracking-wide">Reason: {r.reason.replace('_', ' ')}</p>
                  </div>
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    Needs Verification
                  </span>
                </div>

                {/* Content layout split: image left, actions right */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                  {/* Photo preview (5 columns) */}
                  <div className="sm:col-span-5 aspect-square rounded-card overflow-hidden bg-gray-900 border border-gray-800/60 relative flex items-center justify-center">
                    <img 
                      src={r.photo_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80'} 
                      alt="Low confidence upload" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 left-2 bg-black/60 rounded backdrop-blur-sm px-2 py-1 text-[9px] font-mono text-white flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span>Ahmedabad Grid</span>
                    </div>
                  </div>

                  {/* Triage Inputs (7 columns) */}
                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Reported Timestamp
                      </label>
                      <div className="bg-[#151B26] border border-gray-800 rounded-button px-3.5 py-2 text-xs font-mono font-semibold text-gray-300">
                        {r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently'}
                      </div>
                    </div>

                    {/* Overrides selectors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Final Category
                        </label>
                        <select 
                          value={currentOverride.category}
                          onChange={(e) => handleSelectChange(r.report_id, 'category', e.target.value)}
                          className="w-full border border-gray-800 rounded-button px-2.5 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="pothole">Pothole</option>
                          <option value="garbage">Garbage</option>
                          <option value="waterlogging">Waterlogging</option>
                          <option value="streetlight">Streetlight</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Final Severity
                        </label>
                        <select 
                          value={currentOverride.severity}
                          onChange={(e) => handleSelectChange(r.report_id, 'severity', e.target.value)}
                          className="w-full border border-gray-800 rounded-button px-2.5 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form actions: approve / flag spam */}
                <div className="border-t border-gray-855 pt-4 flex gap-3">
                  <button 
                    onClick={() => handleDiscardSpam(r.report_id)}
                    disabled={processingId === r.report_id}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 px-3 border border-red-500/20 rounded-button bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Discard as Spam</span>
                  </button>
                  
                  <button 
                    onClick={() => handleApproveOverride(r.report_id)}
                    disabled={processingId === r.report_id}
                    className="flex-1 flex justify-center items-center gap-1.5 py-2 px-3 bg-green-500 hover:bg-green-600 text-black text-xs font-extrabold rounded-button transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    {processingId === r.report_id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 font-bold" />
                    )}
                    <span>Approve Override</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
