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
      performedBy: 'John Doe (Manager)',
      oldValues: { hours: 5, description: 'Client meeting' },
      newValues: { hours: 8, description: 'Client meeting + design work' },
      timestamp: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-apple-gray-50 font-sans text-gray-900 selection:bg-apple-blue/20">
      {/* Dynamic Glass Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-black/[0.05]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Time Logger</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-apple-gray-400">v1.0.0</span>
            <div className="w-8 h-8 rounded-full bg-apple-gray-100 flex items-center justify-center text-[10px] font-bold text-apple-gray-500">JD</div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <section className="lg:col-span-4 sticky top-24">
            <TimeEntryForm />
          </section>

          {/* Right Column: Content */}
          <div className="lg:col-span-8 space-y-8">
            <section>
              <Dashboard entries={entries} />
            </section>

            <section>
              <AuditInspector logs={mockLogs} />
            </section>
          </div>

        </div>
      </main>
      
      <footer className="py-12 text-center">
        <p className="text-[10px] font-semibold text-apple-gray-300 uppercase tracking-widest">Enterprise Grade Architecture</p>
      </footer>
    </div>
  )
}

export default App
