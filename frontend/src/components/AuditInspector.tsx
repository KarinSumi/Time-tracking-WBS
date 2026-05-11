import React from 'react';
import { Shield, ArrowUpRight, ArrowDownRight, Pencil, Trash2, PlusCircle } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  oldValues: Record<string, unknown>;
  newValues: Record<string, unknown>;
  timestamp: string;
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  CREATE: { icon: PlusCircle, color: '#4ade80', bg: 'rgba(34,197,94,0.1)', label: 'Created' },
  UPDATE: { icon: Pencil, color: '#60a5fa', bg: 'rgba(59,130,246,0.1)', label: 'Updated' },
  DELETE: { icon: Trash2, color: '#f87171', bg: 'rgba(239,68,68,0.1)', label: 'Deleted' },
};

const relativeTime = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const renderDiffValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const AuditInspector: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2">
          <Shield size={13} className="text-white/25" />
          Audit History
        </h2>
        <span className="text-[10px] text-white/20 font-medium">{logs.length} changes</span>
      </div>

      {/* Timeline */}
      <div className="space-y-5">
        {logs.map((log) => {
          const config = actionConfig[log.action] || actionConfig.UPDATE!;
          const Icon = config.icon;
          const changedKeys = Object.keys(log.newValues || {});

          return (
            <div
              key={log.id}
              className="relative pl-8 group"
            >
              {/* Timeline connector */}
              <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/5 group-last:hidden" />

              {/* Timeline dot */}
              <div
                className="absolute left-0 top-1 w-[22px] h-[22px] rounded-lg flex items-center justify-center"
                style={{ background: config.bg }}
              >
                <Icon size={11} style={{ color: config.color }} />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
                    style={{ color: config.color, background: config.bg }}
                  >
                    {config.label}
                  </span>
                  <span className="text-[10px] text-white/25 font-medium">{relativeTime(log.timestamp)}</span>
                </div>

                <p className="text-[13px] text-white/60 mb-3">
                  by <span className="text-white/80 font-medium">{log.performedBy?.split(' ')[0] || 'Unknown'}</span>
                </p>

                {/* Diff View */}
                {changedKeys.length > 0 && (
                  <div className="space-y-1.5">
                    {changedKeys.map((key) => {
                      const oldVal = log.oldValues?.[key];
                      const newVal = log.newValues?.[key];
                      const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                      if (!changed && log.action === 'UPDATE') return null;

                      return (
                        <div
                          key={key}
                          className="flex items-start gap-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                        >
                          <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider min-w-[70px] pt-0.5">
                            {key}
                          </span>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {log.action === 'UPDATE' && oldVal !== undefined && (
                              <>
                                <span className="flex items-center gap-1 text-xs text-red-400/60">
                                  <ArrowDownRight size={10} />
                                  <span className="line-through truncate max-w-[140px]">{renderDiffValue(oldVal)}</span>
                                </span>
                                <span className="text-white/10">→</span>
                              </>
                            )}
                            <span className="flex items-center gap-1 text-xs text-green-400/80 font-medium">
                              <ArrowUpRight size={10} />
                              <span className="truncate max-w-[200px]">{renderDiffValue(newVal)}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Shield size={24} className="text-white/10 mx-auto mb-3" />
            <p className="text-xs text-white/25">No audit events recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditInspector;
