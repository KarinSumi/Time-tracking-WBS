import React from 'react';
import { Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import type { TimeEntry } from '../types';

const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};



interface DashboardProps { entries: TimeEntry[]; onRefresh?: () => void; onEdit?: (entry: TimeEntry) => void; }

import { deleteEntry, updateEntry } from '../api';

const Dashboard: React.FC<DashboardProps> = ({ entries, onRefresh, onEdit }) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Intelligent Workflow Nudge
  React.useEffect(() => {
    if (!entries || !entries.length || !user?.id) return;
    const drafts = entries.filter(e => e && e.status === 'DRAFT' && e.userId === user?.id);
    if (drafts.length >= 5) {
      const timer = setTimeout(() => {
        addToast({
          type: 'info',
          title: 'Unsubmitted Drafts',
          message: `You have ${drafts.length} entries in draft. Would you like to submit them now?`
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [entries, user?.id, addToast]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteEntry(id);
      addToast({ type: 'success', title: 'Entry deleted' });
      onRefresh?.();
    } catch {
      addToast({ type: 'error', title: 'Failed to delete' });
    }
  };

  const handleSubmitEntry = async (id: string) => {
    try {
      await updateEntry(id, { status: 'SUBMITTED' });
      addToast({ type: 'success', title: 'Entry submitted' });
      onRefresh?.();
    } catch {
      addToast({ type: 'error', title: 'Failed to submit' });
    }
  };

  const safeEntries = entries || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Team Activity</h2>
        <button className="text-xs font-bold text-blue-500 hover:underline">View All</button>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="space-y-1.5">
          {safeEntries.map((entry, idx) => {
            if (!entry) return null;
            return (
              <div key={entry.id || idx}
                className="flex items-center justify-between group p-3 rounded-2xl transition-all duration-200 hover:bg-[var(--bg-surface-hover)] border border-transparent hover:border-[var(--border-subtle)]">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {entry.user?.avatarUrl ? <img src={entry.user.avatarUrl} alt={entry.user.name} className="w-full h-full object-cover" />
                        : <span className="text-[10px] font-bold text-[var(--text-faint)]">{entry.user?.name ? getInitials(entry.user.name) : '??'}</span>}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-[var(--text-primary)] truncate">{entry.taskDescription}</span>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[var(--text-muted)]">
                      <span className="text-[11px] font-medium">{entry.user?.name || 'Unknown'}</span>
                      <span className="text-[11px] opacity-40">·</span>
                      <span className="text-[11px] font-medium truncate">{entry.project?.name || 'General'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                    {Number(entry.hours || 0).toFixed(1)}h</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${entry.status === 'SUBMITTED' ? 'text-green-500' : 'text-[var(--text-faint)]'}`}>
                    {entry.status === 'SUBMITTED' ? 'FINISHED' : 'ONGOING'}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {entry.status === 'DRAFT' && (
                    <button onClick={() => entry.id && handleSubmitEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-green-500/10 text-[var(--text-faint)] hover:text-green-500 transition-all" title="Submit">
                      <CheckCircle2 size={13} />
                    </button>
                  )}
                  {entry.status !== 'SUBMITTED' && (
                    <>
                      <button onClick={() => onEdit?.(entry)} className="p-1.5 rounded-lg hover:bg-[var(--bg-surface-hover)] text-[var(--text-faint)] hover:text-[var(--text-secondary)] transition-all" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => entry.id && handleDelete(entry.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/5 text-[var(--text-faint)] hover:text-red-500 transition-all" title="Delete"><Trash2 size={13} /></button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {safeEntries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                <Clock size={24} className="text-[var(--text-faint)]" /></div>
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">No activity yet</p>
              <p className="text-xs text-[var(--text-faint)]">Time entries will appear here after you save one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
