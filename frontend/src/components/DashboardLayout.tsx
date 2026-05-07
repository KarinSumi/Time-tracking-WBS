import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TimeEntryForm from './TimeEntryForm';
import Dashboard from './Dashboard';
import type { TimeEntry } from './Dashboard';
import AuditInspector from './AuditInspector';

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

const DashboardLayout: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    fetch('/api/entries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch entries');
        return res.json();
      })
      .then(data => {
        setEntries(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch entries:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-black overflow-hidden font-sans text-white selection:bg-blue-500/20">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto bg-[#050505] min-h-screen">
        <header className="flex justify-between items-center p-8 sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-lg border-b border-white/5">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-2">Log Center</p>
            <h2 className="text-sm font-semibold text-white">Wednesday, May 6th</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer group">
               <span className="group-hover:scale-110 transition-transform">JD</span>
             </div>
          </div>
        </header>

        <div className="p-8 pt-6">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              Error loading dashboard: {error}
            </div>
          )}

          <div className="grid grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Bento Tile: Quick Log (Large) */}
            <div className="col-span-12 lg:col-span-8 glass-card p-8">
              <TimeEntryForm />
            </div>

            {/* Bento Tile: Stats (Small) */}
            <div className="col-span-12 lg:col-span-4 glass-card p-8 flex flex-col items-center justify-center text-center">
               <div className="text-[3.5rem] font-bold text-blue-500 leading-none tracking-tighter">85%</div>
               <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-4">Daily Target Reached</p>
            </div>

            {/* Bento Tile: Team Activity (Medium) */}
            <div className="col-span-12 lg:col-span-7 glass-card p-8 min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Dashboard entries={entries} />
              )}
            </div>

            {/* Bento Tile: Insights (Small/Medium) */}
            <div className="col-span-12 lg:col-span-5 bg-blue-600/10 backdrop-blur-3xl border border-blue-500/20 rounded-[32px] p-8 flex flex-col relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full" />
               <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 ml-1">Smart Insights</h2>
               <div className="flex-1 flex flex-col justify-center">
                  <p className="text-xl font-medium text-white/90 leading-relaxed">
                    "You've been focused on <span className="text-white font-bold underline decoration-blue-500/50 underline-offset-4">Core Implementation</span> this morning. You are 2 hours ahead of schedule."
                  </p>
               </div>
               <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">AI Agent Processing</span>
               </div>
            </div>

            {/* Bento Tile: Audit History (Full Width Below) */}
            <div className="col-span-12 glass-card p-8">
              <AuditInspector logs={mockLogs} />
            </div>
          </div>
        </div>

        <footer className="p-8 text-center mt-12 border-t border-white/5">
          <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest">Enterprise Grade Architecture • 2026</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
