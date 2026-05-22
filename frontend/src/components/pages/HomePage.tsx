import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TimeEntryForm from '../TimeEntryForm';
import Dashboard from '../Dashboard';
import DailyTargetChart from '../DailyTargetChart';
import CalendarWidget from '../CalendarWidget';
import SmartInsights from '../SmartInsights';
import AuditInspector from '../AuditInspector';
import OnboardingTour from '../OnboardingTour';
import type { TimeEntry, AuditLog } from '../../types';
import { getEntries, getAuditLogs } from '../../api';
import { useAuth } from '../../context/AuthContext';


const HomePage: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const { token, user } = useAuth();

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getEntries();
      setEntries(data);
    } catch {
      // Error handled by getEntries
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    if (!token || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) return;
    try {
      const data = await getAuditLogs();
      setAuditLogs(data);
    } catch {
      // Ignore
    }
  }, [token, user?.role]);

  const handleSelectSuggestion = (task: Partial<TimeEntry>) => {
    setEditingEntry({
      taskDescription: task.taskDescription || '',
      hours: task.hours || 0,
      userId: task.userId || '',
      date: task.date || new Date().toLocaleDateString('en-CA'),
      project: task.project || null,
      phase: task.phase || null,
      plannedTaskId: task.plannedTaskId || null
    });
  };

  useEffect(() => { 
    fetchEntries(); 
    fetchAuditLogs();
  }, [fetchEntries, fetchAuditLogs]);

  const selectedDateHours = useMemo(() => {
    if (!Array.isArray(entries)) return 0;
    return entries.filter(e => {
      if (!e || !e.date) return false;
      const entryDate = new Date(e.date).toLocaleDateString('en-CA');
      return entryDate === selectedDate;
    }).reduce((sum, e) => sum + Number(e.hours || 0), 0);
  }, [entries, selectedDate]);

  return (
    <div className="px-8 py-6">
      <OnboardingTour />
      <div className="grid grid-cols-12 gap-5 auto-rows-[minmax(180px,auto)]">
        {/* Quick Log Form */}
        <div className="col-span-12 lg:col-span-8 glass-card p-7 animate-slideUp opacity-0 delay-1 tour-quick-log" style={{ animationFillMode: 'forwards' }}>
          <TimeEntryForm 
            onEntrySaved={() => { fetchEntries(); setEditingEntry(null); }} 
            selectedDate={selectedDate} 
            onDateChange={setSelectedDate} 
            editingEntry={editingEntry} 
            onCancelEdit={() => setEditingEntry(null)} 
          />
        </div>

        {/* Daily Target Chart */}
        <div className="col-span-12 lg:col-span-4 glass-card p-7 flex items-center justify-center animate-slideUp opacity-0 delay-2 tour-daily-chart" style={{ animationFillMode: 'forwards' }}>
          <DailyTargetChart hoursLogged={selectedDateHours || 0} targetHours={8} selectedDate={selectedDate} />
        </div>

        {/* Main Dashboard / Recent Logs */}
        <div className="col-span-12 lg:col-span-8 glass-card p-7 min-h-[480px] animate-slideUp opacity-0 delay-3 tour-dashboard" style={{ animationFillMode: 'forwards' }}>
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

        {/* Right Column: Insights & Calendar */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5 animate-slideUp opacity-0 delay-4" style={{ animationFillMode: 'forwards' }}>
          <div className="flex-1 glass-card p-7 min-h-[230px] tour-smart-insights">
            <SmartInsights onSelectTask={handleSelectSuggestion} />
          </div>
          <div className="glass-card p-7 tour-calendar">
            <CalendarWidget entries={entries} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>

        {/* Bottom Section: Audit Logs (Admins only) */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <div className="col-span-12 glass-card p-7 animate-slideUp opacity-0 delay-5" style={{ animationFillMode: 'forwards' }}>
            <AuditInspector logs={auditLogs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
