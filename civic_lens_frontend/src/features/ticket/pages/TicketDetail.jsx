/**
 * ==============================================================================
 * CIVIC LENS — TICKET DETAILS / CASE-FILE DOSSIER (PAGE 8 OF 14 REDESIGN)
 * ==============================================================================
 * 
 * DESIGN MANDATE: "CASE-FILE" AESTHETIC
 * - Replaced generic admin panel forms with a high-fidelity investigative Case Dossier.
 * - Evidence-First Anchor: Prominent photo canvas in Deep Survey Ink (#10263A) with
 *   authentic corner viewfinder reticles (┌ ┐ └ ┘) and integrated field survey annotations
 *   (geo-coordinates, submitter attribution, upload timestamps, and frame counter).
 * - Status as Resolution Pipeline: 5-stage lifecycle chain (Reported → Verified →
 *   Acknowledged → In Progress → Resolved) making clear exactly where in the municipal
 *   chain the ticket sits.
 * - Vertical Resolution Timeline Spine: Continuous hairline ink-line spine connecting
 *   audit history stages with distinct completed, current-active, and pending nodes.
 * - Typography: Space Grotesk / Big Shoulders Stencil for case headers, JetBrains Mono
 *   for telemetry metadata & tags, and Inter for descriptions and comment logs.
 * - 100% Preserved Functionality: Upvote toggle & counter, photo carousel & resolution
 *   proofs, citizen "Mark as Already Resolved" verifications, comments log, and auth guard.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ThumbsUp, MapPin, Clock, Calendar, CheckCircle2, User, 
  ChevronLeft, ChevronRight, MessageSquare, AlertCircle, LogIn, 
  X, ShieldAlert, ShieldCheck, Loader2, Crosshair, ArrowRight, ArrowLeft,
  Layers, Activity, Check, Send, Sparkles, AlertTriangle, Circle
} from 'lucide-react';
import api from '../../../services/api';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  const getPhotoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    return `http://localhost:8000${url.startsWith('/') ? '' : '/'}${url}`;
  };

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
    setError(null);
    
    // Fetch Ticket details & Comments simultaneously
    const fetchTicket = api.get(`/tickets/${id}`);
    const fetchComments = api.get(`/tickets/${id}/comments`);

    Promise.all([fetchTicket, fetchComments])
      .then(([ticketRes, commentsRes]) => {
        const t = ticketRes.data?.data || null;
        if (!t) {
          setError('Ticket data was empty or not found.');
          setIsLoading(false);
          return;
        }

        setTicket(t);
        setUpvotes(t.upvote_count || 0);
        setVerificationsCount(t.resolved_signal_count || 0);
        setHasUpvoted(!!t.has_upvoted);
        setHasVerifiedResolved(!!t.has_verified);

        // Fallback photos list if backend array is empty
        const defaultPhotos = [
          { url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80', uploaded_by: 'Public Upload', uploaded_at: t.created_at },
          { url: 'https://images.unsplash.com/photo-1599740831146-80a8352307a8?auto=format&fit=crop&w=800&q=80', uploaded_by: 'System Audit', uploaded_at: t.created_at }
        ];

        let photosList = t.photos && t.photos.length > 0 ? [...t.photos] : defaultPhotos;
        if (t.resolved_photo) {
          photosList.unshift({
            url: t.resolved_photo.url,
            uploaded_by: 'Admin Resolution Verification',
            uploaded_at: t.resolved_photo.uploaded_at,
            is_resolution: true
          });
        }
        setTicketPhotos(photosList);
        setComments(commentsRes.data?.data?.comments || []);
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
          setUpvotes(prev => Math.max(0, prev - 1));
          setHasUpvoted(false);
        })
        .catch((err) => console.error('Error removing upvote:', err));
    } else {
      // Add Upvote
      api.post(`/tickets/${id}/upvote`)
        .then((response) => {
          setUpvotes(response.data?.data?.upvote_count ?? (upvotes + 1));
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
        setVerificationsCount(response.data?.data?.resolved_signal_count ?? (verificationsCount + 1));
      })
      .catch((err) => {
        if (err.response && err.response.status === 409) {
          setHasVerifiedResolved(true);
        }
        console.error('Error marking resolution:', err);
      });
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    api.post(`/tickets/${id}/comments`, { text: newComment })
      .then((response) => {
        if (response.data?.data) {
          setComments(prev => [response.data.data, ...prev]);
        }
        setNewComment('');
        setIsSubmittingComment(false);
      })
      .catch((err) => {
        console.error('Error posting comment:', err);
        setIsSubmittingComment(false);
      });
  };

  // Helper dynamic mappings for 5-stage vertical stepper timeline
  const getStepStatus = (stepName) => {
    const statuses = ['reported', 'verified', 'acknowledged', 'in_progress', 'resolved'];
    const currentIdx = statuses.indexOf((ticket?.status || 'reported').toLowerCase());
    const stepIdx = statuses.indexOf(stepName.toLowerCase().replace(/ /g, '_'));
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const getStepDate = (stepName) => {
    const stepSlug = stepName.toLowerCase().replace(/ /g, '_');
    const entry = ticket?.status_history?.find(h => h.status === stepSlug);
    if (!entry || !entry.changed_at) return '';
    return new Date(entry.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStepDesc = (stepName) => {
    const stepSlug = stepName.toLowerCase().replace(/ /g, '_');
    const entry = ticket?.status_history?.find(h => h.status === stepSlug);
    if (entry && entry.note) return entry.note;
    
    if (stepSlug === 'reported') return 'Citizen photographic evidence & geotag registered.';
    if (stepSlug === 'verified') return 'Automated AI defect taxonomy & cluster verification met.';
    if (stepSlug === 'acknowledged') return 'Acknowledged by Municipal Ward Engineers.';
    if (stepSlug === 'in_progress') return 'Field repair crew work order dispatched.';
    return 'Awaiting public confirmation of completed repairs.';
  };

  const stages = [
    { label: 'Reported', slug: 'reported', status: getStepStatus('reported'), desc: getStepDesc('reported'), date: getStepDate('reported') },
    { label: 'Verified', slug: 'verified', status: getStepStatus('verified'), desc: getStepDesc('verified'), date: getStepDate('verified') },
    { label: 'Acknowledged', slug: 'acknowledged', status: getStepStatus('acknowledged'), desc: getStepDesc('acknowledged'), date: getStepDate('acknowledged') },
    { label: 'In Progress', slug: 'in_progress', status: getStepStatus('in_progress'), desc: getStepDesc('in_progress'), date: getStepDate('in_progress') },
    { label: 'Resolved', slug: 'resolved', status: getStepStatus('resolved'), desc: getStepDesc('resolved'), date: getStepDate('resolved') },
  ];

  // Screen Loader views
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] flex flex-col justify-center items-center py-24 space-y-3 font-mono text-xs text-ink/60 dark:text-gray-400 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="uppercase tracking-widest animate-pulse">Retrieving Case Dossier…</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] flex flex-col justify-center items-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-card bg-red-500/10 border-2 border-severity-high/40 flex items-center justify-center text-severity-high mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">// DOSSIER RETRIEVAL ERROR</span>
          <h2 className="font-display text-2xl font-bold text-ink dark:text-white">Case File Not Found</h2>
          <p className="text-xs text-ink/70 dark:text-gray-400 font-sans max-w-sm leading-relaxed">{error || 'This ticket does not exist or has been removed from the registry.'}</p>
        </div>
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink text-paper dark:bg-accent dark:text-ink rounded-button font-mono text-xs font-bold uppercase tracking-wider shadow hover:bg-ink-muted transition-all"
        >
          <span>Return to Map Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const ticketKey = String(ticket.ticket_id || ticket.id || id || '');
  const ticketRefCode = ticketKey.length >= 8 ? ticketKey.slice(-8).toUpperCase() : ticketKey.toUpperCase();
  const capitalizedCategory = ticket.category ? (ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)) : 'Civic';
  const locationPosition = ticket.location?.coordinates;
  const displayAddress = ticket.address || `${capitalizedCategory} reported at ${locationPosition?.[1] ? locationPosition[1].toFixed(4) : '23.0225'}°N, ${locationPosition?.[0] ? locationPosition[0].toFixed(4) : '72.5714'}°E`;
  const dynamicDescription = ticket.description || `Active public ${ticket.category || 'infrastructure'} issue logged in this ward sector. Municipal authorities have received telemetry, and citizens can confirm resolution or contribute updates below.`;

  // Priority color config
  const severityMeta = {
    high: {
      label: 'HIGH PRIORITY',
      badgeClass: 'bg-red-500/10 text-severity-high border-severity-high/40 dark:bg-red-950/40',
    },
    medium: {
      label: 'MEDIUM PRIORITY',
      badgeClass: 'bg-amber-500/10 text-severity-medium border-severity-medium/40 dark:bg-amber-950/40',
    },
    low: {
      label: 'LOW PRIORITY',
      badgeClass: 'bg-green-500/10 text-severity-low border-severity-low/40 dark:bg-green-950/40',
    }
  }[(ticket.severity || 'medium').toLowerCase()] || {
    label: 'STANDARD PRIORITY',
    badgeClass: 'bg-primary/10 text-primary border-primary/30 dark:bg-blue-950/40',
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 text-ink dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ── BACK NAVIGATION BAR ── */}
        <div className="flex items-center justify-between font-mono text-xs">
          <Link
            to="/my-reports"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-button bg-paper-card dark:bg-[#131A26] border border-ink-line dark:border-gray-700 text-ink/80 dark:text-gray-300 hover:text-accent dark:hover:text-accent hover:border-accent dark:hover:border-accent transition-all duration-200 font-bold uppercase tracking-wider shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-accent flex-shrink-0" />
            <span>Back to My Reports</span>
          </Link>

          <Link
            to="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-ink/50 dark:text-gray-400 hover:text-ink dark:hover:text-white transition-colors"
          >
            <span>Explore Map Grid</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ═════════════════════════════════════════════════════════════
            1. TOP CASE DOSSIER HEADER & UPVOTE BAR
           ═════════════════════════════════════════════════════════════ */}
        <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-6 sm:p-7 shadow-xl space-y-5 text-left">
          
          {/* Telemetry Eyebrow */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/70 dark:text-gray-400">
            <div className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold text-accent">CASE DOSSIER // AHMEDABAD GRID</span>
              <span>·</span>
              <span className="text-ink dark:text-gray-300">REF #{ticketRefCode}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <Activity className="w-3 h-3 text-accent flex-shrink-0" />
              <span>STATUS: {ticket.status?.toUpperCase().replace(/_/g, ' ') || 'ACTIVE'}</span>
            </div>
          </div>

          {/* Main Title & Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap w-fit ${severityMeta.badgeClass}`}>
                  {severityMeta.label}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 font-mono text-[10px] text-ink/70 dark:text-gray-300 uppercase whitespace-nowrap w-fit">
                  <Layers className="w-3 h-3 text-accent flex-shrink-0" />
                  <span>{ticket.report_count || 1} MERGED REPORTS</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink dark:text-white tracking-tight leading-tight">
                {capitalizedCategory} Incident
              </h1>

              <p className="flex items-center gap-1.5 text-xs sm:text-sm text-ink/80 dark:text-gray-300 font-mono">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{displayAddress}</span>
              </p>
            </div>

            {/* Glowing Upvote Trigger Button */}
            <div className="flex items-center gap-3 self-start md:self-center">
              <button
                type="button"
                onClick={handleUpvote}
                className={`flex items-center gap-2.5 py-3.5 px-6 rounded-button font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 border-2 cursor-pointer shadow-md active:scale-95 whitespace-nowrap ${
                  hasUpvoted
                    ? 'bg-accent text-ink border-accent hover:bg-amber-400 shadow-accent/20'
                    : 'bg-paper dark:bg-gray-800 text-ink dark:text-white border-ink dark:border-gray-700 hover:border-accent dark:hover:border-accent hover:bg-paper-sheet'
                }`}
                title="Upvote this issue to raise municipal priority"
              >
                <ThumbsUp className={`w-4 h-4 flex-shrink-0 ${hasUpvoted ? 'fill-current' : ''}`} />
                <span>Upvotes ({upvotes})</span>
              </button>
            </div>

          </div>

          {/* Horizontal Lifecycle Pipeline Chain */}
          <div className="pt-3 border-t border-ink-line dark:border-gray-800">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
              <span className="text-ink/50 dark:text-gray-400 uppercase tracking-widest block whitespace-nowrap">
                RESOLUTION CHAIN:
              </span>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {stages.map((stg, i) => (
                  <React.Fragment key={stg.slug}>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                      stg.status === 'completed'
                        ? 'bg-green-500/15 text-severity-low border border-severity-low/40'
                        : stg.status === 'current'
                        ? 'bg-accent text-ink border border-accent animate-pulse'
                        : 'bg-paper dark:bg-gray-900 text-ink/40 dark:text-gray-600 border border-ink-line dark:border-gray-800'
                    }`}>
                      {stg.status === 'completed' ? <Check className="w-2.5 h-2.5" /> : <span>{`0${i + 1}`}</span>}
                      <span>{stg.label}</span>
                    </div>
                    {i < stages.length - 1 && (
                      <span className="text-ink/30 dark:text-gray-600 text-xs select-none">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════
            2. MAIN CASE DOSSIER BODY (GRID LAYOUT)
           ═════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT COLUMN (7-8 COLS): EVIDENCE CANVAS, DESCRIPTION, COMMENTS ── */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-8">
            
            {/* ── EVIDENCE INSPECTION CANVAS ── */}
            <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 shadow-xl space-y-5 text-left">
              
              {/* Evidence Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ink-line dark:border-gray-800 font-mono text-[10px]">
                <div className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                  <span className="font-bold text-accent uppercase tracking-wider">
                    PRIMARY PHOTOGRAPHIC EVIDENCE
                  </span>
                </div>
                <span className="text-ink/60 dark:text-gray-400">
                  FRAME {activePhotoIdx + 1} OF {ticketPhotos.length || 1}
                </span>
              </div>

              {/* Viewfinder Evidence Viewer Frame */}
              <div className="relative aspect-[16/10] sm:aspect-video w-full bg-ink rounded-card overflow-hidden border-2 border-ink dark:border-gray-700 group/viewer shadow-2xl flex items-center justify-center">
                
                {/* Viewfinder Corner Reticles */}
                <div className="absolute top-3 left-3 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                  ┌
                </div>
                <div className="absolute top-3 right-3 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                  ┐
                </div>
                <div className="absolute bottom-16 left-3 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                  └
                </div>
                <div className="absolute bottom-16 right-3 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                  ┘
                </div>

                {/* The Evidence Image */}
                <img 
                  src={getPhotoUrl(ticketPhotos[activePhotoIdx]?.url)} 
                  alt="Civic issue documented evidence" 
                  className="w-full h-full object-contain transition-all duration-300" 
                />

                {/* Submitter & Metadata Overlay Strip */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-white text-xs flex justify-between items-end backdrop-blur-[2px] z-10 font-mono">
                  <div className="space-y-0.5 text-left">
                    <p className="font-bold flex items-center gap-1.5 text-accent text-[11px]">
                      <User className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>
                        {ticketPhotos[activePhotoIdx]?.is_resolution 
                          ? 'MUNICIPAL RESOLUTION VERIFICATION PROOF' 
                          : `SUBMITTED BY: ${ticketPhotos[activePhotoIdx]?.uploaded_by || 'Verified Citizen'}`}
                      </span>
                    </p>
                    <p className="text-gray-300 text-[10px]">
                      LOGGED: {ticketPhotos[activePhotoIdx]?.uploaded_at ? new Date(ticketPhotos[activePhotoIdx].uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>

                  {ticketPhotos[activePhotoIdx]?.is_resolution && (
                    <span className="px-2.5 py-1 bg-severity-low text-white rounded font-bold text-[9px] uppercase tracking-wider shadow">
                      ✓ Resolution Proof
                    </span>
                  )}
                </div>

                {/* Carousel Arrows */}
                {ticketPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx(prev => (prev === 0 ? ticketPhotos.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-button backdrop-blur-md transition-all border border-white/20 z-20 cursor-pointer"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx(prev => (prev === ticketPhotos.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-button backdrop-blur-md transition-all border border-white/20 z-20 cursor-pointer"
                      title="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

              </div>

              {/* Photo Pagination Dots */}
              {ticketPhotos.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  {ticketPhotos.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActivePhotoIdx(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer border-0 ${
                        activePhotoIdx === i ? 'w-6 bg-accent' : 'w-2 bg-ink-line dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* ── INCIDENT DESCRIPTION ── */}
              <div className="pt-3 border-t border-ink-line dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-accent uppercase tracking-wider">
                    // FIELD OBSERVATIONS & CONTEXT
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
                  {dynamicDescription}
                </p>
              </div>

            </div>

            {/* ── CASE DISCUSSION LOG & COMMENTS ── */}
            <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 shadow-xl space-y-6 text-left">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-ink-line dark:border-gray-800">
                <div className="inline-flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-base font-bold text-ink dark:text-white">
                    Case Discussion Log ({comments.length})
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-ink/60 dark:text-gray-400 uppercase">
                  PUBLIC FORUM
                </span>
              </div>

              {/* Comments Stream */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="p-6 text-center rounded bg-paper dark:bg-gray-900 border border-dashed border-ink-line dark:border-gray-700 space-y-1">
                    <p className="font-mono text-xs text-ink/60 dark:text-gray-400">
                      No comments logged for this case docket yet.
                    </p>
                    <p className="text-[11px] text-ink/50 dark:text-gray-500 font-sans">
                      Be the first to share an on-site update or confirm current conditions.
                    </p>
                  </div>
                ) : (
                  comments.map((comment) => {
                    const authorInitial = comment.user_id ? comment.user_id.slice(-2).toUpperCase() : 'C';
                    const dateStr = comment.created_at 
                      ? new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : 'Recently';
                    
                    const currentUserId = sessionStorage.getItem('userId');
                    const isMe = comment.user_id === currentUserId;
                    const displayName = isMe 
                      ? `${sessionStorage.getItem('userName') || 'You'} (Citizen)` 
                      : `Citizen #${comment.user_id?.slice(-4) || 'VERIFIED'}`;

                    return (
                      <div key={comment.comment_id || comment.id || String(Math.random())} className="p-4 rounded-card bg-paper dark:bg-gray-900/60 border border-ink-line dark:border-gray-800 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-ink-line/50 dark:border-gray-800/80">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-accent/20 text-accent flex items-center justify-center font-mono font-bold text-[10px] border border-accent/40 flex-shrink-0">
                              {authorInitial}
                            </div>
                            <span className="font-bold text-xs text-ink dark:text-white">
                              {displayName}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-ink/50 dark:text-gray-400">
                            {dateStr}
                          </span>
                        </div>
                        <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Comment Input or Auth Prompt */}
              {!isLoggedIn ? (
                <div className="p-5 bg-paper dark:bg-gray-900 border-2 border-dashed border-ink-line dark:border-gray-700 rounded-card flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-left">
                    <h4 className="font-display text-sm font-bold text-ink dark:text-white">
                      Sign in to contribute updates
                    </h4>
                    <p className="text-xs text-ink/70 dark:text-gray-400 font-sans leading-relaxed">
                      Citizen authentication is required to post verified comments or report repair progress.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    state={{ from: window.location.pathname }}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-button bg-accent text-ink hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow transition-all whitespace-nowrap cursor-pointer flex-shrink-0"
                  >
                    <span>Sign In</span>
                    <LogIn className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handlePostComment} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    placeholder="Write an on-site update or field confirmation…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isSubmittingComment}
                    className="flex-1 px-3.5 py-2.5 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-gray-200 text-xs font-sans placeholder-ink/40 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-button bg-ink text-paper dark:bg-accent dark:text-ink hover:bg-ink-muted dark:hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow border-0"
                  >
                    {isSubmittingComment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Posting…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* ── RIGHT COLUMN (4-5 COLS): RESOLUTION TIMELINE & METADATA ── */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            
            {/* ── VERTICAL RESOLUTION PROGRESS TIMELINE ── */}
            <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 shadow-xl space-y-5 text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-ink-line dark:border-gray-800">
                <h2 className="font-display text-base font-bold text-ink dark:text-white">
                  Resolution Pipeline
                </h2>
                <span className="font-mono text-[10px] text-accent uppercase font-bold">
                  LIVE AUDIT
                </span>
              </div>

              {/* Connected Vertical Timeline Spine */}
              <div className="relative pl-6 space-y-6">
                
                {/* Continuous Spine Line */}
                <div className="absolute top-3 bottom-3 left-2.5 w-0.5 bg-ink-line dark:bg-gray-800 pointer-events-none" />

                {stages.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div key={step.slug} className="relative group">
                      
                      {/* Node Circle */}
                      <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                        isCompleted
                          ? 'bg-severity-low border-severity-low text-white shadow-sm'
                          : isCurrent
                          ? 'bg-accent border-accent text-ink animate-pulse shadow-md shadow-accent/20'
                          : 'bg-paper dark:bg-gray-900 border-ink-line dark:border-gray-700 text-ink/30 dark:text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 rounded-full bg-ink" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-ink-line dark:bg-gray-700" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
                            isCompleted || isCurrent ? 'text-ink dark:text-white' : 'text-ink/50 dark:text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                          {step.date && (
                            <span className="font-mono text-[9px] text-ink/60 dark:text-gray-400">
                              {step.date}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink/70 dark:text-gray-400 font-sans leading-relaxed">
                          {step.desc}
                        </p>
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

            {/* ── TICKET METADATA AUDIT PANEL ── */}
            <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 shadow-xl space-y-4 text-left">
              
              <div className="flex items-center justify-between pb-2 border-b border-ink-line dark:border-gray-800">
                <h3 className="font-display text-sm font-bold text-ink dark:text-white">
                  Ticket Metadata
                </h3>
                <span className="font-mono text-[9px] text-ink/50 dark:text-gray-400 uppercase">
                  LEDGER LOG
                </span>
              </div>

              {/* Data Pairs */}
              <div className="space-y-3 font-mono text-xs">
                
                <div className="flex justify-between items-center pb-2 border-b border-ink-line/60 dark:border-gray-850">
                  <span className="text-ink/60 dark:text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>Merged Reports</span>
                  </span>
                  <span className="font-bold text-ink dark:text-white px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 text-[10px]">
                    {ticket.report_count || 1} Submissions
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-ink-line/60 dark:border-gray-850">
                  <span className="text-ink/60 dark:text-gray-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>Created Date</span>
                  </span>
                  <span className="font-bold text-ink dark:text-white text-[11px]">
                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-ink-line/60 dark:border-gray-850">
                  <span className="text-ink/60 dark:text-gray-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>Municipal Ward</span>
                  </span>
                  <span className="font-bold text-ink dark:text-white text-[11px] truncate max-w-[140px]">
                    {ticket.zone_id || 'Ahmedabad Grid'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-ink/60 dark:text-gray-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-severity-low flex-shrink-0" />
                    <span>Citizen Confirmations</span>
                  </span>
                  <span className="font-bold text-severity-low px-2 py-0.5 rounded bg-green-500/10 border border-severity-low/30 text-[10px]">
                    {verificationsCount} Verifications
                  </span>
                </div>

              </div>

              {/* Citizen Resolution Verification Action */}
              <div className="pt-3 border-t border-ink-line dark:border-gray-800 space-y-2.5">
                <button
                  type="button"
                  onClick={handleVerifyResolved}
                  disabled={hasVerifiedResolved}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-button font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 border-2 cursor-pointer ${
                    hasVerifiedResolved
                      ? 'bg-severity-low border-severity-low text-white shadow-sm cursor-not-allowed'
                      : 'border-severity-low/60 text-severity-low bg-green-500/10 hover:bg-severity-low hover:text-white active:scale-97'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{hasVerifiedResolved ? 'Resolution Verified ✓' : 'Mark as Already Resolved'}</span>
                </button>

                {hasVerifiedResolved && (
                  <div className="p-3 bg-green-500/10 border border-severity-low/40 rounded-card text-xs text-ink dark:text-green-300 font-mono leading-relaxed text-left animate-in fade-in duration-200">
                    <strong className="text-severity-low">✓ VERIFICATION LOGGED:</strong> Feedback registered with municipal engineers to confirm repair closure.
                  </div>
                )}
              </div>

              {/* Admin Verified Photo Proof Card */}
              {ticket.status === 'resolved' && ticket.resolved_photo && (
                <div className="pt-3 border-t border-ink-line dark:border-gray-800 space-y-2">
                  <div className="p-3 rounded-card bg-green-500/10 border border-severity-low/40 space-y-2 text-left">
                    <p className="font-mono text-xs font-bold text-severity-low flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-severity-low flex-shrink-0" />
                      <span>OFFICIAL REPAIR PROOF</span>
                    </p>
                    <p className="text-[10px] text-ink/70 dark:text-gray-300 font-sans leading-tight">
                      This issue was closed and verified with official photographic proof.
                    </p>
                    <div className="relative rounded overflow-hidden aspect-video border border-severity-low/40 bg-black">
                      <img 
                        src={getPhotoUrl(ticket.resolved_photo.url)} 
                        alt="Resolution verification proof" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. AUTHENTICATION REQUIRED MODAL
         ═════════════════════════════════════════════════════════════ */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center relative">
            <button 
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-button text-ink/50 dark:text-gray-400 hover:text-ink dark:hover:text-white border-0 bg-transparent cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-accent/15 text-accent border-2 border-accent/40 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest block">
                // CITIZEN AUTHENTICATION REQUIRED
              </span>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                Sign In to Participate
              </h3>
              <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
                {modalReason === 'upvote' 
                  ? 'To upvote this infrastructure report and raise its priority for municipal engineers, please sign in to your citizen account.'
                  : 'To verify municipal repair completion and submit community feedback, please sign in to your citizen account.'
                }
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                state={{ from: window.location.pathname, message: `Please sign in to ${modalReason === 'upvote' ? 'upvote issues' : 'verify ticket resolution'}.` }}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-button bg-accent text-ink hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer border-0"
              >
                <span>Sign In to Continue</span>
                <LogIn className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 px-4 rounded-button bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 text-ink/70 dark:text-gray-300 hover:text-ink dark:hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
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
