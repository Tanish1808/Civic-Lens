import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Search, RotateCcw, AlertCircle, MapPin, Eye, ThumbsUp, Calendar } from 'lucide-react';

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
  const [selectedSeverity, setSelectedSeverity] = useState({ low: true, medium: true, high: true });
  
  // Pilot Center: Ahmedabad coordinates from documents
  const centerPosition = [23.0225, 72.5714];

  // Mock tickets data matching Document 4 & 5
  const mockTickets = [
    {
      id: 't1',
      category: 'Pothole',
      severity: 'high',
      location: [23.0227, 72.5716],
      address: 'MG Road, near Bus Stop',
      reports: 12,
      votes: 8,
      status: 'verified',
    },
    {
      id: 't2',
      category: 'Garbage',
      severity: 'medium',
      location: '23.0210, 72.5700'.split(',').map(Number),
      address: 'Sector 2 Market Square',
      reports: 4,
      votes: 2,
      status: 'acknowledged',
    },
    {
      id: 't3',
      category: 'Waterlogging',
      severity: 'high',
      location: [23.0250, 72.5730],
      address: 'Subhash Marg Subway',
      reports: 28,
      votes: 15,
      status: 'in_progress',
    },
    {
      id: 't4',
      category: 'Streetlight',
      severity: 'low',
      location: [23.0200, 72.5740],
      address: 'Lane 5, Park Avenue',
      reports: 1,
      votes: 0,
      status: 'reported',
    },
    {
      id: 't5',
      category: 'Garbage',
      severity: 'low',
      location: [23.0300, 72.5650],
      address: 'CG Road, Opp. Mall',
      reports: 2,
      votes: 1,
      status: 'reported',
    },
    {
      id: 't6',
      category: 'Waterlogging',
      severity: 'high',
      location: [23.0150, 72.5800],
      address: 'Maninagar Railway Underpass',
      reports: 34,
      votes: 20,
      status: 'in_progress',
    },
    {
      id: 't7',
      category: 'Pothole',
      severity: 'medium',
      location: [23.0280, 72.5920],
      address: 'Kalupur Circle near Train Station',
      reports: 9,
      votes: 5,
      status: 'verified',
    },
    {
      id: 't8',
      category: 'Streetlight',
      severity: 'medium',
      location: [23.0350, 72.5820],
      address: 'Ashram Road Junction',
      reports: 5,
      votes: 3,
      status: 'acknowledged',
    },
    {
      id: 't9',
      category: 'Pothole',
      severity: 'low',
      location: [23.0120, 72.5620],
      address: 'Paldi Crossing Lane 2',
      reports: 3,
      votes: 0,
      status: 'reported',
    },
    {
      id: 't10',
      category: 'Garbage',
      severity: 'high',
      location: [23.0420, 72.5510],
      address: 'RTO Circle Flyover Underneath',
      reports: 18,
      votes: 11,
      status: 'in_progress',
    },
    {
      id: 't11',
      category: 'Waterlogging',
      severity: 'medium',
      location: [23.0295, 72.5480],
      address: 'Drive-in Road near Cineplex',
      reports: 12,
      votes: 7,
      status: 'verified',
    },
    {
      id: 't12',
      category: 'Streetlight',
      severity: 'low',
      location: [23.0080, 72.5720],
      address: 'Vasna Barrage Road Path',
      reports: 2,
      votes: 1,
      status: 'reported',
    }
  ];

  const filteredTickets = mockTickets.filter(t => selectedSeverity[t.severity]);

  return (
    <div className="relative flex h-[calc(100vh-64px)] w-full overflow-hidden bg-bg-light">
      
      {/* Side Filter Bar */}
      <div
        className={`bg-white border-r border-gray-200/80 z-10 flex flex-col justify-between transition-all duration-300 shadow-xl ${
          showFilters ? 'w-80' : 'w-0 overflow-hidden border-none shadow-none'
        }`}
      >
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-primary">Filter Reports</h2>
            <button 
              onClick={() => setSelectedSeverity({ low: true, medium: true, high: true })}
              className="text-text-secondary hover:text-text-primary p-1 hover:bg-gray-100 rounded transition-colors"
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-button bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-300"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          {/* Category Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Issue Category</h3>
            <div className="space-y-2">
              {['Pothole', 'Waterlogging', 'Streetlight Fault', 'Garbage/Dumping'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer hover:text-black">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5" />
                  <span className="font-medium">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Severity Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Severity Level</h3>
            <div className="space-y-2">
              {['high', 'medium', 'low'].map((sev) => (
                <label key={sev} className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer capitalize">
                  <input 
                    type="checkbox" 
                    checked={selectedSeverity[sev]} 
                    onChange={() => setSelectedSeverity({ ...selectedSeverity, [sev]: !selectedSeverity[sev] })}
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5" 
                  />
                  <span className="font-semibold">{sev} Priority</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Lifecycle Status</h3>
            <div className="space-y-2">
              {['Reported', 'Verified', 'Acknowledged', 'In Progress', 'Resolved'].map((stat) => (
                <label key={stat} className="flex items-center gap-2.5 text-sm text-text-primary cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5" />
                  <span className="font-medium">{stat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Tip */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-2.5 items-start text-xs text-text-secondary leading-relaxed">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
            <p><strong>Deduplication Loop:</strong> Nearby duplicate complaints are merged automatically to prevent tickets from clustering on your view.</p>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="relative flex-1 h-full">
        {/* Toggle Filters Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="absolute left-4 top-4 z-[1000] bg-white px-4 py-2.5 rounded-button shadow-lg border border-gray-200/80 text-text-primary hover:bg-gray-50 hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-bold text-xs"
        >
          <Filter className="w-4 h-4 text-primary" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>

        {/* Leaflet Map Container */}
        <MapContainer 
          center={centerPosition} 
          zoom={14} 
          className="w-full h-full z-0"
          zoomControl={false} // Disable default zoom to keep UI premium
        >
          {/* Tile Layer: CartoDB Positron (Modern Light Grid style) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
                <div className={`w-64 overflow-hidden bg-white text-text-primary rounded-card flex flex-col font-sans border-t-4 shadow-xl ${
                  ticket.severity === 'high' ? 'border-t-red-500' :
                  ticket.severity === 'medium' ? 'border-t-amber-500' :
                  'border-t-green-500'
                }`}>
                  {/* Card content padding */}
                  <div className="p-5 space-y-4">
                    {/* Header: Category & Status */}
                    <div className="space-y-2">
                      <div className="pr-6">
                        <span className="font-black text-sm text-text-primary tracking-tight leading-tight block">
                          {ticket.category} Report
                        </span>
                      </div>

                      {/* Badges Row: Status and Severity stacked below title */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          ticket.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                          ticket.severity === 'high' ? 'bg-red-50 text-red-700 border-red-200/50' :
                          ticket.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                          'bg-green-50 text-green-700 border-green-200/50'
                        }`}>
                          {ticket.severity} Priority
                        </span>
                      </div>
                    </div>

                    {/* Location label */}
                    <p className="text-[11px] text-text-secondary leading-relaxed flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary mt-0.5" />
                      <span>{ticket.address}</span>
                    </p>

                    {/* Stats counters row */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary bg-gray-50/50 p-2.5 rounded-card border border-gray-100 font-mono">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Reports</p>
                        <p className="font-extrabold text-sm text-text-primary flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-primary/60" />
                          <span>{ticket.reports}</span>
                        </p>
                      </div>
                      <div className="space-y-0.5 border-l border-gray-200/85 pl-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Upvotes</p>
                        <p className="font-extrabold text-sm text-text-primary flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5 text-primary/60" />
                          <span>{ticket.votes}</span>
                        </p>
                      </div>
                    </div>

                    {/* Navigation Link button with high visibility text and icon */}
                    <Link
                      to={`/ticket/${ticket.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/95 text-xs font-black text-white rounded-button shadow-md shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-97 text-center cursor-pointer"
                    >
                      <span>View Ticket Details</span>
                      <Eye className="w-4 h-4 text-white" />
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
