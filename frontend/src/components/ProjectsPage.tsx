import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Layers, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Project { id: string; name: string; color: string; status: string; _count?: { timeEntries: number }; }
interface Phase { id: string; name: string; sortOrder: number; _count?: { timeEntries: number }; }

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#22c55e','#ef4444','#ec4899','#f97316','#14b8a6','#6366f1'];

type Tab = 'projects' | 'phases';

const ProjectsPage: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Inline editing state
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');
  const [showNew, setShowNew] = useState(false);

  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const fetchProjects = useCallback(() => {
    fetch('/api/projects', { headers }).then(r => r.json()).then(setProjects).catch(() => {});
  }, [token]);

  const fetchPhases = useCallback(() => {
    fetch('/api/phases', { headers }).then(r => r.json()).then(setPhases).catch(() => {});
  }, [token]);

  useEffect(() => { fetchProjects(); fetchPhases(); }, [fetchProjects, fetchPhases]);

  // --- Project CRUD ---
  const createProject = async () => {
    if (!newName.trim()) { addToast({ type: 'warning', title: 'Name required' }); return; }
    const res = await fetch('/api/projects', { method: 'POST', headers, body: JSON.stringify({ name: newName, color: newColor }) });
    if (res.ok) { addToast({ type: 'success', title: 'Project created' }); setNewName(''); setShowNew(false); fetchProjects(); }
    else addToast({ type: 'error', title: 'Failed to create' });
  };

  const updateProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name: editName, color: editColor }) });
    if (res.ok) { addToast({ type: 'success', title: 'Project updated' }); setEditId(null); fetchProjects(); }
    else addToast({ type: 'error', title: 'Failed to update' });
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project? Entries will be unlinked.')) return;
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers });
    if (res.ok) { addToast({ type: 'success', title: 'Project deleted' }); fetchProjects(); }
    else addToast({ type: 'error', title: 'Failed to delete' });
  };

  // --- Phase CRUD ---
  const createPhase = async () => {
    if (!newName.trim()) { addToast({ type: 'warning', title: 'Name required' }); return; }
    const res = await fetch('/api/phases', { method: 'POST', headers, body: JSON.stringify({ name: newName }) });
    if (res.ok) { addToast({ type: 'success', title: 'Phase created' }); setNewName(''); setShowNew(false); fetchPhases(); }
    else addToast({ type: 'error', title: 'Failed to create' });
  };

  const updatePhase = async (id: string) => {
    const res = await fetch(`/api/phases/${id}`, { method: 'PUT', headers, body: JSON.stringify({ name: editName }) });
    if (res.ok) { addToast({ type: 'success', title: 'Phase updated' }); setEditId(null); fetchPhases(); }
    else addToast({ type: 'error', title: 'Failed to update' });
  };

  const deletePhase = async (id: string) => {
    if (!confirm('Delete this phase? Entries will be unlinked.')) return;
    const res = await fetch(`/api/phases/${id}`, { method: 'DELETE', headers });
    if (res.ok) { addToast({ type: 'success', title: 'Phase deleted' }); fetchPhases(); }
    else addToast({ type: 'error', title: 'Failed to delete' });
  };

  return (
    <div className="px-8 py-6 animate-slideUp opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Project Management</h1>
          <p className="text-xs text-white/30 mt-1">Manage projects and development phases</p>
        </div>
        <button onClick={() => { setShowNew(true); setNewName(''); setNewColor('#3b82f6'); }}
          className="btn-primary px-4 py-2.5 text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> {tab === 'projects' ? 'New Project' : 'New Phase'}
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-group mb-6 w-fit">
        <button className={`tab-item ${tab === 'projects' ? 'active' : ''}`} onClick={() => { setTab('projects'); setShowNew(false); setEditId(null); }}>
          <span className="flex items-center gap-1.5"><Briefcase size={13} />Projects ({projects.length})</span>
        </button>
        <button className={`tab-item ${tab === 'phases' ? 'active' : ''}`} onClick={() => { setTab('phases'); setShowNew(false); setEditId(null); }}>
          <span className="flex items-center gap-1.5"><Layers size={13} />Dev Phases ({phases.length})</span>
        </button>
      </div>

      {/* New Item Form */}
      {showNew && (
        <div className="glass-card p-5 mb-4 flex items-center gap-3 animate-slideDown opacity-0" style={{ animationFillMode: 'forwards' }}>
          {tab === 'projects' && (
            <div className="flex items-center gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  className={`w-6 h-6 rounded-full transition-all ${newColor === c ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-[#050505] scale-110' : 'opacity-50 hover:opacity-80'}`}
                  style={{ background: c }} />
              ))}
            </div>
          )}
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === 'projects' ? 'Project name...' : 'Phase name...'}
            className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm" autoFocus
            onKeyDown={e => { if (e.key === 'Enter') tab === 'projects' ? createProject() : createPhase(); }} />
          <button onClick={() => tab === 'projects' ? createProject() : createPhase()}
            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"><Check size={16} /></button>
          <button onClick={() => setShowNew(false)}
            className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 transition-all"><X size={16} /></button>
        </div>
      )}

      {/* Content */}
      {tab === 'projects' ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Color</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Name</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Entries</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5">
                    {editId === p.id ? (
                      <div className="flex gap-1">{COLORS.map(c => (
                        <button key={c} onClick={() => setEditColor(c)}
                          className={`w-4 h-4 rounded-full ${editColor === c ? 'ring-2 ring-white/40' : 'opacity-40'}`}
                          style={{ background: c }} />
                      ))}</div>
                    ) : (
                      <div className="w-4 h-4 rounded-full" style={{ background: p.color }} />
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="glass-input px-3 py-1.5 rounded-lg text-sm w-48" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') updateProject(p.id); if (e.key === 'Escape') setEditId(null); }} />
                    ) : (
                      <span className="text-sm font-medium text-white/80">{p.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-white/40 tabular-nums">{p._count?.timeEntries || 0}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`badge text-[9px] ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-draft'}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editId === p.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => updateProject(p.id)} className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"><Check size={13} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10"><X size={13} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditColor(p.color); }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60"><Pencil size={13} /></button>
                        <button onClick={() => deleteProject(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/30 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && (
            <div className="py-12 text-center"><Briefcase size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No projects yet. Create one to get started.</p></div>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Phase Name</th>
                <th className="text-center px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Entries</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {phases.map((p, i) => (
                <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                  <td className="px-5 py-3.5 text-xs text-white/20 tabular-nums">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    {editId === p.id ? (
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="glass-input px-3 py-1.5 rounded-lg text-sm w-48" autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') updatePhase(p.id); if (e.key === 'Escape') setEditId(null); }} />
                    ) : (
                      <span className="text-sm font-medium text-white/80">{p.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-white/40 tabular-nums">{p._count?.timeEntries || 0}</td>
                  <td className="px-5 py-3.5 text-right">
                    {editId === p.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => updatePhase(p.id)} className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20"><Check size={13} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:bg-white/10"><X size={13} /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(p.id); setEditName(p.name); }}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60"><Pencil size={13} /></button>
                        <button onClick={() => deletePhase(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/5 text-white/30 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {phases.length === 0 && (
            <div className="py-12 text-center"><Layers size={24} className="text-white/10 mx-auto mb-3" />
              <p className="text-sm text-white/30">No phases yet. Create one to get started.</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
