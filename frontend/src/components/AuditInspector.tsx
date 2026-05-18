import React from 'react';
import { Shield } from 'lucide-react';

import type { AuditLog } from '../types';

const AuditInspector: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Audit History</h2>
        <span className="text-xs font-bold text-[var(--text-faint)]">{logs.length} changes</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="pb-4 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider w-[15%]">Log Date</th>
              <th className="pb-4 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider w-[25%]">Previous Status</th>
              <th className="pb-4 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider w-[30%]">Updated Status</th>
              <th className="pb-4 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider w-[15%] text-center">Delta</th>
              <th className="pb-4 text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-wider w-[15%]">Modifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {logs.map((log) => {
              const delta = (Number(log.newValues?.hours) || 0) - (Number(log.oldValues?.hours) || 0);
              const dateObj = new Date(log.timestamp);
              
              return (
                <tr key={log.id} className="group hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="text-[10px] text-[var(--text-faint)] font-medium mt-0.5">{dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-4">
                    <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {log.oldValues?.hours ? `${log.oldValues?.hours}h - ` : ''}{String(log.oldValues?.description || 'N/A')}
                    </span>
                  </td>
                  <td className="py-5 pr-4">
                    <span className="text-xs font-bold text-[var(--text-primary)] leading-relaxed">
                      {log.newValues?.hours ? `${log.newValues?.hours}h - ` : ''}{String(log.newValues?.description || 'N/A')}
                    </span>
                  </td>
                  <td className="py-5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${delta >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}h
                    </span>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-black text-[9px] font-black text-white flex items-center justify-center">
                         {log.performedBy?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                       </div>
                       <span className="text-[11px] font-bold text-[var(--text-primary)]">{log.performedBy?.split(' ')[0] || 'System'}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <Shield size={24} className="text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-xs text-[var(--text-faint)]">No audit events recorded</p>
        </div>
      )}
    </div>
  );
};

export default AuditInspector;
