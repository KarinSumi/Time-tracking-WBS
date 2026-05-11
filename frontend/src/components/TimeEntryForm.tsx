import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Clock, ArrowRight, Hash, Layers, FolderKanban, CalendarDays } from 'lucide-react';
import type { TimeEntry } from './Dashboard';

interface Project { id: string; name: string; color: string; }
interface Phase { id: string; name: string; }
interface Plan { id: string; taskDescription: string; projectId?: string; phaseId?: string; status: string; }

const formatDateThai = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

type TimeMode = 'range' | 'direct';

interface TimeEntryFormProps { 
  onEntrySaved?: () => void; 
  selectedDate: string;
  onDateChange: (date: string) => void;
  editingEntry?: TimeEntry | null;
  onCancelEdit?: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ onEntrySaved, selectedDate, onDateChange, editingEntry, onCancelEdit }) => {
  const { addToast } = useToast();
  const { token } = useAuth();

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
    const h = { 'Authorization': `Bearer ${token}` };
    fetch('/api/projects', { headers: h }).then(r => r.json()).then(setProjects).catch(() => {});
    fetch('/api/phases', { headers: h }).then(r => r.json()).then(setPhases).catch(() => {});
    fetch('/api/plans', { headers: h }).then(r => r.json())
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
      const url = editingEntry ? `/api/entries/${editingEntry.id}` : '/api/entries';
      const method = editingEntry ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hours: duration, taskDescription: description, date: new Date(selectedDate + 'T12:00:00').toISOString(),
          projectId: projectId || undefined, phaseId: phaseId || undefined, plannedTaskId: plannedTaskId || undefined }),
      });
      if (res.ok) {
        addToast({ type: 'success', title: editingEntry ? 'Entry updated!' : 'Entry logged!', message: `${duration}h tracked for "${description}"` });
        setDescription(''); setDirectHours(''); setStartTime('09:00'); setEndTime('17:00'); setPlannedTaskId('');
        onEntrySaved?.();
        if (editingEntry) onCancelEdit?.();
      } else { const d = await res.json().catch(() => ({})); addToast({ type: 'error', title: 'Failed to save', message: d.error || 'Could not log time entry.' }); }
    } catch { addToast({ type: 'error', title: 'Connection error', message: 'Unable to reach the server.' }); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest flex items-center gap-2">
          <Clock size={13} className="text-white/25" />Quick Log</h2>
        <span className="text-[10px] text-white/20 font-medium">⌘ + Enter to save</span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex flex-wrap gap-3">
          {plans.length > 0 && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] uppercase text-white/30 tracking-wider">Plan:</span>
              <select value={plannedTaskId} onChange={e => handlePlanSelect(e.target.value)} className="select-styled text-xs py-2 bg-blue-500/10 border-blue-500/20 text-blue-200">
                <option value="">None (Ad-hoc)</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.taskDescription}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <FolderKanban size={14} className="text-white/25 flex-shrink-0" />
            <select id="entry-project" value={projectId} onChange={e => setProjectId(e.target.value)} className="select-styled text-xs py-2">
              <option value="">Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Layers size={14} className="text-white/25 flex-shrink-0" />
            <select id="entry-phase" value={phaseId} onChange={e => setPhaseId(e.target.value)} className="select-styled text-xs py-2">
              <option value="">Phase</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 min-w-0 group">
            <CalendarDays size={14} className="text-white/25 flex-shrink-0" />
            <div className="relative">
              <div className="select-styled text-xs py-2 px-3 flex items-center justify-center w-[105px] tabular-nums tracking-wide text-white/90">
                {formatDateThai(selectedDate)}
              </div>
              <input 
                id="entry-date" 
                type="date" 
                value={selectedDate} 
                onChange={e => onDateChange(e.target.value)} 
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                style={{ colorScheme: 'dark' }} 
              />
            </div>
          </div>
        </div>

        <div>
          <input id="entry-description" type="text" value={description} onChange={e => setDescription(e.target.value)}
            className="w-full bg-transparent border-none text-xl font-medium focus:ring-0 focus:outline-none p-0 text-white placeholder:text-white/20"
            placeholder="What are you working on?"
            onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="tab-group w-fit">
            <button type="button" className={`tab-item ${timeMode === 'range' ? 'active' : ''}`} onClick={() => setTimeMode('range')}>
              <span className="flex items-center gap-1.5"><ArrowRight size={12} />Time Range</span></button>
            <button type="button" className={`tab-item ${timeMode === 'direct' ? 'active' : ''}`} onClick={() => setTimeMode('direct')}>
              <span className="flex items-center gap-1.5"><Hash size={12} />Direct Input</span></button>
          </div>
          <div className="flex items-center gap-3">
            {timeMode === 'range' ? (<>
              <div className="flex items-center gap-2">
                <label htmlFor="entry-start-time" className="text-[10px] text-white/30 font-medium uppercase tracking-wider">From</label>
                <input id="entry-start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm w-28 text-center" style={{ colorScheme: 'dark' }} />
              </div>
              <ArrowRight size={16} className="text-white/15 flex-shrink-0" />
              <div className="flex items-center gap-2">
                <label htmlFor="entry-end-time" className="text-[10px] text-white/30 font-medium uppercase tracking-wider">To</label>
                <input id="entry-end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm w-28 text-center" style={{ colorScheme: 'dark' }} />
              </div>
              <div className="ml-3 pl-3 border-l border-white/10">
                <span className="text-lg font-semibold text-white tabular-nums">{duration > 0 ? duration.toFixed(1) : '0.0'}h</span>
                <span className="text-[10px] text-white/30 ml-1.5 uppercase tracking-wider font-medium">auto</span>
              </div>
            </>) : (
              <div className="flex items-center gap-2">
                <label htmlFor="entry-direct-hours" className="text-[10px] text-white/30 font-medium uppercase tracking-wider">Hours</label>
                <input id="entry-direct-hours" type="number" step="0.25" min="0" max="24" value={directHours}
                  onChange={e => setDirectHours(e.target.value)} className="glass-input px-3 py-2 rounded-lg text-sm w-24 text-center" placeholder="0.0" />
                <span className="text-sm text-white/30 font-medium">hours</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            {projectId && projects.find(p => p.id === projectId) && (
              <span className="badge text-[10px]" style={{
                background: `${projects.find(p => p.id === projectId)?.color}15`,
                color: projects.find(p => p.id === projectId)?.color,
                border: `1px solid ${projects.find(p => p.id === projectId)?.color}30`,
              }}>{projects.find(p => p.id === projectId)?.name}</span>
            )}
            {phaseId && phases.find(p => p.id === phaseId) && (
              <span className="badge badge-info text-[10px]">{phases.find(p => p.id === phaseId)?.name}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editingEntry && (
              <button type="button" onClick={onCancelEdit} className="btn-secondary px-4 py-2.5 text-sm font-semibold">
                Cancel
              </button>
            )}
            <button id="entry-submit-btn" type="submit" disabled={isSaving}
              className="btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
              {isSaving ? 'Saving...' : (editingEntry ? 'Update Entry' : 'Save Entry')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TimeEntryForm;
