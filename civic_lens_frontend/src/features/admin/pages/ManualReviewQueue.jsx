/**
 * ==============================================================================
 * CIVIC LENS — MANUAL REVIEW QUEUE // TRIAGE WORKBENCH (PAGE 14 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: High-Velocity Forensic Verification Workbench & Case Docket
 * 
 * SUMMARY OF CHANGES & ARCHITECTURAL UPGRADES:
 * 1. Design Tokens & Visual Hierarchy:
 *    - Locked to dark `ink` (#10263A / #0E131F) base with `paper` (#F6F2E9) typography.
 *    - Space Grotesk (`font-display`) for titles/headers, Inter (`font-sans`) for body copy,
 *      and JetBrains Mono (`font-mono`) across report IDs, timestamps, queue counts, and shortcuts.
 * 
 * 2. Physical Card-Stack Queue Visualization:
 *    - Replaced the single static form with a focused workbench card backed by receded queue cards
 *      (subtly stacked with offset borders and lower opacity, giving a physical docket feel).
 *    - Prominent queue progress counter (`Reviewing Case X of Y`) with dynamic completion progress bar.
 *    - Quick queue stepping navigation (`[J] Prev` / `[K] Next`) and thumbnail queue navigation strip.
 * 
 * 3. Segmented Chip Groups (Replacing Native Selects):
 *    - Converted dropdown selects into clickable, keyboard-bound segmented chip groups:
 *      * Category: [1] Pothole (#1E5F8C), [2] Waterlogging (#4A85AA), [3] Garbage (#E8A33D),
 *                  [4] Streetlight (#4CAF7D), [5] Other (#6B7280).
 *      * Severity: [Q/7] Low (#4CAF7D), [W/8] Medium (#E8A33D), [E/9] High (#D64545).
 *    - Visible focus, radio semantics, and integrated `kbd` shortcut badges.
 * 
 * 4. Keyboard Shortcuts for Rapid Triage:
 *    - `1`–`5`: Instant Category selection.
 *    - `Q`/`W`/`E` or `7`/`8`/`9` or `L`/`M`/`H`: Instant Severity selection.
 *    - `A` / `Enter`: Approve Override & Create Ticket.
 *    - `D` / `Backspace`: Discard as Spam.
 *    - `J` / `K` (or `ArrowLeft`/`ArrowRight`): Previous / Next card in queue.
 *    - `Z`: Undo previous action within the buffer window.
 *    - `?`: Toggle Keyboard Shortcuts Cheatsheet.
 * 
 * 5. Viewfinder Evidence Photo Framing:
 *    - Camera viewfinder reticles (`┌ ┐ └ ┘`) in Signal Amber (#E8A33D).
 *    - Location and timestamp badge overlays with Lightbox full-resolution inspection zoom modal.
 * 
 * 6. Humanized Reason Line with Raw System Signal Inspection:
 *    - Distinguishes between "low model confidence" vs "classifier service unreachable".
 *    - Raw technical error codes (e.g., `ML_SERVICE_UNREACHABLE`) kept accessible in a technical debug badge.
 * 
 * 7. Client-Side Session Stats & Interactive 4-Second Undo Buffer:
 *    - Real-time session stats counter (Reviewed, Approved, Discarded, Remaining) tracked client-side.
 *    - 4-second interactive undo buffer with countdown bar allowing staff to catch accidental keystrokes.
 * ==============================================================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShieldAlert, Check, Ban, MapPin, Loader2, AlertCircle, 
  Sparkles, Keyboard, Layers, ArrowLeft, ArrowRight, Clock,
  Maximize2, X, RefreshCw, CheckCircle2, ChevronRight,
  HelpCircle, RotateCcw, AlertTriangle, Eye, ZoomIn, FileText
} from 'lucide-react';
import api from '../../../services/api';

// Categorical palette strictly mapped to design tokens
const CATEGORY_OPTIONS = [
  { key: 'pothole', label: 'Pothole', shortcut: '1', color: '#1E5F8C', border: 'border-primary/40', bg: 'bg-primary/20', text: 'text-blue-300' },
  { key: 'waterlogging', label: 'Waterlogging', shortcut: '2', color: '#4A85AA', border: 'border-[#4A85AA]/40', bg: 'bg-[#4A85AA]/20', text: 'text-sky-300' },
  { key: 'garbage', label: 'Garbage', shortcut: '3', color: '#E8A33D', border: 'border-accent/40', bg: 'bg-accent/20', text: 'text-amber-300' },
  { key: 'streetlight', label: 'Streetlight', shortcut: '4', color: '#4CAF7D', border: 'border-severity-low/40', bg: 'bg-severity-low/20', text: 'text-emerald-300' },
  { key: 'other', label: 'Other', shortcut: '5', color: '#6B7280', border: 'border-gray-600/40', bg: 'bg-gray-700/20', text: 'text-gray-300' }
];

const SEVERITY_OPTIONS = [
  { key: 'low', label: 'Low Severity', shortcut: 'Q', numShortcut: '7', color: '#4CAF7D', border: 'border-severity-low/50', bg: 'bg-severity-low/20', text: 'text-severity-low' },
  { key: 'medium', label: 'Medium Severity', shortcut: 'W', numShortcut: '8', color: '#E8A33D', border: 'border-severity-medium/50', bg: 'bg-severity-medium/20', text: 'text-severity-medium' },
  { key: 'high', label: 'High Severity', shortcut: 'E', numShortcut: '9', color: '#D64545', border: 'border-severity-high/50', bg: 'bg-severity-high/20', text: 'text-severity-high' }
];

// Humanized Reason Formatter with raw detail mapping
function formatReason(rawReason) {
  if (!rawReason) return { headline: 'Needs Manual Verification', detail: 'Automated triage was inconclusive.', isSystemError: false, raw: 'UNKNOWN' };
  
  const raw = rawReason.toUpperCase().trim();

  if (raw.includes('UNREACHABLE') || raw.includes('SERVICE_UNREACHABLE') || raw.includes('ML_SERVICE')) {
    return {
      headline: 'Classifier Service Unavailable',
      detail: 'The AI computer vision microservice was unreachable during report intake.',
      isSystemError: true,
      raw: rawReason
    };
  }

  if (raw.includes('LOW_CONFIDENCE') || raw.includes('CONFIDENCE')) {
    return {
      headline: 'Low Model Confidence Score',
      detail: 'Classifier score fell below the 60.0% municipal certainty threshold.',
      isSystemError: false,
      raw: rawReason
    };
  }

  if (raw.includes('NO_OBJECT') || raw.includes('EMPTY')) {
    return {
      headline: 'Ambiguous Visual Evidence',
      detail: 'Visual detector did not isolate a distinct civic defect pattern.',
      isSystemError: false,
      raw: rawReason
    };
  }

  if (raw.includes('TICKET_RESOLUTION') || raw.includes('RESOLUTION')) {
    return {
      headline: 'Citizen Resolution Signal',
      detail: 'Community verified that the reported issue has been repaired.',
      isSystemError: false,
      raw: rawReason
    };
  }

  return {
    headline: rawReason.replace(/_/g, ' ').toUpperCase(),
    detail: 'Flagged for administrator manual inspection.',
    isSystemError: false,
    raw: rawReason
  };
}

function ImageWithFallback({ src, alt, className, onOpenLightbox }) {
  const [hasError, setHasError] = useState(false);

  return !hasError && src ? (
    <div className="relative w-full h-full group cursor-pointer" onClick={onOpenLightbox}>
      <img 
        src={src} 
        alt={alt} 
        className={className} 
        onError={() => setHasError(true)} 
      />
      <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="px-2.5 py-1 bg-ink/90 border border-accent/40 rounded-card font-mono text-[10px] text-accent flex items-center gap-1.5 shadow-lg">
          <ZoomIn className="w-3.5 h-3.5" />
          <span>INSPECT PHOTO</span>
        </span>
      </div>
    </div>
  ) : (
    <div className="w-full h-full bg-[#0B0F19] flex flex-col justify-center items-center text-center p-4 select-none text-paper/40 border border-ink-line/15 rounded-card">
      <AlertCircle className="w-6 h-6 text-accent/50 mb-1" />
      <span className="font-mono text-[9px] font-bold text-accent uppercase tracking-widest mb-0.5">IMAGE OFFLINE</span>
      <span className="text-[10px] text-paper/40">Unresolved or blocked host</span>
    </div>
  );
}

export default function ManualReviewQueue() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Override selections mapped by report ID
  const [overrides, setOverrides] = useState({});

  // Lightbox State
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Shortcuts Cheatsheet Modal State
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Client-Side Session Statistics (Reset on page reload)
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    approved: 0,
    discarded: 0
  });

  // Undo Buffer System (4-second delay before committing API calls)
  const [pendingUndoAction, setPendingUndoAction] = useState(null);
  const undoTimerRef = useRef(null);
  const [undoProgress, setUndoProgress] = useState(100);

  // Dialog Modal Configuration
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
        const items = response.data?.data?.queue_items || [];
        setReviews(items);
        setCurrentIndex(0);

        // Pre-populate overrides
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

  // Cleanup undo timer on unmount
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearInterval(undoTimerRef.current);
    };
  }, []);

  // Active current item
  const currentItem = reviews[currentIndex] || null;
  const currentOverride = currentItem ? (overrides[currentItem.report_id] || { category: 'pothole', severity: 'medium' }) : { category: 'pothole', severity: 'medium' };
  const isResolutionSignal = currentItem?.report_id?.startsWith('ticket:');

  // Handle selection updates
  const setCategory = (catKey) => {
    if (!currentItem) return;
    setOverrides(prev => ({
      ...prev,
      [currentItem.report_id]: {
        ...prev[currentItem.report_id],
        category: catKey
      }
    }));
  };

  const setSeverity = (sevKey) => {
    if (!currentItem) return;
    setOverrides(prev => ({
      ...prev,
      [currentItem.report_id]: {
        ...prev[currentItem.report_id],
        severity: sevKey
      }
    }));
  };

  // Step next/prev in queue
  const stepNext = () => {
    if (currentIndex < reviews.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const stepPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Commit API action after undo window expires
  const commitAction = (action) => {
    const { reportId, type, category, severity, isRes } = action;
    setProcessingId(reportId);

    const payload = type === 'approve' 
      ? { category, severity } 
      : { category: 'other', severity: 'low' };

    api.patch(`/admin/manual-review-queue/${reportId}/resolve`, payload)
      .then(() => {
        setProcessingId(null);
        // Remove processed item from local state
        setReviews(prev => {
          const nextReviews = prev.filter(r => r.report_id !== reportId);
          // Keep current index bounded
          if (currentIndex >= nextReviews.length) {
            setCurrentIndex(Math.max(0, nextReviews.length - 1));
          }
          return nextReviews;
        });

        // Update Session Stats
        setSessionStats(prev => ({
          ...prev,
          reviewed: prev.reviewed + 1,
          approved: type === 'approve' ? prev.approved + 1 : prev.approved,
          discarded: type === 'discard' ? prev.discarded + 1 : prev.discarded
        }));
      })
      .catch((err) => {
        console.error('Failed to resolve queue item:', err);
        setProcessingId(null);
        showModal({
          type: 'alert',
          severity: 'error',
          title: 'Action Failed',
          message: err.response?.data?.error?.message || 'Failed to submit triage resolution to backend.'
        });
      });
  };

  // Trigger Action with 4-second Undo Buffer
  const triggerTriageAction = (type) => {
    if (!currentItem || processingId) return;

    const reportId = currentItem.report_id;
    const isRes = reportId.startsWith('ticket:');
    const selection = overrides[reportId] || { category: 'pothole', severity: 'medium' };

    // If there's already a pending undo action, immediately commit it first
    if (pendingUndoAction) {
      clearInterval(undoTimerRef.current);
      commitAction(pendingUndoAction);
    }

    const actionData = {
      reportId,
      type,
      category: selection.category,
      severity: selection.severity,
      isRes,
      label: type === 'approve' 
        ? (isRes ? 'Confirmed Resolution' : `Approved as ${selection.category.toUpperCase()}`) 
        : (isRes ? 'Rejected Resolution' : 'Discarded as Spam')
    };

    setPendingUndoAction(actionData);
    setUndoProgress(100);

    // Auto-step to next item immediately in UI for velocity
    if (reviews.length > 1) {
      if (currentIndex < reviews.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(Math.max(0, reviews.length - 2));
      }
    }

    // Start 4-second countdown
    const startTime = Date.now();
    const duration = 4000;

    undoTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setUndoProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(undoTimerRef.current);
        commitAction(actionData);
        setPendingUndoAction(null);
      }
    }, 50);
  };

  // Undo the pending action
  const handleUndo = () => {
    if (!pendingUndoAction) return;
    clearInterval(undoTimerRef.current);
    // Find index of the undone report and refocus it
    const undoneId = pendingUndoAction.reportId;
    const idx = reviews.findIndex(r => r.report_id === undoneId);
    if (idx !== -1) {
      setCurrentIndex(idx);
    }
    setPendingUndoAction(null);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or modal is open
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (modalConfig.isOpen || lightboxUrl) return;

      const key = e.key.toLowerCase();

      // Shortcuts Modal Toggle
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
        return;
      }

      // Close modal on Escape
      if (e.key === 'Escape') {
        if (showShortcutsModal) setShowShortcutsModal(false);
        if (lightboxUrl) setLightboxUrl(null);
        return;
      }

      // Category shortcuts: 1, 2, 3, 4, 5
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const catMap = { '1': 'pothole', '2': 'waterlogging', '3': 'garbage', '4': 'streetlight', '5': 'other' };
        setCategory(catMap[e.key]);
        return;
      }

      // Severity shortcuts: Q / W / E or 7 / 8 / 9 or L / M / H
      if (['q', 'w', 'e', '7', '8', '9', 'l', 'm', 'h'].includes(key)) {
        e.preventDefault();
        if (key === 'q' || key === '7' || key === 'l') setSeverity('low');
        if (key === 'w' || key === '8' || key === 'm') setSeverity('medium');
        if (key === 'e' || key === '9' || key === 'h') setSeverity('high');
        return;
      }

      // Action: Approve (A or Enter)
      if (key === 'a' || e.key === 'Enter') {
        e.preventDefault();
        triggerTriageAction('approve');
        return;
      }

      // Action: Discard (D or Backspace or X)
      if (key === 'd' || e.key === 'Backspace' || key === 'x') {
        e.preventDefault();
        triggerTriageAction('discard');
        return;
      }

      // Navigation: J / K or ArrowLeft / ArrowRight
      if (key === 'j' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stepPrev();
        return;
      }
      if (key === 'k' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepNext();
        return;
      }

      // Undo shortcut: Z
      if (key === 'z' && (e.ctrlKey || e.metaKey || true)) {
        if (pendingUndoAction) {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem, overrides, currentIndex, reviews, modalConfig, lightboxUrl, showShortcutsModal, pendingUndoAction]);

  // Image URL helper
  const getPhotoUrl = (rawUrl) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
      return rawUrl;
    }
    return `http://localhost:8000${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
  };

  const reasonInfo = currentItem ? formatReason(currentItem.reason) : null;

  return (
    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto bg-ink text-paper min-h-screen relative font-sans selection:bg-accent selection:text-ink">
      
      {/* Background survey grid texture */}
      <div className="absolute inset-0 survey-grid opacity-10 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TRIAGE TELEMETRY BAR */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-ink-line/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest bg-accent/15 text-accent border border-accent/30 rounded">
              FAST VERIFICATION WORKBENCH
            </span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-paper/50">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              LIVE TRIAGE STREAM
            </span>
            <span className="text-paper/30 text-xs hidden sm:inline">•</span>
            <span className="text-[11px] font-mono text-paper/50">
              AHMEDABAD MUNICIPAL CORP
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-paper">
            Manual Review & Exception Queue
          </h1>
          <p className="text-xs md:text-sm text-paper/60 font-sans">
            Rapid classification workbench for reports where computer vision certainty fell below automated threshold gates.
          </p>
        </div>

        {/* Global Controls & Session Stats */}
        <div className="flex items-center gap-3 self-start lg:self-auto flex-wrap">
          
          {/* Client-Side Session Stats Pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#151B26] border border-ink-line/20 rounded-card font-mono text-xs text-paper/70">
            <span className="text-[10px] text-paper/40 font-bold uppercase tracking-wider">SESSION:</span>
            <span className="text-paper font-bold">{sessionStats.reviewed} Triaged</span>
            <span className="text-paper/20">|</span>
            <span className="text-severity-low font-semibold">{sessionStats.approved} Approved</span>
            <span className="text-paper/20">|</span>
            <span className="text-severity-high font-semibold">{sessionStats.discarded} Discarded</span>
          </div>

          {/* Shortcuts Cheatsheet Trigger */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#151B26] hover:bg-ink-muted/50 border border-ink-line/25 hover:border-accent/40 rounded-card text-xs font-mono font-semibold text-paper/80 transition-all cursor-pointer shadow-sm active:scale-95"
            title="View keyboard shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 text-accent" />
            <span className="hidden md:inline">KEYBOARD</span>
            <span className="px-1.5 py-0.2 bg-ink-muted text-accent font-bold rounded text-[10px] border border-ink-line/30">?</span>
          </button>

          {/* Sync / Refresh Queue */}
          <button
            type="button"
            onClick={fetchQueue}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-[#151B26] hover:bg-ink-muted/50 border border-ink-line/20 hover:border-ink-line/40 rounded-card text-xs font-mono text-paper/80 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="Refresh queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">SYNC</span>
          </button>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNDO BUFFER TOAST BAR */}
      {/* ========================================================================= */}
      {pendingUndoAction && (
        <div className="relative z-30 bg-[#0E1B29] border border-accent/40 rounded-card p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
            <div className="space-y-0.5">
              <p className="text-xs font-mono font-bold text-paper flex items-center gap-2">
                <span>{pendingUndoAction.label}</span>
                <span className="text-paper/40 font-normal">#{pendingUndoAction.reportId.slice(-6).toUpperCase()}</span>
              </p>
              <p className="text-[11px] text-paper/50 font-sans">
                Committing to municipal ledger in 4s...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo Button with shortcut */}
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-amber-400 text-ink font-mono text-xs font-bold rounded-button transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>UNDO</span>
              <span className="px-1 bg-ink/20 text-ink text-[10px] rounded ml-1 font-extrabold">[Z]</span>
            </button>
          </div>

          {/* Progressive countdown bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-ink-muted overflow-hidden rounded-b-card">
            <div 
              className="h-full bg-accent transition-all duration-75"
              style={{ width: `${undoProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN WORKBENCH BODY / EMPTY / ERROR STATES */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-28 space-y-4">
          <div className="relative flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <ShieldAlert className="w-4 h-4 text-primary absolute" />
          </div>
          <p className="text-xs font-mono font-bold text-paper/70 uppercase tracking-widest animate-pulse">
            LOADING EXCEPTION QUEUE & VISUAL METADATA...
          </p>
        </div>
      ) : error ? (
        <div className="bg-[#151B26]/40 border border-severity-high/30 p-8 rounded-card text-center max-w-md mx-auto space-y-4 shadow-2xl backdrop-blur-md">
          <AlertCircle className="w-10 h-10 text-severity-high mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-display font-bold text-paper">Failed to Load Review Queue</h3>
            <p className="text-xs text-paper/60">{error}</p>
          </div>
          <button 
            type="button"
            onClick={fetchQueue} 
            className="px-4 py-2 bg-accent hover:bg-amber-400 text-ink text-xs font-mono font-bold rounded-button transition-colors shadow-md cursor-pointer"
          >
            RETRY FETCH
          </button>
        </div>
      ) : reviews.length === 0 ? (
        /* Zero-State Celebratory Queue Clearance */
        <div className="bg-[#151B26]/30 border border-ink-line/20 rounded-card p-12 text-center max-w-lg mx-auto space-y-5 shadow-2xl backdrop-blur-md my-8">
          <div className="w-16 h-16 rounded-full bg-severity-low/15 text-severity-low border border-severity-low/30 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-display font-bold text-paper">Review Queue Clear</h3>
            <p className="text-xs text-paper/60 max-w-sm mx-auto font-sans leading-relaxed">
              All low-confidence municipal reports and community resolution signals have been triaged. The urban telemetry queue is fully reconciled.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-ink/60 rounded border border-ink-line/15 text-paper/70">
              Session Total: <span className="font-bold text-accent">{sessionStats.reviewed}</span>
            </div>
            <button
              type="button"
              onClick={fetchQueue}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-paper font-bold rounded transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Check for New</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 4. ACTIVE VERIFICATION WORKBENCH (CARD-STACK QUEUE) */
        /* ========================================================================= */
        <div className="space-y-6 relative">
          
          {/* Top Progress & Queue Counter Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#151B26]/60 border border-ink-line/20 rounded-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-paper">
                <Layers className="w-4 h-4 text-accent" />
                <span>CASE {currentIndex + 1} OF {reviews.length}</span>
              </div>
              <div className="h-4 w-[1px] bg-ink-line/20 hidden sm:block" />
              <div className="w-36 h-2 bg-[#101520] rounded-full overflow-hidden border border-ink-line/15 hidden sm:block">
                <div 
                  className="h-full bg-accent transition-all duration-300 rounded-full"
                  style={{ width: `${Math.round(((currentIndex + 1) / reviews.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Queue Stepper Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={stepPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-ink border border-ink-line/20 hover:border-accent/40 rounded text-xs font-mono text-paper/80 hover:text-paper disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Previous case (Shortcut: J or Left Arrow)"
              >
                <ArrowLeft className="w-3 h-3 text-accent" />
                <span>PREV</span>
                <span className="text-[10px] text-paper/40">[J]</span>
              </button>

              <button
                type="button"
                onClick={stepNext}
                disabled={currentIndex === reviews.length - 1}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-ink border border-ink-line/20 hover:border-accent/40 rounded text-xs font-mono text-paper/80 hover:text-paper disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                title="Next case (Shortcut: K or Right Arrow)"
              >
                <span>NEXT</span>
                <span className="text-[10px] text-paper/40">[K]</span>
                <ArrowRight className="w-3 h-3 text-accent" />
              </button>
            </div>
          </div>

          {/* Physical Card-Stack Layout Wrapper */}
          <div className="relative">
            
            {/* Receded Queue Stack Card #2 (Background Peek) */}
            {reviews[currentIndex + 2] && (
              <div className="hidden lg:block absolute -top-4 left-4 right-4 h-full bg-[#0E1522]/50 border border-ink-line/10 rounded-card -z-20 transform scale-[0.96] opacity-40 pointer-events-none" />
            )}

            {/* Receded Queue Stack Card #1 (Middle Peek) */}
            {reviews[currentIndex + 1] && (
              <div className="hidden lg:block absolute -top-2 left-2 right-2 h-full bg-[#111927]/80 border border-ink-line/15 rounded-card -z-10 transform scale-[0.98] opacity-70 pointer-events-none" />
            )}

            {/* Foreground Primary Focus Card */}
            <div className="bg-[#151B26]/90 border border-ink-line/25 rounded-card p-6 md:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
              
              {/* Card Header: Case ID, Reason Badge, and Status Tag */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-ink-line/15 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-paper tracking-tight">
                      {isResolutionSignal 
                        ? `RESOLUTION SIGNAL #${currentItem.report_id.split(':', 2)[1].slice(-6).toUpperCase()}` 
                        : `REPORT DOSSIER #${currentItem.report_id.slice(-6).toUpperCase()}`}
                    </span>
                    <span className="font-mono text-[10px] text-paper/40 bg-ink px-2 py-0.5 rounded border border-ink-line/15">
                      ID: {currentItem.report_id}
                    </span>
                  </div>

                  {/* Humanized Reason Line + Technical Error Details */}
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 border ${
                      reasonInfo?.isSystemError 
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/40' 
                        : 'bg-red-500/15 text-red-300 border-red-500/40'
                    }`}>
                      <AlertTriangle className="w-3 h-3" />
                      <span>{reasonInfo?.headline}</span>
                    </span>
                    <span className="text-xs text-paper/60 font-sans">
                      {reasonInfo?.detail}
                    </span>
                    {reasonInfo?.raw && (
                      <span className="font-mono text-[10px] text-paper/40 bg-ink px-1.5 py-0.2 rounded border border-ink-line/10" title="Raw Signal Code">
                        raw: {reasonInfo.raw}
                      </span>
                    )}
                  </div>
                </div>

                <div className="self-start sm:self-auto">
                  <span className="bg-red-500/15 text-red-300 border border-red-500/30 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>NEEDS TRIAGE</span>
                  </span>
                </div>
              </div>

              {/* Card Body: Left Photo Panel + Right Classification Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* ── LEFT: EVIDENCE PHOTO WITH VIEWFINDER MOTIF (5 Columns) ── */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="aspect-square w-full rounded-card overflow-hidden bg-[#0A0E17] border border-ink-line/20 relative flex items-center justify-center group shadow-inner">
                    
                    {/* Viewfinder Reticles (Signal Amber) */}
                    <div className="absolute top-2.5 left-2.5 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                      ┌
                    </div>
                    <div className="absolute top-2.5 right-2.5 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                      ┐
                    </div>
                    <div className="absolute bottom-10 left-2.5 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                      └
                    </div>
                    <div className="absolute bottom-10 right-2.5 font-mono text-sm text-accent font-bold select-none pointer-events-none z-20 drop-shadow">
                      ┘
                    </div>

                    {/* Evidence Photo */}
                    <ImageWithFallback
                      src={getPhotoUrl(currentItem.photo_url)}
                      alt="Defect visual evidence"
                      className="w-full h-full object-contain select-none"
                      onOpenLightbox={() => setLightboxUrl(getPhotoUrl(currentItem.photo_url))}
                    />

                    {/* Metadata Overlay Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent px-3 py-2 text-[11px] font-mono text-paper/80 flex items-center justify-between z-10 backdrop-blur-[2px]">
                      <div className="flex items-center gap-1 text-accent">
                        <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                        <span className="truncate">Ahmedabad Municipal Sector</span>
                      </div>
                      <span className="text-[10px] text-paper/50">
                        {currentItem.created_at ? new Date(currentItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'LOGGED'}
                      </span>
                    </div>

                    {/* Fullscreen Zoom Trigger Button */}
                    {currentItem.photo_url && (
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(getPhotoUrl(currentItem.photo_url))}
                        className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/90 text-white rounded border border-white/20 z-30 transition-all cursor-pointer"
                        title="Enlarge photograph"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-accent" />
                      </button>
                    )}
                  </div>

                  {/* Timestamp & Location Metadata Strip */}
                  <div className="bg-ink/60 border border-ink-line/15 rounded p-2.5 text-xs font-mono text-paper/70 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>Reported:</span>
                    </div>
                    <span className="font-bold text-paper">
                      {currentItem.created_at 
                        ? new Date(currentItem.created_at.endsWith('Z') || currentItem.created_at.includes('+') ? currentItem.created_at : `${currentItem.created_at}Z`).toLocaleString()
                        : 'Recently Logged'}
                    </span>
                  </div>
                </div>

                {/* ── RIGHT: CLASSIFICATION CONTROLS & ACTION BUTTONS (7 Columns) ── */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  
                  {isResolutionSignal ? (
                    /* Resolution Signal Special View */
                    <div className="bg-accent/10 border border-accent/25 rounded-card p-5 space-y-3">
                      <div className="flex items-center gap-2 text-accent font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span>Community Resolution Verification Signal</span>
                      </div>
                      <p className="text-xs text-paper/80 font-sans leading-relaxed">
                        A citizen on the ground reported that this municipal issue is resolved. Approving this override will permanently close and resolve the parent ticket. Discarding will dismiss this resolution signal and keep the ticket active.
                      </p>
                    </div>
                  ) : (
                    /* Standard Category & Severity Segmented Pill Groups */
                    <div className="space-y-5">
                      
                      {/* 1. Final Category Selection Chips */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-paper/70 flex items-center gap-1.5">
                            <span>1. Assign Final Category</span>
                            <span className="text-paper/40 font-normal">(Keys 1–5)</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-accent uppercase">
                            {CATEGORY_OPTIONS.find(c => c.key === currentOverride.category)?.label}
                          </span>
                        </div>

                        {/* Category Segmented Buttons */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Final Category">
                          {CATEGORY_OPTIONS.map((cat) => {
                            const isSelected = currentOverride.category === cat.key;
                            return (
                              <button
                                key={cat.key}
                                type="button"
                                onClick={() => setCategory(cat.key)}
                                role="radio"
                                aria-checked={isSelected}
                                className={`flex items-center justify-between px-3 py-2 rounded-card text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  isSelected 
                                    ? `${cat.bg} ${cat.border} ${cat.text} shadow-md ring-1 ring-white/20 font-bold`
                                    : 'bg-ink/50 border-ink-line/15 text-paper/70 hover:text-paper hover:bg-ink-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cat.color }} />
                                  <span className="truncate">{cat.label}</span>
                                </div>
                                <kbd className="px-1 py-0.2 bg-ink/60 rounded text-[9px] font-mono text-paper/50 border border-ink-line/20 ml-1">
                                  {cat.shortcut}
                                </kbd>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Final Severity Selection Chips */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-paper/70 flex items-center gap-1.5">
                            <span>2. Assign Final Severity</span>
                            <span className="text-paper/40 font-normal">(Keys Q / W / E)</span>
                          </label>
                          <span className="text-xs font-mono font-bold text-accent uppercase">
                            {SEVERITY_OPTIONS.find(s => s.key === currentOverride.severity)?.label}
                          </span>
                        </div>

                        {/* Severity Segmented Buttons */}
                        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Final Severity">
                          {SEVERITY_OPTIONS.map((sev) => {
                            const isSelected = currentOverride.severity === sev.key;
                            return (
                              <button
                                key={sev.key}
                                type="button"
                                onClick={() => setSeverity(sev.key)}
                                role="radio"
                                aria-checked={isSelected}
                                className={`flex items-center justify-between px-3 py-2 rounded-card text-xs font-semibold border transition-all cursor-pointer text-left ${
                                  isSelected 
                                    ? `${sev.bg} ${sev.border} ${sev.text} shadow-md ring-1 ring-white/20 font-bold`
                                    : 'bg-ink/50 border-ink-line/15 text-paper/70 hover:text-paper hover:bg-ink-muted/50'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: sev.color }} />
                                  <span className="truncate">{sev.label.replace(' Severity', '')}</span>
                                </div>
                                <kbd className="px-1 py-0.2 bg-ink/60 rounded text-[9px] font-mono text-paper/50 border border-ink-line/20 ml-1">
                                  {sev.shortcut}
                                </kbd>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* 3. PRIMARY ACTION BUTTONS: DISCARD & APPROVE OVERRIDE */}
                  <div className="pt-4 border-t border-ink-line/15 flex flex-col sm:flex-row gap-3">
                    
                    {/* Discard / Spam Button */}
                    <button
                      type="button"
                      onClick={() => triggerTriageAction('discard')}
                      disabled={processingId === currentItem.report_id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-button bg-severity-high/15 hover:bg-severity-high/25 text-red-300 border border-severity-high/40 text-xs font-mono font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Discard report as spam (Shortcut: D or Backspace)"
                    >
                      <Ban className="w-4 h-4 text-severity-high" />
                      <span>{isResolutionSignal ? 'REJECT SIGNAL' : 'DISCARD AS SPAM'}</span>
                      <kbd className="px-1.5 py-0.5 bg-ink/60 rounded text-[10px] text-red-300/80 border border-severity-high/30">
                        [D]
                      </kbd>
                    </button>

                    {/* Approve Override Button */}
                    <button
                      type="button"
                      onClick={() => triggerTriageAction('approve')}
                      disabled={processingId === currentItem.report_id}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-button bg-severity-low hover:bg-emerald-600 text-ink font-mono text-xs font-extrabold transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                      title="Approve override and create ticket (Shortcut: A or Enter)"
                    >
                      {processingId === currentItem.report_id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-ink" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3] text-ink" />
                      )}
                      <span>{isResolutionSignal ? 'CONFIRM RESOLUTION' : 'APPROVE OVERRIDE'}</span>
                      <kbd className="px-1.5 py-0.5 bg-ink/20 rounded text-[10px] text-ink border border-ink/30 font-bold">
                        [A]
                      </kbd>
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Queue Navigation Thumbnails Strip */}
          {reviews.length > 1 && (
            <div className="bg-[#151B26]/40 border border-ink-line/15 rounded-card p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-paper/50 px-1">
                <span>QUEUE DOCKET ({reviews.length} CASES)</span>
                <span>Click any thumbnail to jump</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {reviews.map((item, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isRes = item.report_id.startsWith('ticket:');
                  return (
                    <button
                      key={item.report_id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex-shrink-0 px-3 py-2 rounded border text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
                        isCurrent 
                          ? 'bg-accent/20 border-accent text-paper font-bold shadow-md' 
                          : 'bg-ink/50 border-ink-line/10 text-paper/60 hover:text-paper hover:bg-ink-muted/40'
                      }`}
                    >
                      <span className="text-accent text-[10px]">#{idx + 1}</span>
                      <span className="truncate max-w-[90px]">
                        {isRes ? `Tick:${item.report_id.split(':')[1].slice(-4)}` : `Rep:${item.report_id.slice(-4)}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. LIGHTBOX MODAL (PHOTO INSPECTION) */}
      {/* ========================================================================= */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 p-2 text-paper/80 hover:text-white font-mono text-xs flex items-center gap-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>CLOSE [ESC]</span>
            </button>
            <img 
              src={lightboxUrl} 
              alt="High-resolution evidence preview" 
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-card border border-ink-line/20 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. KEYBOARD SHORTCUTS CHEATSHEET MODAL */}
      {/* ========================================================================= */}
      {showShortcutsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div 
            className="bg-[#0E1B29] border border-ink-line/30 rounded-card shadow-2xl p-6 max-w-lg w-full space-y-5 text-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-line/15 pb-3">
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-5 h-5 text-accent" />
                <h3 className="font-display text-lg font-bold text-paper">Triage Keyboard Shortcuts</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="text-paper/50 hover:text-paper"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-ink/60 p-2.5 rounded border border-ink-line/10 space-y-1">
                  <span className="font-mono text-[10px] text-accent font-bold block uppercase">CATEGORIES</span>
                  <div className="space-y-1 text-paper/80 font-mono">
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">1</kbd> Pothole</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">2</kbd> Waterlogging</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">3</kbd> Garbage</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">4</kbd> Streetlight</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">5</kbd> Other</p>
                  </div>
                </div>

                <div className="bg-ink/60 p-2.5 rounded border border-ink-line/10 space-y-1">
                  <span className="font-mono text-[10px] text-accent font-bold block uppercase">SEVERITIES</span>
                  <div className="space-y-1 text-paper/80 font-mono">
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-severity-low">Q</kbd> / <kbd className="bg-ink px-1 rounded border border-ink-line/20">7</kbd> Low</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">W</kbd> / <kbd className="bg-ink px-1 rounded border border-ink-line/20">8</kbd> Medium</p>
                    <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-severity-high">E</kbd> / <kbd className="bg-ink px-1 rounded border border-ink-line/20">9</kbd> High</p>
                  </div>
                </div>
              </div>

              <div className="bg-ink/60 p-2.5 rounded border border-ink-line/10 space-y-1.5 font-mono">
                <span className="text-[10px] text-accent font-bold block uppercase">TRIAGE ACTIONS</span>
                <div className="grid grid-cols-2 gap-2 text-paper/80">
                  <p><kbd className="bg-severity-low/20 text-severity-low px-1.5 py-0.5 rounded border border-severity-low/30">A</kbd> or <kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20">Enter</kbd> Approve</p>
                  <p><kbd className="bg-severity-high/20 text-red-400 px-1.5 py-0.5 rounded border border-severity-high/30">D</kbd> or <kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20">Backsp</kbd> Discard</p>
                  <p><kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">J</kbd> / <kbd className="bg-ink px-1.5 py-0.5 rounded border border-ink-line/20 text-accent">K</kbd> Prev / Next Case</p>
                  <p><kbd className="bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/30">Z</kbd> Undo Action</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-ink-line/15 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-paper font-mono text-xs font-bold rounded-button"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CUSTOM DIALOG MODAL */}
      {/* ========================================================================= */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151B26] border border-ink-line/30 rounded-card p-6 w-full max-w-md shadow-2xl space-y-6 text-paper">
            
            <div className="flex items-start gap-4">
              {modalConfig.severity === 'warning' && (
                <div className="p-3 rounded-card bg-accent/15 text-accent border border-accent/30 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'error' && (
                <div className="p-3 rounded-card bg-severity-high/15 text-severity-high border border-severity-high/30 shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}
              {modalConfig.severity === 'success' && (
                <div className="p-3 rounded-card bg-severity-low/15 text-severity-low border border-severity-low/30 shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
              )}
              {modalConfig.severity === 'info' && (
                <div className="p-3 rounded-card bg-primary/20 text-blue-300 border border-primary/40 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-display font-bold text-paper leading-tight">{modalConfig.title}</h3>
                <p className="text-xs text-paper/70 font-sans leading-relaxed">{modalConfig.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-3 border-t border-ink-line/15 font-mono text-xs">
              {modalConfig.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 border border-ink-line/20 rounded-button bg-ink hover:bg-ink-muted text-paper/80 hover:text-paper font-bold transition-all cursor-pointer"
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
                className={`px-4 py-2 rounded-button text-xs font-bold transition-all cursor-pointer shadow-md ${
                  modalConfig.severity === 'error' 
                    ? 'bg-severity-high hover:bg-red-700 text-white' 
                    : modalConfig.severity === 'warning'
                    ? 'bg-accent hover:bg-amber-400 text-ink'
                    : modalConfig.severity === 'success'
                    ? 'bg-severity-low hover:bg-emerald-600 text-ink'
                    : 'bg-primary hover:bg-primary/90 text-white'
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
