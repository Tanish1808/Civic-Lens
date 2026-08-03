import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, MapPin, Clock, Calendar, CheckCircle2, User, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

export default function TicketDetail() {
  const { id } = useParams();
  
  // Upvote states
  const [upvotes, setUpvotes] = useState(12);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  // Carousel Mock photos
  const photos = [
    { url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80', uploadedBy: 'Rohan Sharma', date: 'Jul 20, 2026' },
    { url: 'https://images.unsplash.com/photo-1599740831146-80a8352307a8?auto=format&fit=crop&w=800&q=80', uploadedBy: 'Priya Patel', date: 'Jul 21, 2026' }
  ];
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
    }
  };

  const steps = [
    { label: 'Reported', status: 'completed', desc: 'Report submitted by Rohan Sharma.', date: 'Jul 20, 2026' },
    { label: 'Verified', status: 'completed', desc: 'Auto-verified: threshold of 5 reports crossed.', date: 'Jul 21, 2026' },
    { label: 'Acknowledged', status: 'current', desc: 'Acknowledged by Public Works Dept (Zone 4).', date: 'Jul 22, 2026' },
    { label: 'In Progress', status: 'upcoming', desc: 'Repair crew dispatched scheduling.', date: '' },
    { label: 'Resolved', status: 'upcoming', desc: 'Awaiting completion confirmation.', date: '' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 Columns) - Details, Slideshow, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 pb-6">
              <div className="space-y-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                  High Priority
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Pothole on MG Road Highway</h1>
                <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>Sector 4, MG Road (Near Bus Stop)</span>
                </p>
              </div>

              {/* Glowing Upvote Trigger */}
              <button
                onClick={handleUpvote}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-extrabold rounded-button border transition-all duration-300 active:scale-95 ${
                  hasUpvoted
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current animate-bounce' : ''}`} />
                <span>Upvotes ({upvotes})</span>
              </button>
            </div>

            {/* Custom Carousel */}
            <div className="relative aspect-video w-full bg-gray-50 rounded-card overflow-hidden border border-gray-100 group shadow-inner">
              <img 
                src={photos[activePhotoIdx].url} 
                alt="Civic Issue" 
                className="w-full h-full object-cover transition-all duration-500" 
              />
              
              {/* Overlay Metadata */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white text-xs flex justify-between items-end backdrop-blur-[1px]">
                <div className="space-y-0.5">
                  <p className="font-bold flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Submitted by {photos[activePhotoIdx].uploadedBy}</span>
                  </p>
                  <p className="text-gray-300 text-[10px]">Uploaded on {photos[activePhotoIdx].date}</p>
                </div>
                <span className="px-2 py-0.5 bg-white/20 rounded backdrop-blur-md text-[10px] font-bold">
                  {activePhotoIdx + 1} / {photos.length}
                </span>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Description content */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Description</h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Large, deep pothole in the middle lane of the highway. Commuters riding two-wheelers frequently swerve dangerously to avoid it. It gets completely filled with water during rains, making it invisible and highly hazardous. Needs immediate hot mix asphalt patching.
              </p>
            </div>

          </div>

          {/* Comments section */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Comments (1)</span>
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3 text-sm border-b border-gray-100 pb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs border border-primary/20">
                  PS
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-text-primary">Priya Sharma</span>
                    <span className="text-[10px] text-text-secondary">2 days ago</span>
                  </div>
                  <p className="text-text-secondary text-sm mt-1">This has been worsening since the heavy rains last week. Commuters are swerving onto oncoming lanes. Thanks for reporting!</p>
                </div>
              </div>
            </div>

            {/* Comment Form input */}
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a supportive comment or update..."
                className="flex-1 min-w-0 border border-gray-200 bg-gray-50/50 rounded-button px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-300"
              />
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-colors shadow-md shadow-primary/10"
              >
                Post Comment
              </button>
            </form>
          </div>

        </div>

        {/* Right Column (4 Columns) - Stepper Progress & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Glowing Vertical Timeline Stepper */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-6">
            <h2 className="text-lg font-bold text-text-primary border-b border-gray-100 pb-4">Resolution Progress</h2>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {steps.map((step, idx) => (
                  <li key={step.label}>
                    <div className="relative pb-8">
                      {idx !== steps.length - 1 && (
                        <span className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                          step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                        }`} aria-hidden="true" />
                      )}
                      
                      <div className="relative flex space-x-3 items-start">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white transition-all duration-300 ${
                            step.status === 'completed'
                              ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                              : step.status === 'current'
                              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 animate-pulse'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5 space-y-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-sm font-bold text-text-primary">{step.label}</p>
                            <span className="text-[10px] text-text-secondary font-mono">{step.date}</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{step.desc}</p>
                        </div>
                      </div>

                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ticket Metadata statistics */}
          <div className="bg-white rounded-card shadow-xl shadow-gray-200/40 border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-gray-100 pb-2">Ticket Metadata</h3>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Merged Reports</span>
              </span>
              <span className="font-bold text-text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px]">12 submissions</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Created Date</span>
              </span>
              <span className="font-bold text-text-primary">Jul 20, 2026</span>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <button
                onClick={() => alert('Resolution feedback recorded.')}
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 border border-green-300 text-xs font-bold rounded-button text-green-700 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Already Resolved</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
