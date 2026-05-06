import React from 'react';

const Dashboard: React.FC = () => {
  const mockStats = [
    { team: 'Engineering', hours: 450, people: 12 },
    { team: 'Product', hours: 180, people: 5 },
    { team: 'Design', hours: 120, people: 3 },
  ];

  return (
    <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Hierarchical Productivity Roll-up</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team / Org Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockStats.map((stat, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.team}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.hours}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.people}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
