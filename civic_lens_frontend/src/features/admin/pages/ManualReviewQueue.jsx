import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

export default function ManualReviewQueue() {
  const queuedItems = [
    {
      id: 'rep-884',
      photoUrl: '',
      reason: 'Low category confidence (42%)',
      submittedBy: 'rohan@example.com',
      date: '2026-08-01 14:15',
      userSuggested: 'Pothole',
    },
    {
      id: 'rep-883',
      photoUrl: '',
      reason: 'Duplicate-check-skipped (Network timeout)',
      submittedBy: 'priya@example.com',
      date: '2026-08-01 11:02',
      userSuggested: 'Broken Streetlight',
    }
  ];

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-gray-50">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Review Queue</h1>
        <p className="text-sm text-gray-500">Categorize reports with low ML confidence scores or system duplicate check timeouts.</p>
      </div>

      <div className="flex gap-2.5 items-start bg-amber-50 p-4 rounded-card border border-amber-100 text-amber-800 text-sm max-w-4xl">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Triage Guidelines:</strong> Review the photo carefully before overriding the user's suggested category. Once submitted, the system will execute standard database merge operations.
        </p>
      </div>

      {/* Queue Grid List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl">
        {queuedItems.map((item) => (
          <div key={item.id} className="bg-white rounded-card shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row h-72 md:h-64">
            
            {/* Left Photo display */}
            <div className="w-full md:w-48 bg-gray-100 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0">
              <span className="text-xs text-gray-400 font-bold">[ Uploaded Image ]</span>
            </div>

            {/* Right form controls */}
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm">{item.id}</span>
                  <span className="text-xs text-red-500 font-semibold">{item.reason}</span>
                </div>
                <p className="text-xs text-gray-400">By: {item.submittedBy} | On: {item.date}</p>
                <p className="text-xs text-gray-500 font-medium">User Selected: {item.userSuggested}</p>
              </div>

              {/* Triage Inputs */}
              <div className="grid grid-cols-2 gap-3 my-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Set Category</label>
                  <select className="border border-gray-300 rounded-button px-2 py-1 text-xs w-full bg-white focus:outline-none">
                    <option value="pothole">Pothole</option>
                    <option value="waterlogging">Waterlogging</option>
                    <option value="streetlight">Streetlight</option>
                    <option value="garbage">Garbage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Set Severity</label>
                  <select className="border border-gray-300 rounded-button px-2 py-1 text-xs w-full bg-white focus:outline-none">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors">
                  Flag Spam
                </button>
                <button
                  onClick={() => alert('Report triage complete.')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 rounded transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Resolve & Merge</span>
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
