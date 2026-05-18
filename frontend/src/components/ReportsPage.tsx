import React, { useMemo } from 'react';
import type { TimeEntry } from '../types';
import { BarChart3, TrendingUp, Users } from 'lucide-react';
import ResourceCapacityDashboard from './ResourceCapacityDashboard';
import ForecastingDashboard from './ForecastingDashboard';

interface ReportsPageProps { entries: TimeEntry[]; }

const ReportsPage: React.FC<ReportsPageProps> = ({ entries }) => {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = useMemo(() => {
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0);
    return weekdays.map((day, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const hours = entries.filter(e => new Date(e.date).toDateString() === d.toDateString()).reduce((s, e) => s + Number(e.hours), 0);
      return { day, hours, date: d };
    });
  }, [entries]);
  const maxH = Math.max(8, ...weeklyData.map(d => d.hours));
  const totalW = weeklyData.reduce((s, d) => s + d.hours, 0);

  const [activeTab, setActiveTab] = React.useState<'weekly' | 'capacity' | 'forecast'>('weekly');

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-blue-200/40 mt-1 uppercase tracking-widest font-semibold">Strategic Insights & Resource Health</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'weekly' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/70'}`}
          >
            <BarChart3 size={14} /> Weekly Overview
          </button>
          <button 
            onClick={() => setActiveTab('capacity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'capacity' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/70'}`}
          >
            <Users size={14} /> Resource Capacity
          </button>
          <button 
            onClick={() => setActiveTab('forecast')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'forecast' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:text-white/70'}`}
          >
            <TrendingUp size={14} /> Future Forecast
          </button>
        </div>
      </div>

      {activeTab === 'weekly' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[{ l: 'This Week', v: `${totalW.toFixed(1)}h`, s: 'of 40h target' },
              { l: 'Daily Avg', v: `${(totalW/7).toFixed(1)}h`, s: 'per day' },
              { l: 'Entries', v: `${entries.length}`, s: 'total' }].map((c, i) => (
              <div key={i} className="glass-card p-6 hover:bg-white/[0.04] transition-colors group">
                <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">{c.l}</div>
                <div className="text-3xl font-bold text-white tabular-nums group-hover:text-blue-400 transition-colors">{c.v}</div>
                <div className="text-xs text-white/30 mt-1 flex items-center gap-1">
                  {i === 2 && <TrendingUp size={12} className="text-green-400" />}{c.s}
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card p-7">
            <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2 mb-6">
              <BarChart3 size={13} className="text-white/25" />Weekly Hours</h2>
            <div className="flex items-end gap-3 h-48">
              {weeklyData.map((d, i) => {
                const pct = maxH > 0 ? (d.hours / maxH) * 100 : 0;
                const today = d.date.toDateString() === new Date().toDateString();
                return (<div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-white/40 tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">{d.hours > 0 ? `${d.hours.toFixed(1)}h` : ''}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div className="w-full rounded-lg transition-all duration-700" style={{
                      height: `${Math.max(pct, 2)}%`,
                      background: today ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${today ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      boxShadow: today ? '0 4px 12px rgba(59,130,246,0.2)' : 'none' }} />
                  </div>
                  <span className={`text-[10px] font-semibold ${today ? 'text-blue-400' : 'text-white/30'}`}>{d.day}</span>
                </div>);
              })}
            </div>
          </div>
        </>
      )}
      {activeTab === 'capacity' && <ResourceCapacityDashboard />}
      {activeTab === 'forecast' && <ForecastingDashboard />}
    </div>
  );
};
export default ReportsPage;
