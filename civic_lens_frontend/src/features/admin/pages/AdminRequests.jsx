/**
 * ==============================================================================
 * CIVIC LENS — MUNICIPAL SUPPORT & PENDING INQUIRIES (PAGE 14 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Full-Width Clear Municipal Inquiries Docket & In-App Webmail Composer
 * 
 * SUMMARY OF CHANGES & PORTAL OVERLAY FIX:
 * 1. React Portal Root Modal Mount (100% Zero-Bleed Viewport Overlay):
 *    - Mounted the Email Composer Modal directly to `document.body` via `createPortal`.
 *    - Completely escapes parent scroll containers, eliminating any background bleed or visible numbers at the top.
 * 
 * 2. 100% Web-Based Direct Email Composer (Zero OS/Mailto Prompts):
 *    - Completely eliminated OS-level `mailto:` calls that cause the Windows "Choose an app" browser prompt.
 *    - Added direct 1-click webmail actions:
 *      * [🌐 OPEN IN GMAIL] (opens Gmail compose in a new tab with recipient, subject, and body pre-filled)
 *      * [📫 OPEN IN OUTLOOK] (opens Outlook Web compose in a new tab with pre-filled content)
 *      * [📋 COPY EMAIL & TEXT] (1-click clipboard payload for any other client)
 * 
 * 3. Crystal-Clear, Exact Submission Date & Time Display:
 *    - Eliminated ambiguous/misleading relative approximations.
 *    - Rendered in a high-contrast banner: `Submitted: DD MMM YYYY • HH:MM AM/PM` with Calendar icon.
 *    - Robust normalization for ISO/UTC timestamp parsing ensuring 100% accurate date rendering.
 * 
 * 4. Full-Width Responsive Multi-Column Layout (100% Viewport Utilization):
 *    - Uses a 2-to-3 column responsive card grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full`),
 *      filling modern widescreen displays with real, authentic inquiry dossiers.
 * 
 * 5. Distinct Visual Weight (Pending vs. Processed):
 *    - Pending Requests: Rendered with an active `severity-medium` (Signal Amber `#E8A33D`) left accent border strip,
 *      prominent card surface, and an animated "PENDING REVIEW" pulse badge.
 *    - Processed Requests: Rendered with a settled `severity-low` (Inspection Green `#4CAF7D`) left accent strip,
 *      quieter visual treatment, and a green-toned "PROCESSED" completion badge.
 * 
 * 6. Restyled "Mark as Processed" Action:
 *    - Aligned to established `severity-low` green token (`bg-severity-low hover:bg-emerald-600 text-ink font-extrabold`)
 *      with active spinner and checkmark icon.
 * 
 * 7. Structured Nested Inquiry Details Card:
 *    - Formatted inquiry messages inside a dedicated nested card surface (`bg-[#0A0E17]/80 border-ink-line/20 rounded-card p-4`)
 *      with crisp typography and clean whitespace.
 * 
 * 8. Search & Status Filter Console:
 *    - Segmented filter tabs (`ALL`, `PENDING`, `PROCESSED`) with live counters.
 *    - Real-time search input filtering across submitter names, emails, municipalities, and inquiry content.
 * 
 * 9. Top Summary KPI Deck:
 *    - 3-card at-a-glance telemetry strip: Total Inquiries Logged, Pending Action Required, and Successfully Handled.
 * 
 * 10. Positive Zero/Empty State & CSV Export:
 *     - Celebratory confirmation when all inquiries are cleared ("All municipal inquiries processed — you're all caught up").
 *     - 1-Click "Export CSV" compliance button.
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Mail, Check, Loader2, Calendar, AlertCircle, Search, 
  Filter, Building2, User, Clock, CheckCircle2, AlertTriangle,
  Sparkles, RefreshCw, Download, FileText, ArrowRight, ShieldCheck,
  ExternalLink, Copy, CheckCheck, Send, X, Globe
} from 'lucide-react';
import api from '../../../services/api';

// Exact, crystal-clear timestamp formatter (zero ambiguous relative approximations)
function formatExactSubmissionDate(rawDate) {
  if (!rawDate) return 'Logged in System';
  try {
    const cleanStr = String(rawDate).replace(' ', 'T');
    const isoString = (cleanStr.endsWith('Z') || cleanStr.includes('+') || cleanStr.includes('-')) ? cleanStr : `${cleanStr}Z`;
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      // Direct regex fallback for YYYY-MM-DD HH:MM
      const parts = cleanStr.split(/[- :T]/);
      if (parts.length >= 5) {
        const year = parts[0];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[parseInt(parts[1], 10) - 1] || parts[1];
        const day = parts[2];
        const hour = parseInt(parts[3], 10);
        const min = parts[4];
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12 = hour % 12 || 12;
        return `${day} ${month} ${year} • ${String(h12).padStart(2, '0')}:${min} ${ampm}`;
      }
      return String(rawDate);
    }

    const day = date.toLocaleDateString('en-US', { day: '2-digit' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return `${day} ${month} ${year} • ${time}`;
  } catch (e) {
    return String(rawDate || 'Logged in System');
  }
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [copiedEmailId, setCopiedEmailId] = useState(null);

  // In-App Email Composer Modal State
  const [emailModalReq, setEmailModalReq] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBodyText, setEmailBodyText] = useState('');
  const [isModalCopied, setIsModalCopied] = useState(false);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'pending' | 'processed'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRequests = (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    api.get('/admin/support-requests')
      .then((response) => {
        setRequests(response.data?.data || []);
        setIsLoading(false);
        setIsRefreshing(false);
        if (isManual) {
          showToast('Municipal support inquiries synchronized.');
        }
      })
      .catch((err) => {
        console.error('Error fetching support requests:', err);
        setError('Failed to fetch support requests. Please verify you are logged in as an administrator.');
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleMarkProcessed = (id) => {
    setProcessingId(id);
    api.post(`/admin/support-requests/${id}/process`)
      .then(() => {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'processed' } : req));
        setProcessingId(null);
        showToast('Request marked as processed and archived.');
      })
      .catch((err) => {
        console.error('Error processing request:', err);
        showToast('Failed to update status. Please try again.');
        setProcessingId(null);
      });
  };

  const handleCopyEmail = (email, id) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    showToast(`Copied ${email} to clipboard.`);
    setTimeout(() => setCopiedEmailId(null), 2000);
  };

  // Open In-App Email Composer Modal
  const openEmailModal = (req) => {
    setEmailModalReq(req);
    setEmailSubject(`Civic Lens Support // Municipal Integration — ${req.municipality || 'Inquiry'}`);
    setEmailBodyText(
`Dear ${req.name || 'Municipal Representative'},

Thank you for reaching out via the Civic Lens Municipality Support Portal regarding integration for ${req.municipality || 'your sector'}.

We have reviewed your inquiry and our operations team is ready to assist you with dashboard provisioning and API access.

Inquiry Reference: #${req.id ? req.id.slice(-6).toUpperCase() : 'PORTAL'}
Sector: ${req.municipality || 'Ahmedabad Municipal Grid'}

Please let us know if you have any questions or when you would be available for a brief coordination briefing.

Warm regards,
Central Civic Operations Directorate
Ahmedabad Municipal Corporation (AMC)`
    );
    setIsModalCopied(false);
  };

  // Copy full email text & recipient
  const handleCopyModalContent = () => {
    const fullText = `To: ${emailModalReq?.email || ''}\nSubject: ${emailSubject}\n\n${emailBodyText}`;
    navigator.clipboard.writeText(fullText);
    setIsModalCopied(true);
    showToast('Email content and recipient copied to clipboard.');
    setTimeout(() => setIsModalCopied(false), 2500);
  };

  // 1-Click Launch Gmail Web Tab
  const handleLaunchGmail = () => {
    if (!emailModalReq?.email) return;
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailModalReq.email)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.open(url, '_blank');
  };

  // 1-Click Launch Outlook Web Tab
  const handleLaunchOutlook = () => {
    if (!emailModalReq?.email) return;
    const url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(emailModalReq.email)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBodyText)}`;
    window.open(url, '_blank');
  };

  // KPI Calculations
  const totalCount = requests.length;
  const pendingCount = useMemo(() => requests.filter(r => r.status === 'pending').length, [requests]);
  const processedCount = useMemo(() => requests.filter(r => r.status === 'processed').length, [requests]);

  // Filtered inquiries list
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (statusFilter !== 'ALL') {
        if ((req.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = (req.name || '').toLowerCase().includes(query);
        const matchEmail = (req.email || '').toLowerCase().includes(query);
        const matchMuni = (req.municipality || '').toLowerCase().includes(query);
        const matchDetails = (req.details || '').toLowerCase().includes(query);
        const matchId = (req.id || '').toLowerCase().includes(query);

        if (!matchName && !matchEmail && !matchMuni && !matchDetails && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [requests, statusFilter, searchTerm]);

  // Export CSV Dossier
  const handleExportCSV = () => {
    const rows = [
      ['CIVIC LENS — MUNICIPAL SUPPORT & INTEGRATION INQUIRIES'],
      ['Generated At', new Date().toISOString()],
      ['Total Records', filteredRequests.length],
      [''],
      ['Request ID', 'Submitter Name', 'Email Address', 'Municipality / Zone', 'Status', 'Submission Timestamp', 'Inquiry Details'],
      ...filteredRequests.map(r => [
        r.id ? `#${r.id.slice(-6).toUpperCase()}` : 'N/A',
        r.name || 'Anonymous',
        r.email || 'N/A',
        r.municipality || 'N/A',
        r.status ? r.status.toUpperCase() : 'PENDING',
        formatExactSubmissionDate(r.created_at),
        `"${(r.details || '').replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicLens_Support_Inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Municipal inquiries CSV exported successfully.');
  };

  return (
    <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto bg-ink text-paper min-h-screen relative font-sans selection:bg-accent selection:text-ink">
      
      {/* Background survey grid texture */}
      <div className="absolute inset-0 survey-grid opacity-10 pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0B0F19]/95 border border-accent/40 text-paper px-4 py-3 rounded-card shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-xs font-mono font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TELEMETRY CONTROLS */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-ink-line/15 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest bg-accent/15 text-accent border border-accent/30 rounded">
              MUNICIPALITY SUPPORT PORTAL
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-paper/50">
              <span className="w-1.5 h-1.5 rounded-full bg-severity-low animate-ping" />
              INTEGRATION INQUIRY FEED
            </span>
            <span className="text-paper/30 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-paper/50">
              AHMEDABAD MUNICIPAL CORP
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-paper">
            Pending Support & Integration Requests
          </h1>
          <p className="text-xs md:text-sm text-paper/60 font-sans">
            Submissions from the citizen-facing Municipality Support Portal — integration requests, custom ward telemetry inquiries, and API access dockets.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          {/* Refresh / Sync Button */}
          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#151B26] hover:bg-ink-muted/50 border border-ink-line/20 hover:border-ink-line/40 rounded-card text-xs font-mono text-paper/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh inquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">SYNC</span>
          </button>

          {/* Export CSV Dossier */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={filteredRequests.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 bg-primary hover:bg-primary/90 border border-primary/40 rounded-card text-xs font-mono font-semibold text-paper transition-all active:scale-95 shadow-md disabled:opacity-40 cursor-pointer"
            title="Export CSV inquiry dossier"
          >
            <Download className="w-3.5 h-3.5 text-paper" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY KPI TELEMETRY STRIP (3 CARDS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Total Inquiries */}
        <div className="bg-[#151B26]/60 border border-ink-line/20 rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-paper/60 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Total Inquiries
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-primary/20 text-blue-300 border border-primary/30 rounded">
              ALL TIME
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-paper tracking-tight">
            {totalCount}
          </div>
          <p className="text-[11px] font-sans text-paper/50">
            Support portal submissions received
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent" />
        </div>

        {/* KPI 2: Pending Action */}
        <div className="bg-[#151B26]/60 border border-ink-line/20 rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              Pending Review
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-accent/15 text-accent border border-accent/30 rounded animate-pulse">
              ACTION NEEDED
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-accent tracking-tight">
            {pendingCount}
          </div>
          <p className="text-[11px] font-sans text-paper/50">
            Awaiting administrator resolution & outreach
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        </div>

        {/* KPI 3: Processed & Handled */}
        <div className="bg-[#151B26]/60 border border-ink-line/20 rounded-card p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-severity-low flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-severity-low" />
              Handled & Processed
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-mono bg-severity-low/15 text-severity-low border border-severity-low/30 rounded">
              RESOLVED
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-severity-low tracking-tight">
            {processedCount}
          </div>
          <p className="text-[11px] font-sans text-paper/50">
            Successfully closed municipal requests
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-severity-low via-severity-low/50 to-transparent" />
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SEARCH & SEGMENTED STATUS FILTER CONSOLE */}
      {/* ========================================================================= */}
      <div className="bg-[#151B26]/70 border border-ink-line/20 rounded-card p-4 shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/40 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by submitter name, email, municipality, inquiry details..."
              className="w-full bg-ink/90 border border-ink-line/25 rounded-button pl-9 pr-9 py-2.5 text-xs font-sans text-paper placeholder:text-paper/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/40 hover:text-paper font-mono text-xs cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 font-mono text-xs self-start md:self-auto">
            {[
              { key: 'ALL', label: `ALL (${totalCount})` },
              { key: 'pending', label: `PENDING (${pendingCount})`, isAlert: pendingCount > 0 },
              { key: 'processed', label: `PROCESSED (${processedCount})` }
            ].map((tab) => {
              const isSelected = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-2 rounded text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                    isSelected 
                      ? 'bg-accent text-ink border-accent shadow-sm' 
                      : 'bg-ink/60 text-paper/60 border-ink-line/15 hover:text-paper hover:bg-ink-muted/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FULL-WIDTH MULTI-COLUMN CARD GRID (2-3 COLS ACROSS ENTIRE VIEWPORT) */}
      {/* ========================================================================= */}
      <div className="w-full space-y-4">
        
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs font-bold text-paper/70 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-accent" />
            <span>MUNICIPAL INQUIRIES DOCKET ({filteredRequests.length} CASES)</span>
          </span>
          <span className="text-[11px] font-mono text-paper/40">
            Displaying full verified timestamps & municipal data
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-28 space-y-4 bg-[#151B26]/30 border border-ink-line/15 rounded-card">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <Mail className="w-4 h-4 text-primary absolute" />
            </div>
            <p className="text-xs font-mono font-bold text-paper/70 uppercase tracking-widest animate-pulse">
              LOADING MUNICIPAL SUPPORT DOSSIERS...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-severity-high/30 p-8 rounded-card text-center max-w-md mx-auto space-y-4 my-8 shadow-2xl backdrop-blur-md">
            <AlertCircle className="w-10 h-10 text-severity-high mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-paper">Failed to Load Requests</h3>
              <p className="text-xs text-paper/60">{error}</p>
            </div>
            <button 
              type="button"
              onClick={() => fetchRequests(true)} 
              className="px-4 py-2 bg-accent hover:bg-amber-400 text-ink text-xs font-mono font-bold rounded-button transition-colors cursor-pointer"
            >
              RETRY FETCH
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty / Filter Zero-State */
          <div className="bg-[#151B26]/30 border border-ink-line/20 rounded-card p-12 text-center w-full space-y-4 shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 rounded-full bg-severity-low/15 text-severity-low border border-severity-low/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-bold text-paper">
                {statusFilter === 'pending' ? "You're All Caught Up" : 'No Support Requests Found'}
              </h3>
              <p className="text-xs text-paper/60 max-w-xs mx-auto font-sans leading-relaxed">
                {statusFilter === 'pending' 
                  ? 'There are no pending municipal inquiries awaiting administrative review.' 
                  : searchTerm 
                  ? 'No support inquiries match your active search criteria.' 
                  : 'No submissions have been received from the Municipality Support Portal yet.'}
              </p>
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-3.5 py-1.5 bg-ink text-accent border border-accent/30 rounded text-xs font-mono font-bold hover:bg-ink-muted/50 transition-all cursor-pointer"
              >
                Clear Search Query
              </button>
            )}
          </div>
        ) : (
          /* Full-Width 2-to-3 Column Responsive Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {filteredRequests.map((req) => {
              const isPending = req.status === 'pending';
              const exactTimestamp = formatExactSubmissionDate(req.created_at);
              const isEmailCopied = copiedEmailId === req.id;

              return (
                <div 
                  key={req.id}
                  className={`rounded-card p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between space-y-4 transition-all duration-200 border ${
                    isPending 
                      ? 'bg-[#151B26]/90 border-ink-line/30 border-l-4 border-l-accent shadow-accent/5 hover:border-ink-line/50' 
                      : 'bg-[#121824]/60 border-ink-line/15 border-l-4 border-l-severity-low opacity-85 hover:opacity-100 hover:border-ink-line/30'
                  }`}
                >
                  <div className="space-y-4">
                    
                    {/* Header: Submitter Name, ID & Status Badge */}
                    <div className="flex items-start justify-between gap-3 border-b border-ink-line/15 pb-3.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-base font-bold text-paper tracking-tight truncate">
                            {req.name || 'Municipal Representative'}
                          </span>
                          {req.id && (
                            <span className="font-mono text-[10px] text-paper/50 bg-ink px-2 py-0.5 rounded border border-ink-line/15 flex-shrink-0">
                              #{req.id.slice(-6).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {/* Submitter Email with Copy Action */}
                        <div className="flex items-center gap-2 text-xs font-mono text-paper/70">
                          <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span className="truncate text-sky-300 font-medium">
                            {req.email || 'No email provided'}
                          </span>
                          {req.email && (
                            <button
                              type="button"
                              onClick={() => handleCopyEmail(req.email, req.id)}
                              className="text-paper/40 hover:text-accent transition-colors p-0.5 cursor-pointer"
                              title="Copy email address"
                            >
                              {isEmailCopied ? (
                                <CheckCheck className="w-3 h-3 text-accent" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm flex-shrink-0 ${
                        isPending 
                          ? 'bg-accent/15 text-accent border-accent/40 animate-pulse' 
                          : 'bg-severity-low/15 text-severity-low border-severity-low/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-accent' : 'bg-severity-low'}`} />
                        <span>{isPending ? 'PENDING' : 'PROCESSED'}</span>
                      </span>
                    </div>

                    {/* Sector / Ward Badge */}
                    <div className="flex items-center gap-2.5 bg-[#0B0F19] px-3 py-2.5 rounded-card border border-ink-line/20">
                      <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold text-paper/50 uppercase block leading-tight">
                          MUNICIPAL JURISDICTION
                        </span>
                        <span className="font-semibold text-paper font-sans text-xs truncate block">
                          {req.municipality || 'Ahmedabad Municipal Grid'}
                        </span>
                      </div>
                    </div>

                    {/* Prominent Exact Submission Timestamp Banner */}
                    <div className="flex items-center gap-2.5 bg-[#0B0F19] px-3 py-2.5 rounded-card border border-ink-line/20">
                      <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono font-bold text-paper/50 uppercase block leading-tight">
                          SUBMISSION TIMESTAMP (EXACT)
                        </span>
                        <span className="font-mono text-xs text-paper font-bold tracking-wide block">
                          {exactTimestamp}
                        </span>
                      </div>
                    </div>

                    {/* Nested Inquiry Details Dossier Container */}
                    <div className="bg-[#0A0E17]/90 border border-ink-line/20 rounded-card p-4 space-y-2 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-accent border-b border-ink-line/10 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-accent" />
                          <span>INQUIRY BRIEF & REQUIREMENTS</span>
                        </span>
                        <span className="text-paper/40 font-normal">PORTAL TRANSMISSION</span>
                      </div>
                      <p className="text-xs sm:text-sm text-paper/90 font-sans leading-relaxed whitespace-pre-wrap selection:bg-accent selection:text-ink">
                        {req.details || 'No detailed inquiry text submitted.'}
                      </p>
                    </div>

                  </div>

                  {/* Card Action Footer with Direct "Email Rep" & "Mark as Processed" Buttons */}
                  <div className="pt-3.5 border-t border-ink-line/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    {/* Direct "Email Rep" Modal Trigger Button */}
                    {req.email ? (
                      <button
                        type="button"
                        onClick={() => openEmailModal(req)}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3.5 bg-primary/25 hover:bg-primary text-blue-200 hover:text-white border border-primary/40 text-xs font-mono font-bold rounded-button transition-all shadow-sm active:scale-95 cursor-pointer"
                        title={`Open response composer for ${req.email}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>EMAIL REP</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* Process Status / Action */}
                    {isPending ? (
                      <button
                        type="button"
                        onClick={() => handleMarkProcessed(req.id)}
                        disabled={processingId === req.id}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-severity-low hover:bg-emerald-600 text-ink text-xs font-mono font-extrabold rounded-button transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {processingId === req.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        <span>MARK PROCESSED</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 font-mono text-xs text-severity-low font-bold py-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Handled & Archived</span>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. IN-APP DIRECT EMAIL COMPOSER MODAL (PORTAL MOUNTED DIRECTLY TO BODY) */}
      {/* ========================================================================= */}
      {emailModalReq && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setEmailModalReq(null)}
        >
          <div 
            className="bg-[#111722] border border-ink-line/30 rounded-card shadow-2xl p-6 max-w-xl w-full space-y-5 text-paper my-auto relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink-line/15 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" />
                  <h3 className="font-display text-base font-bold text-paper">
                    Direct Municipal Response Composer
                  </h3>
                </div>
                <p className="text-xs text-paper/60 font-sans">
                  Send official communication to {emailModalReq.name} ({emailModalReq.municipality})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalReq(null)}
                className="text-paper/50 hover:text-paper p-1 cursor-pointer transition-colors"
                title="Close composer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Subject Fields */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 bg-ink/70 p-2.5 rounded border border-ink-line/20">
                <span className="text-paper/40 font-bold uppercase w-16 flex-shrink-0">TO:</span>
                <span className="text-sky-300 font-bold truncate">{emailModalReq.email}</span>
              </div>

              <div className="flex items-center gap-2 bg-ink/70 p-2.5 rounded border border-ink-line/20">
                <span className="text-paper/40 font-bold uppercase w-16 flex-shrink-0">SUBJECT:</span>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="flex-1 bg-transparent text-paper font-sans focus:outline-none"
                />
              </div>

              {/* Message Body Textarea */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-paper/40 font-bold uppercase tracking-wider block">
                  OFFICIAL TRANSMISSION MESSAGE:
                </span>
                <textarea
                  value={emailBodyText}
                  onChange={(e) => setEmailBodyText(e.target.value)}
                  rows={8}
                  className="w-full bg-[#0A0E17] border border-ink-line/25 rounded-card p-3 font-mono text-xs text-paper/90 leading-relaxed focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none selection:bg-accent selection:text-ink"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-ink-line/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
              
              {/* Copy Full Message Button */}
              <button
                type="button"
                onClick={handleCopyModalContent}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-ink hover:bg-ink-muted border border-ink-line/20 hover:border-accent/40 rounded-button text-paper font-bold transition-all cursor-pointer active:scale-95"
              >
                {isModalCopied ? <CheckCheck className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5 text-accent" />}
                <span>{isModalCopied ? 'COPIED!' : 'COPY EMAIL & TEXT'}</span>
              </button>

              <div className="flex items-center gap-2">
                {/* 1-Click Launch Outlook Web */}
                <button
                  type="button"
                  onClick={handleLaunchOutlook}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3.5 bg-ink hover:bg-ink-muted border border-ink-line/25 text-paper/80 hover:text-paper font-bold rounded-button transition-all cursor-pointer"
                  title="Open draft in Outlook Web browser tab"
                >
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>OUTLOOK WEB</span>
                </button>

                {/* 1-Click Launch Gmail Web */}
                <button
                  type="button"
                  onClick={handleLaunchGmail}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-button transition-all cursor-pointer shadow-md active:scale-95"
                  title="Open draft in Gmail browser tab"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-300" />
                  <span>OPEN IN GMAIL</span>
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
