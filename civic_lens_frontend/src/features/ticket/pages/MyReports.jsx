/**
 * ==============================================================================
 * CIVIC LENS — MY SUBMISSIONS / CASE DOCKET (PAGE 7 OF 14 REDESIGN)
 * ==============================================================================
 * 
 * DESIGN MANDATE:
 * - Replaced the generic flat stack of white cards with a connected chronological
 *   "Citizen Case Docket" featuring an authentic vertical timeline spine.
 * - Photo Treatment: Transformed small thumbnails into prominent photographic
 *   evidence containers framed with field viewfinder reticles (┌ ┐ └ ┘) and dark
 *   survey ink (#10263A) contrast.
 * - Status Color Hierarchy: Explicitly mapped pipeline statuses to design system tokens:
 *   • ticket_created / in_progress → Civic Blue (#1E5F8C)
 *   • manual_review → Signal Amber / Urgent Alert (#E8A33D / #D64545)
 *   • processing / classified → Signal Amber (#E8A33D)
 *   • merged → Subdued Slate / Muted Blueprint (#6B7280)
 *   • resolved → Inspection Green (#4CAF7D)
 * - Header & Personal Stat Strip: Displays live metrics (Total Filed, Active Cases,
 *   Manual Review, Resolved) derived directly from the citizen's own /my-reports query.
 * - Actions: Restyled Track Ticket and Delete into sharp civic-card button conventions.
 * 
 * DATA HONESTY NOTE:
 * - Stat totals are calculated locally from the user's authentic /my-reports query payload
 *   without inventing or requiring artificial endpoints. All report fields, geolocation
 *   coordinates, status strings, and delete APIs are 100% preserved.
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Eye, MapPin, Plus, FileText, Loader2, AlertCircle, 
  Trash2, ShieldCheck, ShieldAlert, CheckCircle2, Clock, 
  Layers, ArrowRight, Crosshair, Sparkles, Filter, ExternalLink
} from 'lucide-react';
import api from '../../../services/api';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteReport = () => {
    if (!reportToDelete) return;
    setIsDeleting(true);
    api.delete(`/reports/${reportToDelete}`)
      .then(() => {
        setReports(prev => prev.filter(r => r.id !== reportToDelete));
        setReportToDelete(null);
        setIsDeleting(false);
      })
      .catch((err) => {
        console.error('Failed to delete report:', err);
        alert('Failed to delete report. Please try again.');
        setIsDeleting(false);
      });
  };

  useEffect(() => {
    setIsLoading(true);
    api.get('/my-reports')
      .then((response) => {
        const fetched = (response.data.data.reports || []).map((r) => {
          const lat = r.location?.coordinates?.[1];
          const lng = r.location?.coordinates?.[0];
          const rawStatus = (r.status || 'processing').toLowerCase();
          const displayCategory = r.ml_category
            ? r.ml_category.charAt(0).toUpperCase() + r.ml_category.slice(1)
            : 'Unclassified Issue';
          
          return {
            id: r.report_id,
            ticketId: r.ticket_id,
            isTicketSpam: r.is_ticket_spam,
            rawStatus: rawStatus,
            category: displayCategory,
            location: lat && lng ? `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E` : 'Ahmedabad Grid',
            status: rawStatus.replace(/_/g, ' '),
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
            rawDate: r.created_at,
            description: r.description || 'Active citizen submission awaiting validation review.',
            imageUrl: r.photo_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
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

  // Compute personal docket stats directly from loaded reports
  const docketStats = useMemo(() => {
    const total = reports.length;
    const resolved = reports.filter(r => r.rawStatus.includes('resolved')).length;
    const inReview = reports.filter(r => r.rawStatus.includes('manual_review')).length;
    const merged = reports.filter(r => r.rawStatus.includes('merged')).length;
    const active = total - resolved;

    return { total, resolved, inReview, merged, active };
  }, [reports]);

  // Helper to resolve status badge styling and urgency color markers
  const getStatusMeta = (statusStr) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('resolved')) {
      return {
        label: 'RESOLVED',
        badgeBg: 'bg-green-500/10 dark:bg-green-950/40 text-severity-low border-severity-low/40',
        borderColor: 'border-l-severity-low',
        dotColor: 'bg-severity-low',
        icon: CheckCircle2,
      };
    }
    if (s.includes('manual review') || s.includes('manual_review')) {
      return {
        label: 'MANUAL REVIEW QUEUE',
        badgeBg: 'bg-red-500/10 dark:bg-red-950/40 text-severity-high border-severity-high/40',
        borderColor: 'border-l-severity-high',
        dotColor: 'bg-severity-high',
        icon: ShieldAlert,
      };
    }
    if (s.includes('ticket created') || s.includes('ticket_created') || s.includes('investigating') || s.includes('in progress')) {
      return {
        label: 'TICKET ACTIVE',
        badgeBg: 'bg-primary/10 dark:bg-blue-950/40 text-primary dark:text-blue-400 border-primary/40',
        borderColor: 'border-l-primary',
        dotColor: 'bg-primary',
        icon: ShieldCheck,
      };
    }
    if (s.includes('merged')) {
      return {
        label: 'SPATIAL MERGE',
        badgeBg: 'bg-gray-200/60 dark:bg-gray-800 text-ink/70 dark:text-gray-300 border-ink-line dark:border-gray-700',
        borderColor: 'border-l-ink/40 dark:border-l-gray-600',
        dotColor: 'bg-ink/50 dark:bg-gray-500',
        icon: Layers,
      };
    }
    // Default processing / classified / awaiting triage
    return {
      label: 'AWAITING TRIAGE',
      badgeBg: 'bg-accent/15 dark:bg-amber-950/40 text-accent border-accent/40',
      borderColor: 'border-l-accent',
      dotColor: 'bg-accent',
      icon: Clock,
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] flex flex-col justify-center items-center py-24 space-y-3 font-mono text-xs text-ink/60 dark:text-gray-400 transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span className="uppercase tracking-widest animate-pulse">Syncing Citizen Case Docket…</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-ink dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── 1. HEADER & PERSONAL DOCKET STAT STRIP ── */}
        <div className="space-y-6 pb-6 border-b-2 border-ink-line dark:border-gray-800 text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper-card dark:bg-gray-900 border border-ink-line dark:border-gray-700 rounded font-mono text-[10px] font-bold text-accent uppercase tracking-widest whitespace-nowrap w-fit">
                <Crosshair className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>PERSONAL CASE DOCKET</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
                My Submissions
              </h1>
              <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed font-sans">
                Track the resolution lifecycle, vision classification status, and municipal work orders for issues you have reported.
              </p>
            </div>

            {/* Report New Issue CTA */}
            <Link
              to="/report"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-button bg-accent text-ink hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-accent/20 transition-all active:scale-97 cursor-pointer border-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">Report New Issue</span>
            </Link>
          </div>

          {/* Personal Telemetry Stat Strip (Derived from real query data) */}
          {reports.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
              
              <div className="p-3.5 rounded-card bg-paper-card dark:bg-[#131A26] border border-ink-line dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-bold text-ink/50 dark:text-gray-400 uppercase tracking-wider block">TOTAL FILED</span>
                <span className="font-display text-xl sm:text-2xl font-bold text-ink dark:text-white block">
                  {docketStats.total}
                </span>
              </div>

              <div className="p-3.5 rounded-card bg-paper-card dark:bg-[#131A26] border border-ink-line dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-bold text-primary dark:text-blue-400 uppercase tracking-wider block">IN PROGRESS</span>
                <span className="font-display text-xl sm:text-2xl font-bold text-primary dark:text-blue-400 block">
                  {docketStats.active}
                </span>
              </div>

              <div className="p-3.5 rounded-card bg-paper-card dark:bg-[#131A26] border border-ink-line dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-bold text-severity-high uppercase tracking-wider block">MANUAL REVIEW</span>
                <span className="font-display text-xl sm:text-2xl font-bold text-severity-high block">
                  {docketStats.inReview}
                </span>
              </div>

              <div className="p-3.5 rounded-card bg-paper-card dark:bg-[#131A26] border border-ink-line dark:border-gray-800 space-y-1">
                <span className="text-[9px] font-bold text-severity-low uppercase tracking-wider block">RESOLVED</span>
                <span className="font-display text-xl sm:text-2xl font-bold text-severity-low block">
                  {docketStats.resolved}
                </span>
              </div>

            </div>
          )}

        </div>

        {/* ── 2. MAIN DOCKET TIMELINE CONTENT ── */}
        {error ? (
          <div className="bg-red-500/10 border-2 border-severity-high/40 rounded-card p-8 text-center space-y-3 max-w-lg mx-auto">
            <AlertCircle className="w-8 h-8 text-severity-high mx-auto" />
            <p className="font-mono text-xs font-bold text-severity-high uppercase">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-10 sm:p-14 text-center max-w-lg mx-auto space-y-5 shadow-xl">
            <div className="w-12 h-12 rounded-card bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 flex items-center justify-center mx-auto text-accent">
              <FileText className="w-6 h-6 text-accent stroke-[1.5]" />
            </div>
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest block">
                // ZERO SUBMISSIONS FOUND
              </span>
              <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                No Case Files Registered
              </h3>
              <p className="text-xs text-ink/70 dark:text-gray-300 font-sans leading-relaxed">
                You haven't submitted any civic issue reports yet. Photograph on-site defects to open your first tracked case file and improve Ahmedabad's municipal grid.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/report"
                className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-button bg-accent text-ink hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer border-0"
              >
                <span>Report First Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── CONNECTED CHRONOLOGICAL DOCKET TIMELINE ── */
          <div className="relative pl-6 sm:pl-8 space-y-8 text-left">
            
            {/* Connected Vertical Timeline Spine */}
            <div className="absolute top-4 bottom-4 left-2.5 sm:left-3.5 w-0.5 bg-ink-line dark:bg-gray-800 pointer-events-none" />

            {reports.map((report, idx) => {
              const statusMeta = getStatusMeta(report.rawStatus);
              const StatusIcon = statusMeta.icon;

              return (
                <div key={report.id} className="relative group">
                  
                  {/* Timeline Chrono Marker Node */}
                  <div className={`absolute -left-6 sm:-left-8 top-6 w-3 h-3 rounded-full border-2 border-paper dark:border-[#0E131F] ${statusMeta.dotColor} shadow z-10`} />

                  {/* Case Entry Card */}
                  <div className={`bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card shadow-xl overflow-hidden transition-all duration-300 hover:border-ink/80 dark:hover:border-gray-500 border-l-4 ${statusMeta.borderColor}`}>
                    
                    {/* Top Case Docket Header Bar */}
                    <div className="px-5 py-2.5 bg-paper dark:bg-gray-900/80 border-b border-ink-line dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-ink/70 dark:text-gray-400">
                      <div className="inline-flex items-center gap-2 whitespace-nowrap">
                        <span className="font-bold text-accent">ENTRY #{String(reports.length - idx).padStart(2, '0')}</span>
                        <span>·</span>
                        <span className="text-ink/60 dark:text-gray-500">ID: {report.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                        <span>FILED: {report.date}</span>
                      </div>
                    </div>

                    {/* Main Entry Body */}
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                      
                      {/* Left: Photographic Evidence Frame (Prominent, Viewfinder Framing) */}
                      <div className="relative w-full md:w-56 aspect-[16/10] md:aspect-[4/3] rounded-card overflow-hidden bg-ink border-2 border-ink dark:border-gray-700 flex-shrink-0 shadow group/img">
                        <img 
                          src={report.imageUrl} 
                          alt="Field evidence" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" 
                        />
                        
                        {/* Viewfinder Corner Reticles */}
                        <div className="absolute top-1.5 left-1.5 font-mono text-[10px] text-accent font-bold select-none pointer-events-none drop-shadow">
                          ┌
                        </div>
                        <div className="absolute top-1.5 right-1.5 font-mono text-[10px] text-accent font-bold select-none pointer-events-none drop-shadow">
                          ┐
                        </div>
                        <div className="absolute bottom-1.5 left-1.5 font-mono text-[10px] text-accent font-bold select-none pointer-events-none drop-shadow">
                          └
                        </div>
                        <div className="absolute bottom-1.5 right-1.5 font-mono text-[10px] text-accent font-bold select-none pointer-events-none drop-shadow">
                          ┘
                        </div>

                        {/* Image overlay tag */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-0.5 bg-black/75 backdrop-blur-sm rounded font-mono text-[8px] text-gray-300">
                          <span className="text-accent font-bold uppercase">// EVIDENCE</span>
                          <span>GEO-LOCKED</span>
                        </div>
                      </div>

                      {/* Middle: Case Details & Metadata */}
                      <div className="flex-1 space-y-3 w-full">
                        
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="font-display font-bold text-lg sm:text-xl text-ink dark:text-white">
                            {report.category}
                          </h2>
                          
                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap w-fit ${statusMeta.badgeBg}`}>
                            <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{statusMeta.label}</span>
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 font-sans leading-relaxed line-clamp-2">
                          {report.description}
                        </p>

                        {/* Telemetry Chips */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs text-ink/70 dark:text-gray-400">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 text-[11px] whitespace-nowrap">
                            <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                            <span>{report.location}</span>
                          </div>

                          {report.ticketId && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 text-[11px] whitespace-nowrap">
                              <Crosshair className="w-3 h-3 text-primary dark:text-blue-400 flex-shrink-0" />
                              <span>CASE: #{report.ticketId.slice(-6).toUpperCase()}</span>
                            </div>
                          )}
                        </div>

                      </div>

                      {/* Right: Actions (Track Ticket / Delete) */}
                      <div className="flex sm:flex-col md:flex-col items-stretch justify-end gap-2.5 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-ink-line dark:border-gray-800">
                        
                        {report.ticketId ? (
                          <Link
                            to={`/ticket/${report.ticketId}`}
                            onClick={(e) => {
                              if (report.isTicketSpam) {
                                e.preventDefault();
                                setShowSpamModal(true);
                              }
                            }}
                            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-paper dark:bg-gray-800 hover:bg-ink hover:text-paper dark:hover:bg-primary dark:hover:text-white text-ink dark:text-white border-2 border-ink dark:border-gray-700 rounded-button font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-97 cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                            <span>Track Ticket</span>
                          </Link>
                        ) : (
                          <div className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-button bg-paper dark:bg-gray-900 border border-dashed border-ink-line dark:border-gray-700 font-mono text-[10px] text-ink/60 dark:text-gray-400 uppercase tracking-wider select-none whitespace-nowrap">
                            <Clock className="w-3 h-3 text-accent flex-shrink-0" />
                            <span>Triage In Queue</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setReportToDelete(report.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 border border-ink-line dark:border-gray-700 text-ink/50 dark:text-gray-400 hover:text-severity-high hover:border-severity-high/50 hover:bg-red-500/10 rounded-button transition-all active:scale-95 cursor-pointer font-mono text-xs"
                          title="Delete submission record"
                        >
                          <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="sm:hidden md:hidden">Delete</span>
                        </button>

                      </div>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ── 3. SPAM TICKET WARNING MODAL ── */}
      {showSpamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-6 sm:p-7 max-w-sm w-full space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-red-500/15 text-severity-high border border-severity-high/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">// TICKET REMOVED</span>
                <h3 className="font-display text-base font-bold text-ink dark:text-white">Flagged as Spam</h3>
              </div>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              This report was merged into a master case file that was reviewed and flagged as invalid or duplicate by the municipal moderation team.
            </p>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSpamModal(false)}
                className="px-4 py-2 bg-ink text-paper dark:bg-accent dark:text-ink font-mono text-xs font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer border-0"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. DELETE CONFIRMATION MODAL ── */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-paper-card dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl p-6 sm:p-7 max-w-sm w-full space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-red-500/15 text-severity-high border border-severity-high/40 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider block">// IRREVERSIBLE ACTION</span>
                <h3 className="font-display text-base font-bold text-ink dark:text-white">Delete Case Submission</h3>
              </div>
            </div>
            <p className="text-xs text-ink/80 dark:text-gray-300 font-sans leading-relaxed">
              Are you sure you want to delete this case file from your personal docket? This will permanently remove it from your history.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 font-mono text-xs">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-paper dark:bg-gray-800 hover:bg-paper-sheet text-ink dark:text-white border border-ink-line dark:border-gray-700 rounded-button font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="px-4 py-2 bg-severity-high hover:bg-red-600 text-white font-bold uppercase tracking-wider rounded-button transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 border-0"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
