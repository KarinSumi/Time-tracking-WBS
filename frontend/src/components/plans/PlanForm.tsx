import React from 'react';
import { Plus } from 'lucide-react';

import type { User, Project } from '../../types';

interface PlanFormProps {
  users: User[];
  projects: Project[];
  formAssigneeId: string;
  setFormAssigneeId: (v: string) => void;
  formProjectId: string;
  setFormProjectId: (v: string) => void;
  formDesc: string;
  setFormDesc: (v: string) => void;
  formHours: string;
  setFormHours: (v: string) => void;
  formDate: string;
  setFormDate: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PlanForm: React.FC<PlanFormProps> = ({
  users, projects, formAssigneeId, setFormAssigneeId, formProjectId, setFormProjectId,
  formDesc, setFormDesc, formHours, setFormHours, formDate, setFormDate, onSubmit
}) => {
  return (
    <div className="glass-card p-6 mb-6 animate-in slide-in-from-top duration-500">
      <h2 className="text-sm font-semibold text-white mb-4">Create New Plan</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-1">
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Assignee</label>
          <select value={formAssigneeId} onChange={e => setFormAssigneeId(e.target.value)} className="select-styled text-sm py-2" required>
            <option value="">Select User...</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Task Description</label>
          <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)} className="glass-input w-full px-3 py-2 text-sm" required placeholder="What needs to be done?" />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Project</label>
          <select value={formProjectId} onChange={e => setFormProjectId(e.target.value)} className="select-styled text-sm py-2">
            <option value="">None</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-1">
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Date</label>
          <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="glass-input w-full px-3 py-2 text-sm" required />
        </div>
        <div className="lg:col-span-1">
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Est. Hours</label>
          <div className="flex gap-2">
            <input type="number" step="0.5" min="0.5" value={formHours} onChange={e => setFormHours(e.target.value)} className="glass-input w-full px-3 py-2 text-sm" required />
            <button type="submit" className="btn-primary px-3 flex-shrink-0"><Plus size={16}/></button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;
