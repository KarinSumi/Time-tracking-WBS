import React, { useState } from 'react';

const TimeEntryForm: React.FC = () => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    } catch {
      alert('An error occurred while logging entry.');
    }
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 ml-1">Quick Log</label>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-medium focus:ring-0 p-0 text-white placeholder:text-white/40"
            placeholder="What are you working on?"
            required
          />
        </div>
        <div className="w-24 border-l border-white/10 pl-4">
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-medium focus:ring-0 p-0 text-white placeholder:text-white/40"
            placeholder="0.0h"
            required
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl font-semibold text-sm shadow-apple active:scale-[0.98] transition-all duration-200"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default TimeEntryForm;
