import React, { useState } from 'react';

const TimeEntryForm: React.FC = () => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: parseFloat(hours),
          taskDescription: description,
          userId: 'test-user-id', // Placeholder until auth is implemented
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Entry logged successfully! ID: ${data.id}`);
        setHours('');
        setDescription('');
      } else {
        alert('Failed to log entry.');
      }
    } catch (error) {
      console.error('Error logging entry:', error);
      alert('An error occurred while logging entry.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900">Log Your Time</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hours</label>
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="e.g. 8"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Task Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            placeholder="What did you work on?"
            rows={3}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Entry
        </button>
      </form>
    </div>
  );
};

export default TimeEntryForm;
