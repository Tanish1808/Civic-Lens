/**
 * ==============================================================================
 * CIVIC LENS — MANAGE TICKETS (PAGE 12 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Tactical Case Docket & Municipal Operations Ledger
 * 
 * SUMMARY OF CHANGES:
 * 1. Design Tokens & Visual Hierarchy:
 *    - Locked to dark `ink` (#10263A) base with `paper` (#F6F2E9) text and `ink-line` borders.
 *    - Space Grotesk (`font-display`) for headlines, Inter for body copy, and JetBrains Mono
 *      (`font-mono`) for ticket IDs, report counts, upvotes, timestamps, and coordinates.
 * 2. Interactive KPI Telemetry Deck (NEW):
 *    - 4 dynamic KPI cards calculating real-time municipal metrics:
 *      (1) Critical High Hazards, (2) Waterlogging Floods, (3) Pothole Defects, (4) Pending Intake.
 *    - 1-Click Quick Filtering: Clicking any KPI card immediately filters the table docket.
 * 3. Custom Filter Controls & Real-Time Search Bar:
 *    - Replaced unstyled native `<select>` dropdowns with dark console filter selectors.
 *    - Added instant search filtering across ticket IDs, issue categories, and ward locations.
 * 4. Scannable Row Design with Severity Urgency Strips:
 *    - Each table row features a dynamic severity left border strip (High: #D64545, Medium: #E8A33D, Low: #4CAF7D).
 *    - Clickable/copyable `JetBrains Mono` Ticket IDs in Signal Amber (`#E8A33D`).
 *    - Interactive hover lift (`hover:bg-ink-muted/50`) across the working surface.
 * 5. Row Selection & Contextual Bulk Action Bar:
 *    - Integrated multi-select checkboxes with a floating contextual action bar.
 *    - Supports Bulk CSV Export and Batch Spam Flagging / Restoration.
 * 6. Restyled Action Controls & Overrides:
 *    - Uniform icon buttons for View (`Eye`), Edit/Override (`Edit3`), and Flag/Restore (`Trash2`/`RotateCcw`).
 *    - Dark themed Ticket Details Dossier and Override Modification Modals with photo proof uploads.
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, Edit3, Trash2, ShieldAlert, Loader2, AlertCircle, 
  X, Check, Save, RotateCcw, MapPin, Search, Filter,
  Download, CheckSquare, Square, ChevronDown, Sparkles,
  ExternalLink, Copy, CheckCircle2, Clock, ThumbsUp, Layers,
  Flame, Droplets, Construction, Activity, ArrowRight
} from 'lucide-react';
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
    <div className="w-full h-full bg-ink flex flex-col justify-center items-center text-center p-3 select-none text-paper/40 border border-ink-line/20 rounded-card">
      <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest mb-1">IMAGE OFFLINE</span>
      <span className="text-[8px] text-paper/40">Unresolved or blocked host</span>
    </div>
  );
}

export default function AdminTickets() {
  const navigate = useNavigate();
  
  // Data list states
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Multi-select Row State
  const [selectedTicketIds, setSelectedTicketIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  // Detail View Modal State
  const [selectedViewTicket, setSelectedViewTicket] = useState(null);

  // Editing state (for override / status change modal)
  const [editingTicket, setEditingTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [resolvedImageFile, setResolvedImageFile] = useState(null);

  // Active Tab: 'active' | 'flagged'
  const [activeTab, setActiveTab] = useState('active');

  // Custom confirmation modal configuration
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

  const fetchTickets = () => {
    setIsLoading(true);
    setError(null);

    const params = {
      show_spam: activeTab === 'flagged'
    };
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSeverity) params.severity = selectedSeverity;
    if (selectedStatus) params.status = selectedStatus;

    api.get('/admin/tickets', { params })
      .then((response) => {
        const loaded = (response.data.data.tickets || []).map(t => {
          const lat = t.location?.coordinates?.[1];
          const lng = t.location?.coordinates?.[0];
          const coordStr = (lat !== undefined && lng !== undefined) 
            ? `Ahmedabad (Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)})` 
            : 'Ahmedabad Grid';
          return {
            ...t,
            id: t.ticket_id,
            reports: t.report_count ?? 1,
            votes: t.upvote_count ?? 0,
            address: coordStr,
            rawAddress: t.address || 'Ahmedabad Municipal Grid'
          };
        });
        setTickets(loaded);
        setSelectedTicketIds(new Set()); // Reset selections on tab/filter change
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin tickets:', err);
        setError('Failed to load tickets. Verify you are logged in as an administrator.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedCategory, selectedSeverity, selectedStatus, activeTab]);

  // Client-side search query filtering
  const filteredTickets = useMemo(() => {
    if (!searchTerm.trim()) return tickets;
    const query = searchTerm.toLowerCase();
    return tickets.filter((t) => {
      const matchId = (t.id || '').toLowerCase().includes(query);
      const matchCategory = (t.category || '').toLowerCase().includes(query);
      const matchAddress = (t.rawAddress || '').toLowerCase().includes(query) || (t.address || '').toLowerCase().includes(query);
      const matchWard = (t.zone_id || '').toLowerCase().includes(query);
      return matchId || matchCategory || matchAddress || matchWard;
    });
  }, [tickets, searchTerm]);

  // Dynamic KPI Metrics Calculations
  const kpiStats = useMemo(() => {
    const total = tickets.length;
    const highSeverityCount = tickets.filter(t => (t.severity || '').toLowerCase() === 'high' || (t.severity || '').toLowerCase() === 'critical').length;
    const waterloggingCount = tickets.filter(t => (t.category || '').toLowerCase().includes('water')).length;
    const potholeCount = tickets.filter(t => (t.category || '').toLowerCase().includes('pothole')).length;
    const pendingIntakeCount = tickets.filter(t => (t.status || '').toLowerCase() === 'reported' || (t.status || '').toLowerCase() === 'in_progress').length;

    return {
      total,
      highSeverityCount,
      waterloggingCount,
      potholeCount,
      pendingIntakeCount
    };
  }, [tickets]);

  // Checkbox Selection Logic
  const handleSelectAll = () => {
    if (selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0) {
      setSelectedTicketIds(new Set());
    } else {
      setSelectedTicketIds(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedTicketIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTicketIds(next);
  };

  const handleCopyTicketId = (id, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (t) => {
    setEditingTicket(t);
    setEditStatus(t.status);
    setEditCategory(t.category);
    setEditSeverity(t.severity);
    setEditNote('');
    setResolvedImageFile(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSavingEdit(true);

    if (editStatus === 'resolved' && !resolvedImageFile && !editingTicket.resolved_photo) {
      showModal({
        type: 'alert',
        severity: 'warning',
        title: 'Verification Photo Required',
        message: 'A verification photo is required to mark the ticket as resolved.'
      });
      setIsSavingEdit(false);
      return;
    }

    const promises = [];

    // 1. If status changed OR resolved image is added/updated
    const isStatusChanged = editStatus !== editingTicket.status;
    const isResolvedImageAdded = editStatus === 'resolved' && resolvedImageFile;

    if (isStatusChanged || isResolvedImageAdded) {
      const formData = new FormData();
      formData.append('status', editStatus);
      formData.append('note', editNote || 'Admin manual status override.');
      if (resolvedImageFile) {
        formData.append('resolved_image', resolvedImageFile);
      }

      promises.push(
        api.patch(`/admin/tickets/${editingTicket.id}/status`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      );
    }

    // 2. If category or severity changed, PATCH override
    if (editCategory !== editingTicket.category || editSeverity !== editingTicket.severity) {
      promises.push(
        api.patch(`/admin/tickets/${editingTicket.id}/override`, {
          category: editCategory,
          severity: editSeverity,
          note: editNote || 'Admin manual classification override.'
        })
      );
    }

    if (promises.length === 0) {
      setIsSavingEdit(false);
      setEditingTicket(null);
      return;
    }

    Promise.all(promises)
      .then(() => {
        setIsSavingEdit(false);
        setEditingTicket(null);
        fetchTickets();
        showModal({
          type: 'alert',
          severity: 'success',
          title: 'Ticket Updated',
          message: 'The ticket attributes and override history logs have been updated successfully.'
        });
      })
      .catch((err) => {
        console.error('Failed to update ticket attributes:', err);
        showModal({
          type: 'alert',
          severity: 'error',
          title: 'Update Failed',
          message: err.response?.data?.error?.message || 'Failed to update ticket. Please check status transition rules.'
        });
        setIsSavingEdit(false);
      });
  };

  const handleFlagSpam = (id) => {
    showModal({
      type: 'confirm',
      severity: 'warning',
      title: 'Flag Ticket as Spam',
      message: 'Are you sure you want to flag this ticket as spam? This action will remove the ticket from active dashboards.',
      onConfirm: () => {
        api.patch(`/admin/tickets/${id}/flag-spam`)
          .then(() => {
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'success',
              title: 'Spam Flagged',
              message: 'The ticket has been successfully marked as spam and moved to Flagged Tickets.'
            });
          })
          .catch((err) => {
            console.error('Failed to flag spam:', err);
            showModal({
              type: 'alert',
              severity: 'error',
              title: 'Action Failed',
              message: 'Failed to flag this ticket as spam. Please try again.'
            });
          });
      }
    });
  };

  const handleUnflagSpam = (id) => {
    showModal({
      type: 'confirm',
      severity: 'info',
      title: 'Restore Ticket',
      message: 'Are you sure you want to restore this ticket? It will be moved back to the active tickets list.',
      onConfirm: () => {
        api.patch(`/admin/tickets/${id}/unflag-spam`)
          .then(() => {
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'success',
              title: 'Ticket Restored',
              message: 'The ticket has been successfully restored to the active list.'
            });
          })
          .catch((err) => {
            console.error('Failed to restore ticket:', err);
            showModal({
              type: 'alert',
              severity: 'error',
              title: 'Restore Failed',
              message: 'Failed to restore this ticket. Please try again.'
            });
          });
      }
    });
  };

  // Bulk Actions
  const handleBulkExportCSV = () => {
    const listToExport = selectedTicketIds.size > 0 
      ? tickets.filter(t => selectedTicketIds.has(t.id))
      : filteredTickets;
      
    if (listToExport.length === 0) return;
    
    const headers = ['ID', 'Category', 'Severity', 'Address', 'ReportsCount', 'UpvoteCount', 'Status', 'CreatedAt'];
    const rows = listToExport.map(t => [
      t.id, t.category, t.severity, t.rawAddress || t.address || '', t.reports, t.votes, t.status, t.created_at || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `civic_tickets_${activeTab}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkFlagSpam = () => {
    if (selectedTicketIds.size === 0) return;
    const ids = Array.from(selectedTicketIds);
    showModal({
      type: 'confirm',
      severity: 'warning',
      title: `Flag ${ids.length} Tickets as Spam`,
      message: `Are you sure you want to flag ${ids.length} selected tickets as spam? They will be removed from the active queue.`,
      onConfirm: () => {
        Promise.all(ids.map(id => api.patch(`/admin/tickets/${id}/flag-spam`)))
          .then(() => {
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'success',
              title: 'Batch Completed',
              message: `${ids.length} tickets have been flagged as spam successfully.`
            });
          })
          .catch((err) => {
            console.error('Failed batch spam flag:', err);
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'error',
              title: 'Batch Action Partial',
              message: 'Some tickets could not be updated. Queue has been refreshed.'
            });
          });
      }
    });
  };

  const handleBulkRestore = () => {
    if (selectedTicketIds.size === 0) return;
    const ids = Array.from(selectedTicketIds);
    showModal({
      type: 'confirm',
      severity: 'info',
      title: `Restore ${ids.length} Flagged Tickets`,
      message: `Are you sure you want to restore ${ids.length} selected tickets to active queue?`,
      onConfirm: () => {
        Promise.all(ids.map(id => api.patch(`/admin/tickets/${id}/unflag-spam`)))
          .then(() => {
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'success',
              title: 'Batch Completed',
              message: `${ids.length} tickets restored to active docket.`
            });
          })
          .catch((err) => {
            console.error('Failed batch restore:', err);
            fetchTickets();
            showModal({
              type: 'alert',
              severity: 'error',
              title: 'Batch Partial',
              message: 'Failed to restore some tickets. Queue refreshed.'
            });
          });
      }
    });
  };

  const getSeverityBadgeClass = (severity) => {
    switch ((severity || '').toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-severity-high/15 text-severity-high border-severity-high/30';
      case 'medium':
        return 'bg-accent/15 text-accent border-accent/30';
      case 'low':
      default:
        return 'bg-severity-low/15 text-severity-low border-severity-low/30';
    }
  };

  const getStatusBadgeClass = (statusRaw) => {
    const status = (statusRaw || '').toLowerCase().replace('_', ' ');
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-severity-low/15 text-severity-low border-severity-low/30';
      case 'in progress':
      case 'dispatched':
        return 'bg-accent/15 text-accent border-accent/30';
      case 'verified':
      case 'acknowledged':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      default:
        return 'bg-primary/20 text-blue-300 border-primary/40';
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto bg-ink text-paper min-h-screen font-sans relative selection:bg-accent selection:text-ink">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 survey-grid opacity-10 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER STRIP WITH SEARCH, TABS & EXPORT
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ink-line/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-paper">
              Manage Tickets
            </h1>
            {isLoading && <Loader2 className="w-4 h-4 text-accent animate-spin ml-1" />}
          </div>
          <p className="text-xs sm:text-sm text-paper/70 font-normal">
            Search, filter, inspect photographic dossiers, and execute administrative overrides across AMC grids.
          </p>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleBulkExportCSV}
            disabled={tickets.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-bold bg-ink-muted/80 hover:bg-ink-muted text-paper border border-ink-line/25 rounded-button transition-all disabled:opacity-40 cursor-pointer shadow-sm active:scale-98"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. INTERACTIVE KPI TELEMETRY STRIP (1-CLICK QUICK FILTERS)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* KPI 1: Critical High Severity */}
        <button
          type="button"
          onClick={() => setSelectedSeverity(prev => prev === 'high' ? '' : 'high')}
          className={`p-3.5 rounded-card text-left transition-all duration-200 cursor-pointer group border ${
            selectedSeverity === 'high'
              ? 'bg-severity-high/15 border-severity-high shadow-lg shadow-severity-high/10 ring-1 ring-severity-high/30'
              : 'bg-ink-muted/30 border-ink-line/20 hover:border-severity-high/40 hover:bg-ink-muted/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] font-bold text-severity-high uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Critical Severity</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-severity-high animate-ping" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-paper tracking-tight">
              {kpiStats.highSeverityCount}
            </span>
            <span className="font-mono text-[10px] text-paper/50 group-hover:text-accent transition-colors">
              {selectedSeverity === 'high' ? 'Active Filter ✕' : 'Click to Filter ➔'}
            </span>
          </div>
        </button>

        {/* KPI 2: Waterlogging & Monsoon Floods */}
        <button
          type="button"
          onClick={() => setSelectedCategory(prev => prev === 'waterlogging' ? '' : 'waterlogging')}
          className={`p-3.5 rounded-card text-left transition-all duration-200 cursor-pointer group border ${
            selectedCategory === 'waterlogging'
              ? 'bg-blue-500/15 border-blue-400 shadow-lg shadow-blue-500/10 ring-1 ring-blue-400/30'
              : 'bg-ink-muted/30 border-ink-line/20 hover:border-blue-400/40 hover:bg-ink-muted/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5" />
              <span>Waterlogging</span>
            </span>
            <span className="font-mono text-[9px] text-blue-300 font-bold px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20">
              Monsoon
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-paper tracking-tight">
              {kpiStats.waterloggingCount}
            </span>
            <span className="font-mono text-[10px] text-paper/50 group-hover:text-accent transition-colors">
              {selectedCategory === 'waterlogging' ? 'Active Filter ✕' : 'Click to Filter ➔'}
            </span>
          </div>
        </button>

        {/* KPI 3: Potholes & Road Cracks */}
        <button
          type="button"
          onClick={() => setSelectedCategory(prev => prev === 'pothole' ? '' : 'pothole')}
          className={`p-3.5 rounded-card text-left transition-all duration-200 cursor-pointer group border ${
            selectedCategory === 'pothole'
              ? 'bg-accent/15 border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/30'
              : 'bg-ink-muted/30 border-ink-line/20 hover:border-accent/40 hover:bg-ink-muted/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Construction className="w-3.5 h-3.5" />
              <span>Potholes & Roads</span>
            </span>
            <span className="font-mono text-[9px] text-accent font-bold px-1.5 py-0.2 rounded bg-accent/10 border border-accent/20">
              Asphalt
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-paper tracking-tight">
              {kpiStats.potholeCount}
            </span>
            <span className="font-mono text-[10px] text-paper/50 group-hover:text-accent transition-colors">
              {selectedCategory === 'pothole' ? 'Active Filter ✕' : 'Click to Filter ➔'}
            </span>
          </div>
        </button>

        {/* KPI 4: Pending / In-Progress Intake */}
        <button
          type="button"
          onClick={() => setSelectedStatus(prev => prev === 'in_progress' ? '' : 'in_progress')}
          className={`p-3.5 rounded-card text-left transition-all duration-200 cursor-pointer group border ${
            selectedStatus === 'in_progress'
              ? 'bg-teal-500/15 border-teal-400 shadow-lg shadow-teal-500/10 ring-1 ring-teal-400/30'
              : 'bg-ink-muted/30 border-ink-line/20 hover:border-teal-400/40 hover:bg-ink-muted/50'
          }`}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Action</span>
            </span>
            <span className="font-mono text-[9px] text-teal-300 font-bold px-1.5 py-0.2 rounded bg-teal-500/10 border border-teal-500/20">
              In-Flight
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-paper tracking-tight">
              {kpiStats.pendingIntakeCount}
            </span>
            <span className="font-mono text-[10px] text-paper/50 group-hover:text-accent transition-colors">
              {selectedStatus === 'in_progress' ? 'Active Filter ✕' : 'Click to Filter ➔'}
            </span>
          </div>
        </button>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. TABS & FILTER BAR ROW
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-ink-line/15 pb-4">
        
        {/* Tabs */}
        <div className="flex items-center gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-2.5 transition-all cursor-pointer relative font-display text-sm ${
              activeTab === 'active' 
                ? 'text-accent font-bold' 
                : 'text-paper/60 hover:text-paper'
            }`}
          >
            <span>Active Docket</span>
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flagged')}
            className={`pb-2.5 transition-all cursor-pointer relative font-display text-sm flex items-center gap-1.5 ${
              activeTab === 'flagged' 
                ? 'text-accent font-bold' 
                : 'text-paper/60 hover:text-paper'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-severity-high" />
            <span>Flagged Queue</span>
            {activeTab === 'flagged' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Live Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-paper/40 pointer-events-none" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID, issue, ward..."
              className="w-full bg-ink-muted/40 border border-ink-line/25 rounded-button pl-9 pr-7 py-1.5 text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-paper/40 hover:text-paper"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="relative">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-ink-muted/50 border border-ink-line/25 rounded-button pl-3 pr-8 py-1.5 text-xs font-sans text-paper/90 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0E1B29] text-paper">All Categories</option>
              <option value="pothole" className="bg-[#0E1B29] text-paper">Pothole</option>
              <option value="waterlogging" className="bg-[#0E1B29] text-paper">Waterlogging</option>
              <option value="streetlight" className="bg-[#0E1B29] text-paper">Streetlight</option>
              <option value="garbage" className="bg-[#0E1B29] text-paper">Garbage</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-paper/40 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Severity Filter Dropdown */}
          <div className="relative">
            <select 
              value={selectedSeverity} 
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="appearance-none bg-ink-muted/50 border border-ink-line/25 rounded-button pl-3 pr-8 py-1.5 text-xs font-sans text-paper/90 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0E1B29] text-paper">All Severities</option>
              <option value="low" className="bg-[#0E1B29] text-paper">Low Priority</option>
              <option value="medium" className="bg-[#0E1B29] text-paper">Medium Priority</option>
              <option value="high" className="bg-[#0E1B29] text-paper">High Priority</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-paper/40 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-ink-muted/50 border border-ink-line/25 rounded-button pl-3 pr-8 py-1.5 text-xs font-sans text-paper/90 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent cursor-pointer transition-all"
            >
              <option value="" className="bg-[#0E1B29] text-paper">All Statuses</option>
              <option value="reported" className="bg-[#0E1B29] text-paper">Reported</option>
              <option value="verified" className="bg-[#0E1B29] text-paper">Verified</option>
              <option value="acknowledged" className="bg-[#0E1B29] text-paper">Acknowledged</option>
              <option value="in_progress" className="bg-[#0E1B29] text-paper">In Progress</option>
              <option value="resolved" className="bg-[#0E1B29] text-paper">Resolved</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-paper/40 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Reset Filters Quick Pill */}
          {(selectedCategory || selectedSeverity || selectedStatus || searchTerm) && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                setSelectedSeverity('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
              className="px-2.5 py-1.5 bg-ink-muted/80 hover:bg-ink-muted text-accent font-mono text-[11px] font-bold rounded-button border border-ink-line/25 flex items-center gap-1 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FLOATING CONTEXTUAL BULK ACTION BAR (WHEN ROWS SELECTED)
      ───────────────────────────────────────────────────────────── */}
      {selectedTicketIds.size > 0 && (
        <div className="relative z-20 p-3.5 bg-[#0E1B29] border border-accent/40 rounded-card shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-accent text-ink font-mono text-xs font-bold">
              {selectedTicketIds.size} Selected
            </span>
            <span className="text-xs text-paper/80 font-medium hidden sm:inline">
              Execute batch operations on selected tickets:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-muted hover:bg-ink-muted/80 text-paper border border-ink-line/25 rounded-button text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Export Selected ({selectedTicketIds.size})</span>
            </button>

            {activeTab === 'active' ? (
              <button
                type="button"
                onClick={handleBulkFlagSpam}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-severity-high/20 hover:bg-severity-high/30 text-severity-high border border-severity-high/40 rounded-button text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Flag Spam ({selectedTicketIds.size})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBulkRestore}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-severity-low/20 hover:bg-severity-low/30 text-severity-low border border-severity-low/40 rounded-button text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore ({selectedTicketIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedTicketIds(new Set())}
              className="px-2.5 py-1.5 text-paper/50 hover:text-paper text-xs font-mono font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. MAIN DATA TABLE WITH SCANNABLE SEVERITY STRIPS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 bg-ink-muted/30 border border-ink-line/25 rounded-card overflow-hidden shadow-2xl">
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="font-mono text-xs font-bold text-paper/60 uppercase tracking-widest animate-pulse">
              Syncing tickets database...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-16 space-y-3 text-center p-6">
            <AlertCircle className="w-8 h-8 text-severity-high" />
            <p className="text-xs sm:text-sm text-paper/80">{error}</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 text-paper/50 font-mono text-xs space-y-2">
            <Layers className="w-8 h-8 mx-auto text-paper/20" />
            <p>No tickets matching selected filters or search query found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-line/15 text-xs text-left">
              <thead className="bg-ink-muted/60 text-paper/60 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3.5 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                        selectedTicketIds.size === filteredTickets.length && filteredTickets.length > 0
                          ? 'bg-accent text-ink'
                          : 'bg-ink border border-ink-line/40 text-transparent hover:border-accent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Ticket ID</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Issue Category</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Severity</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Location & Coordinates</th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold">Reports</th>
                  <th scope="col" className="px-4 py-3.5 text-center font-bold">Upvotes</th>
                  <th scope="col" className="px-4 py-3.5 font-bold">Lifecycle Status</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-line/10 text-paper">
                {filteredTickets.map((t) => {
                  const isSelected = selectedTicketIds.has(t.id);
                  const sevColorStrip = 
                    (t.severity || '').toLowerCase() === 'high' || (t.severity || '').toLowerCase() === 'critical'
                      ? 'border-l-4 border-l-severity-high'
                      : (t.severity || '').toLowerCase() === 'medium'
                      ? 'border-l-4 border-l-severity-medium'
                      : 'border-l-4 border-l-severity-low';

                  return (
                    <tr 
                      key={t.id} 
                      className={`hover:bg-ink-muted/50 transition-colors duration-150 group ${sevColorStrip} ${
                        isSelected ? 'bg-accent/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRow(t.id)}
                          className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-accent text-ink' 
                              : 'bg-ink border border-ink-line/30 text-transparent hover:border-accent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      </td>

                      {/* Ticket ID in Mono */}
                      <td className="px-4 py-3.5 font-mono font-bold">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedViewTicket(t)}
                            className="text-accent hover:underline cursor-pointer tracking-wide"
                            title="Click to view ticket dossier"
                          >
                            #{t.id.slice(-6).toUpperCase()}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleCopyTicketId(t.id, e)}
                            className="text-paper/40 hover:text-paper transition-colors"
                            title="Copy full database ID"
                          >
                            {copiedId === t.id ? (
                              <CheckCircle2 className="w-3 h-3 text-severity-low" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Issue Category */}
                      <td className="px-4 py-3.5 font-semibold text-paper">
                        {t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : 'Civic Defect'}
                      </td>

                      {/* Severity Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border ${getSeverityBadgeClass(t.severity)}`}>
                          {t.severity}
                        </span>
                      </td>

                      {/* Location & Coordinates */}
                      <td className="px-4 py-3.5 text-paper/70 max-w-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-accent shrink-0" />
                          <span className="truncate">{t.rawAddress || t.address}</span>
                        </div>
                      </td>

                      {/* Reports */}
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-paper">
                        {t.reports}
                      </td>

                      {/* Upvotes */}
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-paper">
                        {t.votes}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(t.status)}`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button 
                          type="button"
                          onClick={() => setSelectedViewTicket(t)}
                          className="p-1.5 text-paper/60 hover:text-paper hover:bg-ink-muted rounded transition-colors inline-flex cursor-pointer"
                          title="View Ticket Dossier"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {activeTab === 'active' ? (
                          <>
                            <button 
                              type="button"
                              onClick={() => handleOpenEdit(t)}
                              className="p-1.5 text-paper/60 hover:text-accent hover:bg-accent/10 rounded transition-colors inline-flex cursor-pointer"
                              title="Edit / Override Classification"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleFlagSpam(t.id)}
                              className="p-1.5 text-paper/60 hover:text-severity-high hover:bg-severity-high/10 rounded transition-colors inline-flex cursor-pointer"
                              title="Flag as Spam"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => handleUnflagSpam(t.id)}
                            className="p-1.5 text-paper/60 hover:text-severity-low hover:bg-severity-low/10 rounded transition-colors inline-flex cursor-pointer"
                            title="Restore Ticket"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Meta Count */}
        <div className="p-3.5 bg-ink-muted/40 border-t border-ink-line/15 font-mono text-[10px] text-paper/50 flex items-center justify-between">
          <span>SHOWING {filteredTickets.length} OF {tickets.length} DOCKET ENTRIES</span>
          <span className="text-accent font-bold">{activeTab === 'active' ? 'ACTIVE REGISTRY' : 'FLAGGED QUEUE'}</span>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. OVERRIDE / STATUS MODIFICATION MODAL
      ───────────────────────────────────────────────────────────── */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0E1B29] border border-ink-line/30 rounded-card p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl text-paper">
            
            <div className="flex justify-between items-start border-b border-ink-line/20 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display text-base font-bold text-paper">
                  Override Ticket Parameters
                </h3>
                <p className="text-xs text-paper/60 font-mono">
                  Ticket #{editingTicket.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button 
                type="button"
                className="p-1 text-paper/50 hover:text-paper cursor-pointer" 
                onClick={() => setEditingTicket(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                  Status
                </label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-ink-line/25 rounded-button px-3 py-2 text-xs bg-ink text-paper focus:outline-none focus:border-accent"
                >
                  <option value="reported">Reported</option>
                  <option value="verified">Verified</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-ink-line/25 rounded-button px-3 py-2 text-xs bg-ink text-paper focus:outline-none focus:border-accent"
                  >
                    <option value="pothole">Pothole</option>
                    <option value="waterlogging">Waterlogging</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="garbage">Garbage</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-wider mb-1">
                    Severity
                  </label>
                  <select 
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                    className="w-full border border-ink-line/25 rounded-button px-3 py-2 text-xs bg-ink text-paper focus:outline-none focus:border-accent"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              {editStatus === 'resolved' && (
                <div className="space-y-1.5 border border-dashed border-ink-line/30 p-3 rounded-card bg-ink/40">
                  <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-wider">
                    Resolution Verification Photo <span className="text-severity-high">*</span>
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setResolvedImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-paper/70 file:mr-2.5 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-accent/15 file:text-accent hover:file:bg-accent/25 file:cursor-pointer"
                    required={!editingTicket.resolved_photo}
                  />
                  <p className="text-[9px] text-paper/50 leading-tight font-mono">
                    {!editingTicket.resolved_photo 
                      ? "A photographic proof of completed work is required to mark this ticket as resolved."
                      : "A verification photo exists; upload a new file if replacing."}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] font-bold text-paper/60 uppercase tracking-wider mb-1">
                  Audit Action Rationale Note
                </label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Specify the override justification (e.g. Ward inspector field review confirmed road repair)..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full border border-ink-line/25 rounded-button px-3 py-2 text-xs bg-ink text-paper focus:outline-none focus:border-accent placeholder:text-paper/30 font-sans"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-ink-line/20">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-2 border border-ink-line/30 text-xs font-bold text-paper/60 hover:text-paper rounded-button hover:bg-ink-muted text-center cursor-pointer"
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-accent hover:bg-[#D9932E] text-ink text-xs font-bold rounded-button shadow-md transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. TICKET DETAIL DOSSIER MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedViewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0E1B29] border border-ink-line/30 rounded-card p-6 max-w-lg w-full relative z-10 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh] text-paper">
            
            <div className="flex justify-between items-start border-b border-ink-line/20 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-display text-lg font-bold text-paper flex items-center gap-2">
                  <span>Ticket Dossier</span>
                  <span className="text-xs font-mono text-accent font-bold">
                    #{selectedViewTicket.id.slice(-6).toUpperCase()}
                  </span>
                </h3>
              </div>
              <button 
                type="button"
                className="p-1 text-paper/50 hover:text-paper cursor-pointer" 
                onClick={() => setSelectedViewTicket(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submitted Photo Gallery */}
            {selectedViewTicket.photos && selectedViewTicket.photos.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                  Citizen Submitted Evidence
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedViewTicket.photos.map((p, idx) => (
                    <div key={idx} className="relative rounded overflow-hidden border border-ink-line/20 aspect-video bg-ink">
                      <ImageWithFallback 
                        src={p.url ? (
                          (p.url.startsWith('http://') || p.url.startsWith('https://') || p.url.startsWith('data:'))
                            ? p.url 
                            : `http://localhost:8000${p.url.startsWith('/') ? '' : '/'}${p.url}`
                        ) : ''} 
                        alt="Citizen attachment" 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute bottom-1 right-1 bg-ink/80 px-1.5 py-0.5 rounded font-mono text-[8px] font-bold text-paper/70">
                        {p.uploaded_by || 'Citizen'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Verification Photo Proof */}
            {selectedViewTicket.resolved_photo && (
              <div className="space-y-1.5 border border-severity-low/30 p-3 rounded-card bg-severity-low/10">
                <p className="font-mono text-[10px] text-severity-low font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolution Verification Proof</span>
                </p>
                <div className="relative rounded overflow-hidden border border-ink-line/20 aspect-video bg-ink max-w-sm mx-auto">
                  <ImageWithFallback 
                    src={selectedViewTicket.resolved_photo.url ? (
                      (selectedViewTicket.resolved_photo.url.startsWith('http://') || selectedViewTicket.resolved_photo.url.startsWith('https://') || selectedViewTicket.resolved_photo.url.startsWith('data:'))
                        ? selectedViewTicket.resolved_photo.url 
                        : `http://localhost:8000${selectedViewTicket.resolved_photo.url.startsWith('/') ? '' : '/'}${selectedViewTicket.resolved_photo.url}`
                    ) : ''} 
                    alt="Resolution proof" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            )}

            {/* Metadata Fields Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="col-span-2 border-b border-ink-line/15 pb-2">
                <p className="text-paper/50 font-mono text-[10px] uppercase">MongoDB Database Key</p>
                <p className="font-mono text-accent text-[11px] select-all mt-0.5">{selectedViewTicket.id}</p>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Category</p>
                <p className="font-bold text-paper capitalize mt-0.5">{selectedViewTicket.category}</p>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Severity</p>
                <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border mt-0.5 ${getSeverityBadgeClass(selectedViewTicket.severity)}`}>
                  {selectedViewTicket.severity}
                </span>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border mt-0.5 ${getStatusBadgeClass(selectedViewTicket.status)}`}>
                  {selectedViewTicket.status}
                </span>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Municipal Ward</p>
                <p className="font-bold text-accent mt-0.5">{selectedViewTicket.zone_id || 'AMC Unassigned'}</p>
              </div>

              <div className="col-span-2 flex justify-between items-center bg-ink/60 border border-ink-line/20 p-3 rounded-card mt-1">
                <div className="min-w-0">
                  <p className="text-paper/50 text-[10px] uppercase font-mono font-bold tracking-wider">Navigation Geocodes</p>
                  <p className="font-mono text-xs text-paper truncate mt-0.5">
                    Lat: {selectedViewTicket.location?.coordinates?.[1]?.toFixed(6)}, Lng: {selectedViewTicket.location?.coordinates?.[0]?.toFixed(6)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lat = selectedViewTicket.location?.coordinates?.[1];
                    const lng = selectedViewTicket.location?.coordinates?.[0];
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                  }}
                  className="px-3 py-1.5 bg-accent hover:bg-[#D9932E] text-ink font-display font-bold text-[10px] uppercase tracking-wider rounded-button shadow flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </button>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Citizen Reports</p>
                <p className="font-mono font-bold text-paper mt-0.5">{selectedViewTicket.report_count || 1}</p>
              </div>

              <div>
                <p className="text-paper/50 font-mono text-[10px] uppercase">Community Upvotes</p>
                <p className="font-mono font-bold text-paper mt-0.5">{selectedViewTicket.upvote_count || 0}</p>
              </div>
            </div>

            {/* Status History Timeline */}
            {selectedViewTicket.status_history && selectedViewTicket.status_history.length > 0 && (
              <div className="space-y-2 border-t border-ink-line/15 pt-4">
                <p className="font-mono text-[10px] text-accent font-bold uppercase tracking-wider">
                  Status Transition Audit Timeline
                </p>
                <div className="space-y-2.5 font-mono text-[11px] max-h-36 overflow-y-auto pr-1">
                  {selectedViewTicket.status_history.map((h, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-paper capitalize">{h.status}</p>
                        <p className="text-paper/40 text-[10px]">
                          By {h.changed_by} on {new Date(h.changed_at && (h.changed_at.endsWith('Z') || h.changed_at.includes('+') || h.changed_at.includes('-')) ? h.changed_at : `${h.changed_at}Z`).toLocaleString()}
                        </p>
                        {h.note && <p className="text-paper/60 text-[10px] italic">"{h.note}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-2 border-t border-ink-line/15">
              <button
                type="button"
                onClick={() => setSelectedViewTicket(null)}
                className="px-4 py-2 bg-ink-muted hover:bg-ink-muted/80 text-paper rounded-button text-xs font-mono font-bold transition-colors cursor-pointer border border-ink-line/25"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. CUSTOM CONFIRMATION DIALOG MODAL
      ───────────────────────────────────────────────────────────── */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0E1B29] border border-ink-line/30 rounded-card p-6 w-full max-w-md shadow-2xl space-y-6 text-paper">
            
            <div className="flex items-start gap-4">
              {modalConfig.severity === 'warning' && (
                <div className="p-3 rounded-full bg-accent/15 text-accent shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'error' && (
                <div className="p-3 rounded-full bg-severity-high/15 text-severity-high shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'success' && (
                <div className="p-3 rounded-full bg-severity-low/15 text-severity-low shrink-0">
                  <Check className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'info' && (
                <div className="p-3 rounded-full bg-primary/20 text-blue-300 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              
              <div className="space-y-1.5 flex-1">
                <h3 className="font-display text-base font-bold text-paper leading-none">
                  {modalConfig.title}
                </h3>
                <p className="text-xs text-paper/70 leading-relaxed font-normal">
                  {modalConfig.message}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2 border-t border-ink-line/15">
              {modalConfig.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-ink-line/30 rounded-button bg-transparent hover:bg-ink-muted text-xs font-mono font-bold text-paper/70 hover:text-paper transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setModalConfig(prev => ({ ...prev, isOpen: false }));
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                }}
                className={`px-4 py-2 rounded-button text-xs font-bold font-mono transition-all cursor-pointer ${
                  modalConfig.severity === 'error' 
                    ? 'bg-severity-high hover:bg-red-700 text-white' 
                    : modalConfig.severity === 'warning'
                    ? 'bg-accent hover:bg-[#D9932E] text-ink'
                    : modalConfig.severity === 'success'
                    ? 'bg-severity-low hover:bg-[#3D9468] text-white'
                    : 'bg-accent hover:bg-[#D9932E] text-ink'
                }`}
              >
                {modalConfig.type === 'confirm' ? 'Confirm Action' : 'Dismiss'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
