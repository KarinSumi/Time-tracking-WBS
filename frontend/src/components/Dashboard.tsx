import React from 'react';
import { Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export interface TimeEntry {
  id?: string;
  taskDescription: string;
  hours: number;
  userId: string;
  date: string;
  status?: string;
  user?: { name: string; avatarUrl?: string; };
  project?: { id: string; name: string; color: string; } | null;
  phase?: { id: string; name: string; } | null;
}

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const relativeDate = (dateStr: string) => {
  const d = new Date(dateStr), now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'Today'; if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

interface DashboardProps { entries: TimeEntry[]; onRefresh?: () => void; onEdit?: (entry: TimeEntry) => void; }

const Dashboard: React.FC<DashboardProps> = ({ entries, onRefresh, onEdit }) => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { addToast({ type: 'success', title: 'Entry deleted' }); onRefresh?.(); }
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
      if (res.ok) { addToast({ type: 'success', title: 'Entry submitted' }); onRefresh?.(); }
      else addToast({ type: 'error', title: 'Failed to submit' });
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2">
          <Clock size={13} className="text-white/25" />Team Activity</h2>
        {entries.length > 0 && <span className="badge badge-info">{entries.length} entries</span>}
      </div>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="space-y-1.5">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx}
              className="flex items-center justify-between group p-3 rounded-2xl transition-all duration-200 hover:bg-white/[0.03] border border-transparent hover:border-white/[0.06]">
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/8 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {entry.user?.avatarUrl ? <img src={entry.user.avatarUrl} alt={entry.user.name} className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-bold text-white/30">{entry.user?.name ? getInitials(entry.user.name) : '??'}</span>}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-white/90 group-hover:text-white transition-colors truncate">{entry.taskDescription}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-white/30 font-medium">{entry.user?.name || 'Unknown'} · {relativeDate(entry.date)}</span>
                    {entry.project && <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${entry.project.color}15`, color: entry.project.color }}>{entry.project.name}</span>}
                    {entry.phase && <span className="text-[9px] text-white/25 px-1.5 py-0.5 rounded bg-white/[0.03]">{entry.phase.name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                {entry.status && <span className={`badge text-[9px] hidden sm:inline-flex ${entry.status === 'SUBMITTED' ? 'badge-success' : 'badge-draft'}`}>
                  {entry.status === 'SUBMITTED' ? 'Submitted' : 'Draft'}</span>}
                <span className="text-[13px] font-semibold text-white/70 tabular-nums bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/[0.04] group-hover:border-blue-500/15 group-hover:text-blue-400 transition-all min-w-[48px] text-center">
                  {entry.hours}h</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {entry.status === 'DRAFT' && (
                    <button onClick={() => entry.id && handleSubmitEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-green-500/10 text-white/30 hover:text-green-400 transition-all" title="Submit">
                      <CheckCircle2 size={13} />
                    </button>
                  )}
                  {entry.status !== 'SUBMITTED' && (
                    <>
                      <button onClick={() => onEdit?.(entry)} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => entry.id && handleDelete(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/30 hover:text-red-400 transition-all" title="Delete"><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Clock size={24} className="text-white/15" /></div>
              <p className="text-sm font-medium text-white/40 mb-1">No activity yet</p>
              <p className="text-xs text-white/20">Time entries will appear here after you save one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
