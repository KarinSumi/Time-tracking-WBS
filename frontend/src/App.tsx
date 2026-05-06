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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-12 text-gray-900 tracking-tight">
          Enterprise Time Logger
        </h1>
        
        <div className="space-y-12">
          <section>
            <TimeEntryForm />
          </section>

          <section>
            <Dashboard entries={entries} />
          </section>

          <section>
            <AuditInspector logs={mockLogs} />
          </section>
        </div>
      </div>
    </div>
  )
}

export default App
