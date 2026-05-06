import React from 'react';

const Dashboard: React.FC<{ entries: any[] }> = ({ entries }) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest mb-6">Team Activity</h2>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className="flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 group-hover:text-apple-blue transition-colors">{entry.taskDescription}</span>
                <span className="text-[10px] text-apple-gray-400 font-medium uppercase tracking-tight">{entry.userId.split('-')[0]} • {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 tabular-nums bg-apple-gray-50 px-2 py-1 rounded-lg group-hover:bg-apple-blue/5 transition-colors">{entry.hours}h</span>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-apple-gray-300 italic">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
