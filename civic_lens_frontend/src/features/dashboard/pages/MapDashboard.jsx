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
      
      {/* Side Filter Bar */}
      <div
        className={`bg-white dark:bg-[#151B26] border-r border-gray-200/80 dark:border-gray-800 z-10 flex flex-col justify-between transition-all duration-300 shadow-xl ${
          showFilters ? 'w-80' : 'w-0 overflow-hidden border-none shadow-none'
        }`}
      >
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary dark:text-white">Filter Reports</h2>
            <button 
              onClick={handleResetFilters}
              className="text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white p-1 hover:bg-gray-100 dark:hover:bg-gray-800/40 rounded transition-colors border-0 bg-transparent cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
 
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search reports or areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-button bg-gray-50/50 dark:bg-gray-850 text-text-primary dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 dark:focus:ring-amber-500/10 focus:border-primary dark:focus:border-amber-500 transition-all duration-300"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
 
          {/* Category Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">Issue Category</h3>
            <div className="space-y-2">
              {Object.entries(CATEGORY_MAP).map(([label, value]) => (
                <label key={label} className="flex items-center gap-2.5 text-sm text-text-primary dark:text-gray-300 cursor-pointer hover:text-black dark:hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories[value]} 
                    onChange={() => setSelectedCategories({ ...selectedCategories, [value]: !selectedCategories[value] })}
                    className="rounded border-gray-300 dark:border-gray-700 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 h-4.5 w-4.5 bg-white dark:bg-gray-850" 
                  />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>
 
          {/* Severity Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Severity Level</h3>            <div className="space-y-2">
              {['high', 'medium', 'low'].map((sev) => (
                <label key={sev} className="flex items-center gap-2.5 text-sm text-text-primary dark:text-gray-300 cursor-pointer capitalize hover:text-black dark:hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedSeverity[sev]} 
                    onChange={() => setSelectedSeverity({ ...selectedSeverity, [sev]: !selectedSeverity[sev] })}
                    className="rounded border-gray-300 dark:border-gray-700 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 h-4.5 w-4.5 bg-white dark:bg-gray-850" 
                  />
                  <span className="font-semibold">{sev} Priority</span>
                </label>
              ))}
            </div>
          </div>
 
          {/* Status Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary dark:text-gray-400 uppercase tracking-wider">Lifecycle Status</h3>
            <div className="space-y-2">
              {Object.entries(STATUS_MAP).map(([label, value]) => (
                <label key={label} className="flex items-center gap-2.5 text-sm text-text-primary dark:text-gray-300 cursor-pointer hover:text-black dark:hover:text-white">
                  <input 
                    type="checkbox" 
                    checked={selectedStatuses[value]} 
                    onChange={() => setSelectedStatuses({ ...selectedStatuses, [value]: !selectedStatuses[value] })}
                    className="rounded border-gray-300 dark:border-gray-700 text-primary dark:text-amber-500 focus:ring-primary dark:focus:ring-amber-500 h-4.5 w-4.5 bg-white dark:bg-gray-850" 
                  />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
 
        {/* Analytics Tip */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
          <div className="flex gap-2.5 items-start text-xs text-text-secondary dark:text-gray-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-primary dark:text-amber-500 mt-0.5" />
            <p><strong>Deduplication Loop:</strong> Nearby duplicate complaints are merged automatically to prevent tickets from clustering on your view.</p>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 h-full">
        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute left-4 top-4 z-[1000] bg-white dark:bg-[#151B26] px-4 py-2.5 rounded-button shadow-lg border border-gray-200/80 dark:border-gray-800 text-text-primary dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-xl dark:shadow-none transition-all duration-300 flex items-center gap-2 font-bold text-xs cursor-pointer"
        >
          <Filter className="w-4 h-4 text-primary dark:text-amber-500" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
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
              {/* Premium styled popup */}
              <Popup className="custom-leaflet-popup">
                <div className={`w-64 overflow-hidden bg-white dark:bg-[#151B26] text-text-primary dark:text-gray-200 rounded-card flex flex-col font-sans border border-gray-150 dark:border-gray-800 border-t-4 shadow-xl ${
                  ticket.severity === 'high' ? 'border-t-red-500' :
                  ticket.severity === 'medium' ? 'border-t-amber-500' :
                  'border-t-green-500'
                }`}>
                  {/* Card content padding */}
                  <div className="p-5 space-y-4">
                    {/* Header: Category & Status */}
                    <div className="space-y-2">
                      <div className="pr-6">
                        <span className="font-black text-sm text-text-primary dark:text-white tracking-tight leading-tight block">
                          {ticket.category} Report
                        </span>
                      </div>

                      {/* Badges Row: Status and Severity stacked below title */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ticket.status === 'resolved' ? 'bg-green-100 dark:bg-green-950/40 text-green-850 dark:text-green-400' :
                          ticket.status === 'in_progress' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-850 dark:text-amber-400' :
                          ticket.status === 'verified' ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-850 dark:text-blue-400' :
                          'bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                          ticket.severity === 'high' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/50 dark:border-red-900/40' :
                          ticket.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40' :
                          'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/40'
                        }`}>
                          {ticket.severity} Priority
                        </span>
                      </div>
                    </div>

                    {/* Location label */}
                    <p className="text-[11px] text-text-secondary dark:text-gray-400 leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary dark:text-amber-500 mt-0.5" />
                      <span>{ticket.address}</span>
                    </p>

                    {/* Stats counters row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900/40 p-2.5 rounded-card border border-gray-100 dark:border-gray-800 font-mono">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reports</p>
                        <p className="font-extrabold text-sm text-text-primary dark:text-white flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-primary/60 dark:text-amber-500/60" />
                          <span>{ticket.reports}</span>
                        </p>
                      </div>
                      <div className="space-y-0.5 border-l border-gray-200/85 dark:border-gray-800 pl-2">
                        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Upvotes</p>
                        <p className="font-extrabold text-sm text-text-primary dark:text-white flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 text-primary/60 dark:text-amber-500/60" />
                          <span>{ticket.votes}</span>
                        </p>
                      </div>
                    </div>

                    {/* Navigation Link button with high visibility text and icon */}
                    <Link
                      to={`/ticket/${ticket.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary dark:bg-amber-500 hover:bg-primary/95 dark:hover:bg-amber-600 text-xs font-black text-white dark:text-black rounded-button shadow-md shadow-primary/10 dark:shadow-amber-500/10 hover:shadow-primary/20 dark:hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-97 text-center cursor-pointer border-0"
                    >
                      <span>View Ticket Details</span>
                      <Eye className="w-4 h-4 text-white dark:text-black" />
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
