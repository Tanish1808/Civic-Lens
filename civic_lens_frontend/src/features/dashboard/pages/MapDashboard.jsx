/**
 * ==============================================================================
 * CIVIC LENS — MAP DASHBOARD (PAGE 4 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Field-Survey Inspection Radar & Municipal Registry Map
 * 
 * SUMMARY OF CHANGES:
 * 1. Fixed-Width Compact Filter Sidebar:
 *    - Capped at 290px fixed width (`w-[290px] flex-shrink-0`) with internal scrolling
 *      (`overflow-y-auto`) and a fixed header and footer to prevent page push.
 *    - Rebuilt as a 'paper' (#F6F2E9) / dark survey dock with tight, functional spacing.
 *    - Monospace tracked eyebrows (`// ISSUE CATEGORY`, `// SEVERITY LEVEL`, `// LIFECYCLE STATUS`).
 *    - Custom amber checkboxes (`text-accent focus:ring-accent/20`) replacing browser defaults.
 *    - Live active case counter pill (`142 Visible`) with reactive real-time updates.
 *    - Deduplication Loop explanation restyled as a technical permit callout.
 * 2. Guaranteed Map Resizing on Toggle (Fix for broken map):
 *    - Connected a dedicated `MapResizer` component that invokes Leaflet's `map.invalidateSize()`
 *      both immediately and at 150ms/350ms post-transition whenever `showFilters` toggles.
 *    - Map container flexes smoothly to full width when sidebar is hidden with zero blank/grey gaps.
 * 3. Restyled Permit Popups:
 *    - Sharp permit dossier cards with top severity accent line, case ID in JetBrains Mono,
 *      category title in Space Grotesk, geotag address, frosted reports/votes box, and
 *      Signal Amber CTA button linking directly to `/ticket/:id`.
 * 4. Responsive Mobile Adaptation:
 *    - Smooth slide-over drawer on mobile viewports so mobile users can filter without
 *      cramping or obscuring the interactive map.
 * 5. 100% Feature Parity:
 *    - GET /tickets API query logic, sessionStorage filter caching, search filtering,
 *      and pulsing severity markers (High: #D64545, Medium: #E8A33D, Low: #4CAF7D).
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, Search, RotateCcw, AlertCircle, MapPin, Eye, 
  ThumbsUp, Loader2, ShieldCheck, X
} from 'lucide-react';
import api from '../../../services/api';

const CATEGORY_MAP = {
  'Pothole': 'pothole',
  'Waterlogging': 'waterlogging',
  'Streetlight Fault': 'streetlight',
  'Garbage/Dumping': 'garbage',
  'Other Issues': 'other'
};

const STATUS_MAP = {
  'Reported': 'reported',
  'Verified': 'verified',
  'Acknowledged': 'acknowledged',
  'In Progress': 'in_progress',
  'Resolved': 'resolved'
};

// Map Resizer component to guarantee Leaflet recalculates dimensions when sidebar toggles
function MapResizer({ showFilters }) {
  const map = useMap();
  useEffect(() => {
    // Fire immediately and after layout transition finishes
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [showFilters, map]);
  return null;
}

// Create pulsing neon marker icons based on severity
const createSeverityMarker = (severity) => {
  const color =
    severity === 'high' ? '#D64545' :
    severity === 'medium' ? '#E8A33D' : '#4CAF7D';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-7 h-7">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style="background-color: ${color}"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 shadow-md border-2 border-white dark:border-gray-900 transition-all duration-300" style="background-color: ${color}"></span>
      </div>
    `,
    className: 'custom-marker-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -8],
  });
};

export default function MapDashboard() {
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [selectedSeverity, setSelectedSeverity] = useState(() => {
    const cached = sessionStorage.getItem('map_selected_severity');
    return cached ? JSON.parse(cached) : { low: true, medium: true, high: true };
  });

  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cached = sessionStorage.getItem('map_selected_categories');
    return cached ? JSON.parse(cached) : { pothole: true, waterlogging: true, streetlight: true, garbage: true, other: true };
  });

  const [selectedStatuses, setSelectedStatuses] = useState(() => {
    const cached = sessionStorage.getItem('map_selected_statuses');
    return cached ? JSON.parse(cached) : { reported: true, verified: true, acknowledged: true, in_progress: true, resolved: true };
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('map_search_term') || '';
  });

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(localStorage.getItem('theme') || 'light');
    };
    window.addEventListener('theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);
  
  // Pilot Center: Ahmedabad coordinates from survey documents
  const centerPosition = [23.0225, 72.5714];

  // Persist filters in sessionStorage
  useEffect(() => {
    sessionStorage.setItem('map_selected_severity', JSON.stringify(selectedSeverity));
  }, [selectedSeverity]);

  useEffect(() => {
    sessionStorage.setItem('map_selected_categories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  useEffect(() => {
    sessionStorage.setItem('map_selected_statuses', JSON.stringify(selectedStatuses));
  }, [selectedStatuses]);

  useEffect(() => {
    sessionStorage.setItem('map_search_term', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    api.get('/tickets')
      .then((response) => {
        const backendTickets = response.data.data.tickets.map((t) => {
          const lat = t.location?.coordinates?.[1] ?? centerPosition[0];
          const lng = t.location?.coordinates?.[0] ?? centerPosition[1];
          const displayCategory = t.category.charAt(0).toUpperCase() + t.category.slice(1);

          return {
            id: t.ticket_id,
            category: displayCategory,
            severity: t.severity,
            location: [lat, lng],
            address: t.address || `${displayCategory} reported near ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
            reports: t.report_count,
            votes: t.upvote_count,
            status: t.status,
          };
        });
        setTickets(backendTickets);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets from server.');
        setIsLoading(false);
      });
  }, []);

  const handleResetFilters = () => {
    setSelectedSeverity({ low: true, medium: true, high: true });
    setSelectedCategories({ pothole: true, waterlogging: true, streetlight: true, garbage: true, other: true });
    setSelectedStatuses({ reported: true, verified: true, acknowledged: true, in_progress: true, resolved: true });
    setSearchTerm('');
  };

  const filteredTickets = tickets.filter(t => {
    if (!selectedSeverity[t.severity]) return false;
    
    const backendCat = t.category.toLowerCase();
    if (!selectedCategories[backendCat]) return false;
    
    if (!selectedStatuses[t.status]) return false;
    
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const matchCategory = t.category.toLowerCase().includes(query);
      const matchAddress = t.address.toLowerCase().includes(query);
      const matchId = t.id.toLowerCase().includes(query);
      if (!matchCategory && !matchAddress && !matchId) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-paper dark:bg-[#0E131F] space-y-4 font-mono text-ink dark:text-gray-200">
        <Loader2 className="w-9 h-9 text-accent animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
            Syncing Ahmedabad Spatial Grid...
          </p>
          <p className="text-[11px] text-ink/60 dark:text-gray-500 font-normal">
            Querying active 2dsphere defect dossiers
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-paper dark:bg-[#0E131F] space-y-3 p-6 text-center font-mono">
        <AlertCircle className="w-10 h-10 text-severity-high" />
        <h3 className="text-base font-bold text-ink dark:text-white font-display">Municipal Grid Offline</h3>
        <p className="text-xs text-ink/70 dark:text-gray-400 max-w-sm leading-relaxed">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-accent text-ink font-bold text-xs uppercase rounded-button hover:bg-amber-400 cursor-pointer border-0"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Sidebar Filter Form Content Component
  const FilterContent = () => (
    <div className="flex flex-col h-full text-left">
      
      {/* 1. Fixed Header */}
      <div className="p-3.5 bg-paper-card dark:bg-[#0E131F] border-b border-ink-line dark:border-gray-800 flex justify-between items-center select-none font-mono flex-shrink-0">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold text-accent uppercase tracking-widest">
            // FIELD REGISTRY
          </span>
          <h2 className="font-display text-sm font-bold text-ink dark:text-white tracking-tight">
            Filter Reports
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 rounded text-accent">
            {filteredTickets.length}
          </span>
          <button 
            onClick={handleResetFilters}
            className="p-1 text-ink/60 dark:text-gray-400 hover:text-accent dark:hover:text-accent rounded transition-colors border-0 bg-transparent cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs text-ink dark:text-gray-200 font-sans">
        
        {/* Search Input Bar */}
        <div className="relative font-mono">
          <input
            type="text"
            placeholder="Search ticket #, road..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-2 rounded-button bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink dark:text-gray-200 text-xs placeholder-ink/40 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent shadow-inner transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-ink/40 dark:text-gray-500 absolute left-2.5 top-2.5" />
        </div>

        {/* Issue Category Filters */}
        <div className="space-y-1.5">
          <div className="font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">
            // ISSUE CATEGORY
          </div>
          <div className="bg-paper-card dark:bg-gray-900/50 rounded-card p-2 space-y-1 border border-ink-line/60 dark:border-gray-800">
            {Object.entries(CATEGORY_MAP).map(([label, value]) => (
              <label key={label} className="flex items-center justify-between text-xs cursor-pointer hover:text-accent transition-colors py-0.5 px-1 rounded hover:bg-paper-sheet dark:hover:bg-gray-800/40">
                <span className="font-medium text-[11px]">{label}</span>
                <input 
                  type="checkbox" 
                  checked={selectedCategories[value]} 
                  onChange={() => setSelectedCategories({ ...selectedCategories, [value]: !selectedCategories[value] })}
                  className="rounded border-ink-line dark:border-gray-600 text-accent focus:ring-accent/20 bg-paper dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                />
              </label>
            ))}
          </div>
        </div>

        {/* Severity Level Filters */}
        <div className="space-y-1.5">
          <div className="font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">
            // SEVERITY LEVEL
          </div>
          <div className="bg-paper-card dark:bg-gray-900/50 rounded-card p-2 space-y-1 border border-ink-line/60 dark:border-gray-800">
            {['high', 'medium', 'low'].map((sev) => {
              const dot = sev === 'high' ? 'bg-severity-high' : sev === 'medium' ? 'bg-accent' : 'bg-severity-low';
              return (
                <label key={sev} className="flex items-center justify-between text-xs cursor-pointer hover:text-accent transition-colors py-0.5 px-1 rounded hover:bg-paper-sheet dark:hover:bg-gray-800/40">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium capitalize">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span>{sev} Priority</span>
                  </span>
                  <input 
                    type="checkbox" 
                    checked={selectedSeverity[sev]} 
                    onChange={() => setSelectedSeverity({ ...selectedSeverity, [sev]: !selectedSeverity[sev] })}
                    className="rounded border-ink-line dark:border-gray-600 text-accent focus:ring-accent/20 bg-paper dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Status Filters */}
        <div className="space-y-1.5">
          <div className="font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-widest">
            // LIFECYCLE STATUS
          </div>
          <div className="bg-paper-card dark:bg-gray-900/50 rounded-card p-2 space-y-1 border border-ink-line/60 dark:border-gray-800">
            {Object.entries(STATUS_MAP).map(([label, value]) => (
              <label key={label} className="flex items-center justify-between text-xs cursor-pointer hover:text-accent transition-colors py-0.5 px-1 rounded hover:bg-paper-sheet dark:hover:bg-gray-800/40">
                <span className="font-medium text-[11px]">{label}</span>
                <input 
                  type="checkbox" 
                  checked={selectedStatuses[value]} 
                  onChange={() => setSelectedStatuses({ ...selectedStatuses, [value]: !selectedStatuses[value] })}
                  className="rounded border-ink-line dark:border-gray-600 text-accent focus:ring-accent/20 bg-paper dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                />
              </label>
            ))}
          </div>
        </div>

        {/* Deduplication Callout */}
        <div className="p-2.5 rounded-card bg-paper-sheet dark:bg-gray-900/70 border border-dashed border-ink-line dark:border-gray-700 text-[10px] font-mono leading-relaxed space-y-1">
          <div className="flex items-center gap-1 text-accent font-bold uppercase text-[9px]">
            <ShieldCheck className="w-3 h-3 text-severity-low" />
            <span>20m Radial Clustering</span>
          </div>
          <p className="text-ink/70 dark:text-gray-400 font-sans text-[11px] leading-snug">
            Nearby duplicate complaints are merged automatically to prevent tickets from clustering on your view.
          </p>
        </div>

      </div>

      {/* 3. Fixed Footer Status */}
      <div className="p-2.5 bg-paper-card dark:bg-[#0E131F] border-t border-ink-line dark:border-gray-800 flex justify-between items-center font-mono text-[10px] text-ink/70 dark:text-gray-400 flex-shrink-0">
        <span>SHOWING</span>
        <span className="font-bold text-accent bg-paper dark:bg-gray-800 px-1.5 py-0.5 rounded border border-ink-line dark:border-gray-700">
          {filteredTickets.length} / {tickets.length} CASES
        </span>
      </div>

    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-paper dark:bg-[#0E131F] text-ink dark:text-gray-200">
      
      {/* ─────────────────────────────────────────────────────────────
          1. FIXED-WIDTH COMPACT FILTER SIDEBAR (DESKTOP)
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`hidden md:block transition-all duration-300 bg-paper dark:bg-[#131A26] border-r-2 border-ink dark:border-gray-800 shadow-xl overflow-hidden flex-shrink-0 ${
          showFilters ? 'w-[290px]' : 'w-0 border-r-0'
        }`}
      >
        <div className="w-[290px] h-full">
          <FilterContent />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE SLIDE-OVER FILTER DRAWER
      ───────────────────────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <div className="md:hidden fixed inset-0 z-[2000] flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-[290px] max-w-[85vw] h-full bg-paper dark:bg-[#131A26] border-r-2 border-ink dark:border-gray-700 overflow-hidden z-10 shadow-2xl">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-ink/60 dark:text-gray-400 hover:text-ink dark:hover:text-white border-0 bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN MAP CONTAINER (FLEX-1 FILLS REMAINING WIDTH)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative flex-1 h-full min-w-0">
        
        {/* Toggle Filters Button (Desktop) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="hidden md:flex absolute top-3 left-3 z-[1000] items-center gap-1.5 px-3 py-1.5 rounded-button bg-paper dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 font-mono text-xs font-bold text-ink dark:text-white uppercase tracking-wider shadow-md hover:border-accent transition-all cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-accent" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Mobile Filter Trigger Button */}
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden absolute top-3 left-3 z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-button bg-paper dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 font-mono text-xs font-bold text-ink dark:text-white uppercase tracking-wider shadow-md cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5 text-accent" />
          <span>Filters ({filteredTickets.length})</span>
        </button>

        {/* Top-Right HUD Status Strip */}
        <div className="absolute right-3 top-3 z-[1000] hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-button bg-paper/90 dark:bg-[#151B26]/90 backdrop-blur-md border border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/80 dark:text-gray-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-severity-low animate-pulse" />
          <span className="font-bold">AHMEDABAD GRID LIVE</span>
        </div>

        {/* Bottom-Right Coordinates & Legend Strip */}
        <div className="absolute right-3 bottom-5 z-[1000] hidden sm:flex flex-col gap-1 pointer-events-none">
          <div className="px-3 py-1.5 rounded-button bg-paper/90 dark:bg-[#151B26]/90 backdrop-blur-md border border-ink-line dark:border-gray-800 font-mono text-[10px] text-ink/80 dark:text-gray-300 shadow-md flex items-center gap-3">
            <span className="font-bold text-[9px] text-accent uppercase">LEGEND:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-severity-high" />
              <span>High</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>Med</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-severity-low" />
              <span>Low</span>
            </span>
          </div>
        </div>

        {/* Leaflet Map Container */}
        <MapContainer 
          center={centerPosition} 
          zoom={13} 
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <MapResizer showFilters={showFilters} />

          {/* Tile Layer: CARTO dark matter for dark mode, CARTO voyager for light mode */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={theme === 'dark' 
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            }
          />

          {/* Markers mapping */}
          {filteredTickets.map((ticket) => (
            <Marker 
              key={ticket.id} 
              position={ticket.location} 
              icon={createSeverityMarker(ticket.severity)}
            >
              {/* Restyled Permit-Document Popup Card */}
              <Popup className="custom-leaflet-popup">
                <div 
                  className="w-64 overflow-hidden flex flex-col font-sans bg-paper dark:bg-[#151B26] border-2 border-ink dark:border-gray-700 rounded-card shadow-2xl text-left"
                >
                  {/* Top Severity Accent Strip */}
                  <div className={`h-1.5 w-full ${
                    ticket.severity === 'high' ? 'bg-severity-high' :
                    ticket.severity === 'medium' ? 'bg-accent' :
                    'bg-severity-low'
                  }`} />

                  <div className="p-3.5 space-y-2.5">
                    
                    {/* Header: Case ID + Category */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center font-mono text-[9px] text-ink/60 dark:text-gray-400">
                        <span className="font-bold text-accent">CASE #{ticket.id.slice(0, 8)}</span>
                        <span className="uppercase font-semibold">{ticket.severity} PRIORITY</span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-ink dark:text-white tracking-tight leading-snug">
                        {ticket.category} Report
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        ticket.status === 'resolved' ? 'bg-green-100 dark:bg-green-950/60 text-severity-low border border-severity-low/40' :
                        ticket.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-950/60 text-accent border border-accent/40' :
                        ticket.status === 'verified' ? 'bg-blue-100 dark:bg-blue-950/60 text-primary dark:text-blue-400 border border-primary/40' :
                        'bg-paper-card dark:bg-gray-800 text-ink/70 dark:text-gray-300 border border-ink-line dark:border-gray-700'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Geotag Address */}
                    <p className="text-[11px] text-ink/80 dark:text-gray-300 leading-relaxed flex items-start gap-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-accent mt-0.5" />
                      <span className="line-clamp-2">{ticket.address}</span>
                    </p>

                    {/* Telemetry Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 rounded bg-paper-card dark:bg-gray-900 border border-ink-line dark:border-gray-800 font-mono text-[10px]">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-ink/50 dark:text-gray-500 uppercase tracking-wider block">REPORTS</span>
                        <span className="font-bold text-ink dark:text-white flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-accent" />
                          <span>{ticket.reports}</span>
                        </span>
                      </div>
                      <div className="space-y-0.5 border-l border-ink-line dark:border-gray-800 pl-2">
                        <span className="text-[8px] font-bold text-ink/50 dark:text-gray-500 uppercase tracking-wider block">UPVOTES</span>
                        <span className="font-bold text-ink dark:text-white flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-accent" />
                          <span>{ticket.votes}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/ticket/${ticket.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 bg-accent hover:bg-amber-400 text-xs font-mono font-bold uppercase tracking-wider text-ink rounded-button shadow-sm transition-all active:scale-97 border-0 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
