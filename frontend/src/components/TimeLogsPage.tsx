import React, { useState, useMemo } from 'react';
import type { TimeEntry } from './Dashboard';
import { Clock, Search, Filter, Trash2, Calendar, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface TimeLogsPageProps { entries: TimeEntry[]; onRefresh: () => void; }

const TimeLogsPage: React.FC<TimeLogsPageProps> = ({ entries, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { token } = useAuth();
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.taskDescription.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      return true;
    });
  }, [entries, search, statusFilter]);

  const totalHours = filtered.reduce((s, e) => s + Number(e.hours), 0);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { addToast({ type: 'success', title: 'Entry deleted' }); onRefresh(); }
      else addToast({ type: 'error', title: 'Failed to delete' });
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  const handleSubmitEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'SUBMITTED' })
      });
      if (res.ok) { addToast({ type: 'success', title: 'Entry submitted' }); onRefresh(); }
      else addToast({ type: 'error', title: 'Failed to submit' });
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Time Logs</h1>
          <p className="text-xs text-white/30 mt-1">{filtered.length} entries · {totalHours.toFixed(1)}h total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-9 pr-4 py-2.5 rounded-xl text-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/25" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-styled text-xs py-2">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Task</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Project</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Phase</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider"><Calendar size={12} className="inline mr-1" />Date</th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Hours</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, i) => (
              <tr key={entry.id || i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3.5 text-sm text-white/80 font-medium">{entry.taskDescription}</td>
                <td className="px-5 py-3.5">{entry.project ? (
                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${entry.project.color}15`, color: entry.project.color }}>{entry.project.name}</span>
                ) : <span className="text-[10px] text-white/15">—</span>}</td>
                <td className="px-5 py-3.5">{entry.phase ? (
                  <span className="text-[10px] text-white/40">{entry.phase.name}</span>
                ) : <span className="text-[10px] text-white/15">—</span>}</td>
                <td className="px-5 py-3.5 text-xs text-white/40 tabular-nums">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-5 py-3.5 text-sm text-white/70 font-semibold tabular-nums text-right">{entry.hours}h</td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`badge text-[9px] ${entry.status === 'SUBMITTED' ? 'badge-success' : 'badge-draft'}`}>
                    {entry.status === 'SUBMITTED' ? 'Submitted' : 'Draft'}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {entry.status === 'DRAFT' && (
                      <button onClick={() => entry.id && handleSubmitEntry(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-green-500/10 text-white/30 hover:text-green-400 transition-all" title="Submit">
                        <CheckCircle2 size={13} />
                      </button>
                    )}
                    {entry.status !== 'SUBMITTED' && (
                      <button onClick={() => entry.id && handleDelete(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/20 hover:text-red-400 transition-all" title="Delete">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <Clock size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">No entries match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeLogsPage;
