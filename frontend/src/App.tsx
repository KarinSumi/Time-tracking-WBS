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

function App() {
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
