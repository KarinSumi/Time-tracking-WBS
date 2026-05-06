import React from 'react';

const Dashboard: React.FC<{ entries: any[] }> = ({ entries }) => {
  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Hierarchical Productivity Roll-up</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry, idx) => (
              <tr key={entry.id || idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.taskDescription}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.hours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
