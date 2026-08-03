import React, { useState } from 'react';
import { Award, ShieldCheck, Trophy, Sparkles, MapPin, Star, Zap, Clock } from 'lucide-react';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('citizens'); // 'citizens' | 'wards'

  // Top contributors list
  const citizenContributors = [
    { rank: 1, name: 'Aarav Mehta', points: 2840, reports: 42, verifications: 89, badge: 'Civic Sentinel', color: 'border-yellow-400 bg-yellow-500/10' },
    { rank: 2, name: 'Priya Sharma', points: 2410, reports: 31, verifications: 75, badge: 'Ward Advocate', color: 'border-slate-300 bg-slate-500/10' },
    { rank: 3, name: 'Rohan Joshi', points: 1980, reports: 28, verifications: 54, badge: 'Community Hero', color: 'border-amber-600 bg-amber-600/10' },
    { rank: 4, name: 'Ananya Iyer', points: 1650, reports: 19, verifications: 47, badge: 'Verified Reporter' },
    { rank: 5, name: 'Kabir Verma', points: 1420, reports: 15, verifications: 38, badge: 'Civic Contributor' },
    { rank: 6, name: 'Siddharth Shah', points: 1290, reports: 14, verifications: 32, badge: 'Civic Contributor' },
    { rank: 7, name: 'Neha Patel', points: 1100, reports: 12, verifications: 28, badge: 'Local Sentinel' },
    { rank: 8, name: 'Vikram Singh', points: 950, reports: 9, verifications: 22, badge: 'Active Citizen' },
  ];

  // Top performing city wards list
  const wardPerformance = [
    { rank: 1, name: 'West Zone (Navrangpura)', avgTime: '2.4 Days', completed: '97.2%', score: 4.9, activeTickets: 18 },
    { rank: 2, name: 'North West (Bodakdev)', avgTime: '3.1 Days', completed: '94.8%', score: 4.7, activeTickets: 24 },
    { rank: 3, name: 'South Zone (Maninagar)', avgTime: '3.8 Days', completed: '91.5%', score: 4.5, activeTickets: 31 },
    { rank: 4, name: 'East Zone (Nikol)', avgTime: '4.5 Days', completed: '89.0%', score: 4.2, activeTickets: 42 },
    { rank: 5, name: 'Central Zone (Kalupur)', avgTime: '5.2 Days', completed: '86.4%', score: 4.0, activeTickets: 58 },
  ];

  const topThree = citizenContributors.slice(0, 3);
  const remainingCitizens = citizenContributors.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-[#FAFBFD] min-h-[calc(100vh-64px)] text-text-primary">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>Civic Champions</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-text-primary">
          Community Leaderboard
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed">
          Honoring local residents reporting critical ward issues and comparing operational resolution statistics of city zones.
        </p>
      </div>

      {/* Mode Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1 rounded-button border border-gray-200/50 flex gap-1 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('citizens')}
            className={`flex-1 py-2 px-4 rounded-button text-xs font-bold transition-all duration-300 ${
              activeTab === 'citizens'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Top Contributors
          </button>
          <button
            onClick={() => setActiveTab('wards')}
            className={`flex-1 py-2 px-4 rounded-button text-xs font-bold transition-all duration-300 ${
              activeTab === 'wards'
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Ward Performance
          </button>
        </div>
      </div>

      {activeTab === 'citizens' ? (
        <div className="space-y-12">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto">
            
            {/* Rank 2 (Left) */}
            <div className="bg-white rounded-card p-6 border border-gray-100 shadow-lg shadow-gray-200/20 text-center relative order-2 md:order-1 hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-4 left-4 w-7 h-7 bg-slate-100 border border-slate-300 text-slate-700 rounded-full flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-500/10 border-2 border-slate-300 flex items-center justify-center mx-auto mb-4 relative">
                <span className="font-extrabold text-slate-700 text-lg">P</span>
                <div className="absolute -bottom-1 -right-1 bg-slate-400 text-white p-1 rounded-full border border-white">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-bold text-text-primary text-base truncate">{topThree[1].name}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{topThree[1].badge}</p>
              <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-700 text-xs font-extrabold font-mono">
                {topThree[1].points} pts
              </div>
            </div>

            {/* Rank 1 (Center) */}
            <div className="bg-white rounded-card p-8 border-2 border-yellow-400/70 shadow-2xl shadow-yellow-500/5 text-center relative order-1 md:order-2 hover:scale-[1.03] transition-all duration-300 md:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-text-primary px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
                <Trophy className="w-3.5 h-3.5 text-text-primary" />
                <span>Champion</span>
              </div>
              <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4 relative">
                <span className="font-extrabold text-yellow-600 text-2xl">A</span>
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-text-primary p-1.5 rounded-full border-2 border-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h3 className="font-black text-text-primary text-lg truncate">{topThree[0].name}</h3>
              <p className="text-xs text-yellow-600 font-extrabold uppercase tracking-wider mt-1">{topThree[0].badge}</p>
              <div className="mt-4 inline-flex items-center gap-1 px-4 py-1.5 bg-yellow-50 border border-yellow-100 rounded-full text-yellow-700 text-sm font-black font-mono shadow-inner">
                {topThree[0].points} pts
              </div>
            </div>

            {/* Rank 3 (Right) */}
            <div className="bg-white rounded-card p-6 border border-gray-100 shadow-lg shadow-gray-200/20 text-center relative order-3 hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-4 left-4 w-7 h-7 bg-amber-50/50 border border-amber-600/35 text-amber-700 rounded-full flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-600/10 border-2 border-amber-600/50 flex items-center justify-center mx-auto mb-4 relative">
                <span className="font-extrabold text-amber-700 text-lg">R</span>
                <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full border border-white">
                  <Zap className="w-3.5 h-3.5" />
                </div>
              </div>
              <h3 className="font-bold text-text-primary text-base truncate">{topThree[2].name}</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{topThree[2].badge}</p>
              <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 bg-amber-50/50 border border-amber-100/50 rounded-full text-amber-700 text-xs font-extrabold font-mono">
                {topThree[2].points} pts
              </div>
            </div>

          </div>

          {/* List for Rank 4 to 8 */}
          <div className="bg-white border border-gray-200/80 rounded-card shadow-xl shadow-gray-200/20 overflow-hidden max-w-4xl mx-auto">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200/80 grid grid-cols-12 text-xs font-extrabold text-text-secondary uppercase tracking-wider">
              <span className="col-span-2 text-center">Rank</span>
              <span className="col-span-4 pl-4">Citizen Name</span>
              <span className="col-span-2 text-center">Reports</span>
              <span className="col-span-2 text-center">Verifications</span>
              <span className="col-span-2 text-right">Karma Points</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {remainingCitizens.map((citizen) => (
                <div key={citizen.rank} className="px-6 py-4.5 grid grid-cols-12 items-center hover:bg-gray-50/50 transition-colors">
                  <span className="col-span-2 text-center font-bold text-sm text-text-secondary font-mono">#{citizen.rank}</span>
                  <div className="col-span-4 pl-4 space-y-0.5">
                    <span className="font-extrabold text-sm text-text-primary block">{citizen.name}</span>
                    <span className="inline-flex px-1.5 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 uppercase tracking-wider">{citizen.badge}</span>
                  </div>
                  <span className="col-span-2 text-center font-semibold text-sm font-mono text-text-primary">{citizen.reports}</span>
                  <span className="col-span-2 text-center font-semibold text-sm font-mono text-text-primary">{citizen.verifications}</span>
                  <span className="col-span-2 text-right font-extrabold text-sm font-mono text-primary">{citizen.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Ward Performance Tab Content */
        <div className="bg-white border border-gray-200/80 rounded-card shadow-xl shadow-gray-200/20 overflow-hidden max-w-4xl mx-auto animate-fade-in">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200/80 grid grid-cols-12 text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            <span className="col-span-2 text-center">Rank</span>
            <span className="col-span-4 pl-4">Ward Zone</span>
            <span className="col-span-2 text-center">Resolution Speed</span>
            <span className="col-span-2 text-center">Completion Rate</span>
            <span className="col-span-2 text-right pr-2">Satisfaction</span>
          </div>

          <div className="divide-y divide-gray-100">
            {wardPerformance.map((ward) => (
              <div key={ward.rank} className="px-6 py-5 grid grid-cols-12 items-center hover:bg-gray-50/50 transition-colors">
                
                {/* Rank Medals */}
                <div className="col-span-2 text-center flex justify-center">
                  {ward.rank === 1 ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-600 shadow-sm">
                      <Trophy className="w-4 h-4" />
                    </span>
                  ) : ward.rank === 2 ? (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-500 shadow-sm">
                      <Award className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 border border-gray-200 text-gray-500 text-xs font-bold font-mono">
                      {ward.rank}
                    </span>
                  )}
                </div>

                {/* Ward Name */}
                <div className="col-span-4 pl-4 space-y-1">
                  <span className="font-extrabold text-sm text-text-primary block">{ward.name}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{ward.activeTickets} Active Tickets</span>
                  </span>
                </div>

                {/* Avg Resolution Speed Badge */}
                <div className="col-span-2 flex justify-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full font-mono text-xs font-bold shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-primary/70" />
                    <span>{ward.avgTime}</span>
                  </span>
                </div>

                {/* Completion Rate with Dynamic Colors */}
                {(() => {
                  const pct = parseFloat(ward.completed);
                  let colorClass = "bg-green-500";
                  let textClass = "text-green-600";
                  if (pct >= 95) {
                    colorClass = "bg-emerald-500";
                    textClass = "text-emerald-600";
                  } else if (pct >= 90) {
                    colorClass = "bg-teal-500";
                    textClass = "text-teal-600";
                  } else {
                    colorClass = "bg-amber-500";
                    textClass = "text-amber-600";
                  }
                  return (
                    <div className="col-span-2 space-y-1.5 px-4 text-center">
                      <span className={`font-black text-sm font-mono ${textClass} block`}>{ward.completed}</span>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full rounded-full ${colorClass}`} style={{ width: ward.completed }}></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Score Rating Pill */}
                <div className="col-span-2 flex items-center justify-end pr-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200/50 rounded-full text-xs font-black font-mono shadow-sm">
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
