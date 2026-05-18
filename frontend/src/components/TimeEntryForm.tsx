import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Clock } from 'lucide-react';
import type { TimeEntry, Project, Phase, PlannedTask as Plan } from '../types';


type TimeMode = 'range' | 'direct';

interface TimeEntryFormProps { 
  onEntrySaved?: () => void; 
  selectedDate: string;
  onDateChange: (date: string) => void;
  editingEntry?: TimeEntry | null;
  onCancelEdit?: () => void;
}

import { getProjects, getPhases, getPlans, createEntry, updateEntry } from '../api';

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onEntrySaved, selectedDate, onDateChange, editingEntry, onCancelEdit }) => {
  const { addToast } = useToast();
  const { token, theme } = useAuth();

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [plannedTaskId, setPlannedTaskId] = useState('');
  const [timeMode, setTimeMode] = useState<TimeMode>('range');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [directHours, setDirectHours] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch projects and phases from API
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!token) return;
    getProjects().then(setProjects).catch(() => {});
    getPhases().then(setPhases).catch(() => {});
    getPlans()
      .then((data: Plan[]) => setPlans(data.filter(p => p.status !== 'COMPLETED')))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (editingEntry) {
      setDescription(editingEntry.taskDescription);
      setProjectId(editingEntry.project?.id || '');
      setPhaseId(editingEntry.phase?.id || '');
      setTimeMode('direct');
      setDirectHours(editingEntry.hours.toString());
      onDateChange(new Date(editingEntry.date).toLocaleDateString('en-CA'));
    } else {
      setDescription('');
      setProjectId('');
      setPhaseId('');
      setDirectHours('');
    }
  }, [editingEntry, onDateChange]);

  const handlePlanSelect = (id: string) => {
    setPlannedTaskId(id);
    const plan = plans.find(p => p.id === id);
    if (plan) {
      setDescription(plan.taskDescription);
      if (plan.projectId) setProjectId(plan.projectId);
      if (plan.phaseId) setPhaseId(plan.phaseId);
    }
  };

  const calculateDuration = useCallback((): number => {
    if (timeMode === 'direct') return parseFloat(directHours) || 0;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    if (sH === undefined || sM === undefined || eH === undefined || eM === undefined) return 0;
    const diff = (eH * 60 + eM) - (sH * 60 + sM);
    return diff > 0 ? Math.round((diff / 60) * 100) / 100 : 0;
  }, [timeMode, startTime, endTime, directHours]);
  const duration = calculateDuration();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { addToast({ type: 'warning', title: 'Missing task', message: 'Please describe what you worked on' }); return; }
    if (duration <= 0) { addToast({ type: 'warning', title: 'Invalid time', message: timeMode === 'range' ? 'End time must be after start time' : 'Please enter valid hours' }); return; }

    setIsSaving(true);
    try {
      const entryData = { 
        hours: duration, 
        taskDescription: description, 
        date: new Date(selectedDate + 'T12:00:00').toISOString(),
        projectId: projectId || undefined, 
        phaseId: phaseId || undefined, 
        plannedTaskId: plannedTaskId || undefined 
      };

      if (editingEntry?.id) {
        await updateEntry(editingEntry.id, entryData);
      } else {
        await createEntry(entryData);
      }

      addToast({ type: 'success', title: editingEntry ? 'Entry updated!' : 'Entry logged!', message: `${duration}h tracked for "${description}"` });
      setDescription(''); setDirectHours(''); setStartTime('09:00'); setEndTime('17:00'); setPlannedTaskId('');
      onEntrySaved?.();
      if (editingEntry) onCancelEdit?.();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to save', message: err.message || 'Could not log time entry.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
          <Clock size={13} className="text-[var(--text-faint)]" />Quick Log</h2>
        <span className="text-[10px] text-[var(--text-faint)] font-medium">⌘ + Enter to save</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1">
        {/* Top: Description */}
        <div>
          <label className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mb-2 block">Current Focus</label>
          <input id="entry-description" type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0 focus:outline-none p-0 text-[var(--text-primary)] placeholder:text-[var(--text-faint)]"
            placeholder="What are you working on?"
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        </div>

        {/* Middle: Selects */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Project Name</label>
            <select id="entry-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="select-styled text-sm py-2.5 w-full">
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Development State</label>
            <select id="entry-phase" value={phaseId} onChange={e => setPhaseId(e.target.value)} className="select-styled text-sm py-2.5 w-full">
              <option value="">Select Phase</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Task Name</label>
            <select value={plannedTaskId} onChange={e => handlePlanSelect(e.target.value)} className="select-styled text-sm py-2.5 w-full">
              <option value="">None (Ad-hoc)</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.taskDescription}</option>)}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--border-subtle)] w-full" />

        {/* Bottom: Time & Submit */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">No. of Hours</span>
              <div className="flex items-center gap-3 ml-2 border-l border-[var(--border-subtle)] pl-4">
                <input type="number" step="0.5" value={directHours} onChange={e => { setTimeMode('direct'); setDirectHours(e.target.value); }}
                  className="w-12 bg-transparent border-none text-sm font-bold focus:ring-0 p-0 text-[var(--text-primary)]" placeholder="0.0" />
                <span className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider font-bold">Hrs</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-[var(--text-faint)] font-bold uppercase tracking-wider">From-To</span>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                 <input type="time" value={startTime} onChange={e => { setTimeMode('range'); setStartTime(e.target.value); }} className="bg-transparent border-none text-xs font-medium focus:ring-0 p-0 w-16 text-center" style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} />
                 <span className="text-[var(--text-faint)]">-</span>
                 <input type="time" value={endTime} onChange={e => { setTimeMode('range'); setEndTime(e.target.value); }} className="bg-transparent border-none text-xs font-medium focus:ring-0 p-0 w-16 text-center" style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }} />
              </div>
            </div>

            <div className="flex items-center gap-3">
               <span className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{duration > 0 ? (duration % 1 === 0 ? duration : duration.toFixed(1)) : '0.0'}</span>
               <span className="text-[10px] text-[var(--text-faint)] font-black uppercase tracking-widest">Hrs</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {editingEntry && (
              <button type="button" onClick={onCancelEdit} className="btn-secondary px-6 py-3 text-sm font-bold">
                Cancel
              </button>
            )}
            <button id="entry-submit-btn" type="submit" disabled={isSaving}
              className="btn-primary px-10 py-3 text-sm font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all">
              {isSaving ? 'Saving...' : (editingEntry ? 'Update Task' : 'Log Task')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;
