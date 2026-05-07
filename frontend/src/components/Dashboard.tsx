import React from 'react';

const Dashboard: React.FC<{ entries: any[] }> = ({ entries }) => {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Team Activity</h2>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={entry.id || idx} className="flex items-center justify-between group p-2 rounded-xl transition-all duration-200 hover:bg-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white group-hover:text-white transition-colors">{entry.taskDescription}</span>
                <span className="text-[10px] text-white/60 font-medium uppercase tracking-tight">{entry.userId.split('-')[0]} • {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums bg-white/10 px-2 py-1 rounded-lg group-hover:bg-white/20 transition-colors">{entry.hours}h</span>
            </div>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-white/40 italic">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
