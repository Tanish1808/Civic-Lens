import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, MapPin, Upload, Info, CheckCircle2, Loader2, 
  Compass, Layers, AlertCircle, X, ShieldCheck, ShieldAlert, LogIn 
} from 'lucide-react';
import api from '../../../services/api';

export default function SubmitReport() {
  const navigate = useNavigate();
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

  // Form states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [latitude, setLatitude] = useState(23.0225);
  const [longitude, setLongitude] = useState(72.5714);
  
  // UI states
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Processing Simulator States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1); // 1: upload, 2: classify, 3: merge, 4: done
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reportResult, setReportResult] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setSubmitError('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
        setSubmitError('');
      } else {
        setSubmitError('Invalid file type. Please drop an image file.');
      }
    }
  };

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(Number(position.coords.latitude.toFixed(6)));
        setLongitude(Number(position.coords.longitude.toFixed(6)));
        setIsFetchingLocation(false);
      },
      (error) => {
        console.error("Error fetching coordinates", error);
        setIsFetchingLocation(false);
        alert("Unable to fetch location. Defaulting to Ahmedabad center.");
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setSubmitError('Please select or capture a photo of the issue.');
      return;
    }
    setSubmitError('');
    setIsProcessing(true);
    setProcessingStep(1);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    
    if (selectedCategory) {
      formData.append('user_selected_category', selectedCategory);
    }
    if (description) {
      formData.append('description', description);
    }

    // Axios post request with upload progress binding
    api.post('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
        if (percentCompleted >= 100) {
          // Slow down step changes slightly so the user sees the transitions
          setTimeout(() => setProcessingStep(2), 800);
        }
      }
    })
      .then((response) => {
        setReportResult(response.data.data);
        
        // Simulate pipeline analysis states for visual confirmation
        setTimeout(() => {
          setProcessingStep(3);
          setTimeout(() => {
            setProcessingStep(4);
          }, 1200);
        }, 1200);
      })
      .catch((err) => {
        console.error('Error submitting report:', err);
        setIsProcessing(false);
        if (err.response && err.response.data) {
          const errMsg = err.response.data.error?.message || err.response.data.message || 'Failed to submit report. Please review form entries.';
          setSubmitError(errMsg);
        } else {
          setSubmitError('Unable to connect to the server. Please check your connection.');
        }
      });
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedCategory('');
    setDescription('');
    setIsProcessing(false);
    setProcessingStep(1);
    setUploadProgress(0);
    setReportResult(null);
  };

  // If citizen is not logged in, prompt them to sign in
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-card border border-gray-150 p-8 text-center space-y-6 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-text-primary">Authentication Required</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            To submit municipal reports, attach location coordinates, and participate in local problem solving, you must sign in.
          </p>
        </div>
        <Link
          to="/login"
          state={{ from: '/report-issue' }}
          className="w-full flex items-center justify-center gap-1.5 py-3 px-4 font-bold text-xs bg-primary text-white hover:bg-primary/95 rounded-button shadow-md shadow-primary/10 transition-all active:scale-97 cursor-pointer hover:scale-[1.02]"
        >
          <span>Sign In to Continue</span>
          <LogIn className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {/* 1. Main Form Screen */}
      {!isProcessing && (
        <div className="bg-white rounded-card shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 transition-all duration-300">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Report a Civic Issue</h1>
          <p className="text-sm text-text-secondary mb-6">
            Submit a photo and geotag of the infrastructure issue. Our AI will automatically classify category, severity, and merge duplicates.
          </p>

          {submitError && (
            <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-red-50 text-red-950 border border-red-200 rounded-card text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="font-semibold">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Glassmorphic AI Drop Zone ── */}
            <div>
              <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Upload Photo <span className="text-red-500">*</span>
              </label>

              {!filePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer group ${
                    isDragging ? 'scale-[1.01]' : ''
                  }`}
                  style={{
                    background: isDragging
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: isDragging
                      ? '2px dashed rgba(99,102,241,0.5)'
                      : '2px dashed rgba(203,213,225,0.7)',
                    boxShadow: isDragging
                      ? '0 0 30px rgba(99,102,241,0.12), inset 0 1px 1px rgba(255,255,255,0.8)'
                      : 'inset 0 1px 1px rgba(255,255,255,0.8)'
                  }}
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 dropzone-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Corner bracket accents */}
                  <div className={`absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 rounded-tl-lg transition-all duration-300 ${isDragging ? 'border-indigo-400 opacity-100' : 'border-gray-300 opacity-50 group-hover:opacity-100 group-hover:border-primary'}`} />
                  <div className={`absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 rounded-tr-lg transition-all duration-300 ${isDragging ? 'border-indigo-400 opacity-100' : 'border-gray-300 opacity-50 group-hover:opacity-100 group-hover:border-primary'}`} />
                  <div className={`absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 rounded-bl-lg transition-all duration-300 ${isDragging ? 'border-indigo-400 opacity-100' : 'border-gray-300 opacity-50 group-hover:opacity-100 group-hover:border-primary'}`} />
                  <div className={`absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 rounded-br-lg transition-all duration-300 ${isDragging ? 'border-indigo-400 opacity-100' : 'border-gray-300 opacity-50 group-hover:opacity-100 group-hover:border-primary'}`} />

                  {/* Scan line (visible when dragging) */}
                  {isDragging && (
                    <div className="absolute inset-x-0 h-px ai-scan-line ai-scan-glow pointer-events-none z-10"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.9), transparent)' }}
                    />
                  )}

                  <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
                    {/* Animated icon ring */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDragging
                        ? 'bg-indigo-100 dark:bg-indigo-950/40 scale-110'
                        : 'bg-gray-100/80 dark:bg-gray-800/60 group-hover:scale-105 group-hover:bg-primary/10'
                    }`}>
                      <Camera className={`w-6 h-6 transition-colors duration-300 ${isDragging ? 'text-indigo-500' : 'text-gray-400 group-hover:text-primary'}`} />
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="cursor-pointer font-black text-primary dark:text-amber-400 hover:underline">
                          Capture or Upload
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                        </label>
                        {' '}a photo
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Drag & drop · PNG, JPEG up to 8MB</p>
                      <p className="text-[10px] text-primary/70 dark:text-amber-500/60 mt-1.5 font-semibold tracking-wide uppercase">⚡ AI will auto-classify your report</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/40 bg-gray-50 shadow-xl group">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-3 right-3 p-1.5 rounded-full text-white transition-all duration-200 hover:scale-110"
                    style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* Scan line on image preview */}
                  <div className="absolute inset-x-0 h-px ai-scan-line pointer-events-none opacity-60"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.8), transparent)' }}
                  />
                  {/* AI ready badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: '#fbbf24' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    AI Ready
                  </div>
                </div>
              )}
            </div>

            {/* Geotag Confirmation Panel */}
            <div className="bg-gray-50/50 p-4 rounded-card border border-gray-200/60">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Geotag Coordinates</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  GPS Active
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="flex-1 bg-white border border-gray-200 rounded-button px-3.5 py-2.5 text-xs font-mono text-text-secondary w-full">
                  Latitude: {latitude} | Longitude: {longitude}
                </div>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={isFetchingLocation}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 bg-primary/5 rounded-button transition-colors whitespace-nowrap disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {isFetchingLocation ? 'Fetching...' : 'Fetch Location'}
                </button>
              </div>
            </div>

            {/* Category Advisor Select */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Category Advisor (Optional advice for AI)
              </label>
              <select
                id="category"
                className="mt-1 block w-full pl-3 pr-10 py-2.5 border border-gray-200 bg-white/60 focus:bg-white rounded-button shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-300"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Let AI Classify Automatically</option>
                <option value="pothole">Pothole</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="streetlight">Broken Streetlight</option>
                <option value="garbage">Garbage / Dumping</option>
              </select>
            </div>

            {/* Description Area */}
            <div>
              <label htmlFor="description" className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Short Description (Optional)
              </label>
              <textarea
                id="description"
                rows={3}
                maxLength={200}
                className="shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary mt-1 block w-full sm:text-sm border border-gray-200 rounded-button px-3.5 py-2 bg-white/60 focus:bg-white transition-all duration-300 focus:outline-none"
                placeholder="Describe any helpful context details (max 200 characters)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="text-right text-[10px] text-text-secondary mt-1 font-semibold">
                {description.length}/200
              </div>
            </div>

            {/* Manual Review Alert */}
            <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-card border border-blue-100 text-blue-900 text-xs leading-relaxed">
              <Info className="w-5 h-5 flex-shrink-0 text-primary mt-0.5" />
              <p>
                <strong>Triage Fallback:</strong> If automated classification confidence falls below the model's configured thresholds, the ticket is routed directly to the Manual Review Queue for human validation.
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-98"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span>Submit Civic Report</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Glassmorphic AI Processing Simulator ── */}
      {isProcessing && (
        <div
          className="rounded-2xl p-6 md:p-8 space-y-7 max-w-xl mx-auto"
          style={{
            background: 'rgba(11,15,25,0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(245,158,11,0.15)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4" style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-xs font-black text-amber-400 uppercase tracking-widest">AI Inference Pipeline</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-400"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              ⚡ Live
            </span>
          </div>

          {/* Image with scan overlay */}
          {filePreview && (
            <div className="relative w-full h-32 rounded-xl overflow-hidden">
              <img src={filePreview} alt="Scanning" className="w-full h-full object-cover opacity-70" />
              {/* Dark glass overlay */}
              <div className="absolute inset-0" style={{ background: 'rgba(11,15,25,0.5)' }} />
              {/* Pulsing laser scan line */}
              <div
                className="absolute inset-x-0 h-[2px] ai-scan-line ai-scan-glow pointer-events-none z-10"
                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(245,158,11,1) 30%, rgba(251,191,36,1) 50%, rgba(245,158,11,1) 70%, transparent 100%)' }}
              />
              {/* Scan grid lines */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-amber-400 opacity-80" />
              <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-amber-400 opacity-80" />
              <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-amber-400 opacity-80" />
              <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-amber-400 opacity-80" />
              {/* Status label */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[9px] font-black text-amber-300 uppercase tracking-widest"
                style={{ background: 'rgba(11,15,25,0.7)', backdropFilter: 'blur(8px)' }}
              >
                {processingStep === 1 ? 'Uploading...' : processingStep === 2 ? 'Classifying...' : processingStep === 3 ? 'Scanning Geo...' : '✓ Complete'}
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-5">

            {/* Step 1: Upload */}
            <div className="flex items-start gap-4">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                processingStep > 1
                  ? 'bg-green-500/15 border border-green-500/30'
                  : 'border border-amber-500/30 bg-amber-500/10'
              }`} style={processingStep === 1 ? { animation: 'spin 1s linear infinite' } : {}}>
                {processingStep > 1 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Loader2 className="w-4 h-4 text-amber-400" />}
              </div>
              <div className="flex-1 space-y-1.5 pt-0.5">
                <h3 className="text-sm font-bold text-white">1. Uploading to Cloudinary CDN</h3>
                {processingStep === 1 && (
                  <div className="w-full rounded-full h-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-1 rounded-full transition-all duration-200"
                      style={{
                        width: `${uploadProgress}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      }}
                    />
                  </div>
                )}
                {processingStep > 1 && <p className="text-[11px] text-gray-500">✓ Image hosted on Cloudinary.</p>}
              </div>
            </div>

            {/* Step 2: Classification */}
            <div className="flex items-start gap-4">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                processingStep > 2
                  ? 'bg-green-500/15 border border-green-500/30'
                  : processingStep === 2
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'border border-gray-700 bg-gray-800/60'
              }`} style={processingStep === 2 ? { animation: 'pulse 1s ease-in-out infinite' } : {}}>
                {processingStep > 2 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Compass className={`w-4 h-4 ${processingStep === 2 ? 'text-amber-400 animate-spin' : 'text-gray-600'}`} />}
              </div>
              <div className="flex-1 space-y-1 pt-0.5">
                <h3 className={`text-sm font-bold ${processingStep >= 2 ? 'text-white' : 'text-gray-600'}`}>2. Computer Vision Inference</h3>
                {processingStep === 2 && <p className="text-[11px] text-amber-400/80 animate-pulse">Analyzing category & severity flags...</p>}
                {processingStep > 2 && <p className="text-[11px] text-gray-500">Category: <span className="text-white capitalize">{selectedCategory || 'Auto-classified'}</span></p>}
              </div>
            </div>

            {/* Step 3: Geo Duplicate */}
            <div className="flex items-start gap-4">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                processingStep > 3
                  ? 'bg-green-500/15 border border-green-500/30'
                  : processingStep === 3
                  ? 'bg-amber-500/10 border border-amber-500/30'
                  : 'border border-gray-700 bg-gray-800/60'
              }`}>
                {processingStep > 3 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Layers className={`w-4 h-4 ${processingStep === 3 ? 'text-amber-400 animate-bounce' : 'text-gray-600'}`} />}
              </div>
              <div className="flex-1 space-y-1 pt-0.5">
                <h3 className={`text-sm font-bold ${processingStep >= 3 ? 'text-white' : 'text-gray-600'}`}>3. Geospatial Duplicate Scan</h3>
                {processingStep === 3 && <p className="text-[11px] text-amber-400/80 animate-pulse">Running MongoDB 2dsphere check...</p>}
                {processingStep > 3 && (
                  <p className="text-[11px] text-gray-500">
                    {reportResult?.status === 'merged'
                      ? '⚠ Duplicate detected — merged into master ticket.'
                      : '✓ No duplicates. New ticket registered.'}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Success card */}
          {processingStep === 4 && (
            <div
              className="p-5 rounded-xl space-y-4"
              style={{
                background: 'rgba(34,197,94,0.06)',
                border: '1px solid rgba(34,197,94,0.2)',
                boxShadow: '0 0 20px rgba(34,197,94,0.06)'
              }}
            >
              <div className="flex gap-2.5 text-xs text-green-400 items-start leading-relaxed font-semibold">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p>
                  {reportResult?.status === 'manual_review'
                    ? 'Report logged! ML offline — routed to Manual Review Queue.'
                    : reportResult?.status === 'merged'
                    ? 'Duplicate matched! Merged with active ticket — priority raised.'
                    : 'Report registered! New ticket opened for investigation.'
                  }
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-gray-300 transition-all duration-200 hover:text-white cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Report Another
                </button>
                {reportResult?.ticket_id && (
                  <Link
                    to={`/ticket/${reportResult.ticket_id}`}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black text-center transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#0B0F19' }}
                  >
                    View Ticket
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
