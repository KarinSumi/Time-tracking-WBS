import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Calendar, ShieldCheck } from 'lucide-react';


import { getForecasting } from '../api';
import type { ForecastData } from '../types';

const ForecastingDashboard: React.FC = () => {

  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getForecasting()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>;

  const averageUtilization = Math.round(data.reduce((acc, d) => acc + d.utilization, 0) / data.length);
  const peakMonth = [...data].sort((a, b) => b.utilization - a.utilization)[0];

  return (
    <div className="space-y-6">
      {/* Forecasting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-5 bg-gradient-to-br from-blue-600/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400"><TrendingUp size={18} /></div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Avg. Future Load</span>
          </div>
          <h4 className="text-2xl font-bold text-white">{averageUtilization}%</h4>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tight font-medium">Predicted across next 6 months</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-amber-600/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><AlertCircle size={18} /></div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Peak Bottleneck</span>
          </div>
          <h4 className="text-2xl font-bold text-white">{peakMonth.month}</h4>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tight font-medium">Expected {peakMonth.utilization}% load intensity</p>
        </div>

        <div className="glass-card p-5 bg-gradient-to-br from-emerald-600/5 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><ShieldCheck size={18} /></div>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Safe Capacity</span>
          </div>
          <h4 className="text-2xl font-bold text-white">420h</h4>
          <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tight font-medium">Avail. buffer for new projects</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-7">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={14} className="text-blue-400" /> Organizational Load Forecast
            </h3>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Aggregated planned hours vs max organizational capacity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Planned</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">Max Capacity</span>
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="maxCapacity" stroke="rgba(255,255,255,0.1)" fill="rgba(255,255,255,0.02)" strokeDasharray="5 5" />
              <Area type="monotone" dataKey="plannedHours" name="Planned Load" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorPlanned)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Utilization Heatmap-style Bars */}
      <div className="glass-card p-7">
        <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Intensity Heatmap</h3>
        <div className="grid grid-cols-6 gap-4">
          {data.map(m => (
            <div key={m.month} className="space-y-3">
              <div className="h-40 w-full bg-white/5 rounded-xl relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${m.utilization}%`,
                    background: m.utilization > 100 ? '#ef4444' : m.utilization > 80 ? '#f59e0b' : '#3b82f6',
                    boxShadow: `0 0 20px ${m.utilization > 80 ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">{m.month}</p>
                <p className={`text-[9px] font-bold mt-0.5 ${m.utilization > 100 ? 'text-red-400' : 'text-white/20'}`}>{m.utilization}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForecastingDashboard;
