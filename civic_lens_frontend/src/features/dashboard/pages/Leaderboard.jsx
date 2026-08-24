/**
 * ==============================================================================
 * CIVIC LENS — COMMUNITY LEADERBOARD (PAGE 6 OF 14 REDESIGN)
 * ==============================================================================
 * 
 * DESIGN MANDATE:
 * - Replaced the generic gold/amber gamification theme (crowns, glowing gold gradients,
 *   floating pill toggles, flame icons) with the established Civic Lens design system:
 *   Deep Survey Ink (#10263A), Warm Paper (#F6F2E9), Hairline Dividers (#D8D2C2),
 *   Civic Blue (#1E5F8C), and Signal Amber (#E8A33D) used strictly as a single accent.
 * - Tab Switcher: Restyled into a crisp architectural segmented control with 6px rounded
 *   corners and mono indicators, eliminating floating rounded-full pills.
 * - Top Contributors: Rebuilt the top-3 ranking into structured survey cards with
 *   JetBrains Mono rank tags (`#01 · TOP ADVOCATE`, `#02`, `#03`), clean data cells for
 *   Reports / Verifications / Civic XP, and restrained Signal Amber highlighting on Rank 1.
 * - Ward Performance: Formatted as a civic inspection audit table with JetBrains Mono
 *   metrics, responsive mobile-card fallbacks, and sleek Civic Blue progress bars.
 * 
 * DATA HONESTY NOTE:
 * - The backend endpoints (/users/leaderboard and /analytics/wards) currently return
 *   static/unseeded values for certain attributes (e.g., constant "3.2 Days" resolution
 *   speed, default 4.5 satisfaction rating, and 0 pts for unseeded users). Per instructions,
 *   all existing data-fetching logic and fields are preserved exactly without fabricating
 *   artificial numbers.
 * ==============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, ShieldCheck, MapPin, Star, Clock, Loader2, 
  User as UserIcon, CheckCircle2, Crosshair, ArrowRight, 
  Layers, Users, Building2, ChevronRight, Activity, Sparkles, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('citizens'); // 'citizens' | 'wards'
  const [citizenContributors, setCitizenContributors] = useState([]);
  const [wardPerformance, setWardPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 'citizens') {
      api.get('/users/leaderboard')
        .then((response) => {
          setCitizenContributors(response.data.data || []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching leaderboard:", err);
          setIsLoading(false);
        });
    } else {
      api.get('/analytics/wards')
        .then((response) => {
          setWardPerformance(response.data.data || []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching ward performance:", err);
          setIsLoading(false);
        });
    }
  }, [activeTab]);

  const topThree = citizenContributors.slice(0, 3);
  const remainingCitizens = citizenContributors.slice(3);

  // Map 1st place to top index, 2nd to left, 3rd to right for podium balance
  const firstPlace = topThree[0] || null;
  const secondPlace = topThree[1] || null;
  const thirdPlace = topThree[2] || null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-paper dark:bg-[#0E131F] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-ink dark:text-gray-200 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── 1. HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-ink-line dark:border-gray-800 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper-card dark:bg-gray-900 border border-ink-line dark:border-gray-700 rounded font-mono text-[10px] font-bold text-accent uppercase tracking-widest whitespace-nowrap w-fit">
              <Crosshair className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span>CIVIC PERFORMANCE & STANDINGS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink dark:text-white tracking-tight">
              Community Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-ink/80 dark:text-gray-300 leading-relaxed font-sans">
              Recognizing verified citizen field reporters and auditing operational resolution speed across Ahmedabad municipal wards.
            </p>
          </div>

          {/* Structured Architectural Tab Selector */}
          <div className="flex items-center p-1 bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card shadow-sm self-start md:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('citizens')}
              className={`flex items-center gap-2 px-4 py-2 rounded-button font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                activeTab === 'citizens'
                  ? 'bg-ink text-paper dark:bg-accent dark:text-ink shadow-md'
                  : 'text-ink/70 dark:text-gray-400 hover:text-ink dark:hover:text-white bg-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Top Contributors</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('wards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-button font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                activeTab === 'wards'
                  ? 'bg-ink text-paper dark:bg-accent dark:text-ink shadow-md'
                  : 'text-ink/70 dark:text-gray-400 hover:text-ink dark:hover:text-white bg-transparent'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">Ward Performance</span>
            </button>
          </div>
        </div>

        {/* ── 2. MAIN CONTENT AREA ── */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3 font-mono text-xs text-ink/60 dark:text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <span className="uppercase tracking-widest animate-pulse">Syncing municipal registry standings…</span>
          </div>
        ) : activeTab === 'citizens' ? (
          citizenContributors.length === 0 ? (
            /* Empty State */
            <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-10 sm:p-14 text-center max-w-lg mx-auto space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-card bg-paper dark:bg-gray-800 border border-ink-line dark:border-gray-700 flex items-center justify-center mx-auto text-accent">
                <Users className="w-6 h-6 text-accent stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <span className="font-mono text-[10px] font-bold text-accent uppercase tracking-widest block">
                  // NO CITIZEN CONTRIBUTIONS RECORDED
                </span>
                <h3 className="font-display text-xl font-bold text-ink dark:text-white">
                  Registry Awaiting First Intake
                </h3>
                <p className="text-xs text-ink/70 dark:text-gray-300 font-sans leading-relaxed">
                  No verified citizen reports have been filed yet. Submit on-site photographic evidence to open a case and claim Rank #01 on the leaderboard.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-button bg-accent text-ink hover:bg-amber-400 font-mono text-xs font-bold uppercase tracking-wider shadow transition-all cursor-pointer border-0"
                >
                  <span>Submit First Inspection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              
              {/* ── TOP 3 PODIUM CARDS (ARCHITECTURAL CIVIC CARDS) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                
                {/* ── RANK 02 CARD ── */}
                <div className="order-2 md:order-1">
                  {secondPlace ? (
                    <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 space-y-4 shadow-lg text-left relative overflow-hidden transition-all hover:border-primary">
                      {/* Top Header Strip */}
                      <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-ink-line dark:border-gray-800">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400 border border-primary/30 font-bold whitespace-nowrap w-fit">
                          #02 · ADVOCATE
                        </span>
                        <span className="text-[10px] text-ink/50 dark:text-gray-400 uppercase">
                          CIVIC RANK
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-card bg-paper dark:bg-gray-800 border-2 border-ink dark:border-gray-700 flex items-center justify-center font-display font-bold text-lg text-ink dark:text-white flex-shrink-0">
                          {secondPlace.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h3 className="font-display text-base font-bold text-ink dark:text-white truncate">
                            {secondPlace.name}
                          </h3>
                          <span className="inline-block font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 whitespace-nowrap">
                            {secondPlace.badge}
                          </span>
                        </div>
                      </div>

                      {/* Points Metric */}
                      <div className="p-3 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 space-y-0.5 text-center font-mono">
                        <span className="text-[9px] font-bold text-ink/50 dark:text-gray-500 uppercase tracking-wider block">CIVIC SCORE</span>
                        <span className="font-display text-2xl font-bold text-primary dark:text-blue-400">
                          {secondPlace.points} <span className="text-xs font-mono font-normal">XP</span>
                        </span>
                      </div>

                      {/* 2-Column Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/60 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">REPORTS</span>
                          <span className="font-bold text-ink dark:text-white text-sm">{secondPlace.reports}</span>
                        </div>
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/60 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">VERIFIED</span>
                          <span className="font-bold text-severity-low text-sm">{secondPlace.verifications}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-paper-card/40 dark:bg-[#131A26]/40 border-2 border-dashed border-ink-line dark:border-gray-800 rounded-card p-6 text-center space-y-2 opacity-60">
                      <div className="w-10 h-10 rounded-card border border-dashed border-ink/40 dark:border-gray-700 flex items-center justify-center mx-auto text-ink/40">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-ink/50 uppercase block">Rank #02 Spot</span>
                      <span className="font-mono text-[9px] text-ink/40 uppercase tracking-wider block">Awaiting Verified Reporter</span>
                    </div>
                  )}
                </div>

                {/* ── RANK 01 CARD (PROMINENT CHAMPION WITH SIGNAL AMBER ACCENT) ── */}
                <div className="order-1 md:order-2 md:-translate-y-3">
                  {firstPlace ? (
                    <div className="bg-paper-card dark:bg-[#131A26] border-2 border-accent rounded-card p-6 sm:p-7 space-y-5 shadow-2xl text-left relative overflow-hidden">
                      {/* Top Corner Reticles */}
                      <div className="absolute top-2 left-2 font-mono text-xs text-accent font-bold select-none pointer-events-none">
                        ┌
                      </div>
                      <div className="absolute top-2 right-2 font-mono text-xs text-accent font-bold select-none pointer-events-none">
                        ┐
                      </div>

                      {/* Header Badge */}
                      <div className="flex items-center justify-between font-mono text-xs pb-3 border-b-2 border-accent/40">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent text-ink font-bold uppercase tracking-wider whitespace-nowrap w-fit shadow-sm">
                          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>#01 · TOP ADVOCATE</span>
                        </span>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-wider">
                          LEAD INSPECTOR
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-card bg-paper dark:bg-gray-800 border-2 border-accent flex items-center justify-center font-display font-bold text-2xl text-ink dark:text-white flex-shrink-0 shadow-inner">
                          {firstPlace.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h3 className="font-display text-lg sm:text-xl font-bold text-ink dark:text-white truncate">
                            {firstPlace.name}
                          </h3>
                          <span className="inline-block font-mono text-[10px] font-bold text-accent uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 border border-accent/30 whitespace-nowrap">
                            {firstPlace.badge}
                          </span>
                        </div>
                      </div>

                      {/* Points Metric */}
                      <div className="p-3.5 rounded bg-paper dark:bg-gray-900 border-2 border-accent/30 space-y-0.5 text-center font-mono">
                        <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">TOTAL CIVIC CONTRIBUTION</span>
                        <span className="font-display text-3xl font-bold text-ink dark:text-white">
                          {firstPlace.points} <span className="text-sm font-mono text-accent">XP</span>
                        </span>
                      </div>

                      {/* 2-Column Stats Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-center font-mono text-xs">
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/80 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">REPORTS FILED</span>
                          <span className="font-bold text-ink dark:text-white text-base">{firstPlace.reports}</span>
                        </div>
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/80 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">VERIFICATIONS</span>
                          <span className="font-bold text-severity-low text-base">{firstPlace.verifications}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-paper-card/40 dark:bg-[#131A26]/40 border-2 border-dashed border-accent/50 rounded-card p-8 text-center space-y-3 opacity-60">
                      <div className="w-12 h-12 rounded-card border border-dashed border-accent flex items-center justify-center mx-auto text-accent">
                        <Crosshair className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-accent uppercase block">Rank #01 Champion Spot</span>
                      <span className="font-mono text-[9px] text-ink/40 uppercase tracking-wider block">Awaiting First Leader</span>
                    </div>
                  )}
                </div>

                {/* ── RANK 03 CARD ── */}
                <div className="order-3">
                  {thirdPlace ? (
                    <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card p-5 sm:p-6 space-y-4 shadow-lg text-left relative overflow-hidden transition-all hover:border-primary">
                      {/* Top Header Strip */}
                      <div className="flex items-center justify-between font-mono text-xs pb-3 border-b border-ink-line dark:border-gray-800">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary dark:text-blue-400 border border-primary/30 font-bold whitespace-nowrap w-fit">
                          #03 · ADVOCATE
                        </span>
                        <span className="text-[10px] text-ink/50 dark:text-gray-400 uppercase">
                          CIVIC RANK
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-card bg-paper dark:bg-gray-800 border-2 border-ink dark:border-gray-700 flex items-center justify-center font-display font-bold text-lg text-ink dark:text-white flex-shrink-0">
                          {thirdPlace.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <h3 className="font-display text-base font-bold text-ink dark:text-white truncate">
                            {thirdPlace.name}
                          </h3>
                          <span className="inline-block font-mono text-[9px] font-bold text-ink/60 dark:text-gray-400 uppercase tracking-wider px-1.5 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 whitespace-nowrap">
                            {thirdPlace.badge}
                          </span>
                        </div>
                      </div>

                      {/* Points Metric */}
                      <div className="p-3 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-800 space-y-0.5 text-center font-mono">
                        <span className="text-[9px] font-bold text-ink/50 dark:text-gray-500 uppercase tracking-wider block">CIVIC SCORE</span>
                        <span className="font-display text-2xl font-bold text-primary dark:text-blue-400">
                          {thirdPlace.points} <span className="text-xs font-mono font-normal">XP</span>
                        </span>
                      </div>

                      {/* 2-Column Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/60 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">REPORTS</span>
                          <span className="font-bold text-ink dark:text-white text-sm">{thirdPlace.reports}</span>
                        </div>
                        <div className="p-2.5 rounded bg-paper dark:bg-gray-900/60 border border-ink-line dark:border-gray-800 space-y-0.5">
                          <span className="text-[9px] text-ink/50 dark:text-gray-400 uppercase block">VERIFIED</span>
                          <span className="font-bold text-severity-low text-sm">{thirdPlace.verifications}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-paper-card/40 dark:bg-[#131A26]/40 border-2 border-dashed border-ink-line dark:border-gray-800 rounded-card p-6 text-center space-y-2 opacity-60">
                      <div className="w-10 h-10 rounded-card border border-dashed border-ink/40 dark:border-gray-700 flex items-center justify-center mx-auto text-ink/40">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-ink/50 uppercase block">Rank #03 Spot</span>
                      <span className="font-mono text-[9px] text-ink/40 uppercase tracking-wider block">Awaiting Verified Reporter</span>
                    </div>
                  )}
                </div>

              </div>

              {/* ── RANKS 04 TO 10 AUDIT TABLE ── */}
              {remainingCitizens.length > 0 && (
                <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card shadow-xl overflow-hidden text-left">
                  {/* Table Header */}
                  <div className="px-5 py-3.5 bg-paper dark:bg-gray-900/80 border-b-2 border-ink-line dark:border-gray-800 flex items-center justify-between font-mono text-[10px] text-ink/70 dark:text-gray-400 font-bold uppercase tracking-wider">
                    <span>// ADDITIONAL CITIZEN STANDINGS (RANKS 04–10)</span>
                    <span>REGISTRY ACTIVE</span>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans text-xs">
                      <thead>
                        <tr className="border-b border-ink-line dark:border-gray-800 bg-paper-sheet dark:bg-[#111827] font-mono text-[10px] text-ink/60 dark:text-gray-400 uppercase tracking-wider">
                          <th className="py-3 px-5 text-center w-16">Rank</th>
                          <th className="py-3 px-5">Citizen Contributor</th>
                          <th className="py-3 px-5">Badge Tier</th>
                          <th className="py-3 px-5 text-center">Reports</th>
                          <th className="py-3 px-5 text-center">Verified</th>
                          <th className="py-3 px-5 text-right font-bold">Civic XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink-line/60 dark:divide-gray-800">
                        {remainingCitizens.map((citizen) => (
                          <tr key={citizen.rank} className="hover:bg-paper-sheet dark:hover:bg-gray-800/30 transition-colors">
                            <td className="py-3.5 px-5 text-center font-mono font-bold text-ink/70 dark:text-gray-400">
                              #{String(citizen.rank).padStart(2, '0')}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-ink dark:text-white">
                              {citizen.name}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="inline-block px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 font-mono text-[10px] text-ink/70 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                                {citizen.badge}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-center font-mono text-ink dark:text-gray-200">
                              {citizen.reports}
                            </td>
                            <td className="py-3.5 px-5 text-center font-mono text-severity-low font-bold">
                              {citizen.verifications}
                            </td>
                            <td className="py-3.5 px-5 text-right font-mono font-bold text-primary dark:text-blue-400 text-sm">
                              {citizen.points} XP
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Stacked List View */}
                  <div className="sm:hidden divide-y divide-ink-line/60 dark:divide-gray-800">
                    {remainingCitizens.map((citizen) => (
                      <div key={citizen.rank} className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-ink/70 dark:text-gray-400">
                            #{String(citizen.rank).padStart(2, '0')}
                          </span>
                          <span className="font-mono text-xs font-bold text-primary dark:text-blue-400">
                            {citizen.points} XP
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-ink dark:text-white">
                            {citizen.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 font-mono text-[9px] text-ink/70 dark:text-gray-300 uppercase">
                            {citizen.badge}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono text-ink/60 dark:text-gray-400 pt-1 border-t border-ink-line/40 dark:border-gray-850">
                          <span>Reports: {citizen.reports}</span>
                          <span>Verified: <strong className="text-severity-low">{citizen.verifications}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          )
        ) : (
          /* ── 3. WARD PERFORMANCE AUDIT TABLE ── */
          <div className="bg-paper-card dark:bg-[#131A26] border-2 border-ink dark:border-gray-700 rounded-card shadow-xl overflow-hidden text-left">
            
            {/* Header Strip */}
            <div className="px-5 py-3.5 bg-paper dark:bg-gray-900/80 border-b-2 border-ink-line dark:border-gray-800 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-ink/70 dark:text-gray-400 font-bold uppercase tracking-wider">
              <span>// MUNICIPAL OPERATIONAL SPEED & SATISFACTION AUDIT</span>
              <span className="text-accent">AHMEDABAD GRID</span>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-ink-line dark:border-gray-800 bg-paper-sheet dark:bg-[#111827] font-mono text-[10px] text-ink/60 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-5 text-center w-16">Rank</th>
                    <th className="py-3 px-5">Ward Zone</th>
                    <th className="py-3 px-5 text-center">Resolution Speed</th>
                    <th className="py-3 px-5">Completion Rate</th>
                    <th className="py-3 px-5 text-right pr-6">Satisfaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-line/60 dark:divide-gray-800">
                  {wardPerformance.map((ward) => (
                    <tr key={ward.rank} className="hover:bg-paper-sheet dark:hover:bg-gray-800/30 transition-colors">
                      
                      {/* Rank Tag */}
                      <td className="py-4 px-5 text-center font-mono">
                        {ward.rank === 1 ? (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-accent text-ink font-bold text-xs shadow-sm">
                            #01
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink/70 dark:text-gray-400 font-bold text-xs">
                            #{String(ward.rank).padStart(2, '0')}
                          </span>
                        )}
                      </td>

                      {/* Ward Zone Name & Active Count */}
                      <td className="py-4 px-5 space-y-0.5">
                        <span className="font-display font-bold text-sm text-ink dark:text-white block">
                          {ward.name}
                        </span>
                        <span className="font-mono text-[10px] text-ink/60 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                          <span>{ward.activeTickets} Active Case Files</span>
                        </span>
                      </td>

                      {/* Avg Resolution Speed */}
                      <td className="py-4 px-5 text-center font-mono">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-xs font-bold text-ink dark:text-gray-200">
                          <Clock className="w-3.5 h-3.5 text-primary dark:text-blue-400 flex-shrink-0" />
                          <span>{ward.avgTime}</span>
                        </span>
                      </td>

                      {/* Completion Rate Progress Bar */}
                      <td className="py-4 px-5 space-y-1.5 w-60">
                        <div className="flex justify-between font-mono text-[11px] font-bold">
                          <span className="text-ink/60 dark:text-gray-400">RESOLVED</span>
                          <span className="text-severity-low">{ward.completed}</span>
                        </div>
                        <div className="w-full bg-paper dark:bg-gray-900 h-2 rounded border border-ink-line dark:border-gray-700 overflow-hidden">
                          <div 
                            className="h-full bg-severity-low transition-all duration-500 rounded"
                            style={{ width: ward.completed }}
                          />
                        </div>
                      </td>

                      {/* Satisfaction Rating */}
                      <td className="py-4 px-5 text-right pr-6 font-mono">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-xs font-bold text-ink dark:text-white">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent flex-shrink-0" />
                          <span>{ward.score.toFixed(1)} / 5.0</span>
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (Graceful degradation for small viewports) */}
            <div className="md:hidden divide-y divide-ink-line/60 dark:divide-gray-800">
              {wardPerformance.map((ward) => (
                <div key={ward.rank} className="p-5 space-y-3">
                  
                  {/* Top Bar: Rank & Score */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-xs font-bold ${
                      ward.rank === 1 
                        ? 'bg-accent text-ink' 
                        : 'bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 text-ink/70 dark:text-gray-400'
                    }`}>
                      #{String(ward.rank).padStart(2, '0')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-paper dark:bg-gray-900 border border-ink-line dark:border-gray-700 font-mono text-xs font-bold text-ink dark:text-white">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span>{ward.score.toFixed(1)}</span>
                    </span>
                  </div>

                  {/* Ward Title & Active Tickets */}
                  <div className="space-y-0.5">
                    <h3 className="font-display font-bold text-sm text-ink dark:text-white">
                      {ward.name}
                    </h3>
                    <span className="font-mono text-[10px] text-ink/60 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent" />
                      <span>{ward.activeTickets} Active Case Files</span>
                    </span>
                  </div>

                  {/* Completion Rate Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] font-bold text-ink/60 dark:text-gray-400">
                      <span>COMPLETION RATE</span>
                      <span className="text-severity-low">{ward.completed}</span>
                    </div>
                    <div className="w-full bg-paper dark:bg-gray-900 h-2 rounded border border-ink-line dark:border-gray-700 overflow-hidden">
                      <div 
                        className="h-full bg-severity-low rounded"
                        style={{ width: ward.completed }}
                      />
                    </div>
                  </div>

                  {/* Resolution Speed Footnote */}
                  <div className="pt-1 flex items-center justify-between font-mono text-[10px] text-ink/60 dark:text-gray-400 border-t border-ink-line/40 dark:border-gray-850">
                    <span>AVG RESOLUTION SPEED:</span>
                    <span className="font-bold text-ink dark:text-gray-200">{ward.avgTime}</span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
