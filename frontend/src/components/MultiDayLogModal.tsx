import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Layers, FolderKanban, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

import type { Project, Phase, PlannedTask as Plan } from '../types';

interface MultiDayLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

import { getProjects, getPhases, getPlans, createMultiDayEntries } from '../api';

const MultiDayLogModal: React.FC<MultiDayLogModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState('');
  const [phaseId, setPhaseId] = useState('');
  const [plannedTaskId, setPlannedTaskId] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('8');
  const [description, setDescription] = useState('');
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!token || !isOpen) return;
    getProjects().then(setProjects).catch(() => {});
    getPhases().then(setPhases).catch(() => {});
    getPlans()
      .then((data: Plan[]) => setPlans(data.filter(p => p.status !== 'COMPLETED')))
      .catch(() => {});
  }, [token, isOpen]);

  const handlePlanSelect = (id: string) => {
    setPlannedTaskId(id);
    const plan = plans.find(p => p.id === id);
    if (plan) {
      setDescription(plan.taskDescription);
      if (plan.projectId) setProjectId(plan.projectId);
      if (plan.phaseId) setPhaseId(plan.phaseId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) { addToast({ type: 'warning', title: 'Missing task', message: 'Please describe the task' }); return; }
    if (Number(hoursPerDay) <= 0) { addToast({ type: 'warning', title: 'Invalid hours', message: 'Please enter valid hours per day' }); return; }

    setIsSaving(true);
    try {
      const data = await createMultiDayEntries({
        startDate, endDate, hoursPerDay: Number(hoursPerDay),
        taskDescription: description, excludeWeekends,
        projectId: projectId || null,
        phaseId: phaseId || null,
        plannedTaskId: plannedTaskId || null
      });
      addToast({ type: 'success', title: 'Bulk logs created!', message: `Generated ${data.count} entries across the selected range.` });
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to log', message: err.message || 'Could not generate bulk entries.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-blue-400" size={20} />
              Multi-Day Batch Logging
            </h2>
            <p className="text-xs text-white/40 mt-1">Efficiently log repetitive tasks across a date range.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" style={{ colorScheme: 'dark' }} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="glass-input w-full pl-10 pr-4 py-2.5 text-sm" style={{ colorScheme: 'dark' }} />
              </div>
            </div>
          </div>

          {/* Project & Phase */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Project</label>
              <div className="relative">
                <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="select-styled pl-10">
                  <option value="">No Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Phase</label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <select value={phaseId} onChange={e => setPhaseId(e.target.value)} className="select-styled pl-10">
                  <option value="">No Phase</option>
                  {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Plan Selection (Optional) */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Link to Plan (Optional)</label>
            <select value={plannedTaskId} onChange={e => handlePlanSelect(e.target.value)} className="select-styled bg-blue-500/5 border-blue-500/20 text-blue-200">
              <option value="">None (Ad-hoc)</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.taskDescription}</option>)}
            </select>
          </div>

          {/* Task & Hours */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Task Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                className="glass-input w-full px-4 py-3 text-sm min-h-[80px] resize-none"
                placeholder="What were you doing on these days?"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Clock className="text-white/20" size={18} />
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    step="0.5" 
                    value={hoursPerDay} 
                    onChange={e => setHoursPerDay(e.target.value)} 
                    className="glass-input w-16 text-center py-1.5 text-sm font-bold"
                  />
                  <span className="text-xs text-white/40 uppercase tracking-wider font-medium">hours per day</span>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Exclude Weekends & Holidays</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={excludeWeekends} 
                    onChange={e => setExcludeWeekends(e.target.checked)} 
                    className="sr-only"
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${excludeWeekends ? 'bg-blue-600' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform ${excludeWeekends ? 'translate-x-5' : ''}`} />
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm font-bold">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="btn-primary flex-[2] py-3 text-sm font-bold flex items-center justify-center gap-2 group"
            >
              {isSaving ? 'Processing...' : (
                <>
                  <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                  Generate Logs
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiDayLogModal;
