import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check, Ban, MapPin, Loader2, AlertCircle } from 'lucide-react';
import api from '../../../services/api';

function ImageWithFallback({ src, alt, className }) {
  const [hasError, setHasError] = useState(false);

  return !hasError ? (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)} 
    />
  ) : (
    <div className="w-full h-full bg-[#0E131F] flex flex-col justify-center items-center text-center p-3 select-none text-gray-500 border border-gray-800 rounded-card">
      <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">Image Offline</span>
      <span className="text-[8px]">Unresolved or blocked host</span>
    </div>
  );
}

export default function ManualReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Override selections mapped by report ID
  const [overrides, setOverrides] = useState({});

  // Custom modal configuration
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: null,
    severity: 'info'
  });

  const showModal = (config) => {
    setModalConfig({
      isOpen: true,
      type: config.type || 'alert',
      title: config.title || '',
      message: config.message || '',
      onConfirm: config.onConfirm || null,
      severity: config.severity || 'info'
    });
  };

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
        showModal({
          type: 'alert',
          severity: 'success',
          title: 'Override Approved',
          message: `The report was successfully resolved and classified as "${selection.category}" with "${selection.severity}" severity.`
        });
      })
      .catch((err) => {
        console.error('Failed to resolve manual review entry:', err);
        showModal({
          type: 'alert',
          severity: 'error',
          title: 'Resolution Failed',
          message: err.response?.data?.error?.message || 'Failed to submit the override.'
        });
        setProcessingId(null);
      });
  };

  const handleDiscardSpam = (reportId) => {
    showModal({
      type: 'confirm',
      severity: 'warning',
      title: 'Discard Report',
      message: 'Are you sure you want to discard this report submission as spam? This action cannot be undone.',
      onConfirm: () => {
        setProcessingId(reportId);
        // Resolve entry using dummy "other" category to close the queue entry
        api.patch(`/admin/manual-review-queue/${reportId}/resolve`, {
          category: 'other',
          severity: 'low'
        })
          .then(() => {
            setProcessingId(null);
            fetchQueue();
            showModal({
              type: 'alert',
              severity: 'success',
              title: 'Report Discarded',
              message: 'The submission was successfully discarded as spam.'
            });
          })
          .catch((err) => {
            console.error('Failed to discard manual review entry:', err);
            showModal({
              type: 'alert',
              severity: 'error',
              title: 'Discard Failed',
              message: 'Failed to discard the entry. Please try again.'
            });
            setProcessingId(null);
          });
      }
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
                    <ImageWithFallback 
                      src={r.photo_url ? (
                        (r.photo_url.startsWith('http://') || r.photo_url.startsWith('https://') || r.photo_url.startsWith('data:'))
                          ? r.photo_url 
                          : `http://localhost:8000${r.photo_url.startsWith('/') ? '' : '/'}${r.photo_url}`
                      ) : ''} 
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
                        {r.created_at ? new Date(r.created_at.endsWith('Z') || r.created_at.includes('+') || r.created_at.includes('-') ? r.created_at : `${r.created_at}Z`).toLocaleString() : 'Recently'}
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

      {/* Custom Dialog Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#151B26] border border-gray-805 rounded-card p-6 w-full max-w-md shadow-2xl space-y-6">
            
            <div className="flex items-start gap-4">
              {modalConfig.severity === 'warning' && (
                <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'error' && (
                <div className="p-3 rounded-full bg-red-500/10 text-red-500 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'success' && (
                <div className="p-3 rounded-full bg-green-500/10 text-green-500 shrink-0">
                  <Check className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'info' && (
                <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-bold text-white leading-none">{modalConfig.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{modalConfig.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-800/80">
              {modalConfig.type === 'confirm' && (
                <button
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-gray-800 rounded-button bg-transparent hover:bg-gray-800/40 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              
              <button
                onClick={() => {
                  setModalConfig(prev => ({ ...prev, isOpen: false }));
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                }}
                className={`px-4 py-2 rounded-button text-xs font-bold text-black transition-all cursor-pointer ${
                  modalConfig.severity === 'error' 
                    ? 'bg-red-500 hover:bg-red-400' 
                    : modalConfig.severity === 'warning'
                    ? 'bg-amber-500 hover:bg-amber-400'
                    : modalConfig.severity === 'success'
                    ? 'bg-green-500 hover:bg-green-400'
                    : 'bg-amber-500 hover:bg-amber-400'
                }`}
              >
                {modalConfig.type === 'confirm' ? 'Confirm' : 'Dismiss'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
