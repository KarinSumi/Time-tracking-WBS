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
    <div className="p-8 bg-white/80 backdrop-blur-xl rounded-apple shadow-apple border border-white/20">
      <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Audit History</h2>
      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6 border-l-[0.5px] border-apple-gray-200">
            <div className="absolute -left-[3.5px] top-1.5 w-[7px] h-[7px] rounded-full bg-apple-blue shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-apple-blue uppercase tracking-widest">{log.action}</span>
              <span className="text-[10px] font-medium text-apple-gray-400">{new Date(log.timestamp).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="text-sm">
              <p className="text-gray-900 font-medium mb-4">Modified by <span className="text-apple-blue">{log.performedBy.split(' ')[0]}</span></p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-apple-gray-50/50 p-4 rounded-xl border border-apple-gray-100/50">
                  <span className="text-[9px] font-bold text-apple-gray-400 uppercase tracking-widest block mb-2">Previous</span>
                  <pre className="text-[11px] text-apple-gray-500 font-mono leading-relaxed">{JSON.stringify(log.oldValues, null, 2)}</pre>
                </div>
                <div className="bg-white p-4 rounded-xl border border-apple-gray-100 shadow-sm">
                  <span className="text-[9px] font-bold text-apple-blue uppercase tracking-widest block mb-2">Updated</span>
                  <pre className="text-[11px] text-gray-900 font-mono leading-relaxed">{JSON.stringify(log.newValues, null, 2)}</pre>
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
