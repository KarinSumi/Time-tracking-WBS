import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/Toast';
import CommandPalette from './components/CommandPalette';

// Pages (to be updated to standalone if needed)
import TimeLogsPage from './components/TimeLogsPage';
import ProjectsPage from './components/ProjectsPage';
import ProjectDetailPage from './components/ProjectDetailPage';
import PlansPage from './components/PlansPage';
import TeamPage from './components/TeamPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import SuperAdminTable from './components/SuperAdminTable';
import BulkTimeInput from './components/BulkTimeInput';

import './App.css';

import { getHealth } from './api';

function App() {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const handleMaintenance = () => setIsMaintenance(true);
    window.addEventListener('maintenance_mode', handleMaintenance);
    return () => window.removeEventListener('maintenance_mode', handleMaintenance);
  }, []);

  useEffect(() => {
    if (!isMaintenance) return;
    
    const checkHealth = async () => {
      try {
        await getHealth();
        // If we reach here, server is back up (200 OK)
        window.location.reload();
      } catch (err: any) {
        // Still 503 or network error, keep waiting
      }
    };

    const intervalId = setInterval(checkHealth, 3000);
    return () => clearInterval(intervalId);
  }, [isMaintenance]);

  if (isMaintenance) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0d0f17] text-white">
        <div className="bg-[#1a1b2a] p-8 rounded-2xl border border-white/10 flex flex-col items-center max-w-md text-center glass-panel">
          <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
            <div className="w-8 h-8 border-4 border-[#b184f5] border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-[#b184f5] mb-2">System Updating</h1>
          <p className="text-white/60 mb-6">
            The server is currently pulling the latest changes and restarting. Please wait, this page will automatically reload once the update is complete.
          </p>
          <p className="text-sm text-white/40 font-mono bg-white/5 px-3 py-1 rounded">
            Do not close this window
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          {/* Note: some pages still expect props, we'll fix them or wrap them */}
          <Route path="logs" element={<TimeLogsPageWrapper />} />
          <Route path="bulk-entry" element={<div className="px-8 py-6"><BulkTimeInput /></div>} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="reports" element={<ReportsPageWrapper />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<SuperAdminTable />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <CommandPalette />
    </>
  );
}

// Temporary wrappers until we refactor pages to fetch their own data
import { useState, useEffect, useCallback } from 'react';
import { getEntries } from './api';
import type { TimeEntry } from './types';

const TimeLogsPageWrapper = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const fetchEntries = useCallback(async () => {
    try { setEntries(await getEntries()); } catch {}
  }, []);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  return <TimeLogsPage entries={entries} onRefresh={fetchEntries} />;
};

const ReportsPageWrapper = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  useEffect(() => { getEntries().then(setEntries).catch(() => {}); }, []);
  return <ReportsPage entries={entries} />;
};

export default App;
