import React, { useState, useEffect } from 'react';
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

// Pulsing marker icons based on severity
const createSeverityMarker = (severity) => {
  const color =
    severity === 'high' ? '#ef4444' :
    severity === 'medium' ? '#f59e0b' : '#10b981';

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
    <div className="w-full h-full bg-[#0E131F] flex flex-col justify-center items-center text-center p-3 select-none text-gray-500 border border-gray-800 rounded-card">
      <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest mb-1">Image Offline</span>
      <span className="text-[8px]">Unresolved or blocked host</span>
    </div>
  );
}

export default function AdminMap() {
  const [showFilters, setShowFilters] = useState(true);
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
    const catLower = t.category.toLowerCase();
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
      const matchCat = t.category.toLowerCase().includes(query);
      const matchAddress = t.address.toLowerCase().includes(query);
      const matchId = t.id.toLowerCase().includes(query);
      if (!matchCat && !matchAddress && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="p-8 space-y-6 flex-1 overflow-hidden bg-[#0E131F] text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Geospatial Ticket Map</h1>
          <p className="text-sm text-gray-400">View real-time street defects clustered and mapped across ward grids.</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-button border border-gray-800 transition-all cursor-pointer ${
            showFilters ? 'bg-amber-500 text-black border-amber-500' : 'bg-[#151B26] text-gray-300 hover:bg-[#1C2433]'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative min-h-0">
        
        {/* Dynamic Filters sidebar (Left) */}
        {showFilters && (
          <div className="w-80 bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-y-auto max-h-full shrink-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Map Filter Criteria</h3>
                <button 
                  onClick={handleResetFilters}
                  className="text-amber-500 hover:text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Text Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, category, ward..."
                  className="w-full bg-[#0E131F] border border-gray-800 rounded-button pl-10 pr-4 py-2 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Severity Checkboxes */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Severity Load</label>
                <div className="space-y-2">
                  {['high', 'medium', 'low'].map((sev) => (
                    <label key={sev} className="flex items-center gap-3 text-xs text-gray-300 capitalize cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedSeverity[sev]}
                        onChange={() => handleCheckboxChange('severity', sev)}
                        className="rounded text-amber-500 bg-[#0E131F] border-gray-800 focus:ring-offset-0 focus:ring-1 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          sev === 'high' ? 'bg-red-500' :
                          sev === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`} />
                        {sev}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Checkboxes */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <div className="space-y-2">
                  {[
                    { key: 'pothole', label: 'Potholes' },
                    { key: 'waterlogging', label: 'Waterlogging' },
                    { key: 'streetlight', label: 'Streetlights' },
                    { key: 'garbage', label: 'Garbage' },
                    { key: 'other', label: 'Other Issues' }
                  ].map((cat) => (
                    <label key={cat.key} className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedCategories[cat.key]}
                        onChange={() => handleCheckboxChange('category', cat.key)}
                        className="rounded text-amber-500 bg-[#0E131F] border-gray-800 focus:ring-offset-0 focus:ring-1 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Checkboxes */}
              <div className="space-y-2.5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lifecycle Status</label>
                <div className="space-y-2">
                  {[
                    { key: 'reported', label: 'Reported' },
                    { key: 'verified', label: 'Verified' },
                    { key: 'acknowledged', label: 'Acknowledged' },
                    { key: 'in_progress', label: 'In Progress' },
                    { key: 'resolved', label: 'Resolved' }
                  ].map((st) => (
                    <label key={st.key} className="flex items-center gap-3 text-xs text-gray-300 cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedStatuses[st.key]}
                        onChange={() => handleCheckboxChange('status', st.key)}
                        className="rounded text-amber-500 bg-[#0E131F] border-gray-800 focus:ring-offset-0 focus:ring-1 focus:ring-amber-500 w-4 h-4"
                      />
                      <span>{st.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800/60 pt-4 mt-6 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </div>
          </div>
        )}

        {/* Map Canvas (Right) */}
        <div className="flex-1 bg-[#151B26]/30 border border-gray-800/80 rounded-card overflow-hidden shadow-2xl relative">
          {isLoading && (
            <div className="absolute inset-0 bg-[#0E131F]/80 backdrop-blur-sm z-[1000] flex flex-col justify-center items-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Mapping tickets database...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-[#0E131F]/90 backdrop-blur-sm z-[1000] flex flex-col justify-center items-center space-y-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm text-gray-300 max-w-xs">{error}</p>
            </div>
          )}

          <MapContainer 
            center={centerPosition} 
            zoom={13} 
            className="w-full h-full"
            zoomControl={false}
          >
            {/* CARTO DB Dark Matter Tiles - Sleek, dark mode basemap perfect for Admin Dashboard */}
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
                  <div className="text-text-primary p-3 min-w-[240px] space-y-3 font-sans bg-white text-gray-850 rounded-card">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="text-[10px] font-bold font-mono text-amber-600">#{t.id.slice(-6).toUpperCase()}</span>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        t.severity === 'high' ? 'bg-red-50 text-red-500 border border-red-100' :
                        t.severity === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                        'bg-green-50 text-green-500 border border-green-100'
                      }`}>
                        {t.severity}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="w-full h-24 rounded-card overflow-hidden bg-gray-100 border border-gray-100 relative">
                      <ImageWithFallback 
                        src={t.photo.startsWith('http://') || t.photo.startsWith('https://') || t.photo.startsWith('data:') 
                          ? t.photo 
                          : `http://localhost:8000${t.photo.startsWith('/') ? '' : '/'}${t.photo}`} 
                        alt={t.category} 
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5">
                      <div className="flex gap-1.5 items-center flex-wrap">
                        <h4 className="text-xs font-bold text-gray-900 leading-tight">{t.category}</h4>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-600 uppercase tracking-wider font-mono">
                          {t.zone_id ? t.zone_id.replace('Zone', '').trim() : 'Ahmedabad'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 font-semibold leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{t.address}</span>
                      </p>
                      
                      <div className="flex gap-4 pt-1 text-[10px] font-semibold text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-gray-400" />
                          {t.reportsCount} Reports
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-gray-400" />
                          {t.upvotesCount} Upvotes
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="border-t border-gray-100 pt-2 flex justify-between items-center gap-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        t.status === 'resolved' ? 'bg-green-50 text-green-500 border border-green-100' :
                        t.status === 'in_progress' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                        'bg-blue-50 text-blue-500 border border-blue-100'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] text-gray-400 font-semibold font-mono">
                        {t.createdAt ? new Date(t.createdAt.endsWith('Z') || t.createdAt.includes('+') || t.createdAt.includes('-') ? t.createdAt : `${t.createdAt}Z`).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${t.lat},${t.lng}`, '_blank');
                      }}
                      className="w-full mt-2 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase tracking-wider rounded shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 border-0"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
