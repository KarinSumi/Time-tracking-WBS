import React, { useState, useEffect, useRef } from 'react';
import { Plus, Upload, Download, Search, CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface User { id: string; name: string; email: string; avatarUrl?: string; role: string; }
interface Project { id: string; name: string; color: string; }
interface Phase { id: string; name: string; }
interface Plan {
  id: string;
  taskDescription: string;
  plannedHours: number;
  actualHours: number;
  plannedDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignee: User;
  project?: Project;
  phase?: Phase;
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [search, setSearch] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formAssigneeId, setFormAssigneeId] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPhaseId, setFormPhaseId] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formHours, setFormHours] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const { token, user } = useAuth();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setPlans(await res.json());
    } catch { addToast({ type: 'error', title: 'Failed to load plans' }); }
  };

  const fetchLookups = async () => {
    try {
      const [uRes, pRes, phRes] = await Promise.all([
        fetch('/api/plans/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/projects', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/phases', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (pRes.ok) setProjects(await pRes.json());
      if (phRes.ok) setPhases(await phRes.json());
    } catch { console.error('Failed to load lookups'); }
  };

  useEffect(() => {
    fetchPlans();
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') fetchLookups();
  }, [token, user]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAssigneeId || !formDesc || !formHours) return;
    
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          assigneeId: formAssigneeId,
          projectId: formProjectId || null,
          phaseId: formPhaseId || null,
          taskDescription: formDesc,
          plannedHours: Number(formHours),
          plannedDate: formDate,
        })
      });
      
      if (res.ok) {
        addToast({ type: 'success', title: 'Plan created' });
        setShowForm(false);
        setFormDesc('');
        setFormHours('');
        fetchPlans();
      } else {
        addToast({ type: 'error', title: 'Failed to create plan' });
      }
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this plan? Actual logs will keep their hours but lose the plan link.')) return;
    try {
      const res = await fetch(`/api/plans/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { addToast({ type: 'success', title: 'Plan deleted' }); fetchPlans(); }
    } catch { addToast({ type: 'error', title: 'Connection error' }); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/plans/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      
      if (res.ok) {
        addToast({ type: 'success', title: `Imported ${data.created} plans` });
        if (data.errors > 0) addToast({ type: 'error', title: `${data.errors} rows failed validation` });
        fetchPlans();
      } else {
        addToast({ type: 'error', title: data.error || 'Upload failed' });
      }
    } catch {
      addToast({ type: 'error', title: 'Upload connection error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/plans/template';
  };

  const filtered = plans.filter(p => 
    !search || p.taskDescription.toLowerCase().includes(search.toLowerCase()) || p.assignee.name.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Plan vs Actual</h1>
          <p className="text-xs text-white/30 mt-1">Track planned tasks against logged hours</p>
        </div>
        {canManage && (
          <div className="flex gap-3">
            <input type="file" accept=".xlsx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
            <button onClick={handleDownloadTemplate} className="btn-secondary flex items-center gap-2">
              <Download size={14} /> <span className="hidden sm:inline">Template</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary flex items-center gap-2">
              <Upload size={14} /> <span className="hidden sm:inline">{isUploading ? 'Uploading...' : 'Import Excel'}</span>
            </button>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> New Plan
            </button>
          </div>
        )}
      </div>

      {showForm && canManage && (
        <div className="glass-card p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">Create New Plan</h2>
          <form onSubmit={handleCreatePlan} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-1">
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Assignee</label>
              <select value={formAssigneeId} onChange={e => setFormAssigneeId(e.target.value)} className="select-styled text-sm py-2" required>
                <option value="">Select User...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
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
      )}

      {/* Search */}
      <div className="mb-6 max-w-xs relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input type="text" placeholder="Search plans..." value={search} onChange={e => setSearch(e.target.value)} className="glass-input w-full pl-9 pr-4 py-2 text-sm" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Assignee</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Task</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Project</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Plan vs Actual</th>
              <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
              {canManage && <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(plan => {
              const variance = plan.actualHours - plan.plannedHours;
              const percent = Math.min(100, Math.round((plan.actualHours / plan.plannedHours) * 100));
              const isOver = variance > 0;
              
              return (
                <tr key={plan.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {plan.assignee.avatarUrl ? <img src={plan.assignee.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-[9px] font-bold text-white/50">{plan.assignee.name[0]}</span>}
                    </div>
                    <span className="text-xs text-white/70">{plan.assignee.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-white/90">{plan.taskDescription}</td>
                  <td className="px-5 py-3.5">
                    {plan.project ? <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: `${plan.project.color}15`, color: plan.project.color }}>{plan.project.name}</span> : <span className="text-white/20">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col items-center gap-1.5 w-48 mx-auto">
                      <div className="flex justify-between w-full text-[10px] tabular-nums font-medium">
                        <span className="text-white/40">{plan.plannedHours}h plan</span>
                        <span className={isOver ? 'text-red-400' : 'text-green-400'}>{plan.actualHours}h act {variance !== 0 && `(${variance > 0 ? '+' : ''}${variance}h)`}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                        <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {plan.status === 'COMPLETED' ? <span className="badge badge-success"><CheckCircle2 size={10} className="mr-1"/> Completed</span> :
                     plan.status === 'IN_PROGRESS' ? <span className="badge badge-info"><Clock size={10} className="mr-1"/> In Progress</span> :
                     <span className="badge badge-draft"><Circle size={10} className="mr-1"/> Pending</span>}
                  </td>
                  {canManage && (
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlansPage;
