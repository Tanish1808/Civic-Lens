import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock, Calendar, CheckCircle2, User } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  const [upvotes, setUpvotes] = useState(12);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setHasUpvoted(true);
    }
  };

  const steps = [
    { label: 'Reported', status: 'completed', date: 'Jul 20, 2026' },
    { label: 'Verified', status: 'completed', date: 'Jul 21, 2026' },
    { label: 'Acknowledged', status: 'current', date: 'Jul 22, 2026' },
    { label: 'In Progress', status: 'upcoming', date: '' },
    { label: 'Resolved', status: 'upcoming', date: '' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-bg-light">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Photos & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                  High Severity
                </span>
                <h1 className="text-2xl font-bold text-text-primary mt-2">Pothole on Main Highway</h1>
                <p className="flex items-center gap-1.5 text-sm text-text-secondary mt-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Sector 4, MG Road (Near Bus Stop)</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpvote}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-button border transition-all ${
                    hasUpvoted
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-text-primary border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Upvote ({upvotes})</span>
                </button>
              </div>
            </div>

            {/* Photo Preview Slider placeholder */}
            <div className="aspect-video w-full bg-gray-100 rounded-card flex items-center justify-center text-text-secondary border border-gray-200">
              <span className="text-sm font-semibold">[ Supporting Photos Carousel placeholder ]</span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-text-primary mb-2">Description</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Deep pothole in the middle lane of MG Road. Multiple commuters on two-wheelers have met with accidents. Needs urgent blacktopping.
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Comments</h3>
            
            <div className="space-y-4 mb-4">
              <div className="flex gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-text-secondary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-text-primary">Priya Sharma</span>
                    <span className="text-xs text-text-secondary">2 days ago</span>
                  </div>
                  <p className="text-text-secondary mt-1">This has been getting worse since the rain. Thanks for reporting!</p>
                </div>
              </div>
            </div>

            {/* Comment Form */}
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                className="flex-1 min-w-0 border border-gray-300 rounded-button px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-button bg-primary text-white hover:bg-primary/95 transition-colors"
              >
                Post
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Status Tracker & Stats */}
        <div className="space-y-6">
          {/* Status Tracker */}
          <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Resolution Progress</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {steps.map((step, idx) => (
                  <li key={step.label}>
                    <div className="relative pb-8">
                      {idx !== steps.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            step.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : step.status === 'current'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <CheckCircle2 className="w-5 h-5" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                          </div>
                          <div className="text-right text-xs text-text-secondary whitespace-nowrap">
                            <time>{step.date}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ticket Information stats */}
          <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-md font-bold text-text-primary border-b border-gray-100 pb-2">Ticket Info</h3>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Report Count</span>
              </span>
              <span className="font-semibold text-text-primary">12 reports merged</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Created At</span>
              </span>
              <span className="font-semibold text-text-primary">Jul 20, 2026</span>
            </div>
            
            <button
              onClick={() => alert('Resolution signal reported.')}
              className="w-full mt-2 inline-flex justify-center items-center py-2 px-4 border border-green-300 text-xs font-bold rounded-button text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
            >
              Mark as Already Resolved
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
