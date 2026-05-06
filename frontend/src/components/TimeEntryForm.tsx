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
          userId: 'test-user-id',
        }),
      });

      if (response.ok) {
        alert(`Entry logged successfully!`);
        setHours('');
        setDescription('');
      } else {
        alert('Failed to log entry.');
      }
    } catch (error) {
      alert('An error occurred while logging entry.');
    }
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <label className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest mb-4 ml-1">Quick Log</label>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-medium focus:ring-0 p-0 placeholder:text-apple-gray-200"
            placeholder="What are you working on?"
            required
          />
        </div>
        <div className="w-24 border-l border-apple-gray-100 pl-4">
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-medium focus:ring-0 p-0 text-apple-blue placeholder:text-apple-gray-200"
            placeholder="0.0h"
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-apple-blue text-white rounded-xl font-semibold text-sm shadow-apple hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default TimeEntryForm;
