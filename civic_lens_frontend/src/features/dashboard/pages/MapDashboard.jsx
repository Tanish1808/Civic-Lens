import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Search, RotateCcw, AlertCircle, MapPin, Eye, ThumbsUp, Calendar, Loader2 } from 'lucide-react';
import api from '../../../services/api';

const CATEGORY_IMAGES = {
  Pothole: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=400&q=80',
  Waterlogging: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80',
  Streetlight: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=400&q=80',
  Garbage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80',
  Default: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&q=80',
};

const getCategoryPhoto = (category) => {
  const catLower = category.toLowerCase();
  if (catLower.includes('pothole')) return CATEGORY_IMAGES.Pothole;
  if (catLower.includes('water')) return CATEGORY_IMAGES.Waterlogging;
  if (catLower.includes('light')) return CATEGORY_IMAGES.Streetlight;
  if (catLower.includes('garbage') || catLower.includes('dump')) return CATEGORY_IMAGES.Garbage;
  return CATEGORY_IMAGES.Default;
};

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

// Create pulsing neon marker icons based on severity
const createSeverityMarker = (severity) => {
  const color =
    severity === 'high' ? '#D64545' :
    severity === 'medium' ? '#E8A33D' : '#4CAF7D';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" style="background-color: ${color}"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 shadow-lg border-2 border-white transition-all duration-300" style="background-color: ${color}"></span>
      </div>
    `,
    className: 'custom-marker-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -10],
  });
};

export default function MapDashboard() {
  const [showFilters, setShowFilters] = useState(true);
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
  
  // Pilot Center: Ahmedabad coordinates from documents
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
          // Standardize GeoJSON Point [lng, lat] coordinates to Leaflet [lat, lng] format
          const lat = t.location?.coordinates?.[1] ?? centerPosition[0];
          const lng = t.location?.coordinates?.[0] ?? centerPosition[1];
          
          // Capitalize first letter of category name
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
    // 1. Severity filter
    if (!selectedSeverity[t.severity]) return false;
    
    // 2. Category filter
    const backendCat = t.category.toLowerCase();
    if (!selectedCategories[backendCat]) return false;
    
    // 3. Status filter
    if (!selectedStatuses[t.status]) return false;
    
    // 4. Search text filter
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
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#FAFBFD] dark:bg-[#0E131F] space-y-4">
        <Loader2 className="w-10 h-10 text-primary dark:text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-widest animate-pulse">Syncing Ahmedabad Grid...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#FAFBFD] dark:bg-[#0E131F] space-y-3 p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="text-base font-extrabold text-text-primary dark:text-white">Connection Offline</h3>
        <p className="text-xs text-text-secondary dark:text-gray-400 max-w-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-bg-light dark:bg-[#0E131F]">
      
      {/* ── Glassmorphic Side Filter Panel ── */}
      <div
        className={`relative z-10 flex flex-col justify-between transition-all duration-300 ${
          showFilters ? 'w-80' : 'w-0 overflow-hidden'
        }`}
      >
        {/* Glass backdrop */}
        <div className={`absolute inset-0 bg-white/80 dark:bg-[#0E131F]/80 backdrop-blur-xl border-r border-white/50 dark:border-gray-700/40 shadow-2xl shadow-black/5 dark:shadow-black/30 transition-all duration-300 ${showFilters ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative z-10 p-6 overflow-y-auto space-y-5 h-full">

          {/* Panel Header */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-700/40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-primary to-primary/60 dark:from-amber-400 dark:to-amber-600" />
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Filter Reports</h2>
            </div>
            <button 
              onClick={handleResetFilters}
              className="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-amber-400 p-1.5 hover:bg-primary/8 dark:hover:bg-amber-500/10 rounded-lg transition-all duration-200 border-0 bg-transparent cursor-pointer group"
              title="Reset Filters"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
 
          {/* Glassmorphic Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports or areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/70 dark:border-gray-700/50 text-gray-900 dark:text-gray-200 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-amber-500/20 focus:border-primary/50 dark:focus:border-amber-500/50 transition-all duration-300 shadow-sm"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
          </div>
 
          {/* Category Filters — glass pill group */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Issue Category</h3>
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-100/80 dark:border-gray-800/60 p-3 space-y-1.5 shadow-inner">
              {Object.entries(CATEGORY_MAP).map(([label, value]) => (
                <label key={label} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary dark:hover:text-amber-400 transition-colors duration-150 py-0.5 px-1 rounded-lg hover:bg-primary/5 dark:hover:bg-amber-500/5">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories[value]} 
                    onChange={() => setSelectedCategories({ ...selectedCategories, [value]: !selectedCategories[value] })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 bg-white dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                  />
                  <span className="font-semibold text-xs">{label}</span>
                </label>
              ))}
            </div>
          </div>
 
          {/* Severity Filters — glass pill group */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Severity Level</h3>
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-100/80 dark:border-gray-800/60 p-3 space-y-1.5 shadow-inner">
              {['high', 'medium', 'low'].map((sev) => {
                const dot = sev === 'high' ? 'bg-red-500' : sev === 'medium' ? 'bg-amber-400' : 'bg-green-500';
                return (
                  <label key={sev} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary dark:hover:text-amber-400 transition-colors duration-150 py-0.5 px-1 rounded-lg hover:bg-primary/5 dark:hover:bg-amber-500/5">
                    <input 
                      type="checkbox" 
                      checked={selectedSeverity[sev]} 
                      onChange={() => setSelectedSeverity({ ...selectedSeverity, [sev]: !selectedSeverity[sev] })}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 bg-white dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                    />
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    <span className="font-semibold text-xs capitalize">{sev} Priority</span>
                  </label>
                );
              })}
            </div>
          </div>
 
          {/* Status Filters — glass pill group */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Lifecycle Status</h3>
            <div className="bg-white/50 dark:bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-100/80 dark:border-gray-800/60 p-3 space-y-1.5 shadow-inner">
              {Object.entries(STATUS_MAP).map(([label, value]) => (
                <label key={label} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-primary dark:hover:text-amber-400 transition-colors duration-150 py-0.5 px-1 rounded-lg hover:bg-primary/5 dark:hover:bg-amber-500/5">
                  <input 
                    type="checkbox" 
                    checked={selectedStatuses[value]} 
                    onChange={() => setSelectedStatuses({ ...selectedStatuses, [value]: !selectedStatuses[value] })}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 bg-white dark:bg-gray-800 w-3.5 h-3.5 cursor-pointer" 
                  />
                  <span className="font-medium text-xs">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
 
        {/* Analytics Tip — glassy accent */}
        <div className="relative z-10 p-4 mx-3 mb-4 rounded-xl bg-primary/5 dark:bg-amber-500/5 backdrop-blur-sm border border-primary/10 dark:border-amber-500/10">
          <div className="flex gap-2 items-start text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-primary dark:text-amber-500 mt-0.5" />
            <p><strong className="text-gray-700 dark:text-gray-300">Deduplication Loop:</strong> Nearby duplicate complaints are merged automatically to prevent tickets from clustering on your view.</p>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 h-full">
        {/* ── Glassmorphic Toggle Filters Button ── */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute left-4 top-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.5)',
            color: 'inherit'
          }}
        >
          <Filter className="w-3.5 h-3.5 text-primary dark:text-amber-500" />
          <span className="text-gray-800 dark:text-gray-200">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Leaflet Map Container */}
        <MapContainer 
          center={centerPosition} 
          zoom={14} 
          className="w-full h-full z-0"
          zoomControl={false} // Disable default zoom to keep UI premium
        >
          {/* Tile Layer: Dynamic voyager light / dark matter depending on theme */}
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
              {/* ── Glassmorphic Popup Card ── */}
              <Popup className="custom-leaflet-popup">
                <div className={`w-64 overflow-hidden flex flex-col font-sans border-t-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                  ticket.severity === 'high' ? 'border-t-red-500' :
                  ticket.severity === 'medium' ? 'border-t-amber-500' :
                  'border-t-green-500'
                }`}
                  style={{
                    background: 'rgba(255,255,255,0.88)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    borderTopWidth: '4px',
                    borderTopColor: ticket.severity === 'high' ? '#ef4444' : ticket.severity === 'medium' ? '#f59e0b' : '#22c55e',
                  }}
                >
                  <div className="p-4 space-y-3">
                    {/* Category title */}
                    <span className="font-black text-sm text-gray-900 tracking-tight leading-tight block">
                      {ticket.category} Report
                    </span>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                        ticket.status === 'verified' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                        ticket.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                        ticket.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {ticket.severity} Priority
                      </span>
                    </div>

                    {/* Location */}
                    <p className="text-[11px] text-gray-500 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary mt-0.5" />
                      <span>{ticket.address}</span>
                    </p>

                    {/* Stats row — frosted */}
                    <div
                      className="grid grid-cols-2 gap-2 p-2.5 rounded-xl text-[10px] font-mono"
                      style={{ background: 'rgba(248,250,252,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(226,232,240,0.8)' }}
                    >
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Reports</p>
                        <p className="font-extrabold text-sm text-gray-900 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-primary/60" />
                          <span>{ticket.reports}</span>
                        </p>
                      </div>
                      <div className="space-y-0.5 border-l border-gray-200/80 pl-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Upvotes</p>
                        <p className="font-extrabold text-sm text-gray-900 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-primary/60" />
                          <span>{ticket.votes}</span>
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={`/ticket/${ticket.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-xs font-black text-white rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-95 border-0 cursor-pointer"
                    >
                      <span>View Ticket Details</span>
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
