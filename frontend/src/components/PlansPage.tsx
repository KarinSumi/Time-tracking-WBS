import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Components
import PlanHeader from './plans/PlanHeader';
import PlanForm from './plans/PlanForm';
import PlanGrid from './plans/PlanGrid';
import GanttChart from './GanttChart';

import type { User, Project, PlannedTask as Plan } from '../types';

import { 
  getPlans, 
  createPlan, 
  deletePlan, 
  updatePlanDates, 
  uploadPlans, 
  getPlanUsers, 
  getProjects, 
  getWbsGantt,
  getPlanTemplate
} from '../api';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'gantt'>('grid');
  const [isUploading, setIsUploading] = useState(false);
  
  // Form visibility
  const [showForm, setShowForm] = useState(false);
  
  // Form fields
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPhaseId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Gantt specific
  const [ganttProjectId, setGanttProjectId] = useState<string>('');
  const [ganttTasks, setGanttTasks] = useState<any[]>([]);
  const [isGanttLoading, setIsGanttLoading] = useState(false);

  const { user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await getPlans();
      setPlans(data);
    } catch { addToast({ type: 'error', title: 'Failed to load plans' }); }
  }, [addToast]);

  const fetchWbsGanttData = async (projectId: string) => {
    if (!projectId) { setGanttTasks([]); return; }
    setIsGanttLoading(true);
    try {
      const data = await getWbsGantt(projectId);
      setGanttTasks(data);
    } catch { addToast({ type: 'error', title: 'Failed to load Gantt data' }); }
    finally { setIsGanttLoading(false); }
  };

  const fetchLookups = useCallback(async () => {
    try {
      const [uData, pData] = await Promise.all([
        getPlanUsers(),
        getProjects()
      ]);
      setUsers(uData);
      setProjects(pData);
    } catch { console.error('Failed to load lookups'); }
  }, []);

  useEffect(() => {
    fetchPlans();
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN') fetchLookups();
  }, [fetchPlans, fetchLookups, user]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPlan({
        assigneeId: formAssigneeId,
        projectId: formProjectId || undefined,
        phaseId: formPhaseId || undefined,
        taskDescription: formDesc,
        plannedHours: Number(formHours),
        startDate: formDate,
        endDate: formDate,
      });
      addToast({ type: 'success', title: 'Plan created' });
      setShowForm(false);
      setFormDesc('');
      setFormHours('');
      fetchPlans();
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Failed to create plan' });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this plan? Actual logs will keep their hours but lose the plan link.')) return;
    try {
      await deletePlan(id);
      addToast({ type: 'success', title: 'Plan deleted' });
      fetchPlans();
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  const handleUpdateGanttDates = async (id: string, startDate: string, endDate: string) => {
    try {
      await updatePlanDates(id, startDate, endDate);
      addToast({ type: 'success', title: 'Dates updated' });
      fetchWbsGanttData(ganttProjectId);
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Update failed' });
      fetchWbsGanttData(ganttProjectId); // Revert UI
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const data = await uploadPlans(formData);
      addToast({ type: 'success', title: `Imported ${data.created} plans` });
      fetchPlans();
    } catch (err: any) {
      addToast({ type: 'error', title: err.message || 'Upload failed' });
    } finally {
      setIsUploading(true);
      setIsUploading(false);
    }
  };

  const filteredPlans = plans.filter(p => 
    !search || p.taskDescription.toLowerCase().includes(search.toLowerCase()) || p.assignee?.name.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <PlanHeader 
        canManage={canManage}
        view={view}
        setView={setView}
        onDownloadTemplate={() => window.location.href = getPlanTemplate()}
        onImportClick={() => fileInputRef.current?.click()}
        onNewPlanClick={() => setShowForm(!showForm)}
        isUploading={isUploading}
      />

      <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />

      {view === 'grid' ? (
        <>
          {showForm && canManage && (
            <PlanForm 
              users={users}
              projects={projects}
              formAssigneeId={formAssigneeId}
              setFormAssigneeId={setFormAssigneeId}
              formProjectId={formProjectId}
              setFormProjectId={setFormProjectId}
              formDesc={formDesc}
              setFormDesc={setFormDesc}
              formHours={formHours}
              setFormHours={setFormHours}
              formDate={formDate}
              setFormDate={setFormDate}
              onSubmit={handleCreatePlan}
            />
          )}

          <div className="mb-6 max-w-xs relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input type="text" placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full pl-9 pr-4 py-2 text-sm" />
          </div>

          <PlanGrid plans={filteredPlans} canManage={canManage} onDelete={handleDeletePlan} />
        </>
      ) : (
        <div className="space-y-6">
          <div className="max-w-xs">
            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2 font-bold">Select Project to Visualize</label>
            <select 
              value={ganttProjectId} 
              onChange={e => { setGanttProjectId(e.target.value); fetchWbsGanttData(e.target.value); }} 
              className="select-styled"
            >
              <option value="">Select a project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          {isGanttLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-blue-200/30">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest">Generating Timeline...</p>
            </div>
          ) : ganttProjectId ? (
            <GanttChart tasks={ganttTasks} onUpdateDates={handleUpdateGanttDates} />
          ) : (
            <div className="h-64 glass-card flex flex-col items-center justify-center text-center p-8 border-dashed border-white/5">
              <BarChart2 size={40} className="text-white/10 mb-4" />
              <p className="text-sm text-white/40 max-w-xs">Select a project from the dropdown above to view the Work Breakdown Structure in a Gantt timeline.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansPage;
