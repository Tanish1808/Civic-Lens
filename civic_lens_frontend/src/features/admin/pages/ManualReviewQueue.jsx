import React from 'react';
import { ShieldAlert, Check, Ban, HelpCircle, MapPin, Sparkles } from 'lucide-react';

export default function ManualReviewQueue() {
  const reviews = [
    {
      id: 'R-904',
      imageUrl: 'https://images.unsplash.com/photo-1599740831146-80a8352307a8?auto=format&fit=crop&w=300&q=80',
      reason: 'Low Model Confidence (42% Category Pothole)',
      gps: '23.0241° N, 72.5702° E',
      detected: 'Garbage? / Pothole?',
      uploadedBy: 'Anon Citizen',
      date: '2026-07-22'
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Manual Review Queue</h1>
        <p className="text-sm text-gray-400">Triage and resolve reports where automated confidence fell below threshold values.</p>
      </div>

      {/* Review items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-5">
            
            {/* Header: ID & confidence warning */}
            <div className="flex justify-between items-start border-b border-gray-850 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Report {r.id}</h3>
                <p className="text-[10px] text-red-400 font-bold uppercase mt-1 tracking-wide">{r.reason}</p>
              </div>
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Needs Verification
              </span>
            </div>

            {/* Content layout split: image left, actions right */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
              {/* Photo preview (5 columns) */}
              <div className="sm:col-span-5 aspect-square rounded-card overflow-hidden bg-gray-900 border border-gray-800/60 relative">
                <img src={r.imageUrl} alt="Low confidence upload" className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 bg-black/60 rounded backdrop-blur-sm px-2 py-1 text-[9px] font-mono text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>{r.gps}</span>
                </div>
              </div>

              {/* Triage Inputs (7 columns) */}
              <div className="sm:col-span-7 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    System Predicted Category
                  </label>
                  <div className="bg-[#151B26] border border-gray-800 rounded-button px-3.5 py-2 text-xs font-semibold text-gray-300">
                    {r.detected}
                  </div>
                </div>

                {/* Overrides selectors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Final Category
                    </label>
                    <select className="w-full border border-gray-800 rounded-button px-2.5 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option value="pothole">Pothole</option>
                      <option value="garbage">Garbage</option>
                      <option value="waterlogging">Waterlogging</option>
                      <option value="streetlight">Streetlight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Final Severity
                    </label>
                    <select className="w-full border border-gray-800 rounded-button px-2.5 py-1.5 text-xs bg-[#151B26] text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form actions: approve / flag spam */}
            <div className="border-t border-gray-850 pt-4 flex gap-3">
              <button 
                onClick={() => alert('Report flagged as spam.')}
                className="flex-1 flex justify-center items-center gap-1.5 py-2 px-3 border border-red-500/20 rounded-button bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all duration-300"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Discard as Spam</span>
              </button>
              
              <button 
                onClick={() => alert('Report approved and ticket generated.')}
                className="flex-1 flex justify-center items-center gap-1.5 py-2 px-3 border border-transparent rounded-button bg-[#4CAF7D] text-[#0B0F19] text-xs font-extrabold hover:bg-[#45a071] transition-all duration-300 shadow-md shadow-[#4CAF7D]/10"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Triage</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
