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
        const data = await response.json();
        alert(`Entry logged successfully!`);
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
    <div className="p-8 bg-white/80 backdrop-blur-xl rounded-apple shadow-apple border border-white/20">
      <h2 className="text-lg font-semibold text-gray-900 tracking-tight mb-6">Log Hours</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest mb-1.5 ml-1">Duration</label>
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="block w-full rounded-xl bg-apple-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-apple-blue transition-all duration-200 text-sm p-3"
            placeholder="8.0"
            required
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-apple-gray-500 uppercase tracking-widest mb-1.5 ml-1">Task</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="block w-full rounded-xl bg-apple-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-apple-blue transition-all duration-200 text-sm p-3 min-h-[100px]"
            placeholder="What did you work on?"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-apple-blue text-white rounded-xl font-semibold text-sm shadow-apple hover:opacity-90 active:scale-[0.98] transition-all duration-200"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default TimeEntryForm;
