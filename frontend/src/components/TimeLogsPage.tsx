import React, { useState, useMemo } from 'react';
import type { TimeEntry } from '../types';
import { Clock, Search, Filter, Trash2, CheckCircle2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MultiDayLogModal from './MultiDayLogModal';
import { updateEntry, deleteEntry, bulkUpdateStatus } from '../api';

interface TimeLogsPageProps { entries: TimeEntry[]; onRefresh: () => void; }

const TimeLogsPage: React.FC<TimeLogsPageProps> = ({ entries, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showMultiDayModal, setShowMultiDayModal] = useState(false);
  const { } = useAuth();
  const { addToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.taskDescription.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      return true;
    });
  }, [entries, search, statusFilter]);

  const totalHours = filtered.reduce((s, e) => s + Number(e.hours), 0);

  const handleSubmitEntry = async (id: string) => {
    try {
      await updateEntry(id, { status: 'SUBMITTED' });
      addToast({ type: 'success', title: 'Entry submitted' });
      onRefresh();
    } catch { addToast({ type: 'error', title: 'Submit failed' }); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteEntry(id);
      addToast({ type: 'success', title: 'Entry deleted' });
      onRefresh();
    } catch { addToast({ type: 'error', title: 'Delete failed' }); }
  };

  const handleBulkAction = async (action: 'SUBMITTED' | 'DELETE') => {
    if (selectedIds.length === 0) return;
    if (action === 'DELETE' && !confirm(`Delete ${selectedIds.length} entries?`)) return;

    try {
      if (action === 'DELETE') {
        for (const id of selectedIds) {
          await deleteEntry(id);
        }
        addToast({ type: 'success', title: `${selectedIds.length} entries deleted` });
      } else {
        await bulkUpdateStatus(selectedIds, action);
        addToast({ type: 'success', title: `${selectedIds.length} entries submitted` });
      }
      setSelectedIds([]);
      onRefresh();
    } catch { addToast({ type: 'error', title: 'Bulk action error' }); }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(e => e.id!).filter(id => !!id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Time Logs</h1>
          <p className="text-[10px] text-[var(--text-faint)] mt-1 uppercase tracking-widest font-black">{filtered.length} entries · {totalHours.toFixed(1)}h total</p>
        </div>
        <button 
          onClick={() => setShowMultiDayModal(true)}
          className="btn-primary px-8 py-3 text-sm font-bold flex items-center gap-2 group rounded-2xl"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Bulk Log
        </button>
      </div>

      <MultiDayLogModal 
        isOpen={showMultiDayModal} 
        onClose={() => setShowMultiDayModal(false)} 
        onSuccess={onRefresh} 
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-[var(--text-faint)]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-styled text-xs py-2.5">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]">
              <th className="px-6 py-4 text-left w-12">
                <input type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-[var(--border-subtle)] bg-transparent text-black focus:ring-0" />
              </th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Task Description</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Project</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Phase</th>
              <th className="text-left px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Date</th>
              <th className="text-right px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Hours</th>
              <th className="text-center px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Status</th>
              <th className="text-right px-6 py-4 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map((entry, i) => (
              <tr key={entry.id || i} className={`hover:bg-[var(--bg-surface-hover)] transition-colors group ${selectedIds.includes(entry.id!) ? 'bg-black/5' : ''}`}>
                <td className="px-6 py-5 text-center">
                   <input type="checkbox" 
                    checked={selectedIds.includes(entry.id!)}
                    onChange={() => entry.id && toggleSelect(entry.id)}
                    className="rounded border-[var(--border-subtle)] bg-transparent text-black focus:ring-0" />
                </td>
                <td className="px-6 py-5 text-sm text-[var(--text-primary)] font-bold">{entry.taskDescription}</td>
                <td className="px-6 py-5">{entry.project ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-hover)]" style={{ color: entry.project.color }}>{entry.project.name}</span>
                ) : <span className="text-[10px] text-[var(--text-faint)] font-bold">—</span>}</td>
                <td className="px-6 py-5">
                   <span className="text-[11px] text-[var(--text-muted)] font-medium">{entry.phase?.name || '—'}</span>
                </td>
                <td className="px-6 py-5 text-[11px] text-[var(--text-faint)] font-bold tabular-nums">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-6 py-5 text-sm text-[var(--text-primary)] font-black tabular-nums text-right">{entry.hours.toFixed(1)}h</td>
                <td className="px-6 py-5 text-center">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${entry.status === 'SUBMITTED' ? 'text-green-500' : 'text-zinc-400'}`}>
                    {entry.status === 'SUBMITTED' ? 'FINISHED' : 'ONGOING'}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {entry.status === 'DRAFT' && (
                      <button onClick={() => entry.id && handleSubmitEntry(entry.id)}
                        className="p-2 rounded-xl hover:bg-green-500/10 text-green-500 transition-all" title="Submit">
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    {entry.status !== 'SUBMITTED' && (
                      <button onClick={() => entry.id && handleDelete(entry.id)}
                        className="p-2 rounded-xl hover:bg-red-500/5 text-red-500 transition-all" title="Delete">
                        <Trash2 size={14} />
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

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="px-8 py-5 rounded-3xl border border-black shadow-2xl flex items-center gap-8 bg-black text-white">
            <div className="flex items-center gap-4 pr-8 border-r border-white/10">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-black text-black">
                {selectedIds.length}
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em]">Selected</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleBulkAction('SUBMITTED')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-all"
              >
                <CheckCircle2 size={14} /> Submit
              </button>
              <button 
                onClick={() => handleBulkAction('DELETE')}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-zinc-800 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-wider transition-all"
              >
                <Trash2 size={14} /> Delete
              </button>
              <button 
                onClick={() => setSelectedIds([])}
                className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-black ml-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeLogsPage;
