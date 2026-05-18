import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, User as UserIcon, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';

import { useToast } from '../context/ToastContext';

import type { AuditLog } from '../types';

import { getAuditLogs } from '../api';

const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const { addToast } = useToast();

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load audit logs' });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entityType.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-500 bg-red-500/10';
    if (action.includes('CREATE')) return 'text-green-500 bg-green-500/10';
    if (action.includes('UPDATE')) return 'text-blue-500 bg-blue-500/10';
    return 'text-[var(--text-faint)] bg-[var(--bg-surface-hover)]';
  };

  return (
    <div className="space-y-6">
      {/* Search & Stats */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-2">
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input 
            type="text" 
            placeholder="Search audit trail..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="glass-input w-full pl-11 pr-4 py-3 rounded-2xl text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">
          <Calendar size={12} />
          Showing last 500 events
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-surface-hover)] border-b border-[var(--border-subtle)]">
                <th className="px-6 py-5 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">User</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Action</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Target</th>
                <th className="px-6 py-5 text-[10px] font-black text-[var(--text-faint)] uppercase tracking-[0.2em]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-8 h-8 text-blue-500/20 animate-spin mx-auto" /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-white/20 text-xs font-medium">No audit logs found.</td></tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--bg-surface-hover)] transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <p className="text-xs text-[var(--text-primary)] font-bold">{format(new Date(log.timestamp), 'MMM d, HH:mm')}</p>
                      <p className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-tighter">{format(new Date(log.timestamp), 'yyyy')}</p>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
                          {log.user?.avatarUrl ? (
                            <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon size={14} className="text-[var(--text-faint)]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{log.user?.name || 'Unknown'}</p>
                          <p className="text-[9px] text-[var(--text-faint)] font-medium">{log.user?.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Info size={12} className="text-[var(--text-faint)]" />
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{log.entityType}</span>
                      </div>
                      <p className="text-[9px] text-[var(--text-faint)] font-mono mt-0.5">{log.entityId.slice(0, 12)}...</p>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed truncate group-hover:whitespace-normal group-hover:text-[var(--text-secondary)] transition-all">
                        {log.newValues ? JSON.stringify(log.newValues) : log.oldValues ? JSON.stringify(log.oldValues) : 'No additional metadata available.'}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
