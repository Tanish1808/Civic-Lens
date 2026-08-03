import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Upload, Info, CheckCircle2, Loader2, Compass, Layers, AlertCircle, X, ShieldCheck } from 'lucide-react';

export default function SubmitReport() {
  // Form states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Processing Simulator States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(1); // 1: upload, 2: classify, 3: merge, 4: done
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessingStep(1);
    setUploadProgress(0);
  };

  // Simulate the multi-step AI process pipeline
  useEffect(() => {
    if (!isProcessing) return;

    let timer;
    if (processingStep === 1) {
      // Simulate file upload progress bar
      timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setProcessingStep(2);
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    } else if (processingStep === 2) {
      // Simulate ML classification running
      timer = setTimeout(() => {
        setProcessingStep(3);
      }, 2000);
    } else if (processingStep === 3) {
      // Simulate duplicate check sonar query
      timer = setTimeout(() => {
        setProcessingStep(4);
      }, 2000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timer);
    };
  }, [isProcessing, processingStep]);

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedCategory('');
    setDescription('');
    setIsProcessing(false);
    setProcessingStep(1);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      
      {/* 1. Main Form Screen */}
      {!isProcessing && (
        <div className="bg-white rounded-card shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8 transition-all duration-300">
          <h1 className="text-2xl font-bold text-text-primary mb-2">Report a Civic Issue</h1>
          <p className="text-sm text-text-secondary mb-6">
            Submit a photo and geotag of the infrastructure issue. Our AI will automatically classify category, severity, and merge duplicates.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Custom Drag-and-Drop / Camera Area */}
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                Upload Photo <span className="text-red-500">*</span>
              </label>

              {!filePreview ? (
                <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-gray-200 border-dashed rounded-card hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer relative group">
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary group-hover:scale-105 transition-all duration-300 flex items-center justify-center bg-gray-50 rounded-full">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div className="flex text-sm text-text-secondary justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white/0 rounded-md font-bold text-primary hover:text-primary/90 focus-within:outline-none">
                        <span>Capture or Upload</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*" 
                          required 
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">photo</p>
                    </div>
                    <p className="text-xs text-text-secondary">PNG, JPEG up to 8MB</p>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full rounded-card overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center shadow-inner">
                  <img src={filePreview} alt="Preview" className="h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors duration-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
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
                <div className="flex-1 bg-white border border-gray-200 rounded-button px-3.5 py-2 text-xs font-mono text-text-secondary w-full">
                  Latitude: 23.0225 | Longitude: 72.5714
                </div>
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 border border-primary/20 bg-primary/5 rounded-button transition-colors whitespace-nowrap"
                >
                  Fetch Location
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 active:scale-98"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span>Submit Civic Report</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Interactive AI Processing Simulator Screen */}
      {isProcessing && (
        <div className="bg-[#0B0F19] text-white rounded-card shadow-2xl border border-gray-800 p-6 md:p-8 space-y-8 max-w-xl mx-auto transition-all duration-500 animate-in zoom-in-95">
          {/* Simulator Header */}
          <div className="flex justify-between items-center border-b border-gray-800 pb-4">
            <h2 className="text-md font-bold tracking-tight text-amber-500 uppercase tracking-widest text-xs">AI Inference Simulator</h2>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-bold uppercase tracking-widest animate-pulse">
              Live Pipeline
            </span>
          </div>

          {/* Running steps checklist */}
          <div className="space-y-6">
            
            {/* Step 1: Upload */}
            <div className="flex items-start gap-4">
              <span className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                processingStep > 1 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-spin'
              }`}>
                {processingStep > 1 ? <CheckCircle2 className="w-4 h-4 animate-in zoom-in" /> : <Loader2 className="w-4 h-4" />}
              </span>
              <div className="flex-1 space-y-1.5">
                <h3 className="text-sm font-semibold">1. Uploading image to Cloudinary CDN</h3>
                {processingStep === 1 && (
                  <div className="w-full bg-gray-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
                {processingStep > 1 && <p className="text-[11px] text-gray-500">Image successfully hosted on Cloudinary.</p>}
              </div>
            </div>

            {/* Step 2: Classification */}
            <div className="flex items-start gap-4">
              <span className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                processingStep > 2 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : processingStep === 2
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-gray-800 text-gray-600 border border-gray-800'
              }`}>
                {processingStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />
                ) : processingStep === 2 ? (
                  <Compass className="w-4 h-4 animate-spin" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
              </span>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold">2. Running Computer Vision Inference</h3>
                {processingStep === 2 && <p className="text-[11px] text-amber-500/80 animate-pulse">Analyzing category & severity flags...</p>}
                {processingStep > 2 && (
                  <p className="text-[11px] text-gray-500 font-semibold">
                    Category: <span className="text-white">Pothole (98.6% Conf.)</span> | Severity: <span className="text-red-400">High</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Duplicate Merge */}
            <div className="flex items-start gap-4">
              <span className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                processingStep > 3 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : processingStep === 3
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                  : 'bg-gray-800 text-gray-600 border border-gray-800'
              }`}>
                {processingStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 animate-in zoom-in" />
                ) : processingStep === 3 ? (
                  <Layers className="w-4 h-4 animate-bounce" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
              </span>
              <div className="flex-1 space-y-1">
                <h3 className="text-sm font-semibold">3. Scanning Geospatial Duplicate Loop</h3>
                {processingStep === 3 && <p className="text-[11px] text-amber-500/80 animate-pulse">Running MongoDB 2dsphere check...</p>}
                {processingStep > 3 && (
                  <p className="text-[11px] text-gray-500">
                    Duplicate found within 20m. Merged into <span className="text-amber-500 font-semibold">Ticket #104</span>.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* 4. Done success card */}
          {processingStep === 4 && (
            <div className="bg-gray-800/30 border border-gray-800/80 p-5 rounded-card space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex gap-2.5 text-xs text-green-400 items-start leading-relaxed font-semibold">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p>
                  Thanks for contributing! Your report has been merged with Ticket #104. Commuters upvotes now total 13, increasing resolution priority.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-button text-xs font-semibold transition-colors text-center"
                >
                  Report Another
                </button>
                <button
                  onClick={() => alert('Redirecting to ticket details.')}
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-[#0B0F19] rounded-button text-xs font-bold transition-colors text-center"
                >
                  View Ticket
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
