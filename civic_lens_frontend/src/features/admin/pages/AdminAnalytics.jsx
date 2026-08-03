import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';

export default function AdminAnalytics() {
  
  // Mock Resolution Trend Data
  const trendData = [
    { name: 'Mon', reported: 12, resolved: 8 },
    { name: 'Tue', reported: 18, resolved: 10 },
    { name: 'Wed', reported: 15, resolved: 14 },
    { name: 'Thu', reported: 22, resolved: 16 },
    { name: 'Fri', reported: 30, resolved: 24 },
    { name: 'Sat', reported: 10, resolved: 18 },
    { name: 'Sun', reported: 8, resolved: 12 },
  ];

  // Category Distribution
  const categoryData = [
    { name: 'Pothole', count: 48, fill: '#1E5F8C' },
    { name: 'Garbage', count: 32, fill: '#E8A33D' },
    { name: 'Waterlogging', count: 28, fill: '#9C27B0' },
    { name: 'Streetlight', count: 18, fill: '#4CAF50' },
  ];

  // Severity Distribution
  const severityData = [
    { name: 'High', value: 45, color: '#D64545' },
    { name: 'Medium', value: 35, color: '#E8A33D' },
    { name: 'Low', value: 20, color: '#4CAF7D' },
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#0E131F] text-white">
      
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-gray-400">Statistical evaluations of ticket resolution velocities, category ratios, and severity loads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Resolution Trend Chart (8 Columns) */}
        <div className="lg:col-span-8 bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Reporting vs. Resolution Trends</span>
          </h2>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E5F8C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#1E5F8C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF7D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4CAF7D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B26', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="reported" stroke="#1E5F8C" fillOpacity={1} fill="url(#colorReported)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="#4CAF7D" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity pie chart distribution (4 Columns) */}
        <div className="lg:col-span-4 bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-amber-500" />
            <span>Severity Load</span>
          </h2>
          <div className="h-72 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B26', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category bar distribution (12 Columns) */}
        <div className="lg:col-span-12 bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>Tickets Counts by Category</span>
          </h2>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151B26', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
