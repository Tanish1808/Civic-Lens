import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Search, RotateCcw, AlertCircle, MapPin, Eye, ThumbsUp, Calendar } from 'lucide-react';

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
              <Popup>
                <div className="p-2 space-y-3 w-56">
                  {/* Category & Status */}
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-text-primary">{ticket.category}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      ticket.status === 'verified' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Location label */}
                  <p className="text-[11px] text-text-secondary flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary mt-0.5" />
                    <span>{ticket.address}</span>
                  </p>

                  {/* Stats counters */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary bg-gray-50 p-2 rounded-card border border-gray-100 font-mono">
                    <div>
                      <p className="font-bold text-text-primary">{ticket.reports}</p>
                      <p>Reports</p>
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">{ticket.votes}</p>
                      <p>Upvotes</p>
                    </div>
                  </div>

                  {/* Link action */}
                  <Link
                    to={`/ticket/${ticket.id}`}
                    className="w-full flex items-center justify-center gap-1 py-1.5 bg-primary hover:bg-primary/95 text-[11px] font-bold text-white rounded-button shadow-sm transition-colors text-center"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Ticket Details</span>
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
}
