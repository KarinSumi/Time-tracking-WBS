import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, Clock, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

import type { Project, Phase, PlannedTask as Plan } from '../types';

interface RowData {
  id: string;
  date: string;
  projectId: string;
  phaseId: string;
  plannedTaskId: string;
  hours: string;
  taskDescription: string;
}

import { getProjects, getPhases, getPlans, createBulkEntries } from '../api';

const BulkTimeInput: React.FC = () => {
  const { addToast } = useToast();
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [rows, setRows] = useState<RowData[]>([
    { id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString().split('T')[0], projectId: '', phaseId: '', plannedTaskId: '', hours: '', taskDescription: '' }
  ]);

  useEffect(() => {
    if (!token) return;
    getProjects().then(setProjects).catch(() => {});
    getPhases().then(setPhases).catch(() => {});
    getPlans().then(setPlans).catch(() => {});
  }, [token]);

  const addRow = () => {
    const lastRow = rows[rows.length - 1];
    setRows([...rows, { 
      id: Math.random().toString(36).substr(2, 9), 
      date: lastRow?.date || new Date().toISOString().split('T')[0], 
      projectId: lastRow?.projectId || '', 
      phaseId: lastRow?.phaseId || '', 
      plannedTaskId: '', 
      hours: '', 
      taskDescription: '' 
    }]);
  };

  const removeRow = (id: string) => {
    if (rows.length === 1) return;
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: string, field: keyof RowData, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveAll = async () => {
    // Basic validation
    const invalid = rows.some(r => !r.taskDescription || !r.hours || !r.projectId);
    if (invalid) {
      addToast({ type: 'warning', title: 'Missing fields', message: 'Please fill in all required fields (Project, Hours, Task) for all rows' });
      return;
    }

    setLoading(true);
    try {
      await createBulkEntries(rows);
      addToast({ type: 'success', title: 'Success', message: `Successfully saved ${rows.length} entries!` });
      // Reset to one blank row
      setRows([{ id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString().split('T')[0], projectId: '', phaseId: '', plannedTaskId: '', hours: '', taskDescription: '' }]);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to save entries' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Bulk Timesheet</h1>
          <p className="text-blue-200/70 mt-1">Efficiency mode: Log multiple tasks at once</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Row
          </button>
          <button
            onClick={handleSaveAll}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      <div className="glass-morphism rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 w-40">Date</th>
                <th className="px-6 py-4 w-48">Project</th>
                <th className="px-6 py-4 w-48">Phase</th>
                <th className="px-6 py-4">Planned Task (WBS)</th>
                <th className="px-6 py-4 w-24">Hours</th>
                <th className="px-6 py-4 min-w-[200px]">Description</th>
                <th className="px-4 py-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50 group-hover:text-blue-300 transition-colors" size={14} />
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => updateRow(row.id, 'date', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.projectId}
                      onChange={(e) => updateRow(row.id, 'projectId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Select Project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.phaseId}
                      onChange={(e) => updateRow(row.id, 'phaseId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Select Phase</option>
                      {phases.map(p => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.plannedTaskId}
                      onChange={(e) => updateRow(row.id, 'plannedTaskId', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900 text-slate-400 italic">Select Plan</option>
                      {plans
                        .filter(p => !row.projectId || p.projectId === row.projectId)
                        .map(p => (
                          <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.taskDescription}</option>
                        ))
                      }
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300/50 group-hover:text-blue-300 transition-colors" size={14} />
                      <input
                        type="number"
                        step="0.5"
                        placeholder="0.0"
                        value={row.hours}
                        onChange={(e) => updateRow(row.id, 'hours', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group">
                      <FileText className="absolute left-3 top-3 text-blue-300/50 group-hover:text-blue-300 transition-colors" size={14} />
                      <textarea
                        rows={1}
                        placeholder="What did you work on?"
                        value={row.taskDescription}
                        onChange={(e) => updateRow(row.id, 'taskDescription', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none overflow-hidden min-h-[38px]"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                      title="Remove Row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center text-xs text-blue-200/50">
          <div className="flex gap-4">
            <span>Rows: <span className="text-white font-semibold">{rows.length}</span></span>
            <span>Total Hours: <span className="text-white font-semibold">{rows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0)}h</span></span>
          </div>
          <div className="flex items-center gap-1 italic">
            <ChevronRight size={12} />
            Bulk entries are automatically set to 'SUBMITTED' status.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkTimeInput;
