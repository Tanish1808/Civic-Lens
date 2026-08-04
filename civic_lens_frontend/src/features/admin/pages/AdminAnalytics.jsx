import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, PieChartIcon, Loader2 } from 'lucide-react';
import api from '../../../services/api';

export default function AdminAnalytics() {
  const [trendData, setTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/admin/analytics/resolution-trend'),
      api.get('/admin/analytics/category-breakdown'),
      api.get('/admin/analytics/severity-distribution')
    ])
      .then(([trendRes, catRes, sevRes]) => {
        // 1. Process Trend Data
        const rawTrends = trendRes.data.data.trend || [];
        const trends = rawTrends.map(t => ({
          name: t.period,
          reported: t.created_count,
          resolved: t.resolved_count
        }));
        setTrendData(trends);

        // 2. Process Categories Data
        const categoryFills = {
          pothole: '#1E5F8C',
          garbage: '#E8A33D',
          waterlogging: '#9C27B0',
          streetlight: '#4CAF50',
          other: '#795548'
        };
        const rawCats = catRes.data.data.breakdown || [];
        const categories = rawCats.map(c => ({
          name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
          count: c.count,
          fill: categoryFills[c.category.toLowerCase()] || '#607D8B'
        }));
        setCategoryData(categories);

        // 3. Process Severity Data
        const severityColors = {
          high: '#D64545',
          medium: '#E8A33D',
          low: '#4CAF7D'
        };
        const rawSevs = sevRes.data.data.distribution || [];
        const severities = rawSevs.map(s => ({
          name: s.severity.charAt(0).toUpperCase() + s.severity.slice(1),
          value: s.count,
          color: severityColors[s.severity.toLowerCase()] || '#607D8B'
        }));
        setSeverityData(severities);

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin analytics datasets:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] w-full bg-[#0E131F] text-white space-y-4">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
          Computing telemetry charts...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#0E131F] text-white min-h-screen">
      
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
          {/* Custom Legends list */}
          <div className="flex justify-center gap-4 text-xs font-semibold">
            {severityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Load bar chart (12 Columns) */}
      <div className="bg-[#151B26]/30 border border-gray-800/80 rounded-card p-6 shadow-2xl backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-amber-500" />
          <span>Category-wise Volume Breakdown</span>
        </h2>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151B26', border: '1px solid #1F2937', borderRadius: '8px', color: '#FFF' }}
                cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
