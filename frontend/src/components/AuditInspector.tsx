import React from 'react';

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  oldValues: any;
  newValues: any;
  timestamp: string;
}

const AuditInspector: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="p-8 bg-white/5 backdrop-blur-xl rounded-apple shadow-apple border border-white/10">
      <h2 className="text-lg font-semibold text-white tracking-tight mb-6">Audit History</h2>
      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 border-l-[0.5px] border-white/20">
            <div className="absolute -left-[3.5px] top-1.5 w-[7px] h-[7px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">{log.action}</span>
              <span className="text-[10px] font-medium text-white/40">{new Date(log.timestamp).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="text-sm">
              <p className="text-white font-medium mb-4">Modified by <span className="text-white/80">{log.performedBy.split(' ')[0]}</span></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest block mb-2">Previous</span>
                  <pre className="text-[11px] text-white/60 font-mono leading-relaxed overflow-x-auto">{JSON.stringify(log.oldValues, null, 2)}</pre>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 shadow-sm">
                  <span className="text-[9px] font-bold text-white uppercase tracking-widest block mb-2">Updated</span>
                  <pre className="text-[11px] text-white font-mono leading-relaxed overflow-x-auto">{JSON.stringify(log.newValues, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditInspector;
