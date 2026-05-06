import React, { useState, useEffect } from 'react';
import TimeEntryForm from './components/TimeEntryForm'
import AuditInspector from './components/AuditInspector'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [entries, setEntries] = useState([]);
  
  useEffect(() => {
    fetch('/api/entries')
      .then(res => res.json())
      .then(data => setEntries(data))
      .catch(err => console.error('Failed to fetch entries:', err));
  }, []);

  const mockLogs = [
    {
      id: '1',
      action: 'UPDATE',
      performedBy: 'John Manager',
      oldValues: { hours: 5, description: 'Client meeting' },
      newValues: { hours: 8, description: 'Client meeting + design work' },
      timestamp: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-apple-gray-50 font-sans text-gray-900 selection:bg-apple-blue/20 flex flex-col">
      {/* Dynamic Glass Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.05]">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Log Center</h1>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-bold text-apple-gray-400 uppercase tracking-widest leading-none mb-1">Today</p>
                <p className="text-sm font-semibold leading-none">Wednesday, May 6</p>
             </div>
             <div className="w-8 h-8 rounded-full bg-apple-gray-100 flex items-center justify-center text-[10px] font-bold text-apple-gray-500">JD</div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-8">
        <div className="grid grid-cols-12 gap-6 h-full auto-rows-[minmax(180px,auto)]">
          
          {/* Bento Tile: Quick Log (Large) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-apple shadow-apple p-8 border border-white/20">
            <TimeEntryForm />
          </div>

          {/* Bento Tile: Stats (Small) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-apple shadow-apple p-8 border border-white/20 flex flex-col items-center justify-center">
             <div className="text-[3rem] font-bold text-apple-blue leading-none">85%</div>
             <p className="text-xs font-bold text-apple-gray-400 uppercase tracking-widest mt-4">Daily Target</p>
          </div>

          {/* Bento Tile: Team Activity (Medium) */}
          <div className="col-span-12 lg:col-span-7 bg-white rounded-apple shadow-apple p-8 border border-white/20 min-h-[400px]">
            <Dashboard entries={entries} />
          </div>

          {/* Bento Tile: Insights (Small/Medium) */}
          <div className="col-span-12 lg:col-span-5 bg-apple-blue rounded-apple shadow-apple p-8 border border-white/10 flex flex-col">
             <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-6">Smart Insights</h2>
             <div className="flex-1 flex flex-col justify-center">
                <p className="text-xl font-medium text-white leading-relaxed">
                  "You've been focused on <span className="text-white font-bold underline decoration-white/30 underline-offset-4">Core Implementation</span> this morning. You are 2 hours ahead of schedule."
                </p>
             </div>
             <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">AI Agent Processing</span>
             </div>
          </div>

          {/* Bento Tile: Audit History (Full Width Below) */}
          <div className="col-span-12 bg-white rounded-apple shadow-apple p-8 border border-white/20">
            <AuditInspector logs={mockLogs} />
          </div>

        </div>
      </main>
      
      <footer className="py-12 text-center">
        <p className="text-[10px] font-semibold text-apple-gray-300 uppercase tracking-widest">Enterprise Grade Architecture • 2026</p>
      </footer>
    </div>
  )
}

export default App
