import React, { useState } from 'react';
import { Camera, MapPin, Upload, Info } from 'lucide-react';

export default function SubmitReport() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully! ML analysis and duplicate detection running.');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-card shadow-sm border border-gray-100 p-6 md:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Report a Civic Issue</h1>
        <p className="text-sm text-text-secondary mb-6">
          Submit a photo and geotag of the infrastructure issue. Our AI will categorize, prioritize, and check for existing tickets automatically.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload area */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Upload Photo <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-card hover:border-primary transition-colors cursor-pointer">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-text-secondary">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-semibold text-primary hover:text-primary/95 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" required />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-text-secondary">PNG, JPG up to 8MB</p>
              </div>
            </div>
          </div>

          {/* Location Picker Section */}
          <div className="bg-gray-50 p-4 rounded-card border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Geotag Location</span>
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:text-primary/95 flex items-center gap-1"
              >
                Get Current Location
              </button>
            </div>
            <div className="h-40 bg-gray-200 rounded-card flex items-center justify-center text-text-secondary text-sm">
              [ Map Selector Placeholder (Leaflet.js integration) ]
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-text-primary mb-1">
              Category (Optional advice for AI)
            </label>
            <select
              id="category"
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 bg-white rounded-button shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Let AI Classify Automatically</option>
              <option value="pothole">Pothole</option>
              <option value="waterlogging">Waterlogging / Drainage</option>
              <option value="streetlight">Broken Streetlight</option>
              <option value="garbage">Garbage / Illegal Dumping</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-text-primary mb-1">
              Short Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={200}
              className="shadow-sm focus:ring-primary focus:border-primary mt-1 block w-full sm:text-sm border border-gray-300 rounded-button px-3 py-2"
              placeholder="Provide any helpful details (max 200 characters)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="text-right text-xs text-text-secondary mt-1">
              {description.length}/200
            </div>
          </div>

          {/* Banner notification */}
          <div className="flex items-start gap-2.5 bg-blue-50 p-4 rounded-card border border-blue-100 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Reliability Fallback:</strong> If the automated AI classification is low confidence or runs into service limits, your report will be placed in a Manual Review Queue for immediate human triage.
            </p>
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-button shadow-md text-sm font-semibold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              <span>Submit Civic Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
