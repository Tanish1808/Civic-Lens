import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit3, Trash2, ShieldAlert, Loader2, AlertCircle, X, Check, Save } from 'lucide-react';
import api from '../../../services/api';

export default function AdminTickets() {
  const navigate = useNavigate();
  
  // Data list states
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Editing state (for override / status change modal)
  const [editingTicket, setEditingTicket] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSeverity, setEditSeverity] = useState('');
  const [editNote, setEditNote] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchTickets = () => {
    setIsLoading(true);
    setError(null);

    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedSeverity) params.severity = selectedSeverity;
    if (selectedStatus) params.status = selectedStatus;

    api.get('/admin/tickets', { params })
      .then((response) => {
        setTickets(response.data.data.tickets || []);
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
  }, [selectedCategory, selectedSeverity, selectedStatus]);

  const handleOpenEdit = (t) => {
    setEditingTicket(t);
    setEditStatus(t.status);
    setEditCategory(t.category);
    setEditSeverity(t.severity);
    setEditNote('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSavingEdit(true);

    const promises = [];

    // 1. If status changed, PATCH status
    if (editStatus !== editingTicket.status) {
      promises.push(
        api.patch(`/admin/tickets/${editingTicket.id}/status`, {
          status: editStatus,
          note: editNote || 'Admin manual status override.'
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
      })
      .catch((err) => {
        console.error('Failed to update ticket attributes:', err);
        alert(err.response?.data?.error?.message || 'Failed to update ticket. Please check status transition rules.');
        setIsSavingEdit(false);
      });
  };

  const handleFlagSpam = (id) => {
    if (!window.confirm('Are you sure you want to flag this ticket as spam? This action is logged.')) return;
    
    api.post(`/admin/tickets/${id}/flag-spam`)
      .then(() => {
        fetchTickets();
      })
      .catch((err) => {
        console.error('Failed to flag spam:', err);
        alert('Failed to flag spam.');
      });
  };

  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['ID', 'Category', 'Severity', 'Address', 'ReportsCount', 'UpvoteCount', 'Status'];
    const rows = tickets.map(t => [
      t.id, t.category, t.severity, t.address || '', t.reports, t.votes, t.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tickets_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white min-h-screen">
      
      {/* Table Header Section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Tickets</h1>
          <p className="text-sm text-gray-400">Search, filter, and override active civic tickets.</p>
        </div>
        
        {/* Actions buttons */}
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            disabled={tickets.length === 0}
            className="px-4 py-2 text-xs font-bold bg-[#151B26] hover:bg-[#1C2433] text-gray-300 border border-gray-800/80 rounded-button transition-colors disabled:opacity-50 cursor-pointer"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Table Grid Card */}
      <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-6 border-b border-gray-850 bg-[#151B26]/20 flex gap-4 items-center flex-wrap">
          {/* Quick Filters */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            <option value="pothole">Pothole</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="streetlight">Streetlight</option>
            <option value="garbage">Garbage</option>
          </select>

          <select 
            value={selectedSeverity} 
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-850 rounded-button px-3 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="verified">Verified</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing tickets database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-3 text-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs font-semibold">
            No tickets matching selected filters found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
              <thead className="bg-[#151B26]/40 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-center">Reports</th>
                  <th className="px-6 py-4 text-center">Upvotes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-800/25 transition-all duration-300">
                    <td className="px-6 py-4 font-bold text-white font-mono">{t.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {t.category ? t.category.charAt(0).toUpperCase() + t.category.slice(1) : 'Unclassified'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.severity === 'high'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : t.severity === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-green-500/10 text-green-400 border border-green-500/20'
                      }`}>
                        {t.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{t.address || 'Ahmedabad Grid'}</td>
                    <td className="px-6 py-4 text-center font-bold text-white">{t.reports}</td>
                    <td className="px-6 py-4 text-center font-bold text-white">{t.votes}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold capitalize border ${
                        t.status === 'resolved'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : t.status === 'in_progress'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button 
                        onClick={() => navigate(`/ticket/${t.id}`)}
                        className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-800 transition-colors inline-flex cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 text-gray-400 hover:text-amber-400 rounded hover:bg-amber-500/10 transition-colors inline-flex cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleFlagSpam(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors inline-flex cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Override Edit Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEditingTicket(null)} />
          
          <div className="bg-[#151B26] border border-gray-800 rounded-card p-6 max-w-md w-full relative z-10 space-y-4 shadow-2xl">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setEditingTicket(null)}>
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Override Ticket Parameters</h3>
              <p className="text-xs text-gray-400">Modify status lifecycle or override AI classification flags for ticket #{editingTicket.id}.</p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-800 rounded-button px-3 py-2 text-xs bg-[#0E131F] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</label>
                  <select 
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full border border-gray-800 rounded-button px-3 py-2 text-xs bg-[#0E131F] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="pothole">Pothole</option>
                    <option value="waterlogging">Waterlogging</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="garbage">Garbage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Severity</label>
                  <select 
                    value={editSeverity}
                    onChange={(e) => setEditSeverity(e.target.value)}
                    className="w-full border border-gray-800 rounded-button px-3 py-2 text-xs bg-[#0E131F] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Audit Log Action Note</label>
                <textarea 
                  rows={2}
                  required
                  placeholder="Specify the override rationale (e.g. CGI road pothole verified by ward inspections)..."
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full border border-gray-800 rounded-button px-3 py-2 text-xs bg-[#0E131F] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-850">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="flex-1 py-2 border border-gray-800 text-xs font-bold text-gray-400 rounded-button hover:bg-gray-800 text-center cursor-pointer"
                  disabled={isSavingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold rounded-button shadow-md transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                  disabled={isSavingEdit}
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
