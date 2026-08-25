/**
 * ==============================================================================
 * CIVIC LENS — ADMIN GEOSPATIAL MAP (PAGE 11 OF 14 REDESIGN)
 * ==============================================================================
 * DESIGN METAPHOR: Tactical Spatial Intelligence Radar & Municipal GIS Deck
 * 
 * SUMMARY OF CHANGES:
 * 1. Design Token & Palette Alignment:
 *    - Strict dark `ink` (#10263A) base background with `paper` (#F6F2E9) typography,
 *      `ink-line` dark borders, and `accent` (#E8A33D) signal highlights.
 *    - Space Grotesk header (`font-display`), Inter body copy, and JetBrains Mono
 *      (`font-mono`) for metadata, coordinates, ticket IDs, and filter section headers.
 * 2. Fixed-Width & Internally Scrollable Filter Dock:
 *    - Filter sidebar capped at 300px fixed width (`w-[300px] flex-shrink-0`) with
 *      `overflow-y-auto` internal scrolling so large filter lists never push outer layouts.
 *    - Custom accent-colored checkboxes replacing plain default browser controls.
 *    - Restyled search input with custom dark console framing and amber focus ring.
 *    - Compact, styled Reset button with `RotateCcw` icon.
 * 3. Guaranteed Leaflet Resize & Tile Invalidation (`invalidateSize`):
 *    - Integrated `MapResizer` component firing `map.invalidateSize()` immediately and
 *      at 150ms/350ms whenever `showFilters` toggles to prevent grey tile gaps.
 * 4. Dark Console Marker Popups:
 *    - Restyled popups using dark `ink` surface, `ink-line` border, JetBrains Mono
 *      case IDs, severity-coded badges (High: #D64545, Medium: #E8A33D, Low: #4CAF7D),
 *      and high-contrast Signal Amber "Get Directions" CTA button.
 * 5. Responsive Mobile Slide-Over:
 *    - Mobile filter drawer allowing seamless on-the-go GIS inspection on small screens.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, Search, RotateCcw, AlertCircle, MapPin, Eye, 
  ThumbsUp, Loader2, X, Navigation, Layers, ShieldCheck,
  Check, CheckSquare, Square
} from 'lucide-react';
import api from '../../../services/api';

const CATEGORY_IMAGES = {
  Pothole: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80',
  Waterlogging: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
  Streetlight: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  Garbage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80',
  Default: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
};

const getCategoryPhoto = (category) => {
  const catLower = (category || '').toLowerCase();
  if (catLower.includes('pothole')) return CATEGORY_IMAGES.Pothole;
  if (catLower.includes('water')) return CATEGORY_IMAGES.Waterlogging;
  if (catLower.includes('light')) return CATEGORY_IMAGES.Streetlight;
  if (catLower.includes('garbage') || catLower.includes('dump')) return CATEGORY_IMAGES.Garbage;
  return CATEGORY_IMAGES.Default;
};

// Map Resizer component to guarantee Leaflet recalculates dimensions when sidebar toggles
function MapResizer({ showFilters }) {
  const map = useMap();
  useEffect(() => {
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

// Pulsing marker icons based on semantic severity colors
const createSeverityMarker = (severity) => {
  const color =
    severity === 'high' ? '#D64545' :
    severity === 'medium' ? '#E8A33D' : '#4CAF7D';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style="background-color: ${color}"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 shadow-lg border-2 border-[#10263A] transition-all duration-300" style="background-color: ${color}"></span>
      </div>
    `,
    className: 'custom-marker-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10],
  });
};

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
      <span className="text-[9px] text-paper/40">Unresolved or blocked host</span>
    </div>
  );
}

export default function AdminMap() {
  const [showFilters, setShowFilters] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [selectedSeverity, setSelectedSeverity] = useState(() => {
    const cached = sessionStorage.getItem('admin_map_selected_severity');
    return cached ? JSON.parse(cached) : { low: true, medium: true, high: true };
  });

  const [selectedCategories, setSelectedCategories] = useState(() => {
    const cached = sessionStorage.getItem('admin_map_selected_categories');
    return cached ? JSON.parse(cached) : { pothole: true, waterlogging: true, streetlight: true, garbage: true, other: true };
  });

  const [selectedStatuses, setSelectedStatuses] = useState(() => {
    const cached = sessionStorage.getItem('admin_map_selected_statuses');
    return cached ? JSON.parse(cached) : { reported: true, verified: true, acknowledged: true, in_progress: true, resolved: true };
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('admin_map_search_term') || '';
  });

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pilot Center: Ahmedabad coordinates
  const centerPosition = [23.0225, 72.5714];

  // Persist filters in sessionStorage
  useEffect(() => {
    sessionStorage.setItem('admin_map_selected_severity', JSON.stringify(selectedSeverity));
  }, [selectedSeverity]);

  useEffect(() => {
    sessionStorage.setItem('admin_map_selected_categories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);

  useEffect(() => {
    sessionStorage.setItem('admin_map_selected_statuses', JSON.stringify(selectedStatuses));
  }, [selectedStatuses]);

  useEffect(() => {
    sessionStorage.setItem('admin_map_search_term', searchTerm);
  }, [searchTerm]);

  const fetchTickets = () => {
    setIsLoading(true);
    api.get('/admin/tickets', { params: { show_spam: false } })
      .then((response) => {
        const loaded = (response.data.data.tickets || []).map((t) => {
          const lat = t.location?.coordinates?.[1] ?? centerPosition[0];
          const lng = t.location?.coordinates?.[0] ?? centerPosition[1];
          const displayCategory = t.category.charAt(0).toUpperCase() + t.category.slice(1);

          return {
            id: t.ticket_id,
            category: displayCategory,
            severity: t.severity,
            status: t.status,
            address: t.address || 'Ahmedabad Municipal Grid',
            zone_id: t.zone_id,
            lat,
            lng,
            reportsCount: t.report_count ?? 1,
            upvotesCount: t.upvote_count ?? 0,
            photo: (t.photos && t.photos.length > 0) ? t.photos[0].url : getCategoryPhoto(displayCategory),
            createdAt: t.created_at
          };
        });
        setTickets(loaded);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch admin map tickets:', err);
        setError('Failed to fetch tickets. Please verify you are logged in as an administrator.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResetFilters = () => {
    setSelectedSeverity({ low: true, medium: true, high: true });
    setSelectedCategories({ pothole: true, waterlogging: true, streetlight: true, garbage: true, other: true });
    setSelectedStatuses({ reported: true, verified: true, acknowledged: true, in_progress: true, resolved: true });
    setSearchTerm('');
  };

  const handleCheckboxChange = (filterType, name) => {
    if (filterType === 'severity') {
      setSelectedSeverity(prev => ({ ...prev, [name]: !prev[name] }));
    } else if (filterType === 'category') {
      setSelectedCategories(prev => ({ ...prev, [name]: !prev[name] }));
    } else if (filterType === 'status') {
      setSelectedStatuses(prev => ({ ...prev, [name]: !prev[name] }));
    }
  };

  // Filtering logic
  const filteredTickets = tickets.filter((t) => {
    // 1. Severity filter
    if (!selectedSeverity[t.severity]) return false;

    // 2. Category filter
    const catLower = (t.category || '').toLowerCase();
    let mappedCat = 'other';
    if (catLower.includes('pothole')) mappedCat = 'pothole';
    else if (catLower.includes('water')) mappedCat = 'waterlogging';
    else if (catLower.includes('light')) mappedCat = 'streetlight';
    else if (catLower.includes('garbage')) mappedCat = 'garbage';

    if (!selectedCategories[mappedCat]) return false;

    // 3. Status filter
    if (!selectedStatuses[t.status]) return false;

    // 4. Search search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      const matchCat = (t.category || '').toLowerCase().includes(query);
      const matchAddress = (t.address || '').toLowerCase().includes(query);
      const matchId = (t.id || '').toLowerCase().includes(query);
      if (!matchCat && !matchAddress && !matchId) return false;
    }

    return true;
  });

  // Reusable Filter Content Element
  const renderFilterPanel = () => (
    <div className="flex flex-col h-full space-y-6">
      {/* Header with Reset */}
      <div className="flex justify-between items-center border-b border-ink-line/15 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-paper/80">
            Map Filter Criteria
          </h3>
        </div>
        <button 
          type="button"
          onClick={handleResetFilters}
          className="px-2 py-1 bg-ink-muted/80 hover:bg-ink-muted text-accent font-mono text-[10px] font-bold rounded-button border border-ink-line/20 hover:border-accent/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Text Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-paper/40 pointer-events-none" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, category, ward..."
          className="w-full bg-ink/80 border border-ink-line/25 rounded-button pl-9 pr-3.5 py-2 text-xs text-paper placeholder:text-paper/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans"
        />
      </div>

      {/* 1. Severity Checkboxes */}
      <div className="space-y-2.5">
        <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
          // SEVERITY LOAD
        </label>
        <div className="space-y-1.5">
          {[
            { key: 'high', label: 'High Priority', colorClass: 'bg-severity-high', borderClass: 'text-severity-high' },
            { key: 'medium', label: 'Medium Priority', colorClass: 'bg-severity-medium', borderClass: 'text-severity-medium' },
            { key: 'low', label: 'Low Priority', colorClass: 'bg-severity-low', borderClass: 'text-severity-low' }
          ].map((sev) => {
            const isChecked = selectedSeverity[sev.key];
            return (
              <label 
                key={sev.key} 
                className="flex items-center justify-between p-2 rounded bg-ink-muted/20 hover:bg-ink-muted/50 border border-ink-line/10 hover:border-ink-line/25 text-xs text-paper cursor-pointer transition-all select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${sev.colorClass} shadow-sm`} />
                  <span className="font-semibold text-paper/90 group-hover:text-paper">{sev.label}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange('severity', sev.key);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-accent text-ink' 
                      : 'bg-ink border border-ink-line/30 text-transparent hover:border-accent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Category Checkboxes */}
      <div className="space-y-2.5">
        <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
          // ISSUE CATEGORY
        </label>
        <div className="space-y-1.5">
          {[
            { key: 'pothole', label: 'Potholes' },
            { key: 'waterlogging', label: 'Waterlogging' },
            { key: 'streetlight', label: 'Streetlights' },
            { key: 'garbage', label: 'Garbage & Waste' },
            { key: 'other', label: 'Other Hazards' }
          ].map((cat) => {
            const isChecked = selectedCategories[cat.key];
            return (
              <label 
                key={cat.key} 
                className="flex items-center justify-between p-2 rounded bg-ink-muted/20 hover:bg-ink-muted/50 border border-ink-line/10 hover:border-ink-line/25 text-xs text-paper cursor-pointer transition-all select-none group"
              >
                <span className="font-semibold text-paper/90 group-hover:text-paper">{cat.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange('category', cat.key);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-accent text-ink' 
                      : 'bg-ink border border-ink-line/30 text-transparent hover:border-accent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Lifecycle Status Checkboxes */}
      <div className="space-y-2.5">
        <label className="block font-mono text-[10px] font-bold text-accent uppercase tracking-widest">
          // LIFECYCLE STATUS
        </label>
        <div className="space-y-1.5">
          {[
            { key: 'reported', label: 'Reported' },
            { key: 'verified', label: 'Verified' },
            { key: 'acknowledged', label: 'Acknowledged' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' }
          ].map((st) => {
            const isChecked = selectedStatuses[st.key];
            return (
              <label 
                key={st.key} 
                className="flex items-center justify-between p-2 rounded bg-ink-muted/20 hover:bg-ink-muted/50 border border-ink-line/10 hover:border-ink-line/25 text-xs text-paper cursor-pointer transition-all select-none group"
              >
                <span className="font-semibold text-paper/90 group-hover:text-paper">{st.label}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange('status', st.key);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    isChecked 
                      ? 'bg-accent text-ink' 
                      : 'bg-ink border border-ink-line/30 text-transparent hover:border-accent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer Meta Summary */}
      <div className="border-t border-ink-line/15 pt-4 mt-auto font-mono text-[10px] text-paper/50 flex items-center justify-between">
        <span>VISIBLE CASES:</span>
        <span className="font-bold text-accent px-2 py-0.5 rounded bg-ink-muted/60 border border-ink-line/20">
          {filteredTickets.length} / {tickets.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-hidden bg-ink text-paper min-h-screen flex flex-col font-sans relative selection:bg-accent selection:text-ink">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 survey-grid opacity-10 pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER STRIP WITH ACTIONS & ACTIVE COUNTER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-ink-line/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-paper">
              Geospatial Ticket Map
            </h1>
            {isLoading && <Loader2 className="w-4 h-4 text-accent animate-spin ml-1" />}
          </div>
          <p className="text-xs sm:text-sm text-paper/70 font-normal">
            Real-time street defects, cluster distributions, and triage points mapped across AMC ward boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-button bg-accent text-ink shadow-md cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters ({filteredTickets.length})</span>
          </button>

          {/* Desktop Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`hidden lg:flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-button border transition-all cursor-pointer ${
              showFilters 
                ? 'bg-accent text-ink border-accent shadow-md shadow-accent/20' 
                : 'bg-ink-muted/80 text-paper/80 border-ink-line/30 hover:border-accent hover:text-accent'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {/* Live Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-ink-muted/60 border border-ink-line/25 rounded-card font-mono text-xs text-paper/80 shadow-sm">
            <Navigation className="w-3.5 h-3.5 text-severity-low animate-pulse" />
            <span className="font-bold tracking-wider">{filteredTickets.length} ACTIVE PINS</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN MAP STAGE WITH RESPONSIVE FILTER DOCK
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Desktop Dynamic Filters Sidebar (Left, Capped at 300px) */}
        {showFilters && (
          <aside className="hidden lg:flex w-[300px] bg-ink-muted/40 border border-ink-line/25 rounded-card p-5 shadow-2xl backdrop-blur-md overflow-y-auto max-h-full shrink-0 flex-col">
            {renderFilterPanel()}
          </aside>
        )}

        {/* Mobile Slide-Over Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-ink/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-xs bg-[#0E1B29] border-l border-ink-line/30 p-6 flex flex-col h-full shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center border-b border-ink-line/20 pb-4 mb-4">
                <h3 className="font-display text-base font-bold text-paper">Filter Criteria</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded text-paper/70 hover:text-paper"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFilterPanel()}
            </div>
          </div>
        )}

        {/* Map Canvas (Right, flex-1) */}
        <div className="flex-1 bg-ink-muted/30 border border-ink-line/25 rounded-card overflow-hidden shadow-2xl relative min-h-[420px]">
          
          {/* Leaflet Resize Synchronizer */}
          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            <MapResizer showFilters={showFilters} />

            {/* CARTO DB Dark Matter Tiles */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {filteredTickets.map((t) => (
              <Marker 
                key={t.id} 
                position={[t.lat, t.lng]} 
                icon={createSeverityMarker(t.severity)}
              >
                <Popup className="admin-map-popup">
                  <div className="text-paper p-3.5 min-w-[260px] max-w-[300px] space-y-3 font-sans bg-[#0E1B29] border border-ink-line/40 rounded-card shadow-2xl">
                    
                    {/* Header Strip */}
                    <div className="flex justify-between items-center border-b border-ink-line/20 pb-2">
                      <span className="text-[10px] font-bold font-mono text-accent">
                        #{t.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border ${
                        t.severity === 'high' ? 'bg-severity-high/20 text-severity-high border-severity-high/40' :
                        t.severity === 'medium' ? 'bg-severity-medium/20 text-severity-medium border-severity-medium/40' :
                        'bg-severity-low/20 text-severity-low border-severity-low/40'
                      }`}>
                        {t.severity}
                      </span>
                    </div>

                    {/* Image Preview Box */}
                    <div className="w-full h-24 rounded overflow-hidden bg-ink border border-ink-line/20 relative">
                      <ImageWithFallback 
                        src={t.photo.startsWith('http://') || t.photo.startsWith('https://') || t.photo.startsWith('data:') 
                          ? t.photo 
                          : `http://localhost:8000${t.photo.startsWith('/') ? '' : '/'}${t.photo}`} 
                        alt={t.category} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Detail Information */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5 items-center flex-wrap">
                        <h4 className="font-display text-xs font-bold text-paper leading-tight">
                          {t.category}
                        </h4>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/20 text-blue-300 uppercase tracking-wider font-mono border border-primary/30">
                          {t.zone_id ? t.zone_id.replace('Zone', '').trim() : 'Ahmedabad Grid'}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-paper/70 flex items-center gap-1 font-medium leading-relaxed truncate">
                        <MapPin className="w-3 h-3 text-accent shrink-0" />
                        <span className="truncate">{t.address}</span>
                      </p>
                      
                      <div className="flex gap-3 pt-1 text-[10px] font-mono text-paper/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-paper/40" />
                          {t.reportsCount} Reports
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-paper/40" />
                          {t.upvotesCount} Upvotes
                        </span>
                      </div>
                    </div>

                    {/* Status & Timestamp */}
                    <div className="border-t border-ink-line/20 pt-2 flex justify-between items-center gap-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded font-mono text-[8px] font-bold uppercase tracking-wider border ${
                        t.status === 'resolved' ? 'bg-severity-low/15 text-severity-low border-severity-low/30' :
                        t.status === 'in_progress' ? 'bg-accent/15 text-accent border-accent/30' :
                        'bg-primary/20 text-blue-300 border-primary/30'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-paper/50 font-mono">
                        {t.createdAt ? new Date(t.createdAt.endsWith('Z') || t.createdAt.includes('+') || t.createdAt.includes('-') ? t.createdAt : `${t.createdAt}Z`).toLocaleDateString() : ''}
                      </span>
                    </div>

                    {/* Directions Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}`, '_blank');
                      }}
                      className="w-full mt-2 py-1.5 bg-accent hover:bg-[#D9932E] text-ink font-display text-[10px] font-bold uppercase tracking-wider rounded-button shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm z-[1000] flex flex-col justify-center items-center space-y-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="font-mono text-xs font-bold text-paper/70 uppercase tracking-widest animate-pulse">
                Mapping tickets geospatial database...
              </p>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 bg-ink/90 backdrop-blur-sm z-[1000] flex flex-col justify-center items-center space-y-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-severity-high" />
              <p className="text-xs text-paper/80 max-w-xs">{error}</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
