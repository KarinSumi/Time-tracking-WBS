import React, { useMemo } from 'react';
import type { TimeEntry } from './Dashboard';
import { BarChart3, TrendingUp } from 'lucide-react';

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

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <h1 className="text-xl font-semibold text-white mb-1">Reports</h1>
      <p className="text-xs text-white/30 mb-6">Weekly overview</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[{ l: 'This Week', v: `${totalW.toFixed(1)}h`, s: 'of 40h target' },
          { l: 'Daily Avg', v: `${(totalW/7).toFixed(1)}h`, s: 'per day' },
          { l: 'Entries', v: `${entries.length}`, s: 'total' }].map((c, i) => (
          <div key={i} className="glass-card p-6">
            <div className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">{c.l}</div>
            <div className="text-3xl font-bold text-white tabular-nums">{c.v}</div>
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
            return (<div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] text-white/40 tabular-nums">{d.hours > 0 ? `${d.hours.toFixed(1)}h` : ''}</span>
              <div className="w-full flex-1 flex items-end">
                <div className="w-full rounded-lg transition-all duration-700" style={{
                  height: `${Math.max(pct, 2)}%`,
                  background: today ? 'var(--gradient-accent)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${today ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}` }} />
              </div>
              <span className={`text-[10px] font-semibold ${today ? 'text-blue-400' : 'text-white/30'}`}>{d.day}</span>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
