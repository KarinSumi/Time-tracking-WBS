import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TimeEntryForm from './TimeEntryForm';
import Dashboard from './Dashboard';
import type { TimeEntry } from './Dashboard';
import AuditInspector from './AuditInspector';
import DailyTargetChart from './DailyTargetChart';
import CalendarWidget from './CalendarWidget';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, Bell, Sparkles } from 'lucide-react';

// Pages
import TimeLogsPage from './TimeLogsPage';
import ProjectsPage from './ProjectsPage';
import PlansPage from './PlansPage';
import TeamPage from './TeamPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import SuperAdminTable from './SuperAdminTable';

const mockLogs = [
  { id: '1', action: 'UPDATE', performedBy: 'John Manager',
    oldValues: { hours: 5, description: 'Client meeting' },
    newValues: { hours: 8, description: 'Client meeting + design work' },
    timestamp: new Date(Date.now() - 180000).toISOString() },
  { id: '2', action: 'CREATE', performedBy: 'Jane Smith',
    oldValues: {}, newValues: { hours: 3, description: 'Frontend Refinement' },
    timestamp: new Date(Date.now() - 3600000).toISOString() },
];

const DashboardLayout: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const { user, token } = useAuth();
  const location = useLocation();

  const fetchEntries = useCallback(() => {
    if (!token) return;
    setIsLoading(true);
    fetch('/api/entries', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => { setEntries(data); setIsLoading(false); })
      .catch(() => { setIsLoading(false); });
  }, [token]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const selectedDateHours = useMemo(() => {
    return entries.filter(e => {
      const entryDate = new Date(e.date).toLocaleDateString('en-CA');
      return entryDate === selectedDate;
    }).reduce((sum, e) => sum + Number(e.hours), 0);
  }, [entries, selectedDate]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Determine which page to show based on current route
  const renderPage = () => {
    switch (location.pathname) {
      case '/logs': return <TimeLogsPage entries={entries} onRefresh={fetchEntries} />;
      case '/projects': return <ProjectsPage />;
      case '/plans': return <PlansPage />;
      case '/team': return <TeamPage />;
      case '/reports': return <ReportsPage entries={entries} />;
      case '/settings': return <SettingsPage />;
      case '/admin': return <SuperAdminTable />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="px-8 py-6">
      <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">
        <div className="col-span-12 lg:col-span-8 glass-card p-7 animate-slideUp opacity-0 delay-1" style={{ animationFillMode: 'forwards' }}>
          <TimeEntryForm onEntrySaved={() => { fetchEntries(); setEditingEntry(null); }} selectedDate={selectedDate} onDateChange={setSelectedDate} editingEntry={editingEntry} onCancelEdit={() => setEditingEntry(null)} />
        </div>
        <div className="col-span-12 lg:col-span-4 glass-card p-7 flex items-center justify-center animate-slideUp opacity-0 delay-2" style={{ animationFillMode: 'forwards' }}>
          <DailyTargetChart hoursLogged={selectedDateHours || 0} targetHours={8} selectedDate={selectedDate} />
        </div>
        <div className="col-span-12 lg:col-span-7 glass-card p-7 min-h-[380px] animate-slideUp opacity-0 delay-3" style={{ animationFillMode: 'forwards' }}>
          {isLoading ? (
            <div className="h-full flex flex-col gap-3">
              <div className="skeleton h-4 w-32" />
              <div className="flex-1 space-y-3 pt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-2"><div className="skeleton h-3 w-3/4" /><div className="skeleton h-2.5 w-1/3" /></div>
                    <div className="skeleton h-6 w-12 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          ) : <Dashboard entries={entries} onRefresh={fetchEntries} onEdit={setEditingEntry} />}
        </div>
        <div className="col-span-12 lg:col-span-5 glass-card p-7 animate-slideUp opacity-0 delay-4" style={{ animationFillMode: 'forwards' }}>
          <CalendarWidget entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>
        <div className="col-span-12 glass-card p-7 animate-slideUp opacity-0 delay-5" style={{ animationFillMode: 'forwards' }}>
          <AuditInspector logs={mockLogs} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#050505] overflow-hidden font-sans text-white selection:bg-blue-500/20">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto min-h-screen">
        <header className="flex justify-between items-center px-8 py-5 sticky top-0 z-10"
          style={{ background: 'rgba(5,5,5,0.80)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div>
            <h2 className="text-lg font-semibold text-white">{greeting}, <span className="text-white/80">{firstName}</span></h2>
            <p className="text-xs text-white/30 mt-0.5 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-all text-white/30 hover:text-white/60" title="Notifications">
              <Bell size={18} /><div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
            </button>
            <div className="w-px h-6 bg-white/5 mx-1" />
            <ProfileDropdown />
          </div>
        </header>
        {renderPage()}
        <footer className="px-8 py-6 text-center mt-8 border-t border-white/[0.03]">
          <p className="text-[10px] font-medium text-white/15 uppercase tracking-widest">Aion · Enterprise Time Tracking · {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;
