import React from 'react';

const Dashboard: React.FC<{ entries: any[] }> = ({ entries }) => {
  return (
    <div className="p-8 bg-white/80 backdrop-blur-xl rounded-apple shadow-apple border border-white/20">
      <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Team Activity</h2>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-apple-gray-100">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest">User</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest">Description</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest">Hours</th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-apple-gray-50">
            {entries.map((entry, idx) => (
              <tr key={entry.id || idx} className="hover:bg-apple-gray-50/50 transition-colors duration-150">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.userId.split('-')[0]}</td>
                <td className="px-4 py-4 text-sm text-apple-gray-500">{entry.taskDescription}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{entry.hours}h</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-apple-gray-400">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
