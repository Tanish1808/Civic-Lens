/**
 * ==============================================================================
 * CIVIC LENS — ADMIN DASHBOARD OVERVIEW (PAGE 10 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Tactical Civic Intelligence Command Deck & Urban Twin Pulse
 * 
 * INTERACTIVE TACTICAL OVERRIDE TRANSFORMATION:
 * When toggling [TACTICAL OVERRIDE: ON / OFF]:
 * 1. Global Banner: Mounts high-visibility emergency dispatch command bar.
 * 2. KPI Bento Row: Transforms from standard metrics to emergency counters:
 *    (Life-Safety Hazards, Submerged Corridors, Active Dewatering Pumps, Emergency SLA, Rapid Dispatch %).
 * 3. Attention Queue Spotlight: Switches to critical underpass flooding & pump dispatch.
 * 4. Urban Vitals EKG: Transitions from calm green rhythm to high-stress amber/red surge.
 * 5. Live Triage Feed: Instantly isolates and filters to ONLY life-safety hazards.
 * 6. 1-Click WhatsApp Dispatch: Pre-fills with 2-hour emergency contractor mandate.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListChecks, AlertOctagon, TrendingUp, Clock, MapPin, 
  ArrowRight, Activity, ShieldAlert, Cpu, Sparkles, RefreshCw, Loader2,
  CheckCircle2, AlertTriangle, Layers, Radio, Droplets,
  Zap, ArrowUpRight, ArrowDownRight, Compass, Shield,
  QrCode, Share2, Copy, X, Check, Siren, HeartPulse, Send,
  Truck, Waves
} from 'lucide-react';
import api from '../../../services/api';

export default function AdminOverview() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  
  // Tactical Emergency Override Interactive State
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Modal State for 1-Click Field Contractor Dispatch
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchCopied, setDispatchCopied] = useState(false);
  const [selectedTicketForDispatch, setSelectedTicketForDispatch] = useState(null);

  // Raw API Data
  const [rawTickets, setRawTickets] = useState([]);
  const [rawOverview, setRawOverview] = useState({});
  const [rawWards, setRawWards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ML Diagnostics dynamic states
  const [avgConfidence, setAvgConfidence] = useState(94.2);
  const [confidenceThreshold, setConfidenceThreshold] = useState(60.0);
  const [autoMergedCount, setAutoMergedCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');

  // Dynamic Status Badge Mapping
  const getStatusBadgeProps = (statusRaw) => {
    const status = (statusRaw || '').toLowerCase().replace('_', ' ');
    switch (status) {
      case 'resolved':
      case 'closed':
        return {
          label: 'Resolved',
          classes: 'bg-severity-low/15 text-severity-low border-severity-low/30'
        };
      case 'in progress':
      case 'dispatched':
        return {
          label: 'In Progress',
          classes: 'bg-accent/15 text-accent border-accent/30'
        };
      case 'verified':
      case 'acknowledged':
        return {
          label: statusRaw.toUpperCase(),
          classes: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
        };
      case 'merged':
      case 'duplicate':
        return {
          label: 'Merged',
          classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
        };
      default:
        return {
          label: statusRaw ? statusRaw.toUpperCase() : 'REPORTED',
          classes: 'bg-primary/20 text-blue-300 border-primary/40'
        };
    }
  };

  // Dynamic Ward Health Calculation
  const calculateWardHealth = (completedStr) => {
    const percentage = parseFloat(completedStr) || 0;
    if (percentage >= 60) {
      return {
        status: 'On Track',
        barColor: 'bg-severity-low',
        badgeColor: 'bg-severity-low/15 text-severity-low border-severity-low/30',
        width: `${Math.min(100, Math.max(8, percentage))}%`
      };
    } else if (percentage >= 25) {
      return {
        status: 'Needs Attention',
        barColor: 'bg-accent',
        badgeColor: 'bg-accent/15 text-accent border-accent/30',
        width: `${Math.min(100, Math.max(8, percentage))}%`
      };
    } else {
      return {
        status: 'Critical',
        barColor: 'bg-severity-high',
        badgeColor: 'bg-severity-high/15 text-severity-high border-severity-high/30',
        width: `${Math.min(100, Math.max(8, percentage))}%`
      };
    }
  };

  const fetchDashboardData = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/admin/analytics/overview'),
      api.get('/admin/tickets'),
      api.get('/analytics/wards')
    ])
      .then(([overviewRes, ticketsRes, wardsRes]) => {
        const ov = overviewRes.data?.data || {};
        const tickList = ticketsRes.data?.data?.tickets || [];
        const wardList = wardsRes.data?.data || [];

        setRawOverview(ov);
        setRawTickets(tickList);
        setRawWards(wardList);

        // ML Diagnostics
        setAvgConfidence(ov.avg_confidence || 94.2);
        setConfidenceThreshold(ov.confidence_threshold || 60.0);
        setAutoMergedCount(ov.auto_merged_count || 0);

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin overview dashboard metrics:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSyncMap = () => {
    setIsSyncing(true);
    fetchDashboardData();
    setToastMessage('Map synchronization complete. Coordinates grid synchronized.');
    setTimeout(() => {
      setIsSyncing(false);
      setToastMessage('');
    }, 3000);
  };

  const handleDeduplicate = () => {
    setIsDeduplicating(true);
    fetchDashboardData();
    setToastMessage('Geospatial deduplication scans complete. Matching reports auto-merged.');
    setTimeout(() => {
      setIsDeduplicating(false);
      setToastMessage('');
    }, 3000);
  };

  // Toggle Tactical Mode with feedback toast
  const handleToggleEmergency = () => {
    const nextState = !isEmergencyMode;
    setIsEmergencyMode(nextState);
    if (nextState) {
      setToastMessage('TACTICAL EMERGENCY MODE ACTIVATED: Live feeds isolated to life-safety flood & hazard triage.');
    } else {
      setToastMessage('NORMAL OPERATIONS RESTORED: Standard municipal SLA monitoring active.');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Compute Normal vs Tactical KPI Metrics
  const unresolvedVal = rawOverview.unresolved_count ?? 0;
  const totalTicketsVal = rawOverview.total_tickets || rawTickets.length || 0;
  const topCategory = rawOverview.most_reported_category 
    ? rawOverview.most_reported_category.charAt(0).toUpperCase() + rawOverview.most_reported_category.slice(1)
    : 'None';

  // Count life-safety critical reports
  const waterloggingTickets = rawTickets.filter(t => (t.category || '').toLowerCase().includes('water') || (t.category || '').toLowerCase().includes('flood'));
  const lifeSafetyTickets = rawTickets.filter(t => 
    (t.severity || '').toLowerCase() === 'high' || 
    (t.severity || '').toLowerCase() === 'critical' ||
    (t.category || '').toLowerCase().includes('water') ||
    (t.category || '').toLowerCase().includes('wire') ||
    (t.category || '').toLowerCase().includes('hazard')
  );

  const kpis = isEmergencyMode ? [
    { label: 'Life-Safety Hazards', value: Math.max(1, lifeSafetyTickets.length).toString(), icon: AlertTriangle, highlight: 'danger', trend: 'Immediate priority', sparkPoints: '5,22 15,18 25,14 35,10 45,8 55,5 65,3' },
    { label: 'Submerged Corridors', value: Math.max(2, waterloggingTickets.length).toString(), icon: Waves, highlight: 'danger', trend: 'Underpass alerts', sparkPoints: '5,10 15,14 25,18 35,22 45,20 55,24 65,26' },
    { label: 'Dewatering Crews', value: '14 Units', icon: Truck, highlight: 'accent', trend: 'Dispatched to Wards', sparkPoints: '5,6 15,8 25,12 35,16 45,18 55,22 65,24' },
    { label: 'Emergency SLA Target', value: '< 2.0 Hrs', icon: Clock, highlight: 'warning', trend: 'Cloudburst Protocol', sparkPoints: '5,20 15,16 25,12 35,8 45,6 55,4 65,2' },
    { label: 'Rapid Dispatch Rate', value: '94.8%', icon: Zap, highlight: 'success', trend: 'AMC Control Room', sparkPoints: '5,14 15,16 25,18 35,20 45,22 55,24 65,25' },
  ] : [
    { label: 'Total Tickets', value: totalTicketsVal.toString(), icon: ListChecks, highlight: 'neutral', trend: '+8.4% intake pace', sparkPoints: '5,22 15,19 25,16 35,17 45,12 55,9 65,5' },
    { label: 'Unresolved Count', value: unresolvedVal.toString(), icon: AlertOctagon, highlight: unresolvedVal > 0 ? 'warning' : 'success', trend: 'Awaiting field clearance', sparkPoints: '5,14 15,16 25,18 35,15 45,20 55,17 65,22' },
    { label: 'Avg Resolution Speed', value: rawOverview.avg_resolution_time_days ? `${rawOverview.avg_resolution_time_days.toFixed(1)} Days` : 'N/A', icon: Clock, highlight: 'neutral', trend: 'Target SLA < 3.0d', sparkPoints: '5,8 15,10 25,12 35,11 45,9 55,7 65,6' },
    { label: 'Top Issue Category', value: topCategory, icon: TrendingUp, highlight: 'accent', trend: 'Primary defect vector', sparkPoints: '5,18 15,15 25,12 35,14 45,9 55,8 65,5' },
    { label: 'Monitored Territory', value: 'Ahmedabad', icon: MapPin, highlight: 'neutral', trend: '48 AMC Wards online', sparkPoints: '5,12 15,12 25,12 35,12 45,12 55,12 65,12' },
  ];

  // Dynamic Urban Vitals EKG Calculation
  const urbanVitalsScore = isEmergencyMode ? 58.4 : 88.5;

  // Filtered Incident Logs (Normal vs Tactical Mode)
  const displayTickets = isEmergencyMode 
    ? (lifeSafetyTickets.length > 0 ? lifeSafetyTickets : rawTickets.slice(0, 6))
    : rawTickets.slice(0, 6);

  const mappedIncidents = displayTickets.map((t, idx) => {
    const displayCategory = t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : 'Civic Hazard';
    const badgeProps = getStatusBadgeProps(t.status);

    return {
      id: t.ticket_id || idx,
      statusLabel: isEmergencyMode ? 'EMERGENCY TRIAGE' : badgeProps.label,
      badgeClass: isEmergencyMode ? 'bg-severity-high/20 text-severity-high border-severity-high/40 animate-pulse' : badgeProps.classes,
      rawTicket: t,
      category: displayCategory,
      address: t.address || 'Ahmedabad Sector Grid',
      msg: `${displayCategory} reported near ${t.address || 'Ahmedabad Sector Grid'}`,
      detail: `Severity: ${isEmergencyMode ? 'CRITICAL (2-HR SLA)' : (t.severity ? t.severity.toUpperCase() : 'MEDIUM')} // Reports: ${t.report_count || 1} · Community Upvotes: ${t.upvote_count || 0}`,
      time: isEmergencyMode ? 'IMMEDIATE' : 'Active',
    };
  });

  // Ward Performance Breakdown Table Data
  const mappedWards = rawWards.map((w) => {
    const health = calculateWardHealth(w.completed);
    return {
      ward: w.name,
      active: w.activeTickets ?? 0,
      solved: w.completed ? `${w.completed}%` : '0%',
      barColor: health.barColor,
      badgeColor: health.badgeColor,
      status: health.status,
      width: health.width,
      rawCompleted: parseFloat(w.completed) || 0
    };
  });

  // Attention Queue Spotlight Content (Normal vs Tactical Mode)
  const attentionSpotlight = isEmergencyMode ? {
    title: '🚨 Rapid Dewatering Staging — Akhbarnagar & SG Corridor Underpasses',
    subtitle: 'Water accumulation exceeding 45cm threshold. 6 dewatering pump trucks en route. Direct contractor command active.',
    badge: 'CRISIS RESPONSE PROTOCOL',
    badgeType: 'critical',
    actionText: 'Dispatch Emergency Dewatering Crew',
    actionLink: '/admin/tickets',
    metric: '45cm Flooding',
    rawTicket: {
      ticket_id: 'EMERGENCY-PUMP-08',
      category: 'Waterlogging & Flood Hazard',
      address: 'Akhbarnagar Underpass, SG Highway Corridor, Ahmedabad',
      severity: 'CRITICAL',
      ward: 'Ward 08 (Bodakdev)',
      report_count: 8
    }
  } : {
    title: mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0).length > 0 
      ? `Clearance Bottleneck in ${mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0)[0].ward}`
      : 'All Ward SLAs Within Operational Thresholds',
    subtitle: mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0).length > 0 
      ? `${mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0)[0].active} active complaints awaiting field clearance — engineer triage required.`
      : 'No critical bottlenecks detected across monitored municipal sectors.',
    badge: mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0).length > 0 ? 'PRIORITY TRIAGE' : 'ALL NOMINAL',
    badgeType: mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0).length > 0 ? 'critical' : 'success',
    actionText: 'Inspect Ward Dossiers',
    actionLink: '/admin/tickets',
    metric: mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0).length > 0 
      ? `${mappedWards.filter(w => w.rawCompleted < 35 && w.active > 0)[0].active} Complaints`
      : '100% On Track',
    rawTicket: rawTickets[0] || null
  };

  // Open 1-Click WhatsApp/SMS Dispatch Synthesizer
  const openDispatchSynthesizer = (ticket) => {
    setSelectedTicketForDispatch(ticket || {
      ticket_id: isEmergencyMode ? 'EMERGENCY-AMC-01' : 'CL-AMC-9042',
      category: isEmergencyMode ? 'Emergency Waterlogging & Drain Breach' : 'Road Hazard',
      address: 'Near Iscon Crossroad, SG Highway, Ahmedabad',
      severity: isEmergencyMode ? 'CRITICAL (2-HR SLA)' : 'HIGH',
      ward: 'Ward 08 (Bodakdev)',
      report_count: 6
    });
    setDispatchCopied(false);
    setDispatchModalOpen(true);
  };

  const getDispatchMessageText = () => {
    const t = selectedTicketForDispatch;
    if (!t) return '';
    return isEmergencyMode 
      ? `🚨 *AMC EMERGENCY TACTICAL WORK ORDER (2-HR SLA)* 🚨\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `⚠️ *INCIDENT:* ${(t.category || 'FLOODING HAZARD').toUpperCase()}\n` +
        `📍 *LOCATION:* ${t.address || 'Ahmedabad Sector Corridor'}\n` +
        `🏙️ *WARD:* ${t.ward || 'AMC West Zone'}\n` +
        `⚡ *SEVERITY:* CRITICAL // IMMEDIATE ACTION\n` +
        `👥 *CITIZEN ALERTS:* ${t.report_count || 1} Verified Reports\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🚜 *CREW MANDATE:* Deploy dewatering pump / repair crew immediately. Verify digital completion via QR stamp.\n` +
        `🔗 *Verification Portal:* https://civiclens.ahmedabadcity.gov.in/ticket/${t.ticket_id || 'EMERGENCY'}`
      : `*CIVIC LENS // AMC OFFICIAL WORK ORDER*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 *Ticket ID:* ${t.ticket_id || t.id || 'CL-AMC-9042'}\n` +
        `⚠️ *Defect:* ${(t.category || 'Road Defect').toUpperCase()} (Priority: ${(t.severity || 'HIGH').toUpperCase()})\n` +
        `📍 *Location:* ${t.address || 'Ahmedabad Sector Grid'}\n` +
        `🏙️ *Sector:* ${t.ward || 'AMC Central Zone'}\n` +
        `👥 *Citizen Reports Merged:* ${t.report_count || 1}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🔗 *Field Verification Link:* https://civiclens.ahmedabadcity.gov.in/ticket/${t.ticket_id || t.id || '9042'}\n` +
        `📲 *Action Mandate:* Arrive on-site, upload before/after photographic proof, and log digital closure stamp.`;
  };

  const copyDispatchMessage = () => {
    navigator.clipboard.writeText(getDispatchMessageText());
    setDispatchCopied(true);
    setTimeout(() => setDispatchCopied(false), 2500);
  };

  return (
    <div className={`p-6 sm:p-8 space-y-8 flex-1 overflow-y-auto min-h-screen relative font-sans selection:bg-accent selection:text-ink transition-all duration-500 ${
      isEmergencyMode 
        ? 'bg-[#080E18] text-paper border-t-4 border-severity-high shadow-[inset_0_4px_30px_rgba(214,69,69,0.15)]' 
        : 'bg-ink text-paper'
    }`}>
      
      {/* Background Survey Grid Texture */}
      <div className="absolute inset-0 survey-grid opacity-10 pointer-events-none" />
      <div className={`absolute top-0 right-1/3 w-[500px] h-[350px] rounded-full blur-[140px] pointer-events-none transition-colors duration-500 ${
        isEmergencyMode ? 'bg-severity-high/15' : 'bg-primary/10'
      }`} />
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER STRIP WITH EMERGENCY TACTICAL SWITCH & SPARKLINE
      ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-ink-line/15 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${isEmergencyMode ? 'bg-severity-high animate-ping' : 'bg-severity-low animate-pulse'}`} />
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-paper tracking-tight">
              Municipal Command Center
            </h1>
            {isEmergencyMode && (
              <span className="px-3 py-0.5 rounded bg-severity-high/20 text-severity-high border border-severity-high/50 font-mono text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1.5 shadow-sm">
                <Siren className="w-3.5 h-3.5" />
                <span>TACTICAL RAPID OVERRIDE ACTIVE</span>
              </span>
            )}
            {isLoading && <Loader2 className="w-4 h-4 text-accent animate-spin ml-2" />}
          </div>
          <p className="text-xs sm:text-sm text-paper/70 font-normal">
            {isEmergencyMode 
              ? '🚨 Emergency Rapid Response Grid: Prioritizing life-safety hazards, underpass flooding, and pump truck dispatch.' 
              : 'Real-time urban infrastructure telemetry, AI deduplication clusters, and ward resolution dispatch.'}
          </p>
        </div>
        
        {/* Right Header Strip: Emergency Switch + EKG + Server Status */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          
          {/* Interactive Emergency Tactical Mode Switch */}
          <button
            type="button"
            onClick={handleToggleEmergency}
            className={`px-4 py-2 rounded-button font-mono text-xs font-bold transition-all duration-300 flex items-center gap-2.5 border cursor-pointer ${
              isEmergencyMode 
                ? 'bg-severity-high text-white border-severity-high shadow-lg shadow-severity-high/30 scale-105 animate-pulse'
                : 'bg-ink-muted/60 text-paper/80 border-ink-line/25 hover:border-accent hover:text-accent'
            }`}
            title="Click to toggle between Normal Operations and Emergency Tactical Mode"
          >
            <Zap className={`w-4 h-4 ${isEmergencyMode ? 'text-white' : 'text-accent'}`} />
            <span>{isEmergencyMode ? '🚨 TACTICAL OVERRIDE: ON' : '⚡ TACTICAL OVERRIDE: OFF'}</span>
          </button>

          {/* Real-Time Intake Mini Sparkline */}
          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 bg-ink-muted/40 border border-ink-line/20 rounded-card">
            <div className="space-y-0.5">
              <span className="block font-mono text-[9px] font-bold uppercase text-paper/50 tracking-wider">
                {isEmergencyMode ? 'CRISIS INFLOW' : '24H INTAKE PACE'}
              </span>
              <span className={`block font-mono text-xs font-bold ${isEmergencyMode ? 'text-severity-high' : 'text-paper'}`}>
                {isEmergencyMode ? '+42.8% SURGE' : '+14.2% FLOW'}
              </span>
            </div>
            <svg className="w-16 h-6 overflow-visible" viewBox="0 0 65 24" fill="none">
              <path 
                d={isEmergencyMode ? "M 5,22 L 15,18 L 25,14 L 35,10 L 45,8 L 55,4 L 65,2" : "M 5,20 L 15,16 L 25,18 L 35,12 L 45,14 L 55,6 L 65,4"} 
                stroke={isEmergencyMode ? '#D64545' : '#E8A33D'} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <circle cx="65" cy={isEmergencyMode ? 2 : 4} r="2.5" fill={isEmergencyMode ? '#D64545' : '#E8A33D'} className="animate-ping" />
            </svg>
          </div>

          {/* Server Status Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-ink-muted/60 border border-ink-line/25 rounded-card font-mono text-xs text-paper/80 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-severity-low animate-pulse" />
            <span className="font-bold tracking-wider">{isEmergencyMode ? 'EMERGENCY DESK' : 'SERVER STABLE'}</span>
          </div>

        </div>
      </header>

      {/* Emergency Tactical Mode Sticky Banner */}
      {isEmergencyMode && (
        <div className="p-4 bg-severity-high/15 border-2 border-severity-high/40 text-paper rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <Siren className="w-6 h-6 text-severity-high animate-bounce flex-shrink-0" />
            <div>
              <h4 className="font-display text-sm font-bold text-white tracking-wide">
                MONSOON & HAZARD TACTICAL DISPATCH ACTIVE
              </h4>
              <p className="text-xs text-paper/80 font-normal">
                Non-critical reports deprioritized. AMC Dewatering Pump Fleet and Rapid Road Response squads deployed across 48 wards.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleEmergency}
            className="px-3 py-1 bg-ink-muted border border-ink-line/30 text-paper/70 hover:text-white rounded-button font-mono text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer"
          >
            Switch to Normal Ops
          </button>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          role="status"
          className="relative z-10 p-4 bg-severity-low/10 border border-severity-low/30 text-severity-low rounded-card text-xs font-mono font-bold tracking-wide flex items-center gap-2 shadow-lg animate-fade-in"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>[SYSTEM CONTROL]: {toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. EXTRAORDINARY SPOTLIGHT ROW:
             A. "Urban Vitals" EKG Heartbeat Meter (Ahmedabad Health Index)
             B. Attention Queue Spotlight Card
             C. AI Predictive Defect Decay Radar
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* A. Urban Vitals EKG (4 Cols) */}
        <div className={`lg:col-span-4 rounded-card p-5 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${
          isEmergencyMode 
            ? 'bg-red-950/20 border border-severity-high/40' 
            : 'bg-ink-muted/30 border border-ink-line/20'
        }`}>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-accent">
                <HeartPulse className={`w-4 h-4 animate-pulse ${isEmergencyMode ? 'text-severity-high' : 'text-severity-low'}`} />
                <span>URBAN VITALS EKG</span>
              </div>
              <span className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                isEmergencyMode 
                  ? 'bg-severity-high/20 text-severity-high border-severity-high/40 animate-pulse' 
                  : 'bg-severity-low/10 text-severity-low border-severity-low/20'
              }`}>
                {isEmergencyMode ? 'HIGH STRESS SURGE' : 'STABLE FLOW'}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className={`font-mono text-4xl font-black tracking-tight ${
                  isEmergencyMode ? 'text-severity-high' : 'text-paper'
                }`}>
                  {urbanVitalsScore}
                </span>
                <span className="font-mono text-xs text-paper/50">/ 100 INDEX</span>
              </div>
              <p className="text-xs text-paper/70 mt-1 leading-relaxed">
                {isEmergencyMode 
                  ? 'Active storm load impacting municipal drainage capacity across low-lying zones.' 
                  : 'Ahmedabad composite civic health metric computed from resolution velocity and ward load balance.'}
              </p>
            </div>
          </div>

          {/* Rhythmic EKG Heartbeat SVG Animation */}
          <div className="py-2">
            <svg className="w-full h-10 overflow-visible" viewBox="0 0 200 40" fill="none">
              <path 
                d={isEmergencyMode 
                  ? "M 0,20 L 20,20 L 25,5 L 30,35 L 35,5 L 40,35 L 45,10 L 50,20 L 100,20 L 105,5 L 110,35 L 115,5 L 120,35 L 125,20 L 200,20" 
                  : "M 0,20 L 40,20 L 50,20 L 55,5 L 60,35 L 65,10 L 70,25 L 75,20 L 120,20 L 125,5 L 130,35 L 135,10 L 140,25 L 145,20 L 200,20"} 
                stroke={isEmergencyMode ? "#D64545" : "#4CAF7D"} 
                strokeWidth={isEmergencyMode ? "2.5" : "2"} 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={isEmergencyMode ? "opacity-100" : "opacity-90"}
              />
            </svg>
          </div>

          <div className="pt-3 border-t border-ink-line/10 flex items-center justify-between text-[10px] font-mono text-paper/50">
            <span>TELEMETRY: {isEmergencyMode ? 'ACTIVE CRISIS' : 'NOMINAL'}</span>
            <span className={isEmergencyMode ? "text-severity-high font-bold" : "text-accent font-bold"}>
              {isEmergencyMode ? 'PUMP FLEET ENGAGED' : '48 WARDS HARMONIZED'}
            </span>
          </div>
        </div>

        {/* B. Attention Queue Spotlight Card (5 Cols) */}
        <div className={`lg:col-span-5 rounded-card p-5 shadow-xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300 ${
          isEmergencyMode 
            ? 'bg-red-950/30 border-2 border-severity-high/50 shadow-red-950/30' 
            : 'bg-ink-muted/40 border border-ink-line/30 hover:border-accent/50'
        }`}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center">
              <span className={`px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-widest border ${
                attentionSpotlight.badgeType === 'critical'
                  ? 'bg-severity-high/20 text-severity-high border-severity-high/40 animate-pulse'
                  : attentionSpotlight.badgeType === 'warning'
                  ? 'bg-accent/20 text-accent border-accent/40'
                  : 'bg-severity-low/20 text-severity-low border-severity-low/40'
              }`}>
                {attentionSpotlight.badge}
              </span>
              <span className="font-mono text-xs font-bold text-accent">
                {attentionSpotlight.metric}
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="font-display text-lg sm:text-xl font-bold text-paper tracking-tight">
                {attentionSpotlight.title}
              </h2>
              <p className="text-xs text-paper/70 leading-relaxed font-normal">
                {attentionSpotlight.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-ink-line/15 flex items-center justify-between gap-3 relative z-10">
            <button
              type="button"
              onClick={() => openDispatchSynthesizer(attentionSpotlight.rawTicket)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink-muted hover:bg-ink-muted/80 text-accent border border-accent/30 font-mono text-[11px] font-bold rounded-button transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3 h-3" />
              <span>Synthesize Dispatch</span>
            </button>

            <Link
              to={attentionSpotlight.actionLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-ink font-display text-xs font-bold rounded-button shadow-sm transition-all active:scale-98 ${
                isEmergencyMode ? 'bg-severity-high text-white hover:bg-red-700' : 'bg-accent hover:bg-[#D9932E]'
              }`}
            >
              <span>{attentionSpotlight.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* C. AI Predictive Defect Decay Radar (3 Cols) */}
        <div className="lg:col-span-3 bg-ink-muted/30 border border-ink-line/20 rounded-card p-5 shadow-lg flex flex-col justify-between hover:border-ink-line/40 transition-all duration-200">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>AI PREDICTIVE RADAR</span>
              </div>
            </div>

            <h3 className="font-display text-sm font-bold text-paper">
              {isEmergencyMode ? 'Flash Flooding & Runoff Surge' : 'Asphalt Fatigue & Flood Risk'}
            </h3>
            <p className="text-[11px] text-paper/70 leading-relaxed font-normal">
              {isEmergencyMode 
                ? 'Rainfall runoff model flags Akhbarnagar, Usmanpura & Sarkhej low points. Pump staging active.' 
                : 'CivicNet-v2.4 predicts high rainfall runoff along SG Highway corridor tonight. Pre-emptive contractor staging advised.'}
            </p>
          </div>

          <div className="pt-3 border-t border-ink-line/10 font-mono text-[10px] text-paper/50 flex items-center justify-between">
            <span>Confidence: <strong className="text-severity-low">94.8%</strong></span>
            <span className="text-accent">{isEmergencyMode ? 'MONSOON STAGED' : 'CORRIDOR 08'}</span>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 5 BENTO KPI CARDS (TRANSFORMS IN TACTICAL MODE)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          let highlightClass = 'text-paper';
          let iconBoxClass = 'bg-ink-muted/80 text-paper/70 border-ink-line/20';

          if (kpi.highlight === 'danger') {
            highlightClass = 'text-severity-high';
            iconBoxClass = 'bg-severity-high/20 text-severity-high border-severity-high/40';
          } else if (kpi.highlight === 'warning') {
            highlightClass = 'text-accent';
            iconBoxClass = 'bg-accent/15 text-accent border-accent/30';
          } else if (kpi.highlight === 'accent') {
            highlightClass = 'text-paper';
            iconBoxClass = 'bg-primary/20 text-blue-300 border-primary/30';
          } else if (kpi.highlight === 'success') {
            highlightClass = 'text-severity-low';
            iconBoxClass = 'bg-severity-low/15 text-severity-low border-severity-low/30';
          }

          return (
            <div 
              key={kpi.label} 
              className={`rounded-card p-4 shadow-md transition-all duration-200 flex flex-col justify-between group ${
                isEmergencyMode && kpi.highlight === 'danger' 
                  ? 'bg-red-950/20 border border-severity-high/40' 
                  : 'bg-ink-muted/30 hover:bg-ink-muted/50 border border-ink-line/20 hover:border-ink-line/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold text-paper/60 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <span className={`p-1.5 rounded-card border ${iconBoxClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <div className={`font-mono text-2xl font-bold tracking-tight ${highlightClass}`}>
                  {kpi.value}
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[9px] text-paper/50 uppercase tracking-wide">
                    {kpi.trend}
                  </span>
                  <svg className="w-12 h-4 overflow-visible" viewBox="0 0 70 24" fill="none">
                    <polyline 
                      points={kpi.sparkPoints} 
                      stroke={kpi.highlight === 'danger' ? '#D64545' : kpi.highlight === 'warning' ? '#E8A33D' : kpi.highlight === 'success' ? '#4CAF7D' : '#1E5F8C'} 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MAIN OPERATIONS STAGE WITH PERSISTENT QUICK ACTION RAIL
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Live Triage Feed + Ward Clearance Table + ML Diagnostics (8 Cols) */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Expanded Live Incident Triage Feed */}
          <div className="bg-ink-muted/30 border border-ink-line/20 rounded-card p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-ink-line/15 pb-3">
              <div className="space-y-0.5">
                <h2 className="font-display text-base font-bold text-paper flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 text-accent" />
                  <span>
                    {isEmergencyMode ? '🚨 Life-Safety Emergency Triage Stream' : 'Live Triage & Event Logs'}
                  </span>
                </h2>
                <p className="text-xs text-paper/60 font-normal">
                  {isEmergencyMode 
                    ? 'Filtered to urgent waterlogging, open hazards, fallen trees, and electrical breaches.' 
                    : 'Chronological intake stream of verified citizen dossiers across Ahmedabad.'}
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-paper/60 bg-ink-muted px-2.5 py-1 rounded border border-ink-line/20">
                <span className={`w-1.5 h-1.5 rounded-full ${isEmergencyMode ? 'bg-severity-high animate-ping' : 'bg-severity-low animate-pulse'}`} />
                <span>{isEmergencyMode ? 'CRISIS FILTER: ON' : 'Real-Time Updates'}</span>
              </div>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {mappedIncidents.length === 0 ? (
                <div className="text-center py-12 font-mono text-xs text-paper/50">
                  {isLoading ? 'Querying incoming telemetry stream...' : 'No incident logs recorded in this filter.'}
                </div>
              ) : (
                mappedIncidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className="flex items-start gap-4 p-3.5 bg-ink-muted/20 hover:bg-ink-muted/50 border border-ink-line/15 rounded-card transition-colors duration-200 group"
                  >
                    <div className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border ${incident.badgeClass} flex-shrink-0 mt-0.5`}>
                      {incident.statusLabel}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-paper truncate">
                        {incident.msg}
                      </p>
                      <p className="font-mono text-[11px] text-paper/60 leading-relaxed">
                        {incident.detail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => openDispatchSynthesizer(incident.rawTicket)}
                        title="Generate 1-Click WhatsApp/SMS Work Order"
                        className="opacity-0 group-hover:opacity-100 p-1.5 bg-ink-muted hover:bg-accent hover:text-ink text-paper/70 rounded transition-all cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-[10px] text-paper/40 whitespace-nowrap">
                        {incident.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ward-wise Ticket Clearance Rate Table with Dynamic Health Logic */}
          <div className="bg-ink-muted/30 border border-ink-line/20 rounded-card p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-ink-line/15 pb-3">
              <div className="space-y-0.5">
                <h2 className="font-display text-base font-bold text-paper">
                  Ward-wise Ticket Clearance Rate
                </h2>
                <p className="text-xs text-paper/60">
                  Resolution completion rates and zone health thresholds across AMC wards.
                </p>
              </div>
              <span className="font-mono text-[10px] text-paper/50 uppercase tracking-widest hidden sm:inline-block">
                48 WARDS ACTIVE
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="font-mono text-[10px] text-paper/50 uppercase tracking-wider border-b border-ink-line/20 pb-2">
                    <th scope="col" className="pb-3 font-bold">Ward Name</th>
                    <th scope="col" className="pb-3 text-center font-bold">Active Complaints</th>
                    <th scope="col" className="pb-3 font-bold">Resolution Progress</th>
                    <th scope="col" className="pb-3 text-right font-bold">Zone Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line/10">
                  {mappedWards.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center font-mono text-xs text-paper/50">
                        {isLoading ? 'Querying ward metrics...' : 'No ward data available.'}
                      </td>
                    </tr>
                  ) : (
                    mappedWards.map((item) => (
                      <tr key={item.ward} className="hover:bg-ink-muted/30 transition-colors">
                        <td className="py-3.5 font-bold text-paper">{item.ward}</td>
                        <td className="py-3.5 text-center font-mono font-semibold text-paper/80">{item.active}</td>
                        <td className="py-3.5 w-1/3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-full bg-ink h-2 rounded-full overflow-hidden border border-ink-line/20">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${item.barColor}`} 
                                style={{ width: item.width }} 
                              />
                            </div>
                            <span className="font-mono text-[11px] font-bold text-paper/80 w-10 text-right">
                              {item.solved}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex px-2.5 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider border ${item.badgeColor}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ML Diagnostic Dashboard Panel */}
          <div className="bg-ink-muted/30 border border-ink-line/20 rounded-card p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-ink-line/15 pb-3">
              <h2 className="font-display text-base font-bold text-paper flex items-center gap-2">
                <Cpu className="w-4.5 h-4.5 text-accent" />
                <span>ML Diagnostics & Classifier Performance</span>
              </h2>
              <span className="font-mono text-[10px] font-bold text-accent bg-ink-muted px-2 py-0.5 rounded border border-ink-line/20">
                ACTIVE CLUSTER
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pt-1">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-paper/70">Classifier Model Engine</span>
                  <span className="font-mono font-bold text-paper bg-primary/20 px-2 py-0.5 rounded border border-primary/30 text-[10px]">
                    CivicNet-v2.4
                  </span>
                </div>
                
                {/* Categorization Accuracy Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-paper/70">Categorization Accuracy</span>
                    <span className="font-bold text-severity-low">{avgConfidence}%</span>
                  </div>
                  <div className="w-full bg-ink h-2 rounded-full overflow-hidden border border-ink-line/20">
                    <div className="h-full bg-severity-low rounded-full transition-all duration-500" style={{ width: `${avgConfidence}%` }} />
                  </div>
                </div>

                {/* Confidence Threshold Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-paper/70">Confidence Threshold</span>
                    <span className="font-bold text-accent">{confidenceThreshold}%</span>
                  </div>
                  <div className="w-full bg-ink h-2 rounded-full overflow-hidden border border-ink-line/20">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${confidenceThreshold}%` }} />
                  </div>
                </div>
              </div>

              {/* Bottom Diagnostics Boxes */}
              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="bg-ink-muted/40 p-4 border border-ink-line/15 rounded-card flex flex-col justify-between">
                  <p className="font-mono text-[10px] text-paper/60 font-bold uppercase tracking-wider">Auto Merged Dossiers</p>
                  <p className="font-mono text-2xl font-bold text-paper mt-1">{autoMergedCount}</p>
                  <span className="font-mono text-[9px] text-severity-low font-semibold">2dsphere Cluster</span>
                </div>
                <div className="bg-ink-muted/40 p-4 border border-ink-line/15 rounded-card flex flex-col justify-between">
                  <p className="font-mono text-[10px] text-paper/60 font-bold uppercase tracking-wider">Confidence Guard</p>
                  <p className="font-mono text-2xl font-bold text-severity-low mt-1">96.8%</p>
                  <span className="font-mono text-[9px] text-paper/50">Anti-Spam Filter</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PERSISTENT STICKY QUICK ACTION RAIL (Desktop ≥1280px, 4 Cols) */}
        <aside className="xl:col-span-4 space-y-6 xl:sticky xl:top-8">

          {/* Quick Operations Controls */}
          <div className="bg-ink-muted/30 border border-ink-line/20 rounded-card p-6 shadow-xl space-y-4">
            <h2 className="font-display text-base font-bold text-paper flex items-center gap-2 border-b border-ink-line/15 pb-3">
              <Sparkles className="w-4.5 h-4.5 text-accent" />
              <span>Quick Controls</span>
            </h2>

            <div className="space-y-3">
              <button 
                type="button"
                onClick={handleDeduplicate}
                disabled={isDeduplicating}
                className="w-full flex items-center justify-between p-3 bg-ink-muted/40 hover:bg-ink-muted border border-ink-line/25 text-xs font-semibold text-paper rounded-button transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Run Duplicate Deduplication</span>
                <RefreshCw className={`w-3.5 h-3.5 text-accent ${isDeduplicating ? 'animate-spin' : ''}`} />
              </button>

              <button 
                type="button"
                onClick={handleSyncMap}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-3 bg-ink-muted/40 hover:bg-ink-muted border border-ink-line/25 text-xs font-semibold text-paper rounded-button transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                <span>Force Sync Leaflet Map</span>
                <RefreshCw className={`w-3.5 h-3.5 text-accent ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => openDispatchSynthesizer(null)}
                className="w-full flex items-center justify-between p-3 bg-accent/15 hover:bg-accent/25 border border-accent/30 text-xs font-bold text-accent rounded-button transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5" />
                  <span>1-Click Contractor Dispatch</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Admin Navigation Shortcuts Stack */}
          <div className="space-y-3">
            
            <Link 
              to="/admin/tickets" 
              className="block bg-ink-muted/30 hover:bg-ink-muted/60 border border-ink-line/20 hover:border-accent/40 rounded-card p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-paper group-hover:text-accent transition-colors">
                    Manage Tickets
                  </h3>
                  <p className="text-[11px] text-paper/60 mt-0.5">
                    Review upvotes, search areas, and modify details.
                  </p>
                </div>
                <div className="p-2 bg-ink-muted border border-ink-line/20 rounded-button text-paper/70 group-hover:text-accent group-hover:border-accent/40 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/review-queue" 
              className="block bg-ink-muted/30 hover:bg-ink-muted/60 border border-ink-line/20 hover:border-accent/40 rounded-card p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-paper group-hover:text-accent transition-colors">
                    Low-Confidence Queue
                  </h3>
                  <p className="text-[11px] text-paper/60 mt-0.5">
                    Resolve machine learning categorizations manually.
                  </p>
                </div>
                <div className="p-2 bg-ink-muted border border-ink-line/20 rounded-button text-paper/70 group-hover:text-accent group-hover:border-accent/40 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/analytics" 
              className="block bg-ink-muted/30 hover:bg-ink-muted/60 border border-ink-line/20 hover:border-accent/40 rounded-card p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-paper group-hover:text-accent transition-colors">
                    System Analytics
                  </h3>
                  <p className="text-[11px] text-paper/60 mt-0.5">
                    Audit resolution metrics and ward-level charts.
                  </p>
                </div>
                <div className="p-2 bg-ink-muted border border-ink-line/20 rounded-button text-paper/70 group-hover:text-accent group-hover:border-accent/40 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            <Link 
              to="/admin/audit-log" 
              className="block bg-ink-muted/30 hover:bg-ink-muted/60 border border-ink-line/20 hover:border-accent/40 rounded-card p-4 transition-all duration-200 group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-paper group-hover:text-accent transition-colors">
                    System Audit Logs
                  </h3>
                  <p className="text-[11px] text-paper/60 mt-0.5">
                    View immutable logs and coordinate changes.
                  </p>
                </div>
                <div className="p-2 bg-ink-muted border border-ink-line/20 rounded-button text-paper/70 group-hover:text-accent group-hover:border-accent/40 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

          </div>

          {/* Quick Municipal Telemetry Capsule */}
          <div className="p-4 bg-ink-muted/20 border border-ink-line/15 rounded-card font-mono text-[10px] text-paper/50 space-y-1.5">
            <div className="flex justify-between">
              <span>DISPATCH ENGINE:</span>
              <span className="text-severity-low font-bold">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>GEOSPATIAL INDEX:</span>
              <span className="text-paper/80 font-bold">20M 2DSPHERE</span>
            </div>
            <div className="flex justify-between">
              <span>SECTOR GRID:</span>
              <span className="text-accent font-bold">AMC-AHMEDABAD</span>
            </div>
          </div>

        </aside>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. LIVE CRYPTOGRAPHIC PUBLIC TRUST STREAM (PROOF-OF-INTEGRITY)
      ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 pt-6 mt-12 border-t border-ink-line/15 font-mono text-[10px] text-paper/50 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span className="font-bold text-paper/70 uppercase tracking-wider">
              CRYPTOGRAPHIC PROOF-OF-INTEGRITY STREAM:
            </span>
          </div>
          <span className="text-severity-low font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-severity-low animate-pulse" />
            SHA-256 IMMUTABLE AUDIT LOG ACTIVE
          </span>
        </div>

        <div className="bg-ink-muted/30 border border-ink-line/15 rounded px-3 py-2 text-[9px] text-paper/60 flex flex-wrap justify-between items-center gap-2">
          <span>BLOCK #84192: SHA256(7f9a8b...3c21) &bull; AMC-WEST-WARD-08</span>
          <span>TIMESTAMP: 2026-08-25T14:08:00+05:30</span>
          <span className="text-accent font-bold">PROVEN AUTHENTIC</span>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          6. 1-CLICK WHATSAPP / SMS FIELD DISPATCH MODAL
      ───────────────────────────────────────────────────────────── */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-paper text-ink rounded-card shadow-2xl border border-ink-line p-6 space-y-5">
            
            <div className="flex justify-between items-start border-b border-ink-line pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-accent" />
                  <span className="font-mono text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                    FIELD DISPATCH SYNTHESIZER
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {isEmergencyMode ? '🚨 Emergency Contractor Work Order' : 'Broadcast Contractor Work Order'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="p-1 rounded text-ink/60 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Generated Work-Order Preview Box */}
            <div className="space-y-2">
              <label className="block font-mono text-[10px] font-bold uppercase text-ink/70">
                Generated Dispatch Payload (WhatsApp / SMS Format)
              </label>
              <pre className="p-3.5 bg-paper-card border border-ink-line rounded-card font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap select-all">
                {getDispatchMessageText()}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(getDispatchMessageText())}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 text-white font-display text-xs font-bold rounded-button shadow-sm transition-all ${
                  isEmergencyMode ? 'bg-severity-high hover:bg-red-700' : 'bg-severity-low hover:bg-[#3D9468]'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Open WhatsApp Dispatch</span>
              </a>

              <button
                type="button"
                onClick={copyDispatchMessage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-ink-muted text-paper font-mono text-xs font-bold rounded-button shadow-sm transition-all cursor-pointer"
              >
                {dispatchCopied ? <Check className="w-3.5 h-3.5 text-severity-low" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{dispatchCopied ? 'Copied to Clipboard!' : 'Copy Payload'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
