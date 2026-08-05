import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Map, MapPin, ShieldAlert, Award, ArrowRight, CheckCircle2, AlertTriangle, Layers, ChevronDown, ChevronUp, Star, Quote, ArrowUpRight, Github, X, Loader2 } from 'lucide-react';
import api from '../../../services/api';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);

  // Form states for support portal
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMunicipality, setContactMunicipality] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactError, setContactError] = useState('');

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactError('');

    api.post('/support-requests', {
      name: contactName,
      email: contactEmail,
      municipality: contactMunicipality,
      details: contactDetails
    })
      .then(() => {
        setIsSubmittingContact(false);
        setContactSubmitted(true);
        // Clear inputs
        setContactName('');
        setContactEmail('');
        setContactMunicipality('');
        setContactDetails('');
      })
      .catch((err) => {
        console.error('Contact submission failed:', err);
        setIsSubmittingContact(false);
        const errMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Failed to submit request. Please try again.';
        setContactError(errMsg);
      });
  };

  const faqs = [
    {
      q: "How does the AI duplicate detector work?",
      a: "When you upload an issue, Civic Lens queries the database for active reports within a 20-meter radius using MongoDB 2dsphere indexing. It then compares image features to verify if they are of the same physical issue. If they match, they are merged into one ticket to avoid spamming the ward engineer."
    },
    {
      q: "How do you prevent spam reports?",
      a: "We use three verification layers: active mobile GPS checks, AI image validity analysis (ensuring it is not a photo of a screen or internet picture), and community verification (other local citizens upvoting the report)."
    },
    {
      q: "Who is responsible for fixing the reported issues?",
      a: "Civic Lens automatically routes verified tickets to the corresponding municipal ward engineer (e.g., Road & Buildings Department for potholes, Streetlight Division for outages) of your local municipality."
    },
    {
      q: "Is there any charge for citizens to report issues?",
      a: "No, Civic Lens is completely free for all citizens. It is a civic utility designed to bring transparent accountability to municipal management."
    }
  ];

  return (
    <div className="bg-[#FAFBFD] min-h-screen flex flex-col justify-between overflow-x-hidden text-text-primary animate-in fade-in duration-500">
      
      {/* 1. Hero Section with Mesh Gradient */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        
        {/* Soft Background Mesh Blobs */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-20 right-1/4 translate-x-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              <span>AI-Powered Civic Accountability</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Bring Accountability <br />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">To Your Neighborhood</span>
            </h1>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
              Report infrastructure defects with a single geotagged photo. Civic Lens uses machine learning to auto-classify issues and group duplicate neighborhood reports under a single high-priority ticket—placing transparent resolution pressure on local authorities.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/report"
                className="flex items-center gap-2.5 px-8 py-4 text-sm font-extrabold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 animate-bounce-short"
              >
                <Camera className="w-4 h-4" />
                <span>Report an Issue</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 px-8 py-4 text-sm font-extrabold rounded-button bg-white text-text-primary border border-gray-200 hover:bg-gray-50/80 transition-all duration-300 shadow-sm active:scale-95"
              >
                <Map className="w-4 h-4 text-primary" />
                <span>View Live Heatmap</span>
              </Link>
            </div>
          </div>

          {/* Right Column: AI Simulator Mockup Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-white rounded-card shadow-2xl shadow-gray-200/80 border border-gray-100 p-6 relative overflow-hidden transition-all duration-500 hover:shadow-primary/5 hover:scale-[1.01]">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">AI Inference Engine</span>
              </div>

              <div className="relative aspect-video bg-gray-900 rounded-card overflow-hidden flex items-center justify-center border border-gray-200/50">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent/80 shadow-md shadow-accent animate-[bounce_3s_infinite]" />
                <div className="w-full h-full p-4 flex flex-col justify-between items-center text-gray-500 text-xs">
                  <div className="self-start px-2 py-1 bg-black/60 rounded backdrop-blur-sm text-[10px] text-white flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                    <span>23.0225° N, 72.5714° E</span>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">Image Scanning</span>
                  <div className="self-end px-2 py-1 bg-black/60 rounded backdrop-blur-sm text-[10px] text-white font-mono">
                    <span>98.6% CONFIDENCE</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Classified:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                    <span>Pothole</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Severity:</span>
                  <span className="px-2 py-0.5 rounded-full font-bold uppercase text-[9px] bg-red-100 text-red-800 tracking-wider">
                    High Priority
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Geospatial scan:</span>
                  <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Merged to Ticket #104</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Social Proof / Impact Metrics */}
      <section className="bg-white border-y border-gray-200/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
            Empowering Citizen-Led Change Across Cities
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-primary">45,000+</h4>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Active Citizens</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-primary">12,400+</h4>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Resolved Tickets</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-primary">4.2 Days</h4>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Avg. Resolution Speed</p>
            </div>
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-primary">92.4%</h4>
              <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Model Accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features & Benefits */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-text-primary">Advanced Civic Technology</h2>
            <p className="text-sm text-text-secondary">Engineered to bring clean structures and speed to public utility feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-card border border-gray-105 shadow-md hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-blue-50 text-primary rounded-card shadow-sm mb-6">
                <Camera className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-lg">AI Category Classifier</h3>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                Our computer vision models analyze your photo uploads to automatically tag the defect class (Potholes, Waterlogging, Lights, Dumps) and assign priority flags.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-card border border-gray-105 shadow-md hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-amber-50 text-accent rounded-card shadow-sm mb-6">
                <Layers className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-lg">Geospatial De-duplication</h3>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                MongoDB query systems match adjacent complaints reported in close coordinates. Instead of 20 split calls, ward engineers receive one aggregated dashboard ticket.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-card border border-gray-105 shadow-md hover:border-primary/20 hover:-translate-y-1.5 transition-all duration-300">
              <span className="inline-flex p-3 bg-green-50 text-green-600 rounded-card shadow-sm mb-6">
                <Award className="w-6 h-6" />
              </span>
              <h3 className="font-bold text-text-primary text-lg">Community Verification</h3>
              <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                Citizens upvote existing neighborhood issues, sign off completed repairs, and verify resolved statuses, creating transparent public pressure.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 bg-white border-t border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-text-primary">How It Works</h2>
            <p className="text-sm text-text-secondary">Transforming report pictures into local resolutions in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto shadow-md">1</div>
              <h3 className="font-bold text-text-primary text-md">Snap & Upload</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                Capture the infrastructure defect. The system automatically tags your precise GPS location.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto shadow-md">2</div>
              <h3 className="font-bold text-text-primary text-md">AI De-duplication</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                The platform verifies category features and links reports with neighboring tickets dynamically.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mx-auto shadow-md">3</div>
              <h3 className="font-bold text-text-primary text-md">Municipal Dispatch</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto leading-relaxed">
                Ward departments receive clean tickets and track repair stages down to citizen resolution confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-text-primary">Voice of the Citizens</h2>
            <p className="text-sm text-text-secondary font-medium">Real reviews from resident users and municipal authorities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-card border border-gray-150 shadow-md relative">
              <Quote className="w-8 h-8 text-primary/10 absolute top-6 right-6" />
              <div className="flex gap-1.5 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed italic mb-6">
                "There was a dangerous pothole near our society's gate that caused two scooter accidents. We uploaded it on Civic Lens. Ten neighbors upvoted it the same day. Within four days, the municipality road division patched it!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  RM
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Rajesh Mehta</h4>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Resident, Sector 4</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-card border border-gray-150 shadow-md relative">
              <Quote className="w-8 h-8 text-primary/10 absolute top-6 right-6" />
              <div className="flex gap-1.5 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed italic mb-6">
                "As municipal engineers, we are often overwhelmed by dozens of residents calling about the same broken pipe. Civic Lens aggregates duplicates geospatial-wise. It lets us prioritize works on a clean dashboard."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm">
                  AV
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-primary">Amit Verma</h4>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Assistant Ward Engineer</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Pricing Section (Public utility statement card) */}
      <section className="py-20 bg-white border-y border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-150 text-xs font-bold uppercase tracking-wide">
            <span>Free Public Utility</span>
          </div>
          <h2 className="text-3xl font-extrabold text-text-primary">Zero Fees. 100% Transparency.</h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Civic Lens is built as an open-access public service framework. Citizens pay nothing to report. Municipal dashboards are integrated as free modules to optimize administrative efficiency and city trust.
          </p>
          <div className="bg-bg-light/60 p-6 rounded-card border border-gray-100 flex flex-col sm:flex-row justify-around items-center gap-4 text-left max-w-2xl mx-auto">
            <div>
              <h4 className="font-bold text-sm text-text-primary">Looking to pilot in your city?</h4>
              <p className="text-xs text-text-secondary mt-1">Get custom municipal dashboards and reports integration.</p>
            </div>
            <button 
              onClick={() => { setShowContactModal(true); setContactSubmitted(false); }}
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-button text-xs transition-colors whitespace-nowrap active:scale-95 transition-transform"
            >
              Contact Admin Support
            </button>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-20 bg-bg-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-text-primary">Frequently Asked Questions</h2>
            <p className="text-sm text-text-secondary">Everything you need to know about Civic Lens operations.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-card border border-gray-150 overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-bold text-sm text-text-primary hover:bg-gray-50/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-text-secondary leading-relaxed border-t border-gray-50/50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="relative py-20 bg-[#0B0F19] text-white overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Clean Up Your Streets?
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of active citizens who are mapping defects, voting on priority resolutions, and holding administrative bodies accountable.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold rounded-button bg-primary text-white hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              <Camera className="w-4 h-4" />
              <span>Report Issue Now</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-8 py-3.5 text-xs font-bold rounded-button bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 transition-colors"
            >
              <span>Register Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer Section */}
      <footer className="bg-[#070A11] border-t border-gray-900/60 py-12 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-900 pb-8">
          
          {/* Logo brand footer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary text-white p-2 rounded-card">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Civic<span className="text-primary font-normal">Lens</span>
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed">
              AI-driven crowdsourcing tool translating visual complaint photos into immediate municipal solutions.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Citizen Portal</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Map Dashboard</Link></li>
              <li><Link to="/report" className="hover:text-white transition-colors">Submit Report</Link></li>
              <li><Link to="/my-reports" className="hover:text-white transition-colors">My Submissions</Link></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Civic Resources</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowGuidelinesModal(true)} 
                  className="hover:text-white transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-gray-400 font-semibold"
                >
                  Reporting Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowContactModal(true)} 
                  className="hover:text-white transition-colors text-left bg-transparent border-none p-0 cursor-pointer text-gray-400 font-semibold"
                >
                  Contact Support Portal
                </button>
              </li>
              <li><a href="https://data.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">National Open Data</a></li>
              <li className="text-gray-500 font-semibold text-[11px] select-none">AMC Helpline: 155303</li>
            </ul>
          </div>

          {/* Social connections */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Project Resources</h4>
            <div className="flex gap-3">
              <a 
                href="https://github.com/Tanish1808/Civic-Lens" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-gray-900 rounded-full hover:bg-gray-800 hover:text-white transition-colors inline-flex"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
            <p className="text-gray-500">Ahmedabad Municipal Pilot Project.</p>
          </div>

        </div>

        {/* copyright tag */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500">
          <p>© 2026 Civic Lens. All rights reserved. Open-source under MIT Licence.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:underline">Privacy Policy</Link>
            <Link to="#" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Contact Admin Support Modal Overlay */}
      {showContactModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowContactModal(false)}
          />
          
          {/* Modal Card */}
          <div className="bg-white rounded-card shadow-2xl border border-gray-150 p-6 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!contactSubmitted ? (
              <form 
                onSubmit={handleContactSubmit}
                className="space-y-4 text-left"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-primary">Contact Support Portal</h3>
                  <p className="text-xs text-text-secondary">Request custom ward dashboards or pilot integration details.</p>
                </div>

                {contactError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-button text-red-700 text-xs font-semibold">
                    {contactError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Rohan Sharma" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-gray-200 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white/80" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Official Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="rohan@ahmedabadmunicipal.gov.in" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white/80" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Municipality / City</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ahmedabad Municipal Corporation" 
                      value={contactMunicipality}
                      onChange={(e) => setContactMunicipality(e.target.value)}
                      className="w-full border border-gray-200 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white/80" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Request Details</label>
                    <textarea 
                      required 
                      rows={3} 
                      placeholder="We would like to request a demo of the municipal dashboard for our city zone..." 
                      value={contactDetails}
                      onChange={(e) => setContactDetails(e.target.value)}
                      className="w-full border border-gray-200 rounded-button px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary bg-white/80" 
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-xs font-bold text-text-primary rounded-button bg-white hover:bg-gray-50 transition-colors text-center"
                    disabled={isSubmittingContact}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold rounded-button shadow-md shadow-primary/10 transition-colors text-center flex items-center justify-center gap-1.5"
                    disabled={isSubmittingContact}
                  >
                    {isSubmittingContact ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-text-primary">Request Submitted!</h3>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                    Thank you. Our administration support team will review your credentials and contact you within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-6 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-button shadow-md transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Guidelines Modal Overlay */}
      {showGuidelinesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setShowGuidelinesModal(false)}
          />
          
          {/* Modal Card */}
          <div className="bg-white rounded-card shadow-2xl border border-gray-150 p-6 max-w-md w-full relative z-10 animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setShowGuidelinesModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-primary">Reporting Guidelines</h3>
                <p className="text-xs text-text-secondary">Follow these steps to submit clear, actionable civic complaints.</p>
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3.5 text-xs text-text-primary">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="font-bold">Capture a Clear Photo</h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Take a clear, well-lit photo of the street defect. Avoid taking pictures of computer screens or old paper printouts.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="font-bold">Provide High-Accuracy GPS Location</h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Enable GPS/location permissions in your browser so the map pin accurately matches where the issue is happening.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="font-bold">Pick the Correct Category</h4>
                    <p className="text-text-secondary text-[11px] leading-relaxed">Categorize your issue correctly (e.g. pothole, garbage, streetlight, or waterlogging) to ensure automatic routing to the right department.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex">
                <button
                  onClick={() => setShowGuidelinesModal(false)}
                  className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold rounded-button shadow-md shadow-primary/10 transition-colors text-center"
                >
                  Got It, Thanks!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
