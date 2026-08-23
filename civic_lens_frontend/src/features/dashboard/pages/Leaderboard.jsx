import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Trophy, Sparkles, MapPin, Star, Zap, Clock, Loader2, User as UserIcon, Crown, Medal, Flame } from 'lucide-react';
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD] dark:bg-[#0E131F] min-h-[calc(100vh-64px)] text-text-primary dark:text-gray-250 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-amber-500/10 rounded-full text-primary dark:text-amber-500 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Civic Champions</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-text-primary dark:text-white">
          Community Leaderboard
        </h1>
        <p className="text-sm text-text-secondary dark:text-gray-400 leading-relaxed">
          Honoring local residents reporting critical ward issues and comparing operational resolution statistics of city zones.
        </p>
      </div>

      {/* Mode Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-button border border-gray-200/50 dark:border-gray-700/80 flex gap-1 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`flex-1 py-2 px-4 rounded-button text-xs font-bold transition-all duration-300 ${
              activeTab === 'citizens'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-amber-500 shadow-sm'
                : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white bg-transparent border-0'
            }`}
          >
            Top Contributors
          </button>
          <button
            onClick={() => setActiveTab('wards')}
            className={`flex-1 py-2 px-4 rounded-button text-xs font-bold transition-all duration-300 ${
              activeTab === 'wards'
                ? 'bg-white dark:bg-gray-700 text-primary dark:text-amber-500 shadow-sm'
                : 'text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white bg-transparent border-0'
            }`}
          >
            Ward Performance
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-16 space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest animate-pulse">
            Syncing municipal data...
          </p>
        </div>
      ) : activeTab === 'citizens' ? (
        citizenContributors.length === 0 ? (
          <div className="bg-white dark:bg-[#151B26]/50 rounded-card p-12 border border-gray-150 dark:border-gray-800 text-center space-y-4 shadow-sm max-w-lg mx-auto">
            <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-650 mx-auto animate-bounce" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary dark:text-white">No Contributors Recorded</h3>
              <p className="text-xs text-text-secondary dark:text-gray-400 max-w-sm mx-auto">
                No civic contributions have been registered yet. Be the first to report active local issues to earn points and claim Rank #1!
              </p>
            </div>
            <Link
              to="/report"
              className="inline-flex px-5 py-2.5 bg-primary dark:bg-amber-500 text-white dark:text-black text-xs font-bold rounded-button hover:bg-primary/95 dark:hover:bg-amber-600 shadow-lg shadow-primary/10 dark:shadow-amber-500/10 transition-all hover:scale-[1.02] cursor-pointer border-0"
            >
              <span>Submit First Report</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">

            {/* ── TOP 3 GAMIFIED PODIUM ── */}
            <div className="relative flex flex-col md:flex-row items-end justify-center gap-5 max-w-4xl mx-auto px-2 pt-6">

              {/* ── RANK 2 — SILVER ── */}
              <div className="w-full md:w-64 order-2 md:order-1">
                {topThree[1] ? (
                  <div className="relative group cursor-default pt-5">
                    {/* Glow halo — sits outside card */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 opacity-60 group-hover:opacity-90 blur-[6px] transition-all duration-500 -z-10" />
                    {/* Floating tier badge — outside overflow-hidden */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-400/50 flex items-center justify-center border-2 border-white dark:border-gray-900">
                        <Medal className="w-4.5 h-4.5 text-white" />
                      </div>
                    </div>
                    {/* Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl pt-8 pb-5 px-5 text-center flex flex-col items-center gap-3 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-slate-900/40">
                      {/* Gradient top accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-slate-300 via-slate-400 to-slate-500" />
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg">
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                            <span className="font-black text-slate-600 dark:text-slate-300 text-2xl">{topThree[1].name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-gray-900 shadow">
                          2
                        </div>
                      </div>
                      {/* Name */}
                      <div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white truncate max-w-[150px]">{topThree[1].name}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">{topThree[1].badge}</p>
                      </div>
                      {/* Points */}
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                        <Star className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 fill-current" />
                        <span className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono">{topThree[1].points} pts</span>
                      </div>
                      {/* Stats */}
                      <div className="w-full grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl py-2 px-2 border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Reports</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono">{topThree[1].reports}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl py-2 px-2 border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verified</p>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono">{topThree[1].verifications}</p>
                        </div>
                      </div>
                      {/* Podium label */}
                      <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">🥈 Silver</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 text-center opacity-50 select-none bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-gray-900">
                      <UserIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="font-bold text-slate-400 text-sm">Silver Spot</p>
                    <p className="text-[9px] text-slate-400 tracking-widest uppercase">Awaiting Advocate</p>
                  </div>
                )}
              </div>

              {/* ── RANK 1 — GOLD ── */}
              <div className="w-full md:w-72 order-1 md:order-2 md:-translate-y-5">
                {topThree[0] ? (
                  <div className="relative group cursor-default pt-6">
                    {/* Double glow — gold */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 opacity-75 group-hover:opacity-100 blur-[8px] transition-all duration-500 -z-10" />
                    {/* Floating crown — outside card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                      <div
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 shadow-xl shadow-amber-400/60 flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce"
                        style={{ animationDuration: '2.5s' }}
                      >
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    {/* Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl pt-10 pb-5 px-6 text-center flex flex-col items-center gap-3 border-2 border-amber-200/60 dark:border-amber-800/40 shadow-2xl shadow-amber-300/20 dark:shadow-amber-900/20">
                      {/* Top gradient accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500" />
                      {/* Champion badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-[10px] font-black uppercase tracking-widest text-white shadow">
                        <Sparkles className="w-3 h-3" />
                        <span>Champion</span>
                      </div>
                      {/* Avatar — large */}
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 shadow-2xl shadow-amber-400/30 animate-pulse" style={{ animationDuration: '3s' }}>
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                            <span className="font-black text-amber-500 dark:text-amber-400 text-3xl">{topThree[0].name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white text-[11px] font-black border-2 border-white dark:border-gray-900 shadow-lg">
                          1
                        </div>
                      </div>
                      {/* Name */}
                      <div>
                        <h3 className="font-black text-xl text-gray-900 dark:text-white truncate max-w-[200px]">{topThree[0].name}</h3>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest mt-0.5">{topThree[0].badge}</p>
                      </div>
                      {/* Points pill — solid gold */}
                      <div className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg shadow-amber-400/25">
                        <Trophy className="w-4 h-4 text-white" />
                        <span className="text-base font-black text-white font-mono">{topThree[0].points} pts</span>
                      </div>
                      {/* Stats */}
                      <div className="w-full grid grid-cols-2 gap-2">
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl py-2 px-2 border border-amber-100 dark:border-amber-900/30">
                          <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Reports</p>
                          <p className="text-sm font-black text-amber-700 dark:text-amber-300 font-mono">{topThree[0].reports}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl py-2 px-2 border border-amber-100 dark:border-amber-900/30">
                          <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Verified</p>
                          <p className="text-sm font-black text-amber-700 dark:text-amber-300 font-mono">{topThree[0].verifications}</p>
                        </div>
                      </div>
                      {/* Podium label */}
                      <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 shadow-md">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">👑 #1 Champion</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-yellow-200 dark:border-yellow-900 p-7 text-center opacity-50 select-none bg-yellow-50/30 dark:bg-yellow-950/10 flex flex-col items-center gap-3">
                    <div className="w-18 h-18 rounded-full border-2 border-dashed border-yellow-300 dark:border-yellow-700 flex items-center justify-center bg-white dark:bg-gray-900">
                      <Trophy className="w-9 h-9 text-yellow-300 dark:text-yellow-700" />
                    </div>
                    <p className="font-bold text-yellow-500 text-base">Gold Spot</p>
                    <p className="text-[9px] text-yellow-500 tracking-widest uppercase">Awaiting Champion</p>
                  </div>
                )}
              </div>

              {/* ── RANK 3 — BRONZE ── */}
              <div className="w-full md:w-64 order-3">
                {topThree[2] ? (
                  <div className="relative group cursor-default pt-5">
                    {/* Glow halo — bronze */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-300 via-amber-600 to-orange-700 opacity-60 group-hover:opacity-90 blur-[6px] transition-all duration-500 -z-10" />
                    {/* Floating flame badge — outside card */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-700 shadow-lg shadow-orange-500/50 flex items-center justify-center border-2 border-white dark:border-gray-900">
                        <Flame className="w-4.5 h-4.5 text-white" />
                      </div>
                    </div>
                    {/* Card */}
                    <div className="bg-white dark:bg-[#111827] rounded-2xl pt-8 pb-5 px-5 text-center flex flex-col items-center gap-3 border border-orange-100 dark:border-orange-900/30 shadow-xl shadow-orange-200/30 dark:shadow-orange-900/20">
                      {/* Top accent */}
                      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600" />
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-orange-300 to-amber-600 shadow-lg shadow-orange-400/25">
                          <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                            <span className="font-black text-orange-600 dark:text-orange-400 text-2xl">{topThree[2].name.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-amber-700 flex items-center justify-center text-white text-[10px] font-black border-2 border-white dark:border-gray-900 shadow">
                          3
                        </div>
                      </div>
                      {/* Name */}
                      <div>
                        <h3 className="font-black text-base text-gray-900 dark:text-white truncate max-w-[150px]">{topThree[2].name}</h3>
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest mt-0.5">{topThree[2].badge}</p>
                      </div>
                      {/* Points */}
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 border border-orange-200 dark:border-orange-800">
                        <Flame className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                        <span className="text-sm font-black text-orange-700 dark:text-orange-300 font-mono">{topThree[2].points} pts</span>
                      </div>
                      {/* Stats */}
                      <div className="w-full grid grid-cols-2 gap-2">
                        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl py-2 px-2 border border-orange-100 dark:border-orange-900/30">
                          <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider">Reports</p>
                          <p className="text-sm font-black text-orange-700 dark:text-orange-300 font-mono">{topThree[2].reports}</p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl py-2 px-2 border border-orange-100 dark:border-orange-900/30">
                          <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider">Verified</p>
                          <p className="text-sm font-black text-orange-700 dark:text-orange-300 font-mono">{topThree[2].verifications}</p>
                        </div>
                      </div>
                      {/* Podium label */}
                      <div className="w-full py-1.5 rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 border border-orange-200/50 dark:border-orange-800/30">
                        <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">🥉 Bronze</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 p-6 text-center opacity-50 select-none bg-orange-50/30 dark:bg-orange-950/10 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-orange-300 dark:border-orange-700 flex items-center justify-center bg-white dark:bg-gray-900">
                      <UserIcon className="w-6 h-6 text-orange-300 dark:text-orange-700" />
                    </div>
                    <p className="font-bold text-orange-400 text-sm">Bronze Spot</p>
                    <p className="text-[9px] text-orange-400 tracking-widest uppercase">Awaiting Hero</p>
                  </div>
                )}
              </div>

            </div>



            {/* List for Rank 4 to 10 */}
            {remainingCitizens.length > 0 && (
              <div className="bg-white dark:bg-[#151B26]/50 border border-gray-200/80 dark:border-gray-800 rounded-card shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden max-w-4xl mx-auto">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-850 grid grid-cols-12 text-xs font-extrabold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
                  <span className="col-span-2 text-center">Rank</span>
                  <span className="col-span-4 pl-4">Citizen Name</span>
                  <span className="col-span-2 text-center">Reports</span>
                  <span className="col-span-2 text-center">Verifications</span>
                  <span className="col-span-2 text-right">Karma Points</span>
                </div>
                
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {remainingCitizens.map((citizen) => (
                    <div key={citizen.rank} className="px-6 py-4.5 grid grid-cols-12 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <span className="col-span-2 text-center font-bold text-sm text-text-secondary dark:text-gray-400 font-mono">#{citizen.rank}</span>
                      <div className="col-span-4 pl-4 space-y-0.5">
                        <span className="font-extrabold text-sm text-text-primary dark:text-white block">{citizen.name}</span>
                        <span className="inline-flex px-1.5 py-0.5 bg-gray-100 dark:bg-gray-850 rounded text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{citizen.badge}</span>
                      </div>
                      <span className="col-span-2 text-center font-semibold text-sm font-mono text-text-primary dark:text-white">{citizen.reports}</span>
                      <span className="col-span-2 text-center font-semibold text-sm font-mono text-text-primary dark:text-white">{citizen.verifications}</span>
                      <span className="col-span-2 text-right font-extrabold text-sm font-mono text-primary dark:text-amber-500">{citizen.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        /* Ward Performance Tab Content */
        <div className="bg-white dark:bg-[#151B26]/50 border border-gray-200/80 dark:border-gray-800 rounded-card shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden max-w-4xl mx-auto animate-fade-in">
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-850 grid grid-cols-12 text-xs font-extrabold text-text-secondary dark:text-gray-400 uppercase tracking-wider">
            <span className="col-span-2 text-center">Rank</span>
            <span className="col-span-4 pl-4">Ward Zone</span>
            <span className="col-span-2 text-center">Resolution Speed</span>
            <span className="col-span-2 text-center">Completion Rate</span>
            <span className="col-span-2 text-right pr-2">Satisfaction</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {wardPerformance.map((ward) => (
              <div key={ward.rank} className="px-6 py-5 grid grid-cols-12 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                
                {/* Rank Medals */}
                <div className="col-span-2 text-center flex justify-center">
                  {ward.rank === 1 ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400 shadow-sm">
                      <Trophy className="w-4 h-4" />
                    </span>
                  ) : ward.rank === 2 ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
                      <Award className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold font-mono">
                      {ward.rank}
                    </span>
                  )}
                </div>

                {/* Ward Name */}
                <div className="col-span-4 pl-4 space-y-1">
                  <span className="font-extrabold text-sm text-text-primary dark:text-white block">{ward.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary dark:text-amber-500" />
                    <span>{ward.activeTickets} Active Tickets</span>
                  </span>
                </div>

                {/* Avg Resolution Speed Badge */}
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 dark:bg-amber-500/5 text-primary dark:text-amber-500 border border-primary/10 dark:border-amber-500/20 rounded-full font-mono text-xs font-bold shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-primary/70 dark:text-amber-500/70" />
                    <span>{ward.avgTime}</span>
                  </span>
                </div>

                {/* Completion Rate with Dynamic Colors */}
                {(() => {
                  const pct = parseFloat(ward.completed);
                  let colorClass = "bg-green-500";
                  let textClass = "text-green-600 dark:text-green-400";
                  if (pct >= 95) {
                    colorClass = "bg-emerald-500";
                    textClass = "text-emerald-600 dark:text-emerald-400";
                  } else if (pct >= 90) {
                    colorClass = "bg-teal-500";
                    textClass = "text-teal-600 dark:text-teal-400";
                  } else {
                    colorClass = "bg-amber-500";
                    textClass = "text-amber-600 dark:text-amber-400";
                  }
                  return (
                    <div className="col-span-2 space-y-1.5 px-4 text-center">
                      <span className={`font-black text-sm font-mono ${textClass} block`}>{ward.completed}</span>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full ${colorClass}`} style={{ width: ward.completed }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Score Rating Pill */}
                <div className="col-span-2 flex items-center justify-end pr-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 rounded-full text-xs font-black font-mono shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>{ward.score.toFixed(1)}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
