import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ThumbsUp, MapPin, Clock, Calendar, CheckCircle2, User, 
  ChevronLeft, ChevronRight, MessageSquare, AlertCircle, LogIn, X, ShieldAlert, Loader2 
} from 'lucide-react';
import api from '../../../services/api';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  // API loading states
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upvote / Resolution states
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalReason, setModalReason] = useState('upvote'); // 'upvote' | 'resolve'
  const [hasVerifiedResolved, setHasVerifiedResolved] = useState(false);
  const [verificationsCount, setVerificationsCount] = useState(0);

  // Photos Carousel state
  const [ticketPhotos, setTicketPhotos] = useState([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    
    // Fetch Ticket details & Comments simultaneously
    const fetchTicket = api.get(`/tickets/${id}`);
    const fetchComments = api.get(`/tickets/${id}/comments`);

    Promise.all([fetchTicket, fetchComments])
      .then(([ticketRes, commentsRes]) => {
        const t = ticketRes.data.data;
        setTicket(t);
        setUpvotes(t.upvote_count);
        setVerificationsCount(t.resolved_signal_count);

        // Fallback photos list if backend array is empty
        const defaultPhotos = [
          { url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80', uploaded_by: 'Public Upload', uploaded_at: t.created_at },
          { url: 'https://images.unsplash.com/photo-1599740831146-80a8352307a8?auto=format&fit=crop&w=800&q=80', uploaded_by: 'System Audit', uploaded_at: t.created_at }
        ];
        setTicketPhotos(t.photos && t.photos.length > 0 ? t.photos : defaultPhotos);
        setComments(commentsRes.data.data.comments || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error loading ticket details:', err);
        setError('Failed to retrieve ticket info from server. Please try again.');
        setIsLoading(false);
      });
  }, [id]);

  const handleUpvote = () => {
    if (!isLoggedIn) {
      setModalReason('upvote');
      setShowAuthModal(true);
      return;
    }

    if (hasUpvoted) {
      // Remove Upvote
      api.delete(`/tickets/${id}/upvote`)
        .then(() => {
          setUpvotes(prev => prev - 1);
          setHasUpvoted(false);
        })
        .catch((err) => console.error('Error removing upvote:', err));
    } else {
      // Add Upvote
      api.post(`/tickets/${id}/upvote`)
        .then((response) => {
          setUpvotes(response.data.data.upvote_count);
          setHasUpvoted(true);
        })
        .catch((err) => {
          if (err.response && err.response.status === 409) {
            setHasUpvoted(true); // User had already upvoted
          }
          console.error('Error registering upvote:', err);
        });
    }
  };

  const handleVerifyResolved = () => {
    if (!isLoggedIn) {
      setModalReason('resolve');
      setShowAuthModal(true);
      return;
    }
    if (hasVerifiedResolved) return; // Locked state upon validation

    api.post(`/tickets/${id}/mark-resolved`)
      .then((response) => {
        setHasVerifiedResolved(true);
        setVerificationsCount(response.data.data.resolved_signal_count);
      })
      .catch((err) => {
        console.error('Error marking resolution:', err);
      });
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    api.post(`/tickets/${id}/comments`, { text: newComment })
      .then((response) => {
        setComments(prev => [response.data.data, ...prev]);
        setNewComment('');
        setIsSubmittingComment(false);
      })
      .catch((err) => {
        console.error('Error posting comment:', err);
        setIsSubmittingComment(false);
      });
  };

  // Helper dynamic mappings for vertical stepper timeline
  const getStepStatus = (stepName) => {
    const statuses = ['reported', 'verified', 'acknowledged', 'in_progress', 'resolved'];
    const currentIdx = statuses.indexOf(ticket?.status || 'reported');
    const stepIdx = statuses.indexOf(stepName.toLowerCase().replace(' ', '_'));
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const getStepDate = (stepName) => {
    const stepSlug = stepName.toLowerCase().replace(' ', '_');
    const entry = ticket?.status_history?.find(h => h.status === stepSlug);
    if (!entry) return '';
    return new Date(entry.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStepDesc = (stepName) => {
    const stepSlug = stepName.toLowerCase().replace(' ', '_');
    const entry = ticket?.status_history?.find(h => h.status === stepSlug);
    if (entry) return entry.note || `Status changed to ${stepName}.`;
    
    if (stepSlug === 'reported') return 'Citizen complaint registered.';
    if (stepSlug === 'verified') return 'Automatic verification criteria met.';
    if (stepSlug === 'acknowledged') return 'Acknowledged by Municipal Office.';
    if (stepSlug === 'in_progress') return 'Repair crews dispatch pending.';
    return 'Awaiting citizen completion review.';
  };

  const steps = [
    { label: 'Reported', status: getStepStatus('reported'), desc: getStepDesc('reported'), date: getStepDate('reported') },
    { label: 'Verified', status: getStepStatus('verified'), desc: getStepDesc('verified'), date: getStepDate('verified') },
    { label: 'Acknowledged', status: getStepStatus('acknowledged'), desc: getStepDesc('acknowledged'), date: getStepDate('acknowledged') },
    { label: 'In Progress', status: getStepStatus('in_progress'), desc: getStepDesc('in_progress'), date: getStepDate('in_progress') },
    { label: 'Resolved', status: getStepStatus('resolved'), desc: getStepDesc('resolved'), date: getStepDate('resolved') },
  ];

  // Screen Loader views
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#FAFBFD] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">Syncing Ticket Ledger...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#FAFBFD] space-y-3 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-extrabold text-text-primary">Failed to Sync</h3>
        <p className="text-xs text-text-secondary max-w-sm leading-relaxed">{error || 'Ticket not found.'}</p>
        <Link to="/dashboard" className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-button shadow mt-2">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const capitalizedCategory = ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1);
  const locationPosition = ticket.location?.coordinates;
  const displayAddress = ticket.address || `${capitalizedCategory} reported near ${locationPosition?.[1]?.toFixed(4)}°N, ${locationPosition?.[0]?.toFixed(4)}°E`;
  const dynamicDescription = `Active public ${ticket.category} complaint registered in this zone. Civic authorities have been notified, and community members are actively upvoting this report to highlight its urgency.`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Columns) - Details, Slideshow, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-6">
              <div className="space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  ticket.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                  ticket.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-green-50 text-green-700 border-green-200'
                }`}>
                  {ticket.severity} Priority
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">{capitalizedCategory} Incident</h1>
                <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{displayAddress}</span>
                </p>
              </div>

              {/* Glowing Upvote Trigger */}
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-extrabold rounded-button border transition-all duration-300 active:scale-95 ${
                  hasUpvoted
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current animate-bounce' : ''}`} />
                <span>Upvotes ({upvotes})</span>
              </button>
            </div>

            {/* Custom Carousel */}
            <div className="relative aspect-video w-full bg-gray-950 rounded-card overflow-hidden border border-gray-100 group shadow-inner">
              <img 
                src={ticketPhotos[activePhotoIdx]?.url} 
                alt="Civic Issue Upload" 
                className="w-full h-full object-contain transition-all duration-500" 
              />
              
              {/* Overlay Metadata */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs flex justify-between items-end backdrop-blur-[1px]">
                <div className="space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Submitted by {ticketPhotos[activePhotoIdx]?.uploaded_by || 'Citizen'}</span>
                  </p>
                  <p className="text-gray-300 text-[10px]">
                    Uploaded on {ticketPhotos[activePhotoIdx]?.uploaded_at ? new Date(ticketPhotos[activePhotoIdx].uploaded_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-white/20 rounded backdrop-blur-md text-[10px] font-bold">
                  {activePhotoIdx + 1} / {ticketPhotos.length}
                </span>
              </div>

              {/* Navigation Arrows */}
              {ticketPhotos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev === 0 ? ticketPhotos.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev === ticketPhotos.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Description content */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Description</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                {dynamicDescription}
              </p>
            </div>

          </div>

          {/* Comments section */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Comments ({comments.length})</span>
            </h3>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-xs text-text-secondary italic">No comments posted yet. Be the first to share an update!</p>
              ) : (
                comments.map((comment) => {
                  const authorInitial = comment.user_id ? comment.user_id.slice(-2).toUpperCase() : 'C';
                  const dateStr = comment.created_at 
                    ? new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : '';
                  
                  const currentUserId = sessionStorage.getItem('userId');
                  const isMe = comment.user_id === currentUserId;
                  const displayName = isMe 
                    ? `${sessionStorage.getItem('userName') || 'You'} (Citizen)` 
                    : `Citizen #${comment.user_id?.slice(-4)}`;

                  return (
                    <div key={comment.comment_id} className="flex gap-3 text-sm border-b border-gray-100 pb-4 last:border-0 last:pb-0 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs border border-primary/20">
                        {authorInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <span className="font-bold text-text-primary">{displayName}</span>
                          <span className="text-[10px] text-text-secondary font-mono">{dateStr}</span>
                        </div>
                        <p className="text-text-secondary text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment Form input */}
            {!isLoggedIn ? (
              <div className="relative overflow-hidden p-6 bg-gradient-to-r from-primary/[0.03] to-accent/[0.03] border border-primary/10 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none -z-10" />
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-text-primary">Want to join the conversation?</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Sign in or register to post comments, share real-time updates, or confirm resolution.
                    </p>
                  </div>
                </div>

                <Link
                  to="/login"
                  state={{ from: window.location.pathname }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all duration-300 whitespace-nowrap cursor-pointer hover:scale-[1.02]"
                >
                  <span>Sign In to Comment</span>
                  <LogIn className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a supportive comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                  className="flex-1 min-w-0 border border-gray-200 bg-gray-50/50 rounded-button px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-5 py-2.5 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-colors shadow-md shadow-primary/10 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Right Column (4 Columns) - Stepper Progress & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Glowing Vertical Timeline Stepper */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-text-primary border-b border-gray-100 pb-4">Resolution Progress</h2>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {steps.map((step, idx) => (
                  <li key={step.label}>
                    <div className="relative pb-8">
                      {idx !== steps.length - 1 && (
                        <span className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`} aria-hidden="true" />
                      )}
                      
                      <div className="relative flex space-x-3 items-start">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white transition-all duration-300 ${
                            step.status === 'completed'
                              ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                              : step.status === 'current'
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 animate-pulse'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-sm font-bold text-text-primary">{step.label}</p>
                            <span className="text-[10px] text-text-secondary font-mono">{step.date}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
                        </div>
                      </div>

                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ticket Metadata statistics */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-gray-100 pb-2">Ticket Metadata</h3>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Merged Reports</span>
              </span>
              <span className="font-bold text-text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px]">
                {ticket.report_count} submissions
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Created Date</span>
              </span>
              <span className="font-bold text-text-primary">
                {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
              <span className="text-text-secondary flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Citizen Confirmations</span>
              </span>
              <span className="font-bold text-text-primary bg-green-50 px-2 py-0.5 rounded text-[10px] border border-green-200">
                {verificationsCount} verifications
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2 space-y-3">
              <button
                onClick={handleVerifyResolved}
                disabled={hasVerifiedResolved}
                className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-button transition-all duration-300 border ${
                  hasVerifiedResolved
                    ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/10 cursor-not-allowed'
                    : 'border-green-300 text-green-700 bg-green-500/10 hover:bg-green-500/20 cursor-pointer hover:scale-[1.02] active:scale-97'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{hasVerifiedResolved ? 'Resolution Verified ✓' : 'Mark as Already Resolved'}</span>
              </button>

              {hasVerifiedResolved && (
                <div className="p-3 bg-green-50 border border-green-200/60 rounded-card text-[11px] text-green-800 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                  <strong>Verification Logged!</strong> Thank you for verifying this repair. Your feedback is sent to the Public Works Dept to close this ticket.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      
      {/* Auth Warning Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAuthModal(false)}
            className="absolute inset-0 bg-[#0E131F]/60 backdrop-blur-sm transition-opacity duration-300" 
          />
          
          <div className="relative bg-white rounded-card border border-gray-100 max-w-md w-full p-8 shadow-2xl space-y-6 transform transition-all duration-300 animate-in zoom-in-95 z-10 text-center">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-text-primary leading-tight">
                Authentication Required
              </h3>
              <p className="text-sm text-text-primary/75 font-semibold leading-relaxed px-2">
                {modalReason === 'upvote' 
                  ? 'To upvote this infrastructure report and flag its priority to city zone engineers, you must first sign in to your civic account.'
                  : 'To verify municipal resolution status and submit feedback, you must first sign in to your civic account.'
                }
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                state={{ from: window.location.pathname, message: `Please sign in to ${modalReason === 'upvote' ? 'upvote issues' : 'verify ticket resolution'}.` }}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/10 active:scale-97 cursor-pointer hover:scale-[1.02]"
              >
                <span>Sign In</span>
                <LogIn className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-button border border-gray-200 bg-white text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-all duration-300 shadow-sm active:scale-97"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
