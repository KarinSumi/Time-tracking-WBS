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
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Audit History</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="border-l-4 border-indigo-500 pl-4 py-2 bg-gray-50 rounded-r">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-indigo-700">{log.action}</span>
              <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">By:</span> {log.performedBy}</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-red-50 p-2 rounded">
                  <span className="text-xs font-bold text-red-600 uppercase">Before</span>
                  <pre className="text-xs overflow-auto">{JSON.stringify(log.oldValues, null, 2)}</pre>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <span className="text-xs font-bold text-green-600 uppercase">After</span>
                  <pre className="text-xs overflow-auto">{JSON.stringify(log.newValues, null, 2)}</pre>
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
