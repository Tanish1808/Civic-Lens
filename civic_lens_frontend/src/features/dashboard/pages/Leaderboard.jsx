import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, Trophy, Sparkles, MapPin, Star, Zap, Clock, Loader2, User as UserIcon } from 'lucide-react';
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
            {/* Top 3 Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
              
              {/* Rank 2 (Left) */}
              {topThree[1] ? (
                <div className="bg-white dark:bg-[#151B26]/50 rounded-card p-6 border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/20 dark:shadow-none text-center relative order-2 md:order-1 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute top-4 left-4 w-7 h-7 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-500/10 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 relative">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 text-lg">
                      {topThree[1].name.charAt(0)}
                    </span>
                    <div className="absolute -bottom-1 -right-1 bg-slate-400 dark:bg-slate-700 text-white dark:text-gray-200 p-1 rounded-full border border-white dark:border-slate-800">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-text-primary dark:text-white text-base truncate">{topThree[1].name}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">{topThree[1].badge}</p>
                  <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 text-xs font-extrabold font-mono">
                    {topThree[1].points} pts
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 dark:bg-gray-900/35 rounded-card p-6 border border-dashed border-gray-200 dark:border-gray-800 text-center relative order-2 md:order-1 select-none opacity-60">
                  <div className="absolute top-4 left-4 w-7 h-7 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center font-bold text-xs font-mono">
                    2
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mx-auto mb-4 bg-white dark:bg-gray-850">
                    <UserIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-400 dark:text-gray-500 text-sm">Vacant Spot</h3>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider mt-1">Awaiting Advocate</p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-xs font-bold font-mono">
                    0 pts
                  </div>
                </div>
              )}

              {/* Rank 1 (Center) */}
              {topThree[0] ? (
                <div className="bg-white dark:bg-[#151B26]/50 rounded-card p-8 border-2 border-yellow-400/70 shadow-2xl shadow-yellow-500/5 text-center relative order-1 md:order-2 hover:scale-[1.03] transition-all duration-300 md:-translate-y-4">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-text-primary px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md border border-yellow-300">
                    <Trophy className="w-3.5 h-3.5 text-text-primary" />
                    <span>Champion</span>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4 relative">
                    <span className="font-extrabold text-yellow-600 dark:text-yellow-400 text-2xl">
                      {topThree[0].name.charAt(0)}
                    </span>
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-text-primary p-1.5 rounded-full border-2 border-white dark:border-yellow-550 shadow-md">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-black text-text-primary dark:text-white text-lg truncate">{topThree[0].name}</h3>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-extrabold uppercase tracking-wider mt-1">{topThree[0].badge}</p>
                  <div className="mt-4 inline-flex items-center gap-1 px-4 py-1.5 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-100 dark:border-yellow-900 rounded-full text-yellow-750 dark:text-yellow-400 text-sm font-black font-mono shadow-inner">
                    {topThree[0].points} pts
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 dark:bg-gray-900/35 rounded-card p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 text-center relative order-1 md:order-2 select-none opacity-60 md:-translate-y-4 bg-white dark:bg-gray-850">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-3.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Vacant
                  </div>
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mx-auto mb-4 bg-white dark:bg-gray-850">
                    <Trophy className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="font-black text-gray-400 dark:text-gray-500 text-base">Vacant Spot</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-wider mt-1">Awaiting Sentinel</p>
                  <div className="mt-4 inline-flex items-center px-4 py-1.5 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-sm font-bold font-mono">
                    0 pts
                  </div>
                </div>
              )}

              {/* Rank 3 (Right) */}
              {topThree[2] ? (
                <div className="bg-white dark:bg-[#151B26]/50 rounded-card p-6 border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/20 dark:shadow-none text-center relative order-3 hover:scale-[1.02] transition-all duration-300">
                  <div className="absolute top-4 left-4 w-7 h-7 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-600/35 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div className="w-16 h-16 rounded-full bg-amber-600/10 border-2 border-amber-600/50 dark:border-amber-700/60 flex items-center justify-center mx-auto mb-4 relative">
                    <span className="font-extrabold text-amber-700 dark:text-amber-400 text-lg">
                      {topThree[2].name.charAt(0)}
                    </span>
                    <div className="absolute -bottom-1 -right-1 bg-amber-600 dark:bg-amber-750 text-white dark:text-gray-250 p-1 rounded-full border border-white dark:border-amber-800">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h3 className="font-bold text-text-primary dark:text-white text-base truncate">{topThree[2].name}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">{topThree[2].badge}</p>
                  <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900 rounded-full text-amber-750 dark:text-amber-400 text-xs font-extrabold font-mono">
                    {topThree[2].points} pts
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50/50 dark:bg-gray-900/35 rounded-card p-6 border border-dashed border-gray-200 dark:border-gray-800 text-center relative order-3 select-none opacity-60">
                  <div className="absolute top-4 left-4 w-7 h-7 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center font-bold text-xs font-mono">
                    3
                  </div>
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mx-auto mb-4 bg-white dark:bg-gray-850">
                    <UserIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-400 dark:text-gray-500 text-sm">Vacant Spot</h3>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider mt-1">Awaiting Hero</p>
                  <div className="mt-4 inline-flex items-center px-3 py-1 bg-white dark:bg-gray-850 border border-gray-150 dark:border-gray-800 rounded-full text-gray-400 dark:text-gray-500 text-xs font-bold font-mono">
                    0 pts
                  </div>
                </div>
              )}

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
